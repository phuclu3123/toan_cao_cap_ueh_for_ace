import crypto from 'crypto';
import mongoose from 'mongoose';
import Payment from '../persistence/Payment.js';
import { repairMissingPaidEnrollment } from '../../../access/index.js';
import { hasOwnerRole, normalizeIdentifier } from '../../../identity/index.js';
import { reserveCommerceOrder, settlePromotion, releaseFailedPromotion } from '../../application/courseCommerceService.js';


export const PAYOS_API_BASE_URL = 'https://api-merchant.payos.vn';

export const IDEMPOTENCY_KEY_PATTERN = /^[a-zA-Z0-9._:-]{16,128}$/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PAID_PROVIDER_STATUSES = new Set(['PAID']);

export const PENDING_PROVIDER_STATUSES = new Set(['PENDING', 'PROCESSING']);

export const PAYOS_RECONCILE_INTERVAL_MS = 5_000;


export const httpError = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};


export const cleanSingleLine = (value, maxLength) => (
  typeof value === 'string'
    ? value.trim().replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').slice(0, maxLength)
    : ''
);


export const requireDatabase = () => {
  if (mongoose.connection.readyState !== 1) {
    throw httpError(503, 'PAYMENT_STORE_UNAVAILABLE', 'Hệ thống thanh toán đang tạm bảo trì.');
  }
};


export const getPayOSConfig = () => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    throw httpError(503, 'PAYOS_NOT_CONFIGURED', 'Cổng thanh toán chưa được cấu hình đầy đủ.');
  }
  return { clientId, apiKey, checksumKey };
};


export const normalizedSignatureValue = (value) => {
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


export const plainPayment = (payment) => (
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
    updatedAt: value.updatedAt,
    expiresAt: value.expiresAt,
    serverNow: new Date().toISOString(),
    ...(value.pricingSnapshot ? { pricingSnapshot: value.pricingSnapshot } : {})
  };
  if (entitlement !== undefined) response.entitlement = entitlement;
  return response;
};


export const parseOrderCode = (value) => {
  const orderCode = Number(value);
  return Number.isSafeInteger(orderCode) && orderCode > 0 ? orderCode : null;
};


