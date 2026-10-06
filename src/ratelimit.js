'use strict';
const WINDOW_MS = 60 * 1000;
const LIMITS = [
  { name: 'api', test: (p) => p === '/api' || p.startsWith('/api/'), max: 60 },
  { name: 'all', test: () => true, max: 300 },
];
const hits = new Map();

function clientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return String(cf).trim();
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function handle(req, res, url) {
  const ip = clientIp(req);
  const now = Date.now();
  if (hits.size > 50000) hits.clear();
  for (const rule of LIMITS) {
    if (!rule.test(url.pathname)) continue;
    const key = rule.name + ':' + ip;
    let e = hits.get(key);
    if (!e || now - e.start >= WINDOW_MS) {
      e = { start: now, count: 0 };
      hits.set(key, e);
    }
    e.count++;
    if (e.count > rule.max) {
      const retry = Math.ceil((e.start + WINDOW_MS - now) / 1000);
      res.writeHead(429, { 'Content-Type': 'text/plain', 'Retry-After': String(retry) });
      res.end('Too many requests');
      return true;
    }
  }
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, e] of hits) if (now - e.start >= WINDOW_MS) hits.delete(k);
}, WINDOW_MS).unref();

module.exports = { handle };
