// Security headers + a small in-memory rate limiter (no extra packages).

function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'"
  );

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains"
    );
  }

  next();
}

// Fixed-window limiter. State lives in memory, so limits are per server
// instance - fine for one Render/Railway instance.
function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
  message = "Too many requests. Please try again later.",
  keyFn = (req) => req.ip,
} = {}) {
  const hits = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  cleanup.unref();

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = keyFn(req);
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      res.setHeader(
        "Retry-After",
        Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
      );
      return res.status(429).json({ success: false, message });
    }

    next();
  };
}

// Rate limiter whose counters live in PostgreSQL (table "RateLimit"), so
// limits survive restarts and are shared by every server instance. Used for
// the sensitive endpoints (login, register, comments). If the database is
// unreachable it falls back to the in-memory limiter instead of failing.
function createDbRateLimiter({
  name,
  windowMs = 60 * 1000,
  max = 10,
  message = "Too many requests. Please try again later.",
  keyFn = (req) => req.ip,
} = {}) {
  const prisma = require("../lib/prisma");
  const windowSec = Math.max(1, Math.round(windowMs / 1000));
  const fallback = createRateLimiter({ windowMs, max, message, keyFn });

  return async function dbRateLimiter(req, res, next) {
    const key = `${name}:${String(keyFn(req))}`.slice(0, 200);

    try {
      const rows = await prisma.$queryRaw`
        INSERT INTO "RateLimit" ("key", "count", "resetAt")
        VALUES (
          ${key},
          1,
          (NOW() AT TIME ZONE 'UTC') + (${windowSec}::int * INTERVAL '1 second')
        )
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE
            WHEN "RateLimit"."resetAt" <= (NOW() AT TIME ZONE 'UTC') THEN 1
            ELSE "RateLimit"."count" + 1
          END,
          "resetAt" = CASE
            WHEN "RateLimit"."resetAt" <= (NOW() AT TIME ZONE 'UTC')
              THEN (NOW() AT TIME ZONE 'UTC') + (${windowSec}::int * INTERVAL '1 second')
            ELSE "RateLimit"."resetAt"
          END
        RETURNING
          "count",
          CEIL(EXTRACT(EPOCH FROM ("RateLimit"."resetAt" - (NOW() AT TIME ZONE 'UTC'))))::int AS "retryAfter"
      `;

      const count = Number(rows[0].count);

      if (count > max) {
        res.setHeader("Retry-After", Math.max(1, Number(rows[0].retryAfter)));
        return res.status(429).json({ success: false, message });
      }

      return next();
    } catch (error) {
      console.error("DB RATE LIMIT ERROR (using memory fallback):", error.message);
      return fallback(req, res, next);
    }
  };
}

// Removes expired counters. Call now and then (server.js does).
async function purgeExpiredRateLimits() {
  const prisma = require("../lib/prisma");

  const result = await prisma.rateLimit.deleteMany({
    where: { resetAt: { lt: new Date() } },
  });

  return result.count;
}

// Returns true the first time a key is seen inside the window.
// Used to count a "view" once per visitor instead of on every request.
function createOncePerWindow(windowMs = 10 * 60 * 1000) {
  const seen = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, expires] of seen) {
      if (expires <= now) seen.delete(key);
    }
  }, windowMs);
  cleanup.unref();

  return function firstTime(key) {
    const now = Date.now();
    const expires = seen.get(key);
    if (expires && expires > now) return false;
    seen.set(key, now + windowMs);
    return true;
  };
}

module.exports = {
  securityHeaders,
  createRateLimiter,
  createDbRateLimiter,
  purgeExpiredRateLimits,
  createOncePerWindow,
};
