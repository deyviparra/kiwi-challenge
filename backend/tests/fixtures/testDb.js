import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(
  __dirname,
  '../../src/db/migrations/001_initial_schema.sql',
);

export function createTestDatabase() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  const sql = fs.readFileSync(migrationPath, 'utf8');
  db.exec(sql);

  return db;
}

export function seedTestDatabase(db) {
  db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(
    'John Doe',
    'john.doe@example.com',
  );

  db.prepare(
    'INSERT INTO withdrawal_methods (user_id, bank_name, account_number, account_type) VALUES (?, ?, ?, ?)',
  ).run(1, 'Chase Bank', '1234567890', 'checking');
  db.prepare(
    'INSERT INTO withdrawal_methods (user_id, bank_name, account_number, account_type) VALUES (?, ?, ?, ?)',
  ).run(1, 'Bank of America', '9876543210', 'savings');

  const insertTxn = db.prepare(
    'INSERT INTO transactions (user_id, type, amount, description, timestamp) VALUES (?, ?, ?, ?, ?)',
  );
  insertTxn.run(1, 'cashback', 25.5, 'Cashback from Amazon', '2026-01-15 10:30:00');
  insertTxn.run(1, 'cashback', 15.75, 'Cashback from Walmart', '2026-01-20 14:20:00');
  insertTxn.run(1, 'cashback', 30.0, 'Cashback from Target', '2026-02-01 09:15:00');
  insertTxn.run(1, 'referral_bonus', 50.0, 'Referral bonus', '2026-01-25 16:00:00');
  insertTxn.run(1, 'referral_bonus', 50.0, 'Referral bonus', '2026-02-05 11:30:00');
  insertTxn.run(1, 'withdrawal', -50.0, 'Withdrawal to Chase ****7890', '2026-02-06 13:45:00');

  return db;
}
