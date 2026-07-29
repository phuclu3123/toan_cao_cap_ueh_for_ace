import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { PayOS } from '@payos/node';
import Payment from '../models/Payment.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { checkMongoDBConnected } from '../config/db.js';
import { readJSONFile, writeJSONFile, dataDir } from '../utils/jsonHelper.js';
import { getCourseOffering, listCourseOfferings } from '../config/courseCatalog.js';
import { getCourseAccess, grantEnrollment } from '../services/enrollmentService.js';
import { isOwnerIdentifier } from '../utils/roles.js';
import { assertPersistentStorage } from '../utils/storagePolicy.js';

const paymentsFilePath = path.join(dataDir, 'payments.json');
let payOSClient = null;
let payOSClientConfigKey = '';

const getPayOSClient = () => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    const error = new Error('PayOS is not configured');
    error.code = 'PAYOS_NOT_CONFIGURED';
    error.statusCode = 503;
    throw error;
  }

  const configKey = `${clientId}:${apiKey}:${checksumKey}`;
  if (!payOSClient || payOSClientConfigKey !== configKey) {
    payOSClient = new PayOS({
      clientId,
      apiKey,
      checksumKey,
      timeout: 15_000,
      maxRetries: 2,
      logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'warn'
    });
    payOSClientConfigKey = configKey;
  }

  return payOSClient;
};

export const normalizePaymentResponse = (payment) => ({
  orderCode: payment.orderCode,
  courseId: payment.courseId,
  amount: payment.amount,
  description: payment.description,
  status: payment.status,
  paymentLinkId: payment.paymentLinkId,
  checkoutUrl: payment.checkoutUrl,
  qrCode: payment.qrCode,
  reference: payment.reference,
  paidAt: payment.paidAt,
  fulfillmentStatus: payment.fulfillmentStatus,
  failureReason: payment.failureReason,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt
});

export const resolvePaymentStatus = (currentStatus, isPaidEvent) => {
  if (isPaidEvent) return 'PAID';
  if (currentStatus === 'PAID') return 'PAID';
  if (currentStatus === 'CREATING') return 'PENDING';
  return currentStatus;
};

const sanitizeBuyerText = (value, maxLength) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
);

const sanitizeWebhookSummary = (body = {}) => ({
  code: body.code || null,
  success: body.data?.code === '00',
  orderCode: Number(body.data?.orderCode) || null,
  amount: Number(body.data?.amount) || 0,
  paymentLinkId: body.data?.paymentLinkId || null,
  reference: body.data?.reference || null,
  transactionDateTime: body.data?.transactionDateTime || null
});

const createWebhookFingerprint = (body) => crypto
  .createHash('sha256')
  .update(`${body.signature || ''}:${JSON.stringify(sanitizeWebhookSummary(body))}`)
  .digest('hex');

const isDuplicateKeyError = (error) => error?.code === 11000;

const getFrontendBaseUrl = () => (
  process.env.FRONTEND_URL
  || process.env.APP_BASE_URL
  || 'https://toancaocapueh.id.vn'
).replace(/\/+$/, '');

const findPaymentByOrderCode = async (orderCode) => {
  assertPersistentStorage();
  if (checkMongoDBConnected()) {
    return Payment.findOne({ orderCode });
  }
  return readJSONFile(paymentsFilePath, [])
    .find((payment) => Number(payment.orderCode) === Number(orderCode)) || null;
};

const updatePayment = async (orderCode, paymentUpdate, webhookBody = {}) => {
  assertPersistentStorage();
  if (checkMongoDBConnected()) {
    return Payment.findOneAndUpdate(
      { orderCode },
      { $set: paymentUpdate },
      { new: true }
    );
  }
  saveLocalPaymentFromWebhook(webhookBody, { orderCode, ...paymentUpdate });
  return findPaymentByOrderCode(orderCode);
};

