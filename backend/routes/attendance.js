const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { sendSMS, hasAbsenceAlertBeenSent } = require('../smsService');

// GET /api/attendance?school_id=&class_id=&date=&student_id=
router.get('/', auth, (req, res) => {
  const { date, class_id, student_id } = req.query;
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;

  let query = `SELECT a.*, s.first_name, s.last_name, s.parent_phone, s.parent_phone2
    FROM attendance a JOIN students s ON a.student_id=s.id WHERE 1=1`;
  const params = [];
  if (school_id)  { query += ' AND a.school_id=?'; params.push(school_id); }
  if (class_id)   { query += ' AND a.class_id=?'; params.push(class_id); }
  if (date)       { query += ' AND a.date=?'; params.push(date); }
  if (student_id) { query += ' AND a.student_id=?'; params.push(student_id); }
  query += ' ORDER BY s.last_name, s.first_name';

  res.json(db.prepare(query).all(...params));
});

// GET /api/attendance/summary?school_id=&start=&end=
router.get('/summary', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  const { start, end } = req.query;
  if (!school_id) return res.status(400).json({ error: 'school_id required' });

  const rows = db.prepare(`
    SELECT date,
      SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status='absent'  THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN status='late'    THEN 1 ELSE 0 END) as late,
      SUM(CASE WHEN status='excused' THEN 1 ELSE 0 END) as excused,
      COUNT(*) as total
    FROM attendance WHERE school_id=?
    ${start ? 'AND date >= ?' : ''} ${end ? 'AND date <= ?' : ''}
    GROUP BY date ORDER BY date DESC
  `).all(...[school_id, start, end].filter(Boolean));

  res.json(rows);
});

// POST /api/attendance/bulk  — mark a whole class at once
router.post('/bulk', auth, async (req, res) => {
  if (!['teacher', 'school_admin', 'moe_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { class_id, date, records, period = 'full_day' } = req.body;
  // records: [{ student_id, status, notes }]
  if (!class_id || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'class_id, date, records required' });
  }

  const cls = db.prepare('SELECT * FROM classes WHERE id=?').get(class_id);
  if (!cls) return res.status(404).json({ error: 'Class not found' });
  const school_id = cls.school_id;
  const school = db.prepare('SELECT name FROM schools WHERE id=?').get(school_id);

  const insert = db.prepare(`INSERT INTO attendance (id,student_id,class_id,school_id,date,status,period,marked_by,notes)
    VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(student_id,date,period) DO UPDATE SET status=excluded.status, notes=excluded.notes`);

  const smsResults = [];

  const markAll = db.transaction(async () => {
    for (const r of records) {
      const id = uuidv4();
      insert.run(id, r.student_id, class_id, school_id, date, r.status, period, req.user.id, r.notes || null);

      // Send SMS for absent students (skip if already sent today)
      if (r.status === 'absent' && !hasAbsenceAlertBeenSent(r.student_id, date)) {
        const student = db.prepare('SELECT * FROM students WHERE id=?').get(r.student_id);
        if (student && (student.parent_phone || student.parent_phone2)) {
          const msg = `Jamaica MOE Alert: ${student.first_name} ${student.last_name} was ABSENT from ${school.name} on ${date}. If this is an error, contact the school.`;
          const phones = [student.parent_phone, student.parent_phone2].filter(Boolean);
          for (const phone of phones) {
            try {
              const sid = await sendSMS(phone, msg, school_id);
              db.prepare('INSERT INTO sms_log (id,student_id,school_id,phone_number,message,type,status,twilio_sid) VALUES (?,?,?,?,?,?,?,?)')
                .run(uuidv4(), r.student_id, school_id, phone, msg, 'absence_alert', 'sent', sid);
              db.prepare('UPDATE attendance SET sms_sent=1 WHERE student_id=? AND date=? AND period=?')
                .run(r.student_id, date, period);
              smsResults.push({ student_id: r.student_id, phone, status: 'sent' });
            } catch (err) {
              smsResults.push({ student_id: r.student_id, phone, status: 'failed', error: err.message });
            }
          }
        }
      }
    }
  });

  await markAll();
  res.json({ success: true, count: records.length, sms: smsResults });
});

// POST /api/attendance  — single record
router.post('/', auth, async (req, res) => {
  const { student_id, class_id, date, status, period = 'full_day', notes } = req.body;
  if (!student_id || !class_id || !date || !status) return res.status(400).json({ error: 'Missing fields' });

  const cls = db.prepare('SELECT * FROM classes WHERE id=?').get(class_id);
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  const id = uuidv4();
  db.prepare(`INSERT INTO attendance (id,student_id,class_id,school_id,date,status,period,marked_by,notes)
    VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(student_id,date,period) DO UPDATE SET status=excluded.status`)
    .run(id, student_id, class_id, cls.school_id, date, status, period, req.user.id, notes || null);

  res.status(201).json({ success: true });
});

// GET /api/attendance/student/:id  — student's full record
router.get('/student/:id', auth, (req, res) => {
  const { start, end } = req.query;
  let query = 'SELECT * FROM attendance WHERE student_id=?';
  const params = [req.params.id];
  if (start) { query += ' AND date >= ?'; params.push(start); }
  if (end)   { query += ' AND date <= ?'; params.push(end); }
  query += ' ORDER BY date DESC';
  res.json(db.prepare(query).all(...params));
});

module.exports = router;
