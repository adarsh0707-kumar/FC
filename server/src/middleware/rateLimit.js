/**
 * Minimal fixed-window rate limiter.
 *
 * State lives in this process's memory, which is the right trade-off for a
 * single-instance deployment and keeps the dependency list short. If the API is
 * ever scaled to more than one instance the counters stop being global and this
 * should move to Redis (or an `express-rate-limit` store) — noted in
 * `03-ARCHITECTURE.md` §7.
 */
const buckets = new Map();

// Stale buckets would otherwise accumulate one entry per unique client forever.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, SWEEP_INTERVAL_MS);
sweeper.unref?.(); // don't hold the event loop open in tests / short-lived scripts

export function rateLimit({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  keyOn = (req) => req.ip,
}) {
  return function rateLimitMiddleware(req, res, next) {
    const key = `${req.method}:${req.baseUrl}${req.path}:${keyOn(req)}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({ error: message, retryAfter });
    }

    next();
  };
}