export const saveLocalPaymentFromWebhook = (body, paymentUpdate) => {
  assertPersistentStorage();
  const payments = readJSONFile(paymentsFilePath, []);
  const existingIndex = payments.findIndex(payment => Number(payment.orderCode) === paymentUpdate.orderCode);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    payments[existingIndex] = {
      ...payments[existingIndex],
      ...paymentUpdate,
      webhookData: sanitizeWebhookSummary(body),
      updatedAt: now
    };
  } else {
    payments.push({
      ...paymentUpdate,
      orderCode: paymentUpdate.orderCode,
      amount: paymentUpdate.amount || 0,
      description: paymentUpdate.description || '',
      status: paymentUpdate.status || 'PENDING',
      paymentLinkId: paymentUpdate.paymentLinkId || null,
      checkoutUrl: null,
      qrCode: null,
      reference: paymentUpdate.reference || null,
      paidAt: paymentUpdate.paidAt || null,
      createdAt: now,
      updatedAt: now,
      webhookData: sanitizeWebhookSummary(body)
    });
  }

  writeJSONFile(paymentsFilePath, payments);
};

export const createPayment = async (req, res) => {
  try {
    assertPersistentStorage();
    const { courseId, buyerName, buyerPhone } = req.body;
    const course = getCourseOffering(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
    }

    const rawIdempotencyKey = req.get('Idempotency-Key');
    const idempotencyKey = sanitizeBuyerText(rawIdempotencyKey, 128);
    if (rawIdempotencyKey && (
      idempotencyKey.length < 16
      || !/^[A-Za-z0-9._:-]+$/.test(idempotencyKey)
    )) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key không hợp lệ.'
      });
    }

    const existingAccess = await getCourseAccess(req.authUser, course.id);
    if (existingAccess.allowed) {
      return res.status(200).json({
        code: '00',
        desc: 'already enrolled',
        data: {
          courseId: course.id,
          status: 'PAID',
          entitlement: existingAccess
        }
      });
    }

    if (idempotencyKey) {
      const existingPayment = checkMongoDBConnected()
        ? await Payment.findOne({ idempotencyKey, userId: req.authUser.id })
        : readJSONFile(paymentsFilePath, []).find((payment) => (
          payment.idempotencyKey === idempotencyKey
          && payment.userId === req.authUser.id
        ));

      if (existingPayment) {
        return res.status(200).json({
          code: '00',
          desc: 'idempotent replay',
          data: normalizePaymentResponse(existingPayment)
        });
      }
    }

    if (course.amount === 0) {
      const enrollment = await grantEnrollment({
        userId: req.authUser.id,
        username: req.authUser.username,
        courseId: course.id,
        source: 'FREE'
      });
      return res.status(201).json({
        code: '00',
        desc: 'free course enrolled',
        data: {
          courseId: course.id,
          status: 'PAID',
          isFree: true,
          entitlement: { allowed: true, reason: 'ENROLLED', enrollment }
        }
      });
    }

    const payOS = getPayOSClient();
    const orderCode = (Date.now() * 1000) + crypto.randomInt(100, 1000);
    const returnUrl = `${getFrontendBaseUrl()}/payment/result?orderCode=${orderCode}`;
    const cancelUrl = `${getFrontendBaseUrl()}/payment/result?orderCode=${orderCode}&cancelled=1`;
    const description = `${course.descriptionCode} ${String(orderCode).slice(-6)}`.slice(0, 25);

    const payload = {
      orderCode,
      amount: course.amount,
      description,
      cancelUrl,
      returnUrl,
      buyerName: sanitizeBuyerText(buyerName, 100)
        || sanitizeBuyerText(req.authUser.name, 100),
      buyerEmail: sanitizeBuyerText(req.authUser.username, 150),
      buyerPhone: sanitizeBuyerText(buyerPhone, 20)
        || sanitizeBuyerText(req.authUser.phoneNumber, 20),
      expiredAt: Math.floor(Date.now() / 1000) + (30 * 60),
      items: [{
        name: course.title,
        quantity: 1,
        price: course.amount
      }]
    };

    const basePaymentData = {
      orderCode,
      idempotencyKey: idempotencyKey || undefined,
      userId: req.authUser.id,
      username: req.authUser.username,
      courseId: course.id,
      amount: course.amount,
      expectedAmount: course.amount,
      description,
      status: 'CREATING',
      buyerName: payload.buyerName,
      buyerPhone: payload.buyerPhone,
      webhookVerified: false,
      providerVerified: false,
      fulfillmentStatus: 'NOT_READY'
    };

    if (checkMongoDBConnected()) {
      try {
        await Payment.create(basePaymentData);
      } catch (error) {
        if (isDuplicateKeyError(error) && idempotencyKey) {
          const existingPayment = await Payment.findOne({
            idempotencyKey,
            userId: req.authUser.id
          });
          if (existingPayment) {
            return res.status(200).json({
              code: '00',
              desc: 'idempotent replay',
              data: normalizePaymentResponse(existingPayment)
            });
          }
        }
        throw error;
      }
    } else {
      saveLocalPaymentFromWebhook({}, basePaymentData);
    }

    try {
      const paymentLink = await payOS.paymentRequests.create(payload);
      const savedPayment = await updatePayment(orderCode, {
        status: 'PENDING',
        paymentLinkId: paymentLink.paymentLinkId,
        checkoutUrl: paymentLink.checkoutUrl,
        qrCode: paymentLink.qrCode,
        providerVerified: true
      });

      return res.status(201).json({
        code: '00',
        desc: 'success',
        data: normalizePaymentResponse(savedPayment)
      });
    } catch (error) {
      console.error('PayOS payment link creation failed:', error);
      await updatePayment(orderCode, {
        status: 'FAILED',
        failureReason: 'PAYOS_CREATE_FAILED'
      });
      return res.status(error.status || 502).json({
        success: false,
        code: 'PAYOS_CREATE_FAILED',
        message: 'Không thể tạo link thanh toán PayOS. Vui lòng thử lại.'
      });
    }
  } catch (error) {
    console.error('Create payment error:', error);
    const status = error.statusCode || (isDuplicateKeyError(error) ? 409 : 500);
    return res.status(status).json({
      success: false,
      code: error.code || (status === 409 ? 'ORDER_CONFLICT' : 'ORDER_CREATE_FAILED'),
      message: status === 503
        ? 'Hệ thống thanh toán đang tạm bảo trì. Vui lòng thử lại sau.'
        : 'Không thể khởi tạo đơn hàng. Vui lòng thử lại.'
    });
  }
};

