import crypto from 'crypto';
import { acceptSupportWebhook } from '../application/supportPaymentService.js';
import { getCourseOffering, listCourseOfferings } from '../../../learning/index.js';
import Payment from '../persistence/Payment.js';
import WebhookEvent from '../persistence/WebhookEvent.js';
import PayosWebhookRelay from '../persistence/PayosWebhookRelay.js';
import { forwardBroomSharingWebhook, validateRelayDestination } from '../integrations/broomsharingWebhookRelay.js';
import { getCourseAccess, grantEnrollment } from '../../../access/index.js';
import { normalizeIdentifier } from '../../../identity/index.js';
import { validatePurchaseConsent } from '../../config/purchaseTerms.js';
import { getSellableOffering, quoteCheckout, releaseFailedPromotion } from '../../application/courseCommerceService.js';
import { IDEMPOTENCY_KEY_PATTERN, EMAIL_PATTERN, httpError, cleanSingleLine, requireDatabase, getPayOSConfig, createPayOSSignature, verifyPayOSDataSignature, verifyPayOSWebhookSignature, normalizePaymentResponse, parseOrderCode, paymentResultUrls, fetchPayOS, fetchPayOSPayment, providerStatus, shouldReconcilePayment, acquireReconciliationLease, resolveBuyerEmail, validatePayOSCreateResponse, classifyPayOSWebhook, paymentBelongsToUser, reserveOrder, persistPayOSCreateResult, runTransaction, recordVerifiedPayment, activatePaidOrder, ensurePaidEnrollment, reconcileOrder, shouldMarkCreateFailure, safeCompareText, providerTransactions } from '../application/paymentService.js';


const sendPaymentError = (res, error, fallbackMessage) => {
  const statusCode = error?.statusCode || (error?.code === 11000 ? 409 : 500);
  const code = error?.code === 11000
    ? 'ORDER_CONFLICT'
    : (error?.code || 'PAYMENT_OPERATION_FAILED');
  if (error?.retryAfterMs > 0) res.setHeader?.('Retry-After', String(Math.ceil(error.retryAfterMs / 1000)));
  if (statusCode >= 500) console.error(`[Payment] ${code}:`, { providerCode: error?.providerCode || null, providerHttpStatus: error?.providerHttpStatus || null });
  return res.status(statusCode).json({
    success: false,
    code,
    message: statusCode >= 500 ? fallbackMessage : error.message
  });
};


