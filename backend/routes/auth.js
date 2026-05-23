const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, school_id: user.school_id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, school_id: user.school_id } });
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, school_id, phone, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// POST /api/auth/users  (moe_admin creates school_admin/teacher accounts)
router.post('/users', auth, (req, res) => {
  if (!['moe_admin', 'school_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { name, email, password, role, school_id, phone } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

  // school_admin can only create teacher/parent accounts for their school
  if (req.user.role === 'school_admin') {
    if (!['teacher', 'parent'].includes(role)) return res.status(403).json({ error: 'Forbidden role' });
    if (school_id && school_id !== req.user.school_id) return res.status(403).json({ error: 'Wrong school' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Email already in use' });

  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,name,email,password,role,school_id,phone) VALUES (?,?,?,?,?,?,?)')
    .run(id, name, email.toLowerCase(), hash, role, school_id || req.user.school_id || null, phone || null);

  res.status(201).json({ id, name, email, role });
});

// GET /api/auth/users  (list users for a school)
router.get('/users', auth, (req, res) => {
  let users;
  if (req.user.role === 'moe_admin') {
    const { school_id } = req.query;
    users = school_id
      ? db.prepare('SELECT id,name,email,role,school_id,phone,created_at FROM users WHERE school_id = ?').all(school_id)
      : db.prepare('SELECT id,name,email,role,school_id,phone,created_at FROM users').all();
  } else {
    users = db.prepare('SELECT id,name,email,role,school_id,phone,created_at FROM users WHERE school_id = ?').all(req.user.school_id);
  }
  res.json(users);
});

// POST /api/auth/reset-admin  — one-time reset, requires RESET_TOKEN env var
router.post('/reset-admin', (req, res) => {
  const { reset_token, new_password } = req.body;
  const expected = process.env.RESET_TOKEN;
  if (!expected || reset_token !== expected) return res.status(403).json({ error: 'Forbidden' });
  if (!new_password || new_password.length < 8) return res.status(400).json({ error: 'Password too short' });
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare("UPDATE users SET password = ? WHERE role = 'moe_admin'").run(hash);
  res.json({ success: true });
});

// POST /api/auth/change-password
router.post('/change-password', auth, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'current_password and new_password required' });
  if (new_password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password)) return res.status(401).json({ error: 'Current password is incorrect' });

  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ success: true });
});

module.exports = router;
