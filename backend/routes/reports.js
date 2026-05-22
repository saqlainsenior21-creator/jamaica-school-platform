const router = require('express').Router();
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/reports/moe/overview  — national dashboard
router.get('/moe/overview', auth, requireRole('moe_admin'), (req, res) => {
  const totalSchools   = db.prepare('SELECT COUNT(*) as c FROM schools WHERE active=1').get().c;
  const totalStudents  = db.prepare('SELECT COUNT(*) as c FROM students WHERE active=1').get().c;
  const totalTeachers  = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='teacher'").get().c;

  const today = new Date().toISOString().split('T')[0];
  const todayAtt = db.prepare(`
    SELECT
      SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status='absent'  THEN 1 ELSE 0 END) as absent,
      COUNT(*) as total
    FROM attendance WHERE date=?
  `).get(today);

  const attendanceRate = todayAtt.total > 0
    ? Math.round((todayAtt.present / todayAtt.total) * 100)
    : null;

  // School-level breakdown
  const schoolStats = db.prepare(`
    SELECT s.id, s.name, s.parish,
      (SELECT COUNT(*) FROM students st WHERE st.school_id=s.id AND st.active=1) as students,
      (SELECT COUNT(*) FROM attendance a WHERE a.school_id=s.id AND a.date=? AND a.status='present') as present_today,
      (SELECT COUNT(*) FROM attendance a WHERE a.school_id=s.id AND a.date=?) as total_today
    FROM schools s WHERE s.active=1 ORDER BY s.parish, s.name
  `).all(today, today);

  res.json({ totalSchools, totalStudents, totalTeachers, todayAtt, attendanceRate, schoolStats });
});

// GET /api/reports/moe/attendance?start=&end=&parish=
router.get('/moe/attendance', auth, requireRole('moe_admin'), (req, res) => {
  const { start, end, parish } = req.query;
  const params = [];
  let schoolFilter = '';
  if (parish) {
    schoolFilter = 'AND sch.parish=?';
    params.push(parish);
  }

  const rows = db.prepare(`
    SELECT a.date, sch.parish,
      SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status='absent'  THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN a.status='late'    THEN 1 ELSE 0 END) as late,
      COUNT(*) as total
    FROM attendance a JOIN schools sch ON a.school_id=sch.id
    WHERE 1=1 ${schoolFilter}
    ${start ? 'AND a.date>=?' : ''} ${end ? 'AND a.date<=?' : ''}
    GROUP BY a.date, sch.parish ORDER BY a.date DESC
  `).all(...params, ...[start, end].filter(Boolean));

  res.json(rows);
});

// GET /api/reports/moe/behaviour?start=&end=&type=
router.get('/moe/behaviour', auth, requireRole('moe_admin'), (req, res) => {
  const { start, end, type } = req.query;
  const params = [];
  let query = `SELECT sch.name as school_name, sch.parish, b.type,
    COUNT(*) as count FROM behaviour_records b JOIN schools sch ON b.school_id=sch.id WHERE 1=1`;
  if (type)  { query += ' AND b.type=?'; params.push(type); }
  if (start) { query += ' AND b.date>=?'; params.push(start); }
  if (end)   { query += ' AND b.date<=?'; params.push(end); }
  query += ' GROUP BY sch.id, b.type ORDER BY count DESC';
  res.json(db.prepare(query).all(...params));
});

// GET /api/reports/school/attendance?school_id=&start=&end=
router.get('/school/attendance', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  if (!school_id) return res.status(400).json({ error: 'school_id required' });
  const { start, end } = req.query;
  const params = [school_id];
  let query = `SELECT a.date,
    SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN a.status='absent'  THEN 1 ELSE 0 END) as absent,
    SUM(CASE WHEN a.status='late'    THEN 1 ELSE 0 END) as late,
    SUM(CASE WHEN a.status='excused' THEN 1 ELSE 0 END) as excused,
    COUNT(*) as total
    FROM attendance a WHERE a.school_id=?`;
  if (start) { query += ' AND a.date>=?'; params.push(start); }
  if (end)   { query += ' AND a.date<=?'; params.push(end); }
  query += ' GROUP BY a.date ORDER BY a.date DESC';
  res.json(db.prepare(query).all(...params));
});

// GET /api/reports/school/chronic-absentees?school_id=&threshold=
router.get('/school/chronic-absentees', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  const threshold = Number(req.query.threshold) || 5;
  if (!school_id) return res.status(400).json({ error: 'school_id required' });

  const rows = db.prepare(`
    SELECT s.id, s.first_name, s.last_name, s.parent_phone, c.name as class_name,
      COUNT(*) as absent_days
    FROM attendance a
    JOIN students s ON a.student_id=s.id
    LEFT JOIN classes c ON s.class_id=c.id
    WHERE a.school_id=? AND a.status='absent'
    GROUP BY a.student_id
    HAVING absent_days >= ?
    ORDER BY absent_days DESC
  `).all(school_id, threshold);

  res.json(rows);
});

// GET /api/reports/class/attendance?class_id=&date=
router.get('/class/attendance', auth, (req, res) => {
  const { class_id, date } = req.query;
  if (!class_id || !date) return res.status(400).json({ error: 'class_id and date required' });

  const rows = db.prepare(`
    SELECT s.id, s.first_name, s.last_name, a.status, a.notes, a.sms_sent
    FROM students s
    LEFT JOIN attendance a ON a.student_id=s.id AND a.date=? AND a.period='full_day'
    WHERE s.class_id=? AND s.active=1
    ORDER BY s.last_name, s.first_name
  `).all(date, class_id);

  res.json(rows);
});

module.exports = router;