export const paymentResultUrls = () => {
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


// One merchant cooldown is shared by course orders, donations and maintenance.
// Serialize outbound requests so an in-flight 429 cannot be followed by a burst.
export function createPayOSClient({ fetchImpl = (...args) => fetch(...args), now = Date.now } = {}) {
  let retryAt = 0;
  let queue = Promise.resolve();
  const request = async (path, options = {}) => {
  if (now() < retryAt) {
    const error = httpError(503, 'PAYOS_COOLDOWN', 'PayOS đang tạm giới hạn yêu cầu. Vui lòng chờ rồi thử lại.');
    error.providerHttpStatus = 429;
    error.retryAfterMs = retryAt - now();
    throw error;
  }
  const { clientId, apiKey } = getPayOSConfig();
  let response;
  try {
    response = await fetchImpl(`${PAYOS_API_BASE_URL}${path}`, {
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
  } catch {
    throw httpError(502, 'PAYOS_UNAVAILABLE', 'Không thể kết nối PayOS. Vui lòng thử lại.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch { payload = null; }
  const fail = (code, message) => {
    const error = httpError(code === 'PAYOS_AUTH_FAILED' ? 503 : 502, code, message);
    // Retain bounded diagnostic metadata, never credentials, bank data or the raw body.
    error.providerHttpStatus = response.status;
    error.providerCode = typeof payload?.code === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(payload.code) ? payload.code : null;
    const header = response.headers?.get?.('retry-after');
    const seconds = Number(header);
    const delay = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : Date.parse(header) - now();
    if (Number.isFinite(delay) && delay > 0) error.retryAfterMs = Math.min(delay, 60 * 60 * 1000);
    if (response.status === 429) {
      error.retryAfterMs ||= 60_000;
      retryAt = now() + error.retryAfterMs;
    }
    throw error;
  };
  if (!response.ok) {
    if ([401, 403].includes(response.status)) fail('PAYOS_AUTH_FAILED', 'Cấu hình kết nối PayOS cần được kiểm tra.');
    const retryableStatus = response.status >= 500
      || [408, 409, 425, 429].includes(response.status);
    const code = retryableStatus ? 'PAYOS_UNAVAILABLE' : 'PAYOS_REJECTED';
    fail(code, 'PayOS chưa thể xử lý yêu cầu thanh toán.');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || typeof payload.code !== 'string') {
    fail('PAYOS_INVALID_RESPONSE', 'PayOS trả về phản hồi không hợp lệ.');
  }
  if (payload.code !== '00') {
    fail('PAYOS_REJECTED', 'PayOS chưa thể xử lý yêu cầu thanh toán.');
  }
  return payload;
  };
  return (path, options) => {
    const result = queue.then(() => request(path, options));
    queue = result.catch(() => {});
    return result;
  };
}

export const fetchPayOS = createPayOSClient();


export const fetchPayOSPayment = async (orderCode) => {
  const result = await fetchPayOS(`/v2/payment-requests/${orderCode}`, { method: 'GET' });
  const { checksumKey } = getPayOSConfig();
  if (!result.data || !verifyPayOSDataSignature(result.data, result.signature, checksumKey)) {
    throw httpError(502, 'PAYOS_INVALID_RESPONSE', 'Phản hồi đối soát PayOS không hợp lệ.');
  }
  return result.data;
};


export const providerStatus = (status, currentStatus) => {
  const normalized = String(status || '').toUpperCase();
  if (currentStatus === 'PAID') return 'PAID';
  if (PAID_PROVIDER_STATUSES.has(normalized)) return 'PAID';
  if (PENDING_PROVIDER_STATUSES.has(normalized)) return 'PENDING';
  if (['CANCELLED', 'EXPIRED'].includes(normalized)) return 'CANCELLED';
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


export const acquireReconciliationLease = async (payment, now = new Date()) => {
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
    { returnDocument: 'after' }
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


export const isPayOSCheckoutUrl = (value) => {
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


export const paymentBelongsToUser = (payment, user) => (
  hasOwnerRole(user)
  || (payment.userId
    ? payment.userId === user.id
    : Boolean(payment.username && normalizeIdentifier(payment.username) === normalizeIdentifier(user.username)))
);


export const createOrderCode = () => Number(`${Date.now()}${crypto.randomInt(100, 1000)}`);


export const reserveOrder = async ({ user, course, idempotencyKey, buyer, quote, promotionCode, purchaseConsent }) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderCode = createOrderCode();
    const description = `TCC${String(orderCode).slice(-6)}`;
    try {
      const payment = await reserveCommerceOrder({
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
        buyerPhone: buyer.phone,
        purchaseConsent,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }, quote, promotionCode, user);
      return { payment, reused: false };
    } catch (error) {
      // Another request with this same key may have committed while this
      // transaction retried a quota conflict. Return its original order even
      // when the latest quote now reports no remaining promotion inventory.
      const existing = await Payment.findOne({ userId: user.id, idempotencyKey });
      if (existing) return { payment: existing, reused: true };
      if (error?.code !== 11000) throw error;
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
    { returnDocument: 'after', runValidators: true }
  );
  if (current) return current;

  // A webhook can win the race and move the order to PENDING/PAID before the
  // create response is persisted. Attach presentation metadata without ever
  // writing an older status over the newer one.
  current = await paymentModel.findOneAndUpdate(
    { _id: payment._id, status: { $in: ['PENDING', 'PAID'] } },
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  );
  if (current) return current;

  current = await paymentModel.findById(payment._id);
  if (current) return current;
  throw httpError(409, 'ORDER_STATE_CONFLICT', 'Trạng thái đơn hàng vừa thay đổi.');
};


export const runTransaction = async (work) => {
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


export const paidAmountIsValid = (payment, providerData) => {
  const expected = Number(payment.amount);
  const transactionAmount = Number(providerData.amount);
  const totalPaid = providerData.amountPaid === undefined
    ? transactionAmount
    : Number(providerData.amountPaid);
  return Number.isSafeInteger(expected)
    && transactionAmount === expected
    && totalPaid >= expected;
};


export const activatePaidOrder = async (orderCode, providerData, mongoSession = null) => {
  let query = Payment.findOne({ orderCode });
  if (mongoSession) query = query.session(mongoSession);
  const payment = await query;
  if (!payment) return null;
  if (!paidAmountIsValid(payment, providerData)) {
    throw httpError(409, 'PAYMENT_AMOUNT_MISMATCH', 'Số tiền PayOS không khớp với đơn hàng.');
  }

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
  await settlePromotion(orderCode, true, mongoSession);

  let enrollment = null;
  if (payment.userId && payment.username && payment.courseId) {
    const enrollmentDetails = {
      userId: payment.userId,
      username: payment.username,
      courseId: payment.courseId,
      paymentOrderCode: payment.orderCode,
      mongoSession
    };
    // A payment event must never undo an explicit admin revocation, including
    // when revocation happened after the checkout was opened.
    enrollment = await repairMissingPaidEnrollment(enrollmentDetails);
  }
  return { payment, enrollment };
};


export const ensurePaidEnrollment = async (payment) => {
  if (payment.status !== 'PAID' || !payment.userId || !payment.username || !payment.courseId) return null;
  return repairMissingPaidEnrollment({
    userId: payment.userId,
    username: payment.username,
    courseId: payment.courseId,
    paymentOrderCode: payment.orderCode
  });
};


export const reconcileOrder = async (payment) => {
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
    { returnDocument: 'after', runValidators: true }
  );
  if (updated) {
    if (['CANCELLED', 'FAILED'].includes(updated.status)) await releaseFailedPromotion(updated.orderCode);
    return updated;
  }
  const current = await Payment.findById(payment._id);
  return current || payment;
};


// COOLDOWN is raised before dispatch: this particular create never reached PayOS.
// A timeout or a 429 response to an already sent request remains ambiguous.
export const shouldMarkCreateFailure = (error) => ['PAYOS_REJECTED', 'PAYOS_COOLDOWN'].includes(error?.code);


export const reconcileManagedOrder = async (value) => {
  requireDatabase();
  const orderCode = parseOrderCode(value);
  if (!orderCode) throw httpError(400, 'INVALID_ORDER_CODE', 'Mã đơn không hợp lệ.');
  let payment = await Payment.findOne({ orderCode });
  if (!payment) throw httpError(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn.');
  if (['CREATING', 'PENDING'].includes(payment.status)) {
    const leased = await acquireReconciliationLease(payment);
    if (leased) payment = await reconcileOrder(leased);
  }
  if (payment.status === 'PAID') await ensurePaidEnrollment(payment);
  else if (['CANCELLED', 'FAILED'].includes(payment.status)) await releaseFailedPromotion(orderCode);
  return normalizePaymentResponse(payment);
};


export const cancelManagedOrder = async (value) => {
  const current = await reconcileManagedOrder(value);
  if (current.status === 'PAID') throw httpError(409, 'ORDER_ALREADY_PAID', 'Đơn đã thanh toán, không thể hủy bằng thao tác này.');
  if (['CANCELLED', 'FAILED'].includes(current.status)) return current;
  try {
    await fetchPayOS(`/v2/payment-requests/${current.orderCode}/cancel`, { method: 'POST', body: JSON.stringify({ cancellationReason: 'Đóng đơn chưa thanh toán từ UEH TCC' }) });
  } catch (error) {
    // A payment may win the race with cancellation. Verify the provider state
    // instead of ever overwriting PAID with a local cancellation decision.
    const latest = await Payment.findOne({ orderCode: current.orderCode });
    if (latest) {
      const reconciled = await reconcileOrder(latest);
      if (['PAID', 'CANCELLED'].includes(reconciled.status)) return normalizePaymentResponse(reconciled);
    }
    throw error;
  }
  const payment = await Payment.findOne({ orderCode: current.orderCode });
  return normalizePaymentResponse(await reconcileOrder(payment));
};


export const safeCompareText = (expected, received) => {
  const expectedBuffer = Buffer.from(String(expected));
  const receivedBuffer = Buffer.from(String(received));
  return expectedBuffer.length === receivedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};


export const providerTransactions = (data) => {
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (data?.transactions && typeof data.transactions === 'object') {
    return Object.values(data.transactions);
  }
  return [];
};
