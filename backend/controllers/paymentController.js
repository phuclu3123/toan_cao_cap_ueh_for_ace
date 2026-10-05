import crypto from 'crypto';
import mongoose from 'mongoose';
import { getCourseOffering, listCourseOfferings } from '../config/courseCatalog.js';
import Payment from '../models/Payment.js';
import WebhookEvent from '../models/WebhookEvent.js';
import {
  getCourseAccess,
  grantEnrollment,
  repairMissingPaidEnrollment
} from '../services/enrollmentService.js';
import { hasOwnerRole, normalizeIdentifier } from '../utils/roles.js';

const PAYOS_API_BASE_URL = 'https://api-merchant.payos.vn';
const IDEMPOTENCY_KEY_PATTERN = /^[a-zA-Z0-9._:-]{16,128}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAID_PROVIDER_STATUSES = new Set(['PAID']);
const PENDING_PROVIDER_STATUSES = new Set(['PENDING', 'PROCESSING']);
const PAYOS_RECONCILE_INTERVAL_MS = 5_000;

const httpError = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const sendPaymentError = (res, error, fallbackMessage) => {
  const statusCode = error?.statusCode || (error?.code === 11000 ? 409 : 500);
  const code = error?.code === 11000
    ? 'ORDER_CONFLICT'
    : (error?.code || 'PAYMENT_OPERATION_FAILED');
  if (statusCode >= 500) console.error(`[Payment] ${code}:`, error?.message || error);
  return res.status(statusCode).json({
    success: false,
    code,
    message: statusCode >= 500 ? fallbackMessage : error.message
  });
};

const cleanSingleLine = (value, maxLength) => (
  typeof value === 'string'
    ? value.trim().replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').slice(0, maxLength)
    : ''
);

const requireDatabase = () => {
  if (mongoose.connection.readyState !== 1) {
    throw httpError(503, 'PAYMENT_STORE_UNAVAILABLE', 'Hệ thống thanh toán đang tạm bảo trì.');
  }
};

const getPayOSConfig = () => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    throw httpError(503, 'PAYOS_NOT_CONFIGURED', 'Cổng thanh toán chưa được cấu hình đầy đủ.');
  }
  return { clientId, apiKey, checksumKey };
};

const normalizedSignatureValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const createPayOSSignature = (data, checksumKey) => {
  const signedContent = Object.keys(data || {})
    .sort()
    .map((key) => `${key}=${normalizedSignatureValue(data[key])}`)
    .join('&');

  return crypto
    .createHmac('sha256', checksumKey)
    .update(signedContent)
    .digest('hex');
};

