const crypto = require('crypto');

// Tiny in-memory cache for read-heavy GET endpoints.
// Notes:
// - Per-process only (fine for single node / dev; can be swapped for Redis later).
// - Includes ETag support so clients can revalidate cheaply.

const store = new Map();

function nowMs() {
  return Date.now();
}

function stableKey(req) {
  const auth = req.headers.authorization || req.headers['x-auth-token'] || '';
  return `${req.method}:${req.originalUrl}:${auth}`;
}

function makeEtag(payload) {
  const hash = crypto.createHash('sha1').update(payload).digest('hex');
  return `"${hash}"`;
}

function cacheGetJson({ ttlMs }) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = stableKey(req);
    const hit = store.get(key);
    const t = nowMs();

    if (hit && hit.expiresAt > t) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('ETag', hit.etag);

      if (req.headers['if-none-match'] === hit.etag) {
        return res.status(304).end();
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).send(hit.body);
    }

    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      try {
        const body = JSON.stringify(data);
        const etag = makeEtag(body);
        store.set(key, { body, etag, expiresAt: t + ttlMs });
        res.setHeader('ETag', etag);
      } catch {
        // If stringify fails, just fall through with uncached response.
      }
      return originalJson(data);
    };

    next();
  };
}

module.exports = { cacheGetJson };