export const handleWebhook = async (req, res) => {
  const body = req.body;

  try {
    assertPersistentStorage();

    if (!body || !body.data) {
      return res.status(400).json({ success: false, message: 'Invalid payOS webhook body' });
    }

    try {
      body.data = await getPayOSClient().webhooks.verify(body);
    } catch (verificationError) {
      console.warn('Rejected payOS webhook because signature is invalid');
      return res.status(400).json({
        success: false,
        code: 'INVALID_PAYOS_SIGNATURE',
        message: 'Invalid payOS signature'
      });
    }

    const orderCode = Number(body.data.orderCode);
    if (!Number.isFinite(orderCode)) {
      return res.status(400).json({ success: false, message: 'Invalid orderCode' });
    }

    const payment = await findPaymentByOrderCode(orderCode);
    if (!payment) {
      // PayOS sends a signed sample payload while confirming a webhook URL.
      // Unknown signed orders are acknowledged but can never create an order
      // or an enrollment.
      console.warn(`Acknowledged payOS webhook for unknown order ${orderCode}`);
      if (checkMongoDBConnected()) {
        const eventSummary = sanitizeWebhookSummary(body);
        const fingerprint = createWebhookFingerprint(body);
        await WebhookEvent.updateOne(
          { fingerprint },
          {
            $setOnInsert: {
              fingerprint,
              orderCode,
              checksumVerified: true,
              status: 'REJECTED',
              reason: 'UNKNOWN_ORDER',
              eventSummary
            }
          },
          { upsert: true }
        );
      }
      return res.json({ success: true, ignored: true });
    }

    if (
      payment.paymentLinkId
      && payment.paymentLinkId !== body.data.paymentLinkId
    ) {
      return res.status(400).json({ success: false, message: 'Payment link mismatch' });
    }

    const isPaid = body.data.code === '00';
    const receivedAmount = Number(body.data.amount) || 0;
    const expectedAmount = Number(payment.expectedAmount || payment.amount);
    const amountMatches = receivedAmount === expectedAmount;
    const eventSummary = sanitizeWebhookSummary(body);
    const fingerprint = createWebhookFingerprint(body);

    if (isPaid && !amountMatches) {
      console.warn(`Rejected payOS webhook amount mismatch for order ${orderCode}`);
      if (checkMongoDBConnected()) {
        await Promise.all([
          Payment.updateOne(
            { orderCode, status: { $ne: 'PAID' } },
            {
              $set: {
                status: 'FAILED',
                failureReason: 'AMOUNT_MISMATCH',
                webhookVerified: true,
                providerVerified: false,
                webhookData: eventSummary,
                lastWebhookAt: new Date()
              }
            }
          ),
          WebhookEvent.updateOne(
            { fingerprint },
            {
              $setOnInsert: {
                fingerprint,
                orderCode,
                checksumVerified: true,
                status: 'REJECTED',
                reason: 'AMOUNT_MISMATCH',
                eventSummary
              }
            },
            { upsert: true }
          )
        ]);
      } else {
        await updatePayment(orderCode, {
          status: payment.status === 'PAID' ? 'PAID' : 'FAILED',
          failureReason: 'AMOUNT_MISMATCH',
          webhookVerified: true,
          providerVerified: false,
          webhookData: eventSummary,
          lastWebhookAt: new Date().toISOString()
        }, body);
      }
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
    }

    if (!checkMongoDBConnected()) {
      if (payment.status === 'PAID' && payment.fulfillmentStatus === 'GRANTED') {
        return res.json({ success: true, duplicate: true });
      }

      const nextStatus = resolvePaymentStatus(payment.status, isPaid);
      await updatePayment(orderCode, {
        amount: isPaid ? receivedAmount : payment.amount,
        status: nextStatus,
        paymentLinkId: body.data.paymentLinkId || payment.paymentLinkId || null,
        reference: body.data.reference || payment.reference || null,
        paidAt: body.data.transactionDateTime || payment.paidAt || null,
        webhookVerified: true,
        providerVerified: isPaid,
        webhookData: eventSummary,
        lastWebhookAt: new Date().toISOString()
      }, body);

      if (isPaid && payment.userId && payment.username && payment.courseId) {
        await grantEnrollment({
          userId: payment.userId,
          username: payment.username,
          courseId: payment.courseId,
          source: 'PAYOS',
          paymentOrderCode: orderCode
        });
        await updatePayment(orderCode, {
          fulfillmentStatus: 'GRANTED',
          failureReason: null
        }, body);
      }
      return res.json({ success: true });
    }

    const mongoSession = await mongoose.startSession();
    let duplicate = false;
    try {
      await mongoSession.withTransaction(async () => {
        const existingEvent = await WebhookEvent.findOne({ fingerprint }).session(mongoSession);
        if (existingEvent) {
          duplicate = true;
          return;
        }

        const currentPayment = await Payment.findOne({ orderCode }).session(mongoSession);
        if (!currentPayment) {
          const error = new Error('Unknown orderCode');
          error.statusCode = 404;
          throw error;
        }

        if (
          currentPayment.paymentLinkId
          && currentPayment.paymentLinkId !== body.data.paymentLinkId
        ) {
          const error = new Error('Payment link mismatch');
          error.statusCode = 400;
          throw error;
        }

        if (isPaid) {
          if (!currentPayment.userId || !currentPayment.username || !currentPayment.courseId) {
            const error = new Error('Paid legacy order has no entitlement mapping');
            error.code = 'LEGACY_ORDER_MAPPING_REQUIRED';
            error.statusCode = 409;
            throw error;
          }

          currentPayment.amount = receivedAmount;
          currentPayment.status = 'PAID';
          currentPayment.paymentLinkId = body.data.paymentLinkId || currentPayment.paymentLinkId;
          currentPayment.reference = body.data.reference || currentPayment.reference;
          currentPayment.paidAt = body.data.transactionDateTime || currentPayment.paidAt;
          currentPayment.webhookVerified = true;
          currentPayment.providerVerified = true;
          currentPayment.webhookData = eventSummary;
          currentPayment.lastWebhookAt = new Date();

          await grantEnrollment({
            userId: currentPayment.userId,
            username: currentPayment.username,
            courseId: currentPayment.courseId,
            source: 'PAYOS',
            paymentOrderCode: orderCode,
            mongoSession
          });

          currentPayment.fulfillmentStatus = 'GRANTED';
          currentPayment.failureReason = null;
          await currentPayment.save({ session: mongoSession });
        } else if (currentPayment.status !== 'PAID') {
          // Informational/non-paid events must never downgrade a terminal PAID order.
          currentPayment.status = resolvePaymentStatus(currentPayment.status, false);
          currentPayment.webhookVerified = true;
          currentPayment.webhookData = eventSummary;
          currentPayment.lastWebhookAt = new Date();
          await currentPayment.save({ session: mongoSession });
        }

        await WebhookEvent.create([{
          fingerprint,
          orderCode,
          checksumVerified: true,
          status: 'PROCESSED',
          reason: isPaid ? 'PAYMENT_CONFIRMED' : 'NON_PAID_EVENT',
          eventSummary
        }], { session: mongoSession });
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        duplicate = true;
      } else {
        throw error;
      }
    } finally {
      await mongoSession.endSession();
    }

    return res.json({ success: true, duplicate });
  } catch (error) {
    console.error('PayOS webhook error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code || 'PAYOS_WEBHOOK_FAILED',
      message: error.statusCode && error.statusCode < 500
        ? error.message
        : 'PayOS webhook processing failed'
    });
  }
};