export const safeCompareSignature = (expected, received) => {
  if (!/^[a-f0-9]{64}$/i.test(expected || '') || !/^[a-f0-9]{64}$/i.test(received || '')) {
    return false;
  }
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

export const verifyPayOSDataSignature = (data, signature, checksumKey) => (
  safeCompareSignature(createPayOSSignature(data, checksumKey), signature)
);

export const verifyPayOSWebhookSignature = (body) => {
  const { checksumKey } = getPayOSConfig();
  return Boolean(body?.data && body?.signature)
    && verifyPayOSDataSignature(body.data, body.signature, checksumKey);
};

export const resolvePaymentStatus = (currentStatus, isPaidSignal) => {
  if (currentStatus === 'PAID') return 'PAID';
  if (isPaidSignal) return 'PAID';
  if (currentStatus === 'CREATING') return 'PENDING';
  return currentStatus || 'PENDING';
};

const plainPayment = (payment) => (
  typeof payment?.toObject === 'function' ? payment.toObject() : (payment || {})
);

export const normalizePaymentResponse = (payment, entitlement = undefined) => {
  const value = plainPayment(payment);
  const response = {
    orderCode: value.orderCode,
    courseId: value.courseId,
    amount: value.amount,
    description: value.description,
    status: value.status,
    paymentLinkId: value.paymentLinkId || null,
    checkoutUrl: value.checkoutUrl || null,
    qrCode: value.qrCode || null,
    reference: value.reference || null,
    paidAt: value.paidAt || null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt
  };
  if (entitlement !== undefined) response.entitlement = entitlement;
  return response;
};

const parseOrderCode = (value) => {
  const orderCode = Number(value);
  return Number.isSafeInteger(orderCode) && orderCode > 0 ? orderCode : null;
};

export const paymentResultUrls = (req) => {
  const configuredFrontend = process.env.FRONTEND_URL || process.env.CLIENT_URL;
  if (!configuredFrontend && process.env.NODE_ENV === 'production') {
    throw httpError(503, 'FRONTEND_URL_INVALID', 'Địa chỉ website thanh toán chưa được cấu hình.');
  }
  const configuredBase = configuredFrontend || 'http://localhost:5173';
  let base;
  try {
    base = new URL(configuredBase);
  } catch {
    throw httpError(503, 'FRONTEND_URL_INVALID', 'Địa chỉ website thanh toán chưa được cấu hình đúng.');
  }
  if (!['http:', 'https:'].includes(base.protocol)) {
    throw httpError(503, 'FRONTEND_URL_INVALID', 'Địa chỉ website thanh toán chưa được cấu hình đúng.');
  }

  const returnUrl = new URL('/payment/result', base);
  const cancelUrl = new URL('/payment/result', base);
  cancelUrl.searchParams.set('cancelled', '1');
  return { returnUrl: returnUrl.toString(), cancelUrl: cancelUrl.toString() };
};

const fetchPayOS = async (path, options = {}) => {
  const { clientId, apiKey } = getPayOSConfig();
  let response;
  try {
    response = await fetch(`${PAYOS_API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey,
        ...options.headers
      },
      signal: AbortSignal.timeout(12_000)
    });
  } catch (error) {
    throw httpError(502, 'PAYOS_UNAVAILABLE', `Không thể kết nối PayOS: ${error.message}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw httpError(502, 'PAYOS_INVALID_RESPONSE', 'PayOS trả về phản hồi không hợp lệ.');
  }
  if (!response.ok) {
    const retryableStatus = response.status >= 500
      || [408, 409, 425, 429].includes(response.status);
    const code = retryableStatus ? 'PAYOS_UNAVAILABLE' : 'PAYOS_REJECTED';
    throw httpError(502, code, 'PayOS chưa thể xử lý yêu cầu thanh toán.');
  }
  if (!payload || typeof payload !== 'object' || typeof payload.code !== 'string') {
    throw httpError(502, 'PAYOS_INVALID_RESPONSE', 'PayOS trả về phản hồi không hợp lệ.');
  }
  if (payload.code !== '00') {
    throw httpError(502, 'PAYOS_REJECTED', 'PayOS chưa thể xử lý yêu cầu thanh toán.');
  }
  return payload;
};

const fetchPayOSPayment = async (orderCode) => {
  const result = await fetchPayOS(`/v2/payment-requests/${orderCode}`, { method: 'GET' });
  const { checksumKey } = getPayOSConfig();
  if (!result.data || !verifyPayOSDataSignature(result.data, result.signature, checksumKey)) {
    throw httpError(502, 'PAYOS_INVALID_RESPONSE', 'Phản hồi đối soát PayOS không hợp lệ.');
  }
  return result.data;
};

const providerStatus = (status, currentStatus) => {
  const normalized = String(status || '').toUpperCase();
  if (currentStatus === 'PAID') return 'PAID';
  if (PAID_PROVIDER_STATUSES.has(normalized)) return 'PAID';
  if (PENDING_PROVIDER_STATUSES.has(normalized)) return 'PENDING';
  if (normalized === 'CANCELLED') return 'CANCELLED';
  return currentStatus === 'CREATING' ? 'PENDING' : currentStatus;
};

export const shouldReconcilePayment = (payment, now = Date.now()) => {
  if (!['CREATING', 'PENDING'].includes(payment?.status)) return false;
  const lastCheckedAt = payment.providerStatusCheckedAt
    ? new Date(payment.providerStatusCheckedAt).getTime()
    : 0;
  return !Number.isFinite(lastCheckedAt)
    || now - lastCheckedAt >= PAYOS_RECONCILE_INTERVAL_MS;
};

const acquireReconciliationLease = async (payment, now = new Date()) => {
  if (!shouldReconcilePayment(payment, now.getTime())) return null;
  const staleBefore = new Date(now.getTime() - PAYOS_RECONCILE_INTERVAL_MS);
  return Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: { $in: ['CREATING', 'PENDING'] },
      $or: [
        { providerStatusCheckedAt: null },
        { providerStatusCheckedAt: { $exists: false } },
        { providerStatusCheckedAt: { $lte: staleBefore } }
      ]
    },
    { $set: { providerStatusCheckedAt: now } },
    { new: true }
  );
};

export const resolveBuyerEmail = (requestedEmail, authUser) => {
  const accountEmail = normalizeIdentifier(authUser?.username || authUser?.email);
  const submittedEmail = normalizeIdentifier(requestedEmail || accountEmail);
  if (!EMAIL_PATTERN.test(accountEmail)) {
    throw httpError(400, 'INVALID_BUYER', 'Tài khoản chưa có email hợp lệ.');
  }
  if (submittedEmail !== accountEmail) {
    throw httpError(
      400,
      'BUYER_EMAIL_MISMATCH',
      'Email nhận quyền học phải trùng với tài khoản đang đăng nhập.'
    );
  }
  return accountEmail;
};

const isPayOSCheckoutUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && !url.username
      && !url.password
      && (url.hostname === 'payos.vn' || url.hostname.endsWith('.payos.vn'));
  } catch {
    return false;
  }
};

export const validatePayOSCreateResponse = (providerData, payment) => {
  const valid = providerData
    && parseOrderCode(providerData.orderCode) === Number(payment.orderCode)
    && Number(providerData.amount) === Number(payment.amount)
    && PENDING_PROVIDER_STATUSES.has(String(providerData.status || '').toUpperCase())
    && Boolean(cleanSingleLine(providerData.paymentLinkId, 160))
    && isPayOSCheckoutUrl(providerData.checkoutUrl);
  if (!valid) {
    throw httpError(502, 'PAYOS_INVALID_RESPONSE', 'Phản hồi tạo đơn PayOS không khớp với đơn hàng.');
  }

  return {
    paymentLinkId: cleanSingleLine(providerData.paymentLinkId, 160),
    checkoutUrl: new URL(providerData.checkoutUrl).toString(),
    qrCode: cleanSingleLine(providerData.qrCode, 8_000)
  };
};

export const isStrictPayOSPaidSignal = (body) => (
  body?.success === true
  && body?.code === '00'
  && body?.data?.code === '00'
);

export const classifyPayOSWebhook = (body, payment) => {
  if (!payment) return { accepted: false, reason: 'UNKNOWN_ORDER' };
  if (!isStrictPayOSPaidSignal(body)) {
    return { accepted: false, reason: 'NON_SUCCESS_EVENT' };
  }
  if (Number(body.data.amount) !== Number(payment.amount)) {
    return { accepted: false, reason: 'AMOUNT_MISMATCH' };
  }
  if (payment.paymentLinkId && payment.paymentLinkId !== body.data.paymentLinkId) {
    return { accepted: false, reason: 'PAYMENT_LINK_MISMATCH' };
  }
  return { accepted: true, reason: null };
};

const paymentBelongsToUser = (payment, user) => (
  hasOwnerRole(user)
  || (payment.userId && payment.userId === user.id)
  || (payment.username && normalizeIdentifier(payment.username) === normalizeIdentifier(user.username))
);

const createOrderCode = () => Number(`${Date.now()}${crypto.randomInt(100, 1000)}`);

const reserveOrder = async ({ user, course, idempotencyKey, buyer }) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderCode = createOrderCode();
    const description = `TCC${String(orderCode).slice(-6)}`;
    try {
      const payment = await Payment.create({
        orderCode,
        userId: user.id,
        username: normalizeIdentifier(user.username),
        courseId: course.id,
        idempotencyKey,
        amount: course.amount,
        description,
        status: 'CREATING',
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone
      });
      return { payment, reused: false };
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const existing = await Payment.findOne({ userId: user.id, idempotencyKey });
      if (existing) return { payment: existing, reused: true };
    }
  }
  throw httpError(503, 'ORDER_CODE_UNAVAILABLE', 'Chưa thể cấp mã đơn hàng. Vui lòng thử lại.');
};

export const persistPayOSCreateResult = async (
  payment,
  providerDetails,
  paymentModel = Payment
) => {
  const update = {
    paymentLinkId: providerDetails.paymentLinkId,
    checkoutUrl: providerDetails.checkoutUrl,
    qrCode: providerDetails.qrCode || null,
    failureReason: null,
    providerStatusCheckedAt: new Date()
  };

  let current = await paymentModel.findOneAndUpdate(
    { _id: payment._id, status: 'CREATING' },
    { $set: { ...update, status: 'PENDING' } },
    { new: true, runValidators: true }
  );
  if (current) return current;

  // A webhook can win the race and move the order to PENDING/PAID before the
  // create response is persisted. Attach presentation metadata without ever
  // writing an older status over the newer one.
  current = await paymentModel.findOneAndUpdate(
    { _id: payment._id, status: { $in: ['PENDING', 'PAID'] } },
    { $set: update },
    { new: true, runValidators: true }
  );
  if (current) return current;

  current = await paymentModel.findById(payment._id);
  if (current) return current;
  throw httpError(409, 'ORDER_STATE_CONFLICT', 'Trạng thái đơn hàng vừa thay đổi.');
};

const runTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

const paidAmountIsValid = (payment, providerData) => {
  const expected = Number(payment.amount);
  const transactionAmount = Number(providerData.amount);
  const totalPaid = providerData.amountPaid === undefined
    ? transactionAmount
    : Number(providerData.amountPaid);
  return Number.isSafeInteger(expected)
    && transactionAmount === expected
    && totalPaid >= expected;
};

