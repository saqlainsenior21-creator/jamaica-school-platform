/**
 * SQLite backup script — run via cron or Railway cron job.
 * Copies the live DB to a timestamped file.
 * If BACKUP_DIR env is set, writes there; otherwise writes to ./backups/
 *
 * Usage:  node backend/scripts/backup.js
 * Cron:   0 2 * * *   (daily at 2 AM)
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../school_platform.db');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');

if (!fs.existsSync(DB_PATH)) {
  console.error('Database not found:', DB_PATH);
  process.exit(1);
}

fs.mkdirSync(BACKUP_DIR, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dest = path.join(BACKUP_DIR, `school_platform_${ts}.db`);

const db = new Database(DB_PATH);
db.backup(dest)
  .then(() => {
    console.log(`✅ Backup complete: ${dest}`);
    db.close();

    // Prune backups older than 30 days
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('school_platform_') && f.endsWith('.db'))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime);

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    files.forEach(({ name, mtime }) => {
      if (mtime < cutoff) {
        fs.unlinkSync(path.join(BACKUP_DIR, name));
        console.log(`🗑  Pruned old backup: ${name}`);
      }
    });
  })
  .catch(err => {
    console.error('Backup failed:', err);
    process.exit(1);
  });
