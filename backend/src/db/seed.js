import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './database.js';
import { runMigrations } from './migrate.js';

export function seedDatabase(db) {
  db = db || getDatabase();

  const existingUser = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get('john.doe@example.com');

  if (existingUser) {
    console.log('Seed data already exists. Skipping.');
    return db;
  }

  const insertUser = db.prepare(
    'INSERT INTO users (name, email) VALUES (?, ?)',
  );
  insertUser.run('John Doe', 'john.doe@example.com');

  const insertMethod = db.prepare(
    'INSERT INTO withdrawal_methods (user_id, bank_name, account_number, account_type) VALUES (?, ?, ?, ?)',
  );
  insertMethod.run(1, 'Chase Bank', '1234567890', 'checking');
  insertMethod.run(1, 'Bank of America', '9876543210', 'savings');

  const insertTransaction = db.prepare(
    'INSERT INTO transactions (user_id, type, amount, description, timestamp) VALUES (?, ?, ?, ?, ?)',
  );

  insertTransaction.run(
    1,
    'cashback',
    25.5,
    'Recompensa de compra en Amazon',
    '2026-01-15 10:30:00',
  );
  insertTransaction.run(
    1,
    'cashback',
    15.75,
    'Recompensa de compra en Walmart',
    '2026-01-20 14:20:00',
  );
  insertTransaction.run(
    1,
    'cashback',
    30.0,
    'Recompensa de compra en Target',
    '2026-02-01 09:15:00',
  );
  insertTransaction.run(
    1,
    'referral_bonus',
    50.0,
    'Bono de referido',
    '2026-01-25 16:00:00',
  );
  insertTransaction.run(
    1,
    'referral_bonus',
    50.0,
    'Bono de referido',
    '2026-02-05 11:30:00',
  );
  insertTransaction.run(
    1,
    'withdrawal',
    -50.0,
    'Retiro a Chase Bank ****7890',
    '2026-02-06 13:45:00',
  );

  const insertWithdrawal = db.prepare(
    'INSERT INTO withdrawals (user_id, method_id, amount, status, completed_at, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
  );
  insertWithdrawal.run(1, 1, 50.0, 'completed', '2026-02-06 13:46:00', 6);

  console.log('Seed data inserted successfully.');
  console.log('Test user: john.doe@example.com, Balance: $121.25');
  return db;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  runMigrations();
  seedDatabase();
  console.log('Seeding complete.');
}