const activatePaidOrder = async (orderCode, providerData, mongoSession = null) => {
  let query = Payment.findOne({ orderCode });
  if (mongoSession) query = query.session(mongoSession);
  const payment = await query;
  if (!payment) return null;
  if (!paidAmountIsValid(payment, providerData)) {
    throw httpError(409, 'PAYMENT_AMOUNT_MISMATCH', 'Số tiền PayOS không khớp với đơn hàng.');
  }

  const wasAlreadyPaid = payment.status === 'PAID';
  payment.status = 'PAID';
  payment.reference = cleanSingleLine(
    providerData.reference || providerData.transactions?.[0]?.reference,
    160
  ) || payment.reference;
  payment.paidAt = cleanSingleLine(
    providerData.transactionDateTime || providerData.transactions?.[0]?.transactionDateTime,
    80
  ) || payment.paidAt;
  payment.paymentLinkId = cleanSingleLine(providerData.paymentLinkId || providerData.id, 160)
    || payment.paymentLinkId;
  payment.lastWebhookAt = new Date();
  payment.providerStatusCheckedAt = new Date();
  await payment.save({ session: mongoSession || undefined });

  let enrollment = null;
  if (payment.userId && payment.username && payment.courseId) {
    const enrollmentDetails = {
      userId: payment.userId,
      username: payment.username,
      courseId: payment.courseId,
      paymentOrderCode: payment.orderCode,
      mongoSession
    };
    enrollment = wasAlreadyPaid
      ? await repairMissingPaidEnrollment(enrollmentDetails)
      : await grantEnrollment({ ...enrollmentDetails, source: 'PAYOS' });
  }
  return { payment, enrollment };
};

const ensurePaidEnrollment = async (payment) => {
  if (payment.status !== 'PAID' || !payment.userId || !payment.username || !payment.courseId) return null;
  return repairMissingPaidEnrollment({
    userId: payment.userId,
    username: payment.username,
    courseId: payment.courseId,
    paymentOrderCode: payment.orderCode
  });
};

const reconcileOrder = async (payment) => {
  if (!['CREATING', 'PENDING'].includes(payment.status)) return payment;
  const providerData = await fetchPayOSPayment(payment.orderCode);
  const nextStatus = providerStatus(providerData.status, payment.status);

  if (nextStatus === 'PAID') {
    const activated = await runTransaction(
      (session) => activatePaidOrder(payment.orderCode, providerData, session)
    );
    return activated?.payment || payment;
  }

  const updated = await Payment.findOneAndUpdate(
    { orderCode: payment.orderCode, status: { $ne: 'PAID' } },
    {
      $set: {
        status: nextStatus,
        providerStatusCheckedAt: new Date(),
        paymentLinkId: cleanSingleLine(providerData.id || providerData.paymentLinkId, 160)
          || payment.paymentLinkId
      }
    },
    { new: true, runValidators: true }
  );
  if (updated) return updated;
  const current = await Payment.findById(payment._id);
  return current || payment;
};

export const shouldMarkCreateFailure = (error) => error?.code === 'PAYOS_REJECTED';

export const createOrder = async (req, res) => {
  try {
    requireDatabase();
    const course = getCourseOffering(req.body?.courseId);
    if (!course) throw httpError(404, 'COURSE_NOT_FOUND', 'Khóa học không tồn tại.');

    const existingAccess = await getCourseAccess(req.authUser, course.id);
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

    if (course.amount === 0) {
      const enrollment = await grantEnrollment({
        userId: req.authUser.id,
        username: req.authUser.username,
        courseId: course.id,
        source: 'FREE'
      });
      return res.status(201).json({
        success: true,
        data: {
          courseId: course.id,
          amount: 0,
          isFree: true,
          status: 'PAID',
          entitlement: { allowed: true, reason: 'ENROLLED', enrollment }
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

    const reserved = await reserveOrder({
      user: req.authUser,
      course,
      idempotencyKey,
      buyer
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
    if (shouldMarkCreateFailure(error)) {
      const key = cleanSingleLine(req.get('Idempotency-Key'), 128);
      if (key && req.authUser?.id) {
        await Payment.updateOne(
          { userId: req.authUser.id, idempotencyKey: key, status: 'CREATING' },
          { $set: { status: 'FAILED', failureReason: error.code } }
        ).catch(() => {});
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
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${req.body.signature}:${JSON.stringify(data)}`)
      .digest('hex');
    let outcome = { duplicate: false, rejected: false, reason: null };

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

const safeCompareText = (expected, received) => {
  const expectedBuffer = Buffer.from(String(expected));
  const receivedBuffer = Buffer.from(String(received));
  return expectedBuffer.length === receivedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const providerTransactions = (data) => {
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (data?.transactions && typeof data.transactions === 'object') {
    return Object.values(data.transactions);
  }
  return [];
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
