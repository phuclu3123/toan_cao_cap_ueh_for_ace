const buckets = new Map();

const normalizeIp = (req) => (
  req.ip
  || req.socket?.remoteAddress
  || 'unknown'
);

const cleanupExpiredBuckets = () => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

const cleanupTimer = setInterval(cleanupExpiredBuckets, 10 * 60 * 1000);
cleanupTimer.unref?.();

export const createRateLimit = ({
  namespace,
  windowMs,
  max,
  message = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'
}) => {
  if (!namespace || !Number.isFinite(windowMs) || !Number.isFinite(max)) {
    throw new TypeError('Rate limiter requires namespace, windowMs, and max');
  }

  return (req, res, next) => {
    const now = Date.now();
    const key = `${namespace}:${normalizeIp(req)}`;
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
        message,
        retryAfterSeconds
      });
    }

    return next();
  };
};

export const authenticationRateLimit = createRateLimit({
  namespace: 'authentication',
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Bạn đã thử xác thực quá nhiều lần. Vui lòng đợi ít phút rồi thử lại.'
});

export const firebaseSyncRateLimit = createRateLimit({
  namespace: 'firebase-sync',
  windowMs: 10 * 60 * 1000,
  max: 40
});

export const paymentWriteRateLimit = createRateLimit({
  namespace: 'payment-write',
  windowMs: 10 * 60 * 1000,
  max: 12,
  message: 'Bạn đã tạo hoặc đối soát quá nhiều đơn. Vui lòng đợi ít phút rồi thử lại.'
});

export const publicFormRateLimit = createRateLimit({
  namespace: 'public-form',
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Bạn đã gửi biểu mẫu quá nhiều lần. Vui lòng thử lại sau.'
});
