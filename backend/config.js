const { cleanEnv, str, port, num } = require('envalid');

module.exports = cleanEnv(process.env, {
  PORT:                 port({ default: 4000 }),
  JWT_SECRET:           str({ docs: 'Secret key for signing JWTs — must be set in production' }),
  FRONTEND_URL:         str({ default: 'http://localhost:5173' }),
  TWILIO_ACCOUNT_SID:   str({ default: '' }),
  TWILIO_AUTH_TOKEN:    str({ default: '' }),
  TWILIO_PHONE_NUMBER:  str({ default: '' }),
  SEED_ADMIN_EMAIL:     str({ default: 'admin@moe.gov.jm' }),
  SEED_ADMIN_PASSWORD:  str({ default: 'Admin2026!' }),
  SMS_DAILY_CAP:        num({ default: 500, docs: 'Max SMS messages per school per day' }),
  NODE_ENV:             str({ choices: ['development', 'production', 'test'], default: 'development' }),
});
