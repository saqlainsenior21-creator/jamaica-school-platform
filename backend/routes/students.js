const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

function schoolGuard(req) {
  return req.user.role === 'moe_admin' ? req.query.school_id || null : req.user.school_id;
}

// GET /api/students
router.get('/', auth, (req, res) => {
  const school_id = schoolGuard(req);
  const { class_id, search, active } = req.query;

  let query = `SELECT s.*, c.name as class_name FROM students s
    LEFT JOIN classes c ON s.class_id=c.id WHERE 1=1`;
  const params = [];

  if (school_id) { query += ' AND s.school_id=?'; params.push(school_id); }
  if (class_id)  { query += ' AND s.class_id=?'; params.push(class_id); }
  if (active !== undefined) { query += ' AND s.active=?'; params.push(Number(active)); }
  if (search) {
    query += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id_number LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  query += ' ORDER BY s.last_name, s.first_name';

  res.json(db.prepare(query).all(...params));
});

// GET /api/students/:id
router.get('/:id', auth, (req, res) => {
  const student = db.prepare('SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id=c.id WHERE s.id=?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json(student);
});

// POST /api/students
router.post('/', auth, (req, res) => {
  if (!['moe_admin', 'school_admin', 'teacher'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const { first_name, last_name, date_of_birth, gender, student_id_number, class_id,
    parent_name, parent_phone, parent_phone2, parent_email, address } = req.body;
  if (!first_name || !last_name) return res.status(400).json({ error: 'Name required' });
  const school_id = req.user.role === 'moe_admin' ? req.body.school_id : req.user.school_id;
  if (!school_id) return res.status(400).json({ error: 'school_id required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO students
    (id,school_id,class_id,first_name,last_name,date_of_birth,gender,student_id_number,
     parent_name,parent_phone,parent_phone2,parent_email,address)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, school_id, class_id || null, first_name, last_name, date_of_birth || null, gender || null,
      student_id_number || null, parent_name || null, parent_phone || null, parent_phone2 || null,
      parent_email || null, address || null);
  res.status(201).json({ id, first_name, last_name });
});

// PUT /api/students/:id
router.put('/:id', auth, (req, res) => {
  if (!['moe_admin', 'school_admin', 'teacher'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const { first_name, last_name, date_of_birth, gender, student_id_number, class_id,
    parent_name, parent_phone, parent_phone2, parent_email, address, active } = req.body;
  db.prepare(`UPDATE students SET
    first_name=COALESCE(?,first_name), last_name=COALESCE(?,last_name),
    date_of_birth=COALESCE(?,date_of_birth), gender=COALESCE(?,gender),
    student_id_number=COALESCE(?,student_id_number), class_id=COALESCE(?,class_id),
    parent_name=COALESCE(?,parent_name), parent_phone=COALESCE(?,parent_phone),
    parent_phone2=COALESCE(?,parent_phone2), parent_email=COALESCE(?,parent_email),
    address=COALESCE(?,address), active=COALESCE(?,active) WHERE id=?`)
    .run(first_name, last_name, date_of_birth, gender, student_id_number, class_id,
      parent_name, parent_phone, parent_phone2, parent_email, address, active, req.params.id);
  res.json({ success: true });
});

// DELETE (soft)
router.delete('/:id', auth, (req, res) => {
  if (!['moe_admin', 'school_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('UPDATE students SET active=0 WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