export const confirmWebhook = async (req, res) => {
  const { webhookUrl } = req.body;
  const confirmToken = process.env.PAYOS_CONFIRM_TOKEN;

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
    const result = await getPayOSClient().webhooks.confirm(webhookUrl);
    return res.json({ success: true, payos: result });
  } catch (error) {
    console.error('PayOS confirm webhook error:', error);
    return res.status(error.status || error.statusCode || 502).json({
      success: false,
      code: 'PAYOS_WEBHOOK_CONFIRM_FAILED',
      message: 'Could not confirm the PayOS webhook URL'
    });
  }
};

const reconcileVerifiedPaidOrder = async (payment, paymentLink) => {
  const orderCode = Number(payment.orderCode);
  const transaction = paymentLink.transactions?.[0] || null;

  if (!checkMongoDBConnected()) {
    let updated = await updatePayment(orderCode, {
      status: 'PAID',
      amount: Number(paymentLink.amount),
      reference: transaction?.reference || null,
      paidAt: transaction?.transactionDateTime || null,
      providerVerified: true,
      failureReason: null
    });
    await grantEnrollment({
      userId: updated.userId,
      username: updated.username,
      courseId: updated.courseId,
      source: 'PAYOS',
      paymentOrderCode: orderCode
    });
    return updatePayment(orderCode, {
      fulfillmentStatus: 'GRANTED',
      failureReason: null
    });
  }

  const mongoSession = await mongoose.startSession();
  try {
    await mongoSession.withTransaction(async () => {
      const currentPayment = await Payment.findOne({ orderCode }).session(mongoSession);
      if (!currentPayment?.userId || !currentPayment.username || !currentPayment.courseId) {
        const error = new Error('Order has no entitlement mapping');
        error.code = 'LEGACY_ORDER_MAPPING_REQUIRED';
        error.statusCode = 409;
        throw error;
      }

      currentPayment.status = 'PAID';
      currentPayment.amount = Number(paymentLink.amount);
      currentPayment.reference = transaction?.reference || currentPayment.reference || null;
      currentPayment.paidAt = transaction?.transactionDateTime || currentPayment.paidAt || null;
      currentPayment.providerVerified = true;
      currentPayment.failureReason = null;

      await grantEnrollment({
        userId: currentPayment.userId,
        username: currentPayment.username,
        courseId: currentPayment.courseId,
        source: 'PAYOS',
        paymentOrderCode: orderCode,
        mongoSession
      });

      currentPayment.fulfillmentStatus = 'GRANTED';
      await currentPayment.save({ session: mongoSession });
    });
  } finally {
    await mongoSession.endSession();
  }

  return findPaymentByOrderCode(orderCode);
};

