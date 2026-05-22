const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { sendSMS } = require('../smsService');

// GET /api/sms/log?school_id=&student_id=
router.get('/log', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  const { student_id, limit = 100 } = req.query;
  let query = 'SELECT * FROM sms_log WHERE 1=1';
  const params = [];
  if (school_id)  { query += ' AND school_id=?'; params.push(school_id); }
  if (student_id) { query += ' AND student_id=?'; params.push(student_id); }
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));
  res.json(db.prepare(query).all(...params));
});

// POST /api/sms/broadcast  — send custom message to all parents in a class or school
router.post('/broadcast', auth, requireRole('moe_admin', 'school_admin'), async (req, res) => {
  const { message, class_id, school_id: target_school } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const school_id = req.user.role === 'moe_admin' ? target_school : req.user.school_id;

  let students;
  if (class_id) {
    students = db.prepare('SELECT * FROM students WHERE class_id=? AND active=1').all(class_id);
  } else {
    students = db.prepare('SELECT * FROM students WHERE school_id=? AND active=1').all(school_id);
  }

  const results = [];
  for (const s of students) {
    const phones = [s.parent_phone, s.parent_phone2].filter(Boolean);
    for (const phone of phones) {
      try {
        const sid = await sendSMS(phone, message);
        db.prepare('INSERT INTO sms_log (id,student_id,school_id,phone_number,message,type,status,twilio_sid) VALUES (?,?,?,?,?,?,?,?)')
          .run(uuidv4(), s.id, school_id, phone, message, 'broadcast', 'sent', sid);
        results.push({ student: `${s.first_name} ${s.last_name}`, phone, status: 'sent' });
      } catch (err) {
        results.push({ student: `${s.first_name} ${s.last_name}`, phone, status: 'failed', error: err.message });
      }
    }
  }

  res.json({ sent: results.filter(r => r.status === 'sent').length, failed: results.filter(r => r.status === 'failed').length, results });
});

// POST /api/sms/send  — send to specific student's parent
router.post('/send', auth, async (req, res) => {
  if (!['teacher', 'school_admin', 'moe_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const { student_id, message, phone } = req.body;
  if (!student_id || !message) return res.status(400).json({ error: 'student_id and message required' });

  const student = db.prepare('SELECT * FROM students WHERE id=?').get(student_id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const targetPhone = phone || student.parent_phone;
  if (!targetPhone) return res.status(400).json({ error: 'No parent phone on file' });

  try {
    const sid = await sendSMS(targetPhone, message);
    db.prepare('INSERT INTO sms_log (id,student_id,school_id,phone_number,message,type,status,twilio_sid) VALUES (?,?,?,?,?,?,?,?)')
      .run(uuidv4(), student_id, student.school_id, targetPhone, message, 'manual', 'sent', sid);
    res.json({ success: true, sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
