'use strict';
function redactSecrets(message) {
  const text = String(message);
  if (!/(code|otp|verif|reset|password)/i.test(text)) return text;
  return text
    .replace(/https?:\/\/\S+/g, '[link removed]')
    .replace(/\b\d{4,8}\b/g, '[removed]');
}
module.exports = { redactSecrets };