export const createOrder = async (req, res) => {
  try {
    requireDatabase();
    let course = getCourseOffering(req.body?.courseId);
    if (!course) throw httpError(404, 'COURSE_NOT_FOUND', 'Khóa học không tồn tại.');

    const existingAccess = await getCourseAccess(req.authUser, course.id);
    if (existingAccess.reason === 'REVOKED') throw httpError(403, 'ACCESS_REVOKED', 'Quyền học đã bị thu hồi. Vui lòng liên hệ admin để khôi phục.');
    if (existingAccess.allowed) {
      return res.json({
        success: true,
        data: {
          courseId: course.id,
          amount: course.amount,
          isFree: course.amount === 0,
          status: 'PAID',
          entitlement: existingAccess
        }
      });
    }

    getPayOSConfig();
    const idempotencyKey = cleanSingleLine(req.get('Idempotency-Key'), 128);
    if (!IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
      throw httpError(400, 'INVALID_IDEMPOTENCY_KEY', 'Idempotency-Key không hợp lệ.');
    }

    const buyerEmail = resolveBuyerEmail(req.body?.buyerEmail, req.authUser);
    const buyer = {
      name: cleanSingleLine(req.body?.buyerName || req.authUser.name, 100),
      email: buyerEmail,
      phone: cleanSingleLine(req.body?.buyerPhone || req.authUser.phoneNumber, 30)
    };
    if (!buyer.name || !EMAIL_PATTERN.test(buyer.email) || !buyer.phone) {
      throw httpError(400, 'INVALID_BUYER', 'Thông tin học viên chưa hợp lệ.');
    }

    // Idempotent retries return the original price and consent, including
    // legacy orders. New policies never rewrite previously created orders.
    const previousOrder = await Payment.findOne({ userId: req.authUser.id, idempotencyKey });
    let quote = null; let purchaseConsent = null;
    if (!previousOrder) {
      course = await getSellableOffering(course.id);
      quote = await quoteCheckout(course.id, req.authUser, req.body?.promotionCode || '');
      if (req.body?.quote?.priceVersion !== quote.priceVersion || req.body?.quote?.promotionId !== quote.promotionId || req.body?.quote?.amount !== quote.amount) throw httpError(409, 'CHECKOUT_PRICE_CHANGED', 'Giá hoặc ưu đãi vừa thay đổi. Vui lòng kiểm tra tổng thanh toán và xác nhận lại.');
      purchaseConsent = validatePurchaseConsent(req.body?.purchaseConsent, req.authUser, quote.amount);
    }
    const reserved = previousOrder ? { payment: previousOrder, reused: true } : await reserveOrder({
      user: req.authUser,
      course,
      idempotencyKey,
      buyer,
      quote,
      promotionCode: req.body?.promotionCode || '',
      purchaseConsent
    });
    let payment = reserved.payment;
    if (payment.courseId !== course.id) {
      throw httpError(409, 'IDEMPOTENCY_KEY_REUSED', 'Khóa idempotency đã dùng cho khóa học khác.');
    }
    if (reserved.reused) {
      const enrollment = await ensurePaidEnrollment(payment);
      return res.status(payment.status === 'CREATING' ? 202 : 200).json({
        success: true,
        data: normalizePaymentResponse(
          payment,
          enrollment ? { allowed: true, reason: 'ENROLLED', enrollment } : undefined
        )
      });
    }

    const { returnUrl, cancelUrl } = paymentResultUrls(req);
    const signatureData = {
      amount: payment.amount,
      cancelUrl,
      description: payment.description,
      orderCode: payment.orderCode,
      returnUrl
    };
    const { checksumKey } = getPayOSConfig();
    const providerResult = await fetchPayOS('/v2/payment-requests', {
      method: 'POST',
      body: JSON.stringify({
        ...signatureData,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone,
        expiredAt: Math.floor(new Date(payment.expiresAt).getTime() / 1000),
        signature: createPayOSSignature(signatureData, checksumKey)
      })
    });
    if (
      !providerResult.data
      || !verifyPayOSDataSignature(providerResult.data, providerResult.signature, checksumKey)
    ) {
      throw httpError(502, 'PAYOS_INVALID_RESPONSE', 'Phản hồi tạo đơn PayOS không hợp lệ.');
    }

    const providerDetails = validatePayOSCreateResponse(providerResult.data, payment);
    payment = await persistPayOSCreateResult(payment, providerDetails);

    return res.status(201).json({ success: true, data: normalizePaymentResponse(payment) });
  } catch (error) {
    if (['CHECKOUT_PRICE_CHANGED', 'PROMOTION_UNAVAILABLE', 'PROMOTION_USER_LIMIT'].includes(error.code) && req.authUser?.id) {
      const key = cleanSingleLine(req.get('Idempotency-Key'), 128);
      // A simultaneous idempotent request can consume the final coupon slot
      // before this request finishes quoting. Its committed order wins.
      const existing = IDEMPOTENCY_KEY_PATTERN.test(key) ? await Payment.findOne({ userId: req.authUser.id, idempotencyKey: key, courseId: req.body?.courseId }).catch(() => null) : null;
      if (existing) return res.status(existing.status === 'CREATING' ? 202 : 200).json({ success: true, data: normalizePaymentResponse(existing) });
    }
    if (shouldMarkCreateFailure(error)) {
      const key = cleanSingleLine(req.get('Idempotency-Key'), 128);
      if (key && req.authUser?.id) {
        await Payment.updateOne(
          { userId: req.authUser.id, idempotencyKey: key, status: 'CREATING' },
          { $set: { status: 'FAILED', failureReason: error.code } }
        ).catch(() => {});
        const failed = await Payment.findOne({ userId: req.authUser.id, idempotencyKey: key, status: 'FAILED' }).select('orderCode').lean().catch(() => null);
        if (failed) await releaseFailedPromotion(failed.orderCode).catch(() => {});
      }
    }
    return sendPaymentError(res, error, 'Không thể tạo đơn thanh toán lúc này.');
  }
};


