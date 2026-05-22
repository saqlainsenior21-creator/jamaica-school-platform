const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/schools
router.get('/', auth, (req, res) => {
  const schools = db.prepare('SELECT * FROM schools ORDER BY name').all();
  res.json(schools);
});

// GET /api/schools/:id
router.get('/:id', auth, (req, res) => {
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.id);
  if (!school) return res.status(404).json({ error: 'Not found' });
  res.json(school);
});

// POST /api/schools  (moe_admin only)
router.post('/', auth, requireRole('moe_admin'), (req, res) => {
  const { name, parish, district, principal_name, principal_phone, principal_email, address, school_type } = req.body;
  if (!name || !parish) return res.status(400).json({ error: 'Name and parish required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO schools (id,name,parish,district,principal_name,principal_phone,principal_email,address,school_type)
    VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, name, parish, district || null, principal_name || null, principal_phone || null,
      principal_email || null, address || null, school_type || 'Primary');
  res.status(201).json({ id, name, parish });
});

// PUT /api/schools/:id
router.put('/:id', auth, (req, res) => {
  if (req.user.role !== 'moe_admin' && req.user.school_id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { name, parish, district, principal_name, principal_phone, principal_email, address, school_type, student_count, active } = req.body;
  db.prepare(`UPDATE schools SET name=COALESCE(?,name), parish=COALESCE(?,parish), district=COALESCE(?,district),
    principal_name=COALESCE(?,principal_name), principal_phone=COALESCE(?,principal_phone),
    principal_email=COALESCE(?,principal_email), address=COALESCE(?,address),
    school_type=COALESCE(?,school_type), student_count=COALESCE(?,student_count), active=COALESCE(?,active)
    WHERE id=?`)
    .run(name, parish, district, principal_name, principal_phone, principal_email, address, school_type, student_count, active, req.params.id);
  res.json({ success: true });
});

// GET /api/schools/:id/stats
router.get('/:id/stats', auth, (req, res) => {
  const sid = req.params.id;
  const studentCount = db.prepare('SELECT COUNT(*) as c FROM students WHERE school_id=? AND active=1').get(sid).c;
  const teacherCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE school_id=? AND role='teacher'").get(sid).c;
  const classCount = db.prepare('SELECT COUNT(*) as c FROM classes WHERE school_id=?').get(sid).c;
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = db.prepare(`
    SELECT
      SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) as absent,
      COUNT(*) as total
    FROM attendance WHERE school_id=? AND date=?
  `).get(sid, today);
  res.json({ studentCount, teacherCount, classCount, todayAttendance });
});

module.exports = router;
