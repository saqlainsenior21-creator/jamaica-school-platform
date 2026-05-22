const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

// GET /api/classes  — scoped by school
router.get('/', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  if (!school_id) return res.status(400).json({ error: 'school_id required' });
  const classes = db.prepare(`
    SELECT c.*, u.name as teacher_name
    FROM classes c LEFT JOIN users u ON c.teacher_id=u.id
    WHERE c.school_id=? ORDER BY c.grade, c.name
  `).all(school_id);
  res.json(classes);
});

// GET /api/classes/my  — teacher's own classes
router.get('/my', auth, (req, res) => {
  const classes = db.prepare(`
    SELECT c.*, u.name as teacher_name
    FROM classes c LEFT JOIN users u ON c.teacher_id=u.id
    WHERE c.teacher_id=? ORDER BY c.grade, c.name
  `).all(req.user.id);
  res.json(classes);
});

// GET /api/classes/:id
router.get('/:id', auth, (req, res) => {
  const cls = db.prepare(`
    SELECT c.*, u.name as teacher_name FROM classes c
    LEFT JOIN users u ON c.teacher_id=u.id WHERE c.id=?
  `).get(req.params.id);
  if (!cls) return res.status(404).json({ error: 'Not found' });
  res.json(cls);
});

// POST /api/classes
router.post('/', auth, (req, res) => {
  if (!['moe_admin', 'school_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const { school_id, name, grade, teacher_id, academic_year, term } = req.body;
  if (!name || !grade || !academic_year) return res.status(400).json({ error: 'Missing fields' });
  const sid = req.user.role === 'moe_admin' ? school_id : req.user.school_id;
  const id = uuidv4();
  db.prepare('INSERT INTO classes (id,school_id,name,grade,teacher_id,academic_year,term) VALUES (?,?,?,?,?,?,?)')
    .run(id, sid, name, grade, teacher_id || null, academic_year, term || 1);
  res.status(201).json({ id, name, grade });
});

// PUT /api/classes/:id
router.put('/:id', auth, (req, res) => {
  if (!['moe_admin', 'school_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const { name, grade, teacher_id, term } = req.body;
  db.prepare('UPDATE classes SET name=COALESCE(?,name), grade=COALESCE(?,grade), teacher_id=COALESCE(?,teacher_id), term=COALESCE(?,term) WHERE id=?')
    .run(name, grade, teacher_id, term, req.params.id);
  res.json({ success: true });
});

module.exports = router;
