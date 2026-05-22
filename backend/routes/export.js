const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

function toCSV(rows, columns) {
  const header = columns.map(c => `"${c.label}"`).join(',');
  const lines = rows.map(row =>
    columns.map(c => {
      const val = row[c.key] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header, ...lines].join('\r\n');
}

function sendCSV(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('﻿' + csv); // UTF-8 BOM so Excel opens correctly
}

// GET /api/export/attendance?school_id=&start=&end=&class_id=
router.get('/attendance', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  const { start, end, class_id } = req.query;
  if (!school_id) return res.status(400).json({ error: 'school_id required' });

  let query = `SELECT s.first_name, s.last_name, c.name as class_name, c.grade,
    a.date, a.status, a.period, a.notes, a.sms_sent, u.name as marked_by
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN users u ON a.marked_by = u.id
    WHERE a.school_id = ?`;
  const params = [school_id];

  if (start)    { query += ' AND a.date >= ?'; params.push(start); }
  if (end)      { query += ' AND a.date <= ?'; params.push(end); }
  if (class_id) { query += ' AND a.class_id = ?'; params.push(class_id); }
  query += ' ORDER BY a.date DESC, s.last_name, s.first_name';

  const rows = db.prepare(query).all(...params);
  const csv = toCSV(rows, [
    { key: 'last_name',   label: 'Last Name' },
    { key: 'first_name',  label: 'First Name' },
    { key: 'class_name',  label: 'Class' },
    { key: 'grade',       label: 'Grade' },
    { key: 'date',        label: 'Date' },
    { key: 'status',      label: 'Status' },
    { key: 'period',      label: 'Period' },
    { key: 'sms_sent',    label: 'SMS Sent' },
    { key: 'notes',       label: 'Notes' },
    { key: 'marked_by',   label: 'Marked By' },
  ]);
  sendCSV(res, `attendance_${school_id}_${start || 'all'}_${end || 'all'}.csv`, csv);
});

// GET /api/export/behaviour?school_id=&start=&end=&type=
router.get('/behaviour', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  const { start, end, type } = req.query;
  if (!school_id) return res.status(400).json({ error: 'school_id required' });

  let query = `SELECT s.first_name, s.last_name, c.name as class_name,
    b.type, b.category, b.description, b.action_taken, b.date, b.parent_notified, u.name as teacher_name
    FROM behaviour_records b
    JOIN students s ON b.student_id = s.id
    LEFT JOIN classes c ON b.class_id = c.id
    JOIN users u ON b.teacher_id = u.id
    WHERE b.school_id = ?`;
  const params = [school_id];

  if (type)  { query += ' AND b.type = ?'; params.push(type); }
  if (start) { query += ' AND b.date >= ?'; params.push(start); }
  if (end)   { query += ' AND b.date <= ?'; params.push(end); }
  query += ' ORDER BY b.date DESC';

  const rows = db.prepare(query).all(...params);
  const csv = toCSV(rows, [
    { key: 'last_name',       label: 'Last Name' },
    { key: 'first_name',      label: 'First Name' },
    { key: 'class_name',      label: 'Class' },
    { key: 'type',            label: 'Type' },
    { key: 'category',        label: 'Category' },
    { key: 'description',     label: 'Description' },
    { key: 'action_taken',    label: 'Action Taken' },
    { key: 'parent_notified', label: 'Parent Notified' },
    { key: 'date',            label: 'Date' },
    { key: 'teacher_name',    label: 'Reported By' },
  ]);
  sendCSV(res, `behaviour_${school_id}_${start || 'all'}_${end || 'all'}.csv`, csv);
});

// GET /api/export/students?school_id=
router.get('/students', auth, (req, res) => {
  const school_id = req.user.role === 'moe_admin' ? req.query.school_id : req.user.school_id;
  if (!school_id) return res.status(400).json({ error: 'school_id required' });

  const rows = db.prepare(`SELECT s.first_name, s.last_name, s.student_id_number, s.gender,
    s.date_of_birth, c.name as class_name, c.grade, s.parent_name, s.parent_phone,
    s.parent_phone2, s.parent_email, s.address, s.active
    FROM students s LEFT JOIN classes c ON s.class_id = c.id
    WHERE s.school_id = ? ORDER BY s.last_name, s.first_name`).all(school_id);

  const csv = toCSV(rows, [
    { key: 'last_name',          label: 'Last Name' },
    { key: 'first_name',         label: 'First Name' },
    { key: 'student_id_number',  label: 'Student ID' },
    { key: 'gender',             label: 'Gender' },
    { key: 'date_of_birth',      label: 'Date of Birth' },
    { key: 'class_name',         label: 'Class' },
    { key: 'grade',              label: 'Grade' },
    { key: 'parent_name',        label: 'Parent Name' },
    { key: 'parent_phone',       label: 'Parent Phone 1' },
    { key: 'parent_phone2',      label: 'Parent Phone 2' },
    { key: 'parent_email',       label: 'Parent Email' },
    { key: 'address',            label: 'Address' },
    { key: 'active',             label: 'Active' },
  ]);
  sendCSV(res, `students_${school_id}.csv`, csv);
});

// GET /api/export/moe/national?start=&end=  (moe_admin only)
router.get('/moe/national', auth, (req, res) => {
  if (req.user.role !== 'moe_admin') return res.status(403).json({ error: 'Forbidden' });
  const { start, end } = req.query;
  const params = [];
  let dateFilter = '';
  if (start) { dateFilter += ' AND a.date >= ?'; params.push(start); }
  if (end)   { dateFilter += ' AND a.date <= ?'; params.push(end); }

  const rows = db.prepare(`SELECT sch.name as school_name, sch.parish,
    a.date,
    SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN a.status='absent'  THEN 1 ELSE 0 END) as absent,
    SUM(CASE WHEN a.status='late'    THEN 1 ELSE 0 END) as late,
    SUM(CASE WHEN a.status='excused' THEN 1 ELSE 0 END) as excused,
    COUNT(*) as total
    FROM attendance a JOIN schools sch ON a.school_id = sch.id
    WHERE 1=1 ${dateFilter}
    GROUP BY sch.id, a.date ORDER BY sch.parish, sch.name, a.date DESC`).all(...params);

  const csv = toCSV(rows, [
    { key: 'school_name', label: 'School' },
    { key: 'parish',      label: 'Parish' },
    { key: 'date',        label: 'Date' },
    { key: 'present',     label: 'Present' },
    { key: 'absent',      label: 'Absent' },
    { key: 'late',        label: 'Late' },
    { key: 'excused',     label: 'Excused' },
    { key: 'total',       label: 'Total' },
  ]);
  sendCSV(res, `national_attendance_${start || 'all'}_${end || 'all'}.csv`, csv);
});

module.exports = router;
