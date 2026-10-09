'use strict';
/** Blocks cross-site browser requests that change data. */
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

function handle(req, res) {
  if (SAFE.has(req.method)) return false;
  const h = req.headers;
  let bad = false;
  if (h.origin) {
    try { const o = new URL(h.origin).host; bad = o !== h.host && o !== h['x-forwarded-host']; } catch { bad = true; }
  } else if (h['sec-fetch-site'] && h['sec-fetch-site'] !== 'same-origin' && h['sec-fetch-site'] !== 'none') {
    bad = true;
  }
  if (!bad) return false;
  console.log('[csrf] refused ' + req.method + ' ' + req.url);
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end('Cross-site request blocked.\n');
  return true;
}

module.exports = { handle };
