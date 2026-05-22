const twilio = require('twilio');
const db = require('./db');
const logger = require('./logger');

const SMS_DAILY_CAP = parseInt(process.env.SMS_DAILY_CAP || '500', 10);
const TWILIO_ENABLED = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
  !process.env.TWILIO_ACCOUNT_SID.startsWith('your_'));

let client;
function getClient() {
  if (!client) client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client;
}

function normalisePhone(to) {
  let phone = to.replace(/\D/g, '');
  if (phone.length === 7)  phone = '1876' + phone;
  if (phone.length === 10 && phone.startsWith('876')) phone = '1' + phone;
  if (!phone.startsWith('+')) phone = '+' + phone;
  return phone;
}

function checkAndIncrementCap(school_id) {
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`INSERT INTO sms_daily_count (school_id, date, count) VALUES (?, ?, 0)
    ON CONFLICT(school_id, date) DO NOTHING`).run(school_id, today);
  const { count } = db.prepare('SELECT count FROM sms_daily_count WHERE school_id=? AND date=?').get(school_id, today);
  if (count >= SMS_DAILY_CAP) throw new Error(`SMS daily cap of ${SMS_DAILY_CAP} reached for this school`);
  db.prepare('UPDATE sms_daily_count SET count=count+1 WHERE school_id=? AND date=?').run(school_id, today);
}

async function sendSMS(to, body, school_id = null) {
  const phone = normalisePhone(to);

  if (!TWILIO_ENABLED) {
    logger.info({ phone, body }, '[SMS MOCK] Twilio not configured — logging only');
    return 'MOCK_SID_' + Date.now();
  }

  if (school_id) checkAndIncrementCap(school_id);

  const msg = await getClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });

  logger.info({ sid: msg.sid, phone }, 'SMS sent');
  return msg.sid;
}

// Guard against sending duplicate absence alerts the same day
function hasAbsenceAlertBeenSent(student_id, date) {
  const rec = db.prepare(
    'SELECT sms_sent FROM attendance WHERE student_id=? AND date=? AND period=\'full_day\''
  ).get(student_id, date);
  return rec?.sms_sent === 1;
}

module.exports = { sendSMS, hasAbsenceAlertBeenSent, normalisePhone };
