const crypto = require('crypto');
const AuthRateLimit = require('../models/AuthRateLimit');

// MongoDB-backed fixed-window limiter: shared by all app instances and survives restarts.
const createAuthRateLimiter = ({ windowMs, max, scope, message }) => async (req, res, next) => {
  try {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs);
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex');
    const key = crypto.createHash('sha256').update(`${scope}:${ipHash}:${windowStart}`).digest('hex');
    const expiresAt = new Date((windowStart + 1) * windowMs);

    const bucket = await AuthRateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const remaining = Math.max(0, max - bucket.count);
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(remaining));
    res.set('RateLimit-Reset', String(Math.ceil(expiresAt.getTime() / 1000)));

    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        message,
        retryAfter,
        retryAfterSeconds: retryAfter
      });
    }

    return next();
  } catch (error) {
    // Fail closed: if the shared limiter cannot be checked, do not expose auth endpoints.
    console.error('Authentication rate limiter error:', error.message);
    return res.status(503).json({ message: 'Authentication is temporarily unavailable. Please try again shortly.' });
  }
};

exports.loginRateLimit = createAuthRateLimiter({
  scope: 'owner-login',
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

exports.registrationRateLimit = createAuthRateLimiter({
  scope: 'owner-registration',
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registration attempts. Please try again after 1 hour.'
});

exports.customerLoginRateLimit = createAuthRateLimiter({
  scope: 'customer-login',
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many customer login attempts. Please try again after 15 minutes.'
});