export const claimLegacyPayment = async (req, res) => {
  const orderCode = Number(req.body?.orderCode);
  const providedReference = sanitizeBuyerText(req.body?.reference, 100).toUpperCase();

  if (!Number.isSafeInteger(orderCode) || orderCode <= 0 || providedReference.length < 6) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_LEGACY_CLAIM',
      message: 'Vui lòng cung cấp mã đơn và mã tham chiếu giao dịch PayOS hợp lệ.'
    });
  }

  try {
    assertPersistentStorage();
    let payment = await findPaymentByOrderCode(orderCode);
    if (!payment) {
      return res.status(404).json({
        success: false,
        code: 'LEGACY_ORDER_NOT_FOUND',
        message: 'Không tìm thấy đơn hàng cũ trên hệ thống.'
      });
    }

    if (payment.userId) {
      if (payment.userId !== req.authUser.id) {
        return res.status(409).json({
          success: false,
          code: 'LEGACY_ORDER_ALREADY_CLAIMED',
          message: 'Đơn hàng này đã được liên kết với một tài khoản khác.'
        });
      }
      const access = payment.courseId
        ? await getCourseAccess(req.authUser, payment.courseId)
        : { allowed: false };
      return res.json({
        success: true,
        data: { courseId: payment.courseId, entitlement: access }
      });
    }

    const paymentLink = await getPayOSClient().paymentRequests.get(orderCode);
    const providerReference = String(
      paymentLink.transactions?.[0]?.reference || ''
    ).trim().toUpperCase();
    const providerAmount = Number(paymentLink.amount);
    const amountPaid = Number(paymentLink.amountPaid);
    const matchingCourses = listCourseOfferings().filter((course) => (
      course.amount > 0 && course.amount === providerAmount
    ));

    if (
      paymentLink.status !== 'PAID'
      || providerAmount !== amountPaid
      || providerReference !== providedReference
      || matchingCourses.length !== 1
    ) {
      return res.status(403).json({
        success: false,
        code: 'LEGACY_CLAIM_NOT_VERIFIED',
        message: 'Không thể đối chiếu đơn hàng với biên nhận PayOS đã cung cấp.'
      });
    }

    const course = matchingCourses[0];
    if (!checkMongoDBConnected()) {
      payment = await updatePayment(orderCode, {
        userId: req.authUser.id,
        username: req.authUser.username,
        courseId: course.id,
        expectedAmount: course.amount,
        amount: providerAmount,
        status: 'PAID',
        providerVerified: true,
        fulfillmentStatus: 'NOT_READY',
        failureReason: null
      });
      await grantEnrollment({
        userId: req.authUser.id,
        username: req.authUser.username,
        courseId: course.id,
        source: 'PAYOS',
        paymentOrderCode: orderCode
      });
      payment = await updatePayment(orderCode, { fulfillmentStatus: 'GRANTED' });
    } else {
      const mongoSession = await mongoose.startSession();
      try {
        await mongoSession.withTransaction(async () => {
          const currentPayment = await Payment.findOne({ orderCode }).session(mongoSession);
          if (!currentPayment || (
            currentPayment.userId
            && currentPayment.userId !== req.authUser.id
          )) {
            const error = new Error('Legacy order was claimed concurrently');
            error.code = 'LEGACY_ORDER_ALREADY_CLAIMED';
            error.statusCode = 409;
            throw error;
          }

          currentPayment.userId = req.authUser.id;
          currentPayment.username = req.authUser.username;
          currentPayment.courseId = course.id;
          currentPayment.expectedAmount = course.amount;
          currentPayment.amount = providerAmount;
          currentPayment.status = 'PAID';
          currentPayment.providerVerified = true;
          currentPayment.fulfillmentStatus = 'GRANTED';
          currentPayment.failureReason = null;

          await grantEnrollment({
            userId: req.authUser.id,
            username: req.authUser.username,
            courseId: course.id,
            source: 'PAYOS',
            paymentOrderCode: orderCode,
            mongoSession
          });
          await currentPayment.save({ session: mongoSession });
        });
      } finally {
        await mongoSession.endSession();
      }
      payment = await findPaymentByOrderCode(orderCode);
    }

    const access = await getCourseAccess(req.authUser, course.id);
    return res.json({
      success: true,
      data: {
        ...normalizePaymentResponse(payment),
        entitlement: access
      }
    });
  } catch (error) {
    console.error('Legacy payment claim failed:', error);
    return res.status(error.statusCode || error.status || 500).json({
      success: false,
      code: error.code || 'LEGACY_CLAIM_FAILED',
      message: error.statusCode === 503
        ? 'Hệ thống đối soát đang tạm bảo trì.'
        : 'Chưa thể khôi phục quyền học từ đơn cũ.'
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  const orderCode = Number(req.params.orderCode);

  if (!Number.isSafeInteger(orderCode) || orderCode <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid orderCode' });
  }

  try {
    let payment = await findPaymentByOrderCode(orderCode);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const isOwner = (
      req.authUser.role === 'Admin'
      && isOwnerIdentifier(req.authUser.username)
    );
    if (!isOwner && payment.userId !== req.authUser.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này.'
      });
    }

    if (['CREATING', 'PENDING'].includes(payment.status)) {
      try {
        const paymentLink = await getPayOSClient().paymentRequests.get(orderCode);
        const expectedAmount = Number(payment.expectedAmount || payment.amount);
        const paymentLinkMatches = (
          !payment.paymentLinkId
          || payment.paymentLinkId === paymentLink.id
        );
        const amountMatches = (
          Number(paymentLink.amount) === expectedAmount
          && Number(paymentLink.amountPaid) === expectedAmount
        );

        if (paymentLink.status === 'PAID' && amountMatches && paymentLinkMatches) {
          payment = await reconcileVerifiedPaidOrder(payment, paymentLink);
        } else if (paymentLink.status === 'PAID') {
          payment = await updatePayment(orderCode, {
            status: 'FAILED',
            failureReason: 'PROVIDER_RECONCILIATION_MISMATCH',
            providerVerified: false
          });
        } else if (['CANCELLED', 'EXPIRED', 'FAILED'].includes(paymentLink.status)) {
          payment = await updatePayment(orderCode, {
            status: paymentLink.status === 'CANCELLED' ? 'CANCELLED' : 'FAILED',
            failureReason: paymentLink.status,
            providerVerified: true
          });
        } else if (payment.status === 'CREATING') {
          payment = await updatePayment(orderCode, {
            status: 'PENDING',
            providerVerified: true
          });
        }
      } catch (apiErr) {
        console.warn('PayOS status reconciliation failed:', apiErr.message);
      }
    }

    if (
      payment.status === 'PAID'
      && payment.fulfillmentStatus !== 'GRANTED'
      && payment.userId
      && payment.username
      && payment.courseId
    ) {
      try {
        await grantEnrollment({
          userId: payment.userId,
          username: payment.username,
          courseId: payment.courseId,
          source: 'PAYOS',
          paymentOrderCode: orderCode
        });
        payment = await updatePayment(orderCode, {
          fulfillmentStatus: 'GRANTED',
          failureReason: null
        });
      } catch (fulfillmentError) {
        console.error(`Entitlement retry failed for order ${orderCode}:`, fulfillmentError);
      }
    }

    const access = payment.courseId
      ? await getCourseAccess(req.authUser, payment.courseId)
      : { allowed: false, reason: 'LEGACY_ORDER' };

    return res.json({
      code: "00",
      desc: "success",
      data: {
        ...normalizePaymentResponse(payment),
        entitlement: access
      }
    });
  } catch (error) {
    console.error('Payment lookup error:', error);
    return res.status(error.statusCode || error.status || 500).json({
      success: false,
      code: error.code || 'PAYMENT_STATUS_FAILED',
      message: error.statusCode === 503
        ? 'Hệ thống thanh toán đang tạm bảo trì.'
        : 'Could not load payment status'
    });
  }
};
