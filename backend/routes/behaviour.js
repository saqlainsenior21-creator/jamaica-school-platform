const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { sendSMS } = require('../smsService');

// GET /api/behaviour?student_id=&school_id=&type=&start=&end=
router.get('/', auth, (req, res) => {
  const { student_id, type, start, end } = req.query;
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;

  let query = `SELECT b.*, s.first_name, s.last_name, u.name as teacher_name
    FROM behaviour_records b
    JOIN students s ON b.student_id=s.id
    JOIN users u ON b.teacher_id=u.id WHERE 1=1`;
  const params = [];
  if (school_id)  { query += ' AND b.school_id=?'; params.push(school_id); }
  if (student_id) { query += ' AND b.student_id=?'; params.push(student_id); }
  if (type)       { query += ' AND b.type=?'; params.push(type); }
  if (start)      { query += ' AND b.date>=?'; params.push(start); }
  if (end)        { query += ' AND b.date<=?'; params.push(end); }
  query += ' ORDER BY b.date DESC, b.created_at DESC';

  res.json(db.prepare(query).all(...params));
});

// GET /api/behaviour/:id
router.get('/:id', auth, (req, res) => {
  const record = db.prepare('SELECT * FROM behaviour_records WHERE id=?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json(record);
});

// POST /api/behaviour
router.post('/', auth, async (req, res) => {
  if (!['teacher', 'school_admin', 'moe_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { student_id, class_id, type, category, description, action_taken, date, notify_parent } = req.body;
  if (!student_id || !type || !description || !date) return res.status(400).json({ error: 'Missing fields' });

  const student = db.prepare('SELECT * FROM students WHERE id=?').get(student_id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const school_id = req.user.role === 'moe_admin' ? req.body.school_id : req.user.school_id;
  const id = uuidv4();
  let parent_notified = 0;

  if (notify_parent && student.parent_phone) {
    try {
      const school = db.prepare('SELECT name FROM schools WHERE id=?').get(school_id);
      const emoji = type === 'commendation' ? '🌟' : '⚠️';
      const label = type === 'commendation' ? 'Commendation' : type.charAt(0).toUpperCase() + type.slice(1);
      const msg = `${emoji} ${school.name}: ${label} for ${student.first_name} ${student.last_name} on ${date}. ${description}${action_taken ? ' Action: ' + action_taken : ''}`;
      await sendSMS(student.parent_phone, msg);
      parent_notified = 1;
    } catch (err) {
      console.error('SMS failed:', err.message);
    }
  }

  db.prepare(`INSERT INTO behaviour_records
    (id,student_id,school_id,class_id,teacher_id,type,category,description,action_taken,parent_notified,date)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, student_id, school_id, class_id || null, req.user.id, type, category || null,
      description, action_taken || null, parent_notified, date);

  res.status(201).json({ id, type, parent_notified });
});

// PUT /api/behaviour/:id
router.put('/:id', auth, (req, res) => {
  const { description, action_taken, category } = req.body;
  db.prepare('UPDATE behaviour_records SET description=COALESCE(?,description), action_taken=COALESCE(?,action_taken), category=COALESCE(?,category) WHERE id=?')
    .run(description, action_taken, category, req.params.id);
  res.json({ success: true });
});

module.exports = router;
