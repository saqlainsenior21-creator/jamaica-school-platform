const validator = require('validator');

// Fields that must never be HTML-escaped (auth values, raw data)
const SKIP_ESCAPE = new Set(['password', 'token', 'secret', 'hash']);

// Recursively sanitise all string values in req.body:
// - trim whitespace
// - strip null bytes and control characters
// - HTML-escape only non-sensitive fields (prevents XSS if values are ever rendered)
function sanitiseBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitise(req.body, '');
  }
  next();
}

function deepSanitise(obj, key) {
  if (typeof obj === 'string') {
    // Always: trim + remove null bytes / non-printable control chars
    let s = obj.trim().replace(/\0/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    // Only HTML-escape non-sensitive fields
    if (!SKIP_ESCAPE.has(key)) s = validator.escape(s);
    return s;
  }
  if (Array.isArray(obj)) return obj.map(v => deepSanitise(v, key));
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepSanitise(v, k);
    return out;
  }
  return obj;
}

function isJamaicanPhone(phone) {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 7
    || (digits.length === 10 && digits.startsWith('876'))
    || (digits.length === 11 && digits.startsWith('1876'));
}

module.exports = { sanitiseBody, isJamaicanPhone };
