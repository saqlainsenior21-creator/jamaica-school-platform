const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/terms/current?school_id=
router.get('/current', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  const today = new Date().toISOString().split('T')[0];

  const term = db.prepare(`
    SELECT * FROM academic_terms
    WHERE (school_id = ? OR school_id IS NULL)
    AND start_date <= ? AND end_date >= ?
    ORDER BY is_current DESC, school_id DESC LIMIT 1
  `).get(school_id, today, today);

  res.json(term || null);
});

// GET /api/terms?school_id=
router.get('/', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  const terms = db.prepare(
    'SELECT * FROM academic_terms WHERE school_id=? OR school_id IS NULL ORDER BY academic_year DESC, term'
  ).all(school_id);
  res.json(terms);
});

// POST /api/terms  (school_admin or moe_admin)
router.post('/', auth, requireRole('moe_admin', 'school_admin'), (req, res) => {
  const { academic_year, term, start_date, end_date, is_current, school_id: body_school } = req.body;
  if (!academic_year || !term || !start_date || !end_date) return res.status(400).json({ error: 'Missing fields' });
  const school_id = req.user.role === 'moe_admin' ? body_school : req.user.school_id;

  if (is_current) {
    db.prepare('UPDATE academic_terms SET is_current=0 WHERE school_id=?').run(school_id);
  }

  const id = uuidv4();
  db.prepare('INSERT INTO academic_terms (id,school_id,academic_year,term,start_date,end_date,is_current) VALUES (?,?,?,?,?,?,?)')
    .run(id, school_id, academic_year, term, start_date, end_date, is_current ? 1 : 0);

  res.status(201).json({ id, academic_year, term, is_current: !!is_current });
});

// PUT /api/terms/:id/set-current
router.put('/:id/set-current', auth, requireRole('moe_admin', 'school_admin'), (req, res) => {
  const termRow = db.prepare('SELECT * FROM academic_terms WHERE id=?').get(req.params.id);
  if (!termRow) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE academic_terms SET is_current=0 WHERE school_id=?').run(termRow.school_id);
  db.prepare('UPDATE academic_terms SET is_current=1 WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
