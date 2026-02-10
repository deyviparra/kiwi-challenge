import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db = null;

export function getDatabase(dbPath) {
  if (db) return db;

  const resolvedPath = dbPath || process.env.DATABASE_PATH || './data/rewards.db';
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export function createTestDatabase() {
  const testDb = new Database(':memory:');
  testDb.pragma('foreign_keys = ON');
  return testDb;
}
