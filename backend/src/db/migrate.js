import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runMigrations(db) {
  db = db || getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const currentVersion =
    db.prepare('SELECT MAX(version) as version FROM schema_migrations').get()
      ?.version || 0;

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const version = parseInt(file.split('_')[0], 10);
    if (version > currentVersion) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(
        version,
      );
      console.log(`Applied migration ${version}: ${file}`);
    }
  }

  return db;
}

// Run directly
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  runMigrations();
  console.log('Migrations complete.');
}
