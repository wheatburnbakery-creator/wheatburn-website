'use strict';
/** Cross-site request check. CSRF_MODE=block enforces; anything else only logs. */
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);
const clip = (v) => String(v || '').slice(0, 80);

function handle(req, res) {
  if (SAFE.has(req.method)) return false;
  const h = req.headers;
  let bad = false;
  if (h.origin) {
    try {
      const o = new URL(h.origin).host;
      bad = o !== h.host && o !== h['x-forwarded-host'];
    } catch (e) { bad = true; }
  } else if (h['sec-fetch-site'] && h['sec-fetch-site'] !== 'same-origin' && h['sec-fetch-site'] !== 'none') {
    bad = true;
  }
  if (!bad) return false;
  const enforce = process.env.CSRF_MODE === 'block';
  console.log('[csrf] ' + (enforce ? 'BLOCKED ' : 'WOULD BLOCK ') + req.method + ' ' +
    clip(String(req.url).split('?')[0]) + ' origin=' + clip(h.origin) + ' host=' + clip(h.host) +
    ' xfh=' + clip(h['x-forwarded-host']) + ' sfs=' + clip(h['sec-fetch-site']));
  if (!enforce) return false;
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end('Cross-site request blocked.\n');
  return true;
}

module.exports = { handle };
