const router = require('express').Router();
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// Parents see only their own children.
// A parent user is linked to students via parent_email matching user email.
function getMyChildren(user) {
  return db.prepare(
    'SELECT * FROM students WHERE parent_email = ? AND active = 1'
  ).all(user.email);
}

// GET /api/parent/children
router.get('/children', auth, requireRole('parent'), (req, res) => {
  const children = getMyChildren(req.user);
  res.json(children);
});

// GET /api/parent/attendance?student_id=&start=&end=
router.get('/attendance', auth, requireRole('parent'), (req, res) => {
  const { student_id, start, end } = req.query;
  const children = getMyChildren(req.user);
  const childIds = children.map(c => c.id);

  if (!childIds.length) return res.json([]);
  if (student_id && !childIds.includes(student_id)) {
    return res.status(403).json({ error: 'Not your child' });
  }

  const targetId = student_id || null;
  let query = `SELECT a.date, a.status, a.period, a.notes,
    s.first_name, s.last_name, c.name as class_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    LEFT JOIN classes c ON s.class_id = c.id
    WHERE a.student_id IN (${childIds.map(() => '?').join(',')})`;
  const params = [...childIds];

  if (targetId) { query += ' AND a.student_id = ?'; params.push(targetId); }
  if (start)    { query += ' AND a.date >= ?'; params.push(start); }
  if (end)      { query += ' AND a.date <= ?'; params.push(end); }
  query += ' ORDER BY a.date DESC LIMIT 90';

  res.json(db.prepare(query).all(...params));
});

// GET /api/parent/behaviour?student_id=
router.get('/behaviour', auth, requireRole('parent'), (req, res) => {
  const { student_id } = req.query;
  const children = getMyChildren(req.user);
  const childIds = children.map(c => c.id);

  if (!childIds.length) return res.json([]);
  if (student_id && !childIds.includes(student_id)) {
    return res.status(403).json({ error: 'Not your child' });
  }

  const targetId = student_id || null;
  let query = `SELECT b.type, b.category, b.description, b.action_taken, b.date,
    s.first_name, s.last_name, u.name as teacher_name
    FROM behaviour_records b
    JOIN students s ON b.student_id = s.id
    JOIN users u ON b.teacher_id = u.id
    WHERE b.student_id IN (${childIds.map(() => '?').join(',')})`;
  const params = [...childIds];
  if (targetId) { query += ' AND b.student_id = ?'; params.push(targetId); }
  query += ' ORDER BY b.date DESC LIMIT 50';

  res.json(db.prepare(query).all(...params));
});

// GET /api/parent/summary  — quick stats per child
router.get('/summary', auth, requireRole('parent'), (req, res) => {
  const children = getMyChildren(req.user);
  const summary = children.map(child => {
    const last30 = new Date(); last30.setDate(last30.getDate() - 30);
    const start = last30.toISOString().split('T')[0];
    const stats = db.prepare(`
      SELECT
        SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status='absent'  THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status='late'    THEN 1 ELSE 0 END) as late,
        COUNT(*) as total
      FROM attendance WHERE student_id=? AND date>=?
    `).get(child.id, start);
    const behaviourCount = db.prepare(
      "SELECT COUNT(*) as c FROM behaviour_records WHERE student_id=? AND type != 'commendation'"
    ).get(child.id).c;
    return { ...child, stats, behaviourCount };
  });
  res.json(summary);
});

module.exports = router;