// Backward-compatible controller name. The route still applies authentication,
// server-side pricing and idempotency before this function runs.
export const createPayment = createOrder;


export const getPaymentStatus = async (req, res) => {
  const orderCode = parseOrderCode(req.params.orderCode);
  if (!orderCode) {
    return res.status(400).json({ success: false, code: 'INVALID_ORDER_CODE', message: 'Mã đơn không hợp lệ.' });
  }

  try {
    requireDatabase();
    let payment = await Payment.findOne({ orderCode });
    if (!payment) throw httpError(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.');
    if (!paymentBelongsToUser(payment, req.authUser)) {
      throw httpError(403, 'ORDER_FORBIDDEN', 'Đơn hàng không thuộc tài khoản này.');
    }

    if (shouldReconcilePayment(payment)) {
      try {
        const leasedPayment = await acquireReconciliationLease(payment);
        if (leasedPayment) {
          payment = await reconcileOrder(leasedPayment);
        } else {
          payment = await Payment.findById(payment._id) || payment;
        }
      } catch (error) {
        console.warn(`[Payment] Could not reconcile order ${orderCode}: ${error.code || error.message}`);
      }
    }

    const repairedEnrollment = await ensurePaidEnrollment(payment);
    const entitlement = repairedEnrollment
      ? { allowed: true, reason: 'ENROLLED', enrollment: repairedEnrollment }
      : await getCourseAccess(req.authUser, payment.courseId);

    return res.json({
      success: true,
      code: '00',
      desc: 'success',
      data: normalizePaymentResponse(payment, entitlement)
    });
  } catch (error) {
    return sendPaymentError(res, error, 'Không thể tải trạng thái thanh toán.');
  }
};


export const handleWebhook = async (req, res) => {
  let signatureValid = false;
  try {
    signatureValid = verifyPayOSWebhookSignature(req.body);
  } catch (error) {
    return sendPaymentError(res, error, 'Không thể kiểm tra webhook PayOS.');
  }
  if (!signatureValid) {
    return res.status(400).json({ success: false, code: 'INVALID_PAYOS_SIGNATURE', message: 'Chữ ký PayOS không hợp lệ.' });
  }

  const data = req.body.data;
  const orderCode = parseOrderCode(data.orderCode);
  if (!orderCode) {
    return res.status(400).json({ success: false, code: 'INVALID_ORDER_CODE', message: 'Mã đơn không hợp lệ.' });
  }

  try {
    requireDatabase();
    const support=await acceptSupportWebhook(req.body);
    if(support) return res.json(support);
    const relayed = await forwardBroomSharingWebhook(req.body, {
      hasCourseOrder: (code) => Payment.exists({ orderCode: code }),
      readRelay: () => PayosWebhookRelay.findOne({ key: 'BROOMSHARING' }).lean()
    });
    if (relayed) return res.json({ success: true, relayed: 'BROOMSHARING' });
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${req.body.signature}:${JSON.stringify(data)}`)
      .digest('hex');
    let outcome = { duplicate: false, rejected: false, reason: null };
    const verifiedOrder=await Payment.findOne({orderCode});
    if(classifyPayOSWebhook(req.body,verifiedOrder).accepted) await recordVerifiedPayment(verifiedOrder);

    try {
      outcome = await runTransaction(async (session) => {
        const payment = await Payment.findOne({ orderCode }).session(session);
        const classification = classifyPayOSWebhook(req.body, payment);

        await WebhookEvent.create([{
          fingerprint,
          provider: 'PAYOS',
          orderCode,
          checksumVerified: true,
          status: classification.accepted ? 'PROCESSED' : 'REJECTED',
          reason: classification.reason,
          eventSummary: {
            code: req.body.code,
            success: req.body.success,
            amount: Number(data.amount) || 0,
            reference: cleanSingleLine(data.reference, 160),
            paymentLinkId: cleanSingleLine(data.paymentLinkId, 160)
          }
        }], { session });

        if (!classification.accepted) {
          return { duplicate: false, rejected: true, reason: classification.reason };
        }

        await activatePaidOrder(orderCode, data, session);
        return { duplicate: false, rejected: false, reason: null };
      });
    } catch (error) {
      if (error?.code === 11000) outcome = { duplicate: true, rejected: false, reason: null };
      else throw error;
    }

    return res.json({
      success: true,
      duplicate: outcome.duplicate,
      ignored: outcome.rejected,
      reason: outcome.reason
    });
  } catch (error) {
    return sendPaymentError(res, error, 'Không thể xử lý webhook PayOS.');
  }
};


// Reuses the existing server-only setup token. It does not change the provider's webhook URL.
export const configureBroomSharingRelay = async (req, res) => {
  const expected = process.env.PAYOS_CONFIRM_TOKEN || '';
  if (!expected || !safeCompareText(expected, req.get('x-payos-confirm-token') || '')) {
    return res.status(401).json({ success: false, code: 'UNAUTHORIZED' });
  }
  let destination;
  try { destination = validateRelayDestination(req.body?.destination); }
  catch { return res.status(400).json({ success: false, code: 'INVALID_RELAY_DESTINATION' }); }
  try {
    requireDatabase();
    await PayosWebhookRelay.findOneAndUpdate({ key: 'BROOMSHARING' },
      { $set: { destination } }, { upsert: true, returnDocument: 'after' });
    return res.json({ success: true, relay: 'BROOMSHARING', destination });
  } catch (error) { return sendPaymentError(res, error, 'Cannot configure BroomSharing webhook relay.'); }
};


export const confirmWebhook = async (req, res) => {
  const confirmToken = process.env.PAYOS_CONFIRM_TOKEN || '';
  const suppliedToken = req.get('x-payos-confirm-token') || '';
  if (!confirmToken || !safeCompareText(confirmToken, suppliedToken)) {
    return res.status(401).json({ success: false, code: 'UNAUTHORIZED', message: 'Không được phép cấu hình webhook.' });
  }

  let webhookUrl;
  try {
    webhookUrl = new URL(req.body?.webhookUrl);
    if (webhookUrl.protocol !== 'https:') throw new Error('HTTPS required');
  } catch {
    return res.status(400).json({ success: false, code: 'INVALID_WEBHOOK_URL', message: 'Webhook URL phải là địa chỉ HTTPS hợp lệ.' });
  }

  try {
    const result = await fetchPayOS('/confirm-webhook', {
      method: 'POST',
      body: JSON.stringify({ webhookUrl: webhookUrl.toString() })
    });
    return res.json({ success: true, payos: result });
  } catch (error) {
    return sendPaymentError(res, error, 'Không thể cấu hình webhook PayOS.');
  }
};


export const claimLegacyOrder = async (req, res) => {
  const orderCode = parseOrderCode(req.body?.orderCode);
  const reference = cleanSingleLine(req.body?.reference, 160);
  if (!orderCode || reference.length < 6) {
    return res.status(400).json({ success: false, code: 'INVALID_CLAIM', message: 'Thông tin đối soát không hợp lệ.' });
  }

  try {
    requireDatabase();
    const providerData = await fetchPayOSPayment(orderCode);
    if (providerStatus(providerData.status) !== 'PAID') {
      throw httpError(409, 'ORDER_NOT_PAID', 'PayOS chưa xác nhận đơn hàng đã thanh toán.');
    }
    const matchingTransaction = providerTransactions(providerData).find(
      (transaction) => cleanSingleLine(transaction?.reference, 160) === reference
    );
    if (!matchingTransaction) {
      throw httpError(400, 'CLAIM_NOT_VERIFIED', 'Không thể xác minh mã tham chiếu giao dịch.');
    }

    const providerAmount = Number(providerData.amount);
    const providerAmountPaid = Number(providerData.amountPaid ?? providerData.amount);
    if (providerAmountPaid < providerAmount) {
      throw httpError(409, 'ORDER_NOT_PAID', 'PayOS chưa ghi nhận đủ số tiền của đơn hàng.');
    }
    let existing = await Payment.findOne({ orderCode });
    let course = existing?.courseId ? getCourseOffering(existing.courseId) : null;
    if (!course) {
      const matches = listCourseOfferings().filter(
        (offering) => offering.amount > 0 && offering.amount === providerAmount
      );
      if (matches.length !== 1) {
        throw httpError(409, 'COURSE_CLAIM_AMBIGUOUS', 'Không xác định được khóa học của giao dịch này.');
      }
      [course] = matches;
    }
    if (providerAmount !== course.amount) {
      throw httpError(409, 'PAYMENT_AMOUNT_MISMATCH', 'Số tiền giao dịch không khớp khóa học.');
    }
    if (existing?.userId && !paymentBelongsToUser(existing, req.authUser)) {
      throw httpError(409, 'ORDER_ALREADY_CLAIMED', 'Đơn hàng đã thuộc một tài khoản khác.');
    }

    const result = await runTransaction(async (session) => {
      existing = await Payment.findOne({ orderCode }).session(session);
      if (existing?.userId && !paymentBelongsToUser(existing, req.authUser)) {
        throw httpError(409, 'ORDER_ALREADY_CLAIMED', 'Đơn hàng đã thuộc một tài khoản khác.');
      }

      let payment;
      if (existing) {
        existing.userId = req.authUser.id;
        existing.username = normalizeIdentifier(req.authUser.username);
        existing.courseId = course.id;
        if(!existing.verifiedPaidAt) { existing.verifiedPaidAt=new Date(); existing.verifiedPaidAmount=course.amount; }
        existing.status = 'PAID';
        existing.amount = course.amount;
        existing.reference = reference;
        existing.paidAt = cleanSingleLine(matchingTransaction.transactionDateTime, 80) || existing.paidAt;
        payment = await existing.save({ session });
      } else {
        [payment] = await Payment.create([{
          orderCode,
          userId: req.authUser.id,
          username: normalizeIdentifier(req.authUser.username),
          courseId: course.id,
          idempotencyKey: `legacy:${orderCode}`,
          verifiedPaidAt:new Date(), verifiedPaidAmount:course.amount,
          amount: course.amount,
          description: `TCC${String(orderCode).slice(-6)}`,
          status: 'PAID',
          paymentLinkId: cleanSingleLine(providerData.id || providerData.paymentLinkId, 160),
          reference,
          paidAt: cleanSingleLine(matchingTransaction.transactionDateTime, 80)
        }], { session });
      }

      const enrollment = await grantEnrollment({
        userId: req.authUser.id,
        username: req.authUser.username,
        courseId: course.id,
        source: 'PAYOS',
        paymentOrderCode: orderCode,
        mongoSession: session
      });
      return { payment, enrollment };
    });

    return res.json({
      success: true,
      data: {
        ...normalizePaymentResponse(result.payment),
        entitlement: { allowed: true, reason: 'ENROLLED', enrollment: result.enrollment }
      }
    });
  } catch (error) {
    return sendPaymentError(res, error, 'Không thể đối soát giao dịch cũ.');
  }
};

// Temporary exports for existing maintenance tools; production consumers use payments/index.js.
export * from '../application/paymentService.js';
export { startCommerceMaintenance } from '../jobs/commerceMaintenance.js';
