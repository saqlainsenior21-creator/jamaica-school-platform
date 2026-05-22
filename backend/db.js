const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'school_platform.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Roles: moe_admin, school_admin, teacher, parent
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('moe_admin','school_admin','teacher','parent')),
    school_id TEXT,
    phone TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parish TEXT NOT NULL,
    district TEXT,
    principal_name TEXT,
    principal_phone TEXT,
    principal_email TEXT,
    address TEXT,
    school_type TEXT DEFAULT 'Primary',
    student_count INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL REFERENCES schools(id),
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    teacher_id TEXT REFERENCES users(id),
    academic_year TEXT NOT NULL,
    term INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL REFERENCES schools(id),
    class_id TEXT REFERENCES classes(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    student_id_number TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    parent_phone2 TEXT,
    parent_email TEXT,
    address TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id),
    class_id TEXT NOT NULL REFERENCES classes(id),
    school_id TEXT NOT NULL REFERENCES schools(id),
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('present','absent','late','excused')),
    period TEXT DEFAULT 'full_day',
    marked_by TEXT REFERENCES users(id),
    notes TEXT,
    sms_sent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, date, period)
  );

  CREATE TABLE IF NOT EXISTS behaviour_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id),
    school_id TEXT NOT NULL REFERENCES schools(id),
    class_id TEXT REFERENCES classes(id),
    teacher_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK(type IN ('incident','commendation','warning','suspension')),
    category TEXT,
    description TEXT NOT NULL,
    action_taken TEXT,
    parent_notified INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sms_log (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id),
    school_id TEXT REFERENCES schools(id),
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    twilio_sid TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS academic_terms (
    id TEXT PRIMARY KEY,
    school_id TEXT REFERENCES schools(id),
    academic_year TEXT NOT NULL,
    term INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_current INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    user_email TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    school_id TEXT,
    ip TEXT,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sms_daily_count (
    school_id TEXT NOT NULL,
    date TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    PRIMARY KEY (school_id, date)
  );

  CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
  CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_school ON attendance(school_id);
  CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
  CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
  CREATE INDEX IF NOT EXISTS idx_behaviour_student ON behaviour_records(student_id);
  CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
`);

// Seed MOE admin
function seedAdmin() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(process.env.SEED_ADMIN_EMAIL || 'admin@moe.gov.jm');
  if (!existing) {
    const { v4: uuidv4 } = require('uuid');
    const hash = bcrypt.hashSync(process.env.SEED_ADMIN_PASSWORD || 'Admin2026!', 10);
    db.prepare(`INSERT INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)`)
      .run(uuidv4(), 'MOE Administrator', process.env.SEED_ADMIN_EMAIL || 'admin@moe.gov.jm', hash, 'moe_admin');

    // Seed sample schools
    const parishes = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];
    const schoolNames = [
      'Calabar High School','Kingston College','Wolmer\'s Boys School','Holy Trinity High',
      'St. Andrew High School','Excelsior High School','Merl Grove High','Meadowbrook High',
      'Manchester High School','Holmwood Technical','Munro College','Black River High',
      'Cornwall College','Montego Bay High'
    ];

    const insertSchool = db.prepare(`INSERT INTO schools (id,name,parish,school_type,active) VALUES (?,?,?,?,1)`);
    schoolNames.forEach((name, i) => {
      insertSchool.run(uuidv4(), name, parishes[i] || 'Kingston', i < 7 ? 'Secondary' : 'Primary');
    });

    console.log('✅ MOE Admin seeded:', process.env.SEED_ADMIN_EMAIL || 'admin@moe.gov.jm');
  }
}

seedAdmin();

module.exports = db;
