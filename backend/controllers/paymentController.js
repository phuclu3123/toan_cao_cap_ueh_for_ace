import path from 'path';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
export const createPayOSSignature = (data, checksumKey) => {
  const signedContent = Object.keys(data || {})
    .sort()
    .map((key) => {
      const value = data[key];
      const normalizedValue = value !== null && typeof value === 'object'
        ? JSON.stringify(value)
        : value;
      return `${key}=${normalizedValue}`;
    })
    .join('&');

  return crypto
    .createHmac('sha256', checksumKey)
    .update(signedContent)
    .digest('hex');
};

export const safeCompareSignature = (expected, received) => {
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

export const verifyPayOSWebhookSignature = (body) => {
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!checksumKey) {
    throw new Error('PAYOS_CHECKSUM_KEY is not configured');
  }

  if (!body?.data || !body.signature) {
    return false;
  }

  const expectedSignature = createPayOSSignature(body.data, checksumKey);
  return safeCompareSignature(expectedSignature, body.signature);
};

export const normalizePaymentResponse = (payment) => ({
  orderCode: payment.orderCode,
  amount: payment.amount,
  description: payment.description,
  status: payment.status,
  paymentLinkId: payment.paymentLinkId,
  checkoutUrl: payment.checkoutUrl,
  qrCode: payment.qrCode,
  reference: payment.reference,
  paidAt: payment.paidAt,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt
});



export const createPayment = async (req, res) => {
  const { orderCode, amount, description, buyerName } = req.body;

  if (!orderCode || !amount || !description) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng bắt buộc: orderCode, amount, description' });
  }

  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    return res.status(500).json({ success: false, message: 'Hệ thống chưa cấu hình đầy đủ khoá PayOS (clientId, apiKey, checksumKey)!' });
  }

  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.get('host');
  const returnUrl = `${protocol}://${host}/payment/success`;
  const cancelUrl = `${protocol}://${host}/payment/cancel`;

  const payload = {
    orderCode: Number(orderCode),
    amount: Number(amount),
    description,
    cancelUrl,
    returnUrl
  };

  const signature = createPayOSSignature(payload, checksumKey);
  payload.signature = signature;
  payload.buyerName = buyerName || '';

  try {
    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.code === '00') {
      const paymentData = {
        orderCode: Number(orderCode),
        amount: Number(amount),
        description,
        status: 'PENDING',
        paymentLinkId: result.data.paymentLinkId,
        checkoutUrl: result.data.checkoutUrl,
        qrCode: result.data.qrCode
      };

      await Payment.findOneAndUpdate(
        { orderCode: Number(orderCode) },
        { 
          $set: paymentData,
          $setOnInsert: { reference: null, paidAt: null }
        },
        { upsert: true, new: true }
      );
    }

    return res.status(response.status).json(result);
  } catch (error) {
    console.error('Lỗi khi gọi API tạo thanh toán PayOS:', error);
    return res.status(502).json({ success: false, message: 'Không thể kết nối đến máy chủ PayOS để tạo link thanh toán!' });
  }
};

export const handleWebhook = async (req, res) => {
  const body = req.body;

  try {
    if (!body || !body.data) {
      return res.status(400).json({ success: false, message: 'Invalid payOS webhook body' });
    }

    const isValidSignature = verifyPayOSWebhookSignature(body);
    if (!isValidSignature) {
      console.warn('Rejected payOS webhook because signature is invalid');
      return res.status(400).json({ success: false, message: 'Invalid payOS signature' });
    }

    const orderCode = Number(body.data.orderCode);
    if (!Number.isFinite(orderCode)) {
      return res.status(400).json({ success: false, message: 'Invalid orderCode' });
    }

    const isPaid = body.success === true && body.code === '00';
    const paymentUpdate = {
      orderCode,
      amount: Number(body.data.amount) || 0,
      description: body.data.description || '',
      status: isPaid ? 'PAID' : 'PENDING',
      paymentLinkId: body.data.paymentLinkId || null,
      reference: body.data.reference || null,
      paidAt: body.data.transactionDateTime || null,
      webhookData: body
    };

    await Payment.findOneAndUpdate(
      { orderCode },
      {
        $set: paymentUpdate,
        $setOnInsert: {
          checkoutUrl: null,
          qrCode: null
        }
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('PayOS webhook error:', error);
    return res.status(500).json({ success: false, message: 'PayOS webhook processing failed' });
  }
};

export const confirmWebhook = async (req, res) => {
  const { webhookUrl } = req.body;
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const confirmToken = process.env.PAYOS_CONFIRM_TOKEN;

  if (!clientId || !apiKey) {
    return res.status(500).json({ success: false, message: 'PAYOS_CLIENT_ID or PAYOS_API_KEY is not configured' });
  }

  if (!confirmToken || req.get('x-payos-confirm-token') !== confirmToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized webhook confirmation request' });
  }

  try {
    const parsedUrl = new URL(webhookUrl);
    if (parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ success: false, message: 'Webhook URL must use HTTPS' });
    }
  } catch {
    return res.status(400).json({ success: false, message: 'Webhook URL is invalid' });
  }

  try {
    const response = await fetch('https://api-merchant.payos.vn/confirm-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey
      },
      body: JSON.stringify({ webhookUrl })
    });

    const result = await response.json().catch(() => ({}));
    return res.status(response.status).json({
      success: response.ok,
      payos: result
    });
  } catch (error) {
    console.error('PayOS confirm webhook error:', error);
    return res.status(502).json({ success: false, message: 'Could not connect to payOS confirm-webhook API' });
  }
};

export const getPaymentStatus = async (req, res) => {
  const orderCode = Number(req.params.orderCode);

  if (!Number.isFinite(orderCode)) {
    return res.status(400).json({ success: false, message: 'Invalid orderCode' });
  }

  try {
    let payment = await Payment.findOne({ orderCode })
      .select('-_id orderCode amount description status paymentLinkId checkoutUrl qrCode reference paidAt createdAt updatedAt')
      .lean();

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'PENDING') {
      const clientId = process.env.PAYOS_CLIENT_ID;
      const apiKey = process.env.PAYOS_API_KEY;
      if (clientId && apiKey) {
        try {
          const response = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`, {
            headers: {
              'x-client-id': clientId,
              'x-api-key': apiKey
            }
          });
          const result = await response.json();
          if (response.ok && result.code === '00' && result.data) {
            const payosStatus = result.data.status;
            if (payosStatus && payosStatus !== payment.status) {
              payment.status = payosStatus;
              
              const paymentUpdate = {
                orderCode,
                status: payosStatus,
                amount: result.data.amount,
                reference: result.data.transactions?.[0]?.reference || null,
                paidAt: result.data.transactions?.[0]?.transactionDateTime || null
              };

              await Payment.updateOne({ orderCode }, { $set: { status: payosStatus } });
            }
          }
        } catch (apiErr) {
          console.warn('Lỗi khi đối soát trực tiếp trạng thái với PayOS:', apiErr.message);
        }
      }
    }

    return res.json({
      code: "00",
      desc: "success",
      data: normalizePaymentResponse(payment)
    });
  } catch (error) {
    console.error('Payment lookup error:', error);
    return res.status(500).json({ success: false, message: 'Could not load payment status' });
  }
};
