'use strict';
function providerFetch(url, opts) {
  if (process.env.SMS_PROVIDER !== 'africastalking') return fetch(url, opts);
  const apiKey = process.env.SMS_PROVIDER_TOKEN || '';
  const username = process.env.AT_USERNAME || '';
  if (!apiKey || !username) return Promise.resolve(new Response('missing credentials', { status: 500 }));
  let p;
  try { p = JSON.parse(opts.body); } catch (e) { return Promise.resolve(new Response('bad payload', { status: 400 })); }
  if (p.channel && String(p.channel).toLowerCase() !== 'sms') {
    return Promise.resolve(new Response('unsupported channel', { status: 501 }));
  }
  let to = String(p.to || '').replace(/[^\d+]/g, '');
  if (!to.startsWith('+')) to = '+' + to;
  const form = new URLSearchParams({ username, to, message: String(p.message || '') });
  if (process.env.AT_SENDER_ID) form.set('from', process.env.AT_SENDER_ID);
  return fetch(url, {
    method: 'POST',
    headers: { apiKey, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    signal: AbortSignal.timeout(10000)
  }).then(async (res) => {
    if (!res.ok) return res;
    let data = null;
    try { data = await res.clone().json(); } catch (e) {}
    const rec = data && data.SMSMessageData && data.SMSMessageData.Recipients;
    if (Array.isArray(rec) && rec.length && !rec.some((r) => r.status === 'Success' || (r.statusCode >= 100 && r.statusCode <= 102))) {
      return new Response('rejected', { status: 502 });
    }
    return res;
  });
}
module.exports = { providerFetch };
