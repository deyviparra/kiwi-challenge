# Data Model

**Feature**: Rewards and Cashback Application
**Branch**: `001-rewards-cashback-app`
**Date**: 2026-02-08
**Storage**: SQLite Database

---

## Entity Relationship Diagram

```text
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ name            │
│ email           │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ├──────────────────┐
         │                  │
         │                  │
         ▼                  ▼
┌──────────────────┐  ┌──────────────────────┐
│   Transaction    │  │  WithdrawalMethod    │
│──────────────────│  │──────────────────────│
│ id (PK)          │  │ id (PK)              │
│ user_id (FK)     │  │ user_id (FK)         │
│ type             │  │ bank_name            │
│ amount           │  │ account_number       │
│ description      │  │ account_type         │
│ timestamp        │  │ is_active            │
│ created_at       │  │ created_at           │
└──────────────────┘  └──────────┬───────────┘
                                 │
                                 │ N:1
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │     Withdrawal       │
                      │──────────────────────│
                      │ id (PK)              │
                      │ user_id (FK)         │
                      │ method_id (FK)       │
                      │ transaction_id (FK)  │
                      │ amount               │
                      │ status               │
                      │ requested_at         │
                      │ completed_at         │
                      └──────────────────────┘
```

---

## Entity Definitions

### 1. User

Represents a rewards account holder.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `name` | TEXT | NOT NULL | User's full name |
| `email` | TEXT | NOT NULL, UNIQUE | User's email address |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Validations**:
- `email`: Must be valid email format (regex validation in API layer)
- `name`: 2-100 characters

**Computed Properties**:
- `balance`: Calculated as `SUM(transactions.amount)` where `user_id = user.id`

**Relationships**:
- Has many `Transaction` records
- Has many `WithdrawalMethod` records
- Has many `Withdrawal` records

---

### 2. Transaction

Represents a record of balance changes (credits and debits).

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique transaction identifier |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → User(id) | Owner of transaction |
| `type` | TEXT | NOT NULL, CHECK (type IN ('cashback', 'referral_bonus', 'withdrawal')) | Transaction type |
| `amount` | DECIMAL(10,2) | NOT NULL | Transaction amount (positive for credits, negative for debits) |
| `description` | TEXT | NULL | Human-readable description |
| `timestamp` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When transaction occurred |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When record was created |

**Validations**:
- `type`: Must be one of: `cashback`, `referral_bonus`, `withdrawal`
- `amount`:
  - For `cashback` and `referral_bonus`: Must be positive (> 0)
  - For `withdrawal`: Must be negative (< 0)
  - Max 2 decimal places
- `description`: Optional, max 255 characters

**Indexes**:
- `idx_transactions_user_timestamp` ON `(user_id, timestamp DESC)` - for efficient history queries
- `idx_transactions_type_amount_timestamp` ON `(user_id, type, amount, timestamp)` - for duplicate withdrawal check

**Relationships**:
- Belongs to `User`
- May be referenced by `Withdrawal` (if type is 'withdrawal')

---

### 3. WithdrawalMethod

Represents a linked bank account for withdrawals.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique method identifier |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → User(id) | Owner of this withdrawal method |
| `bank_name` | TEXT | NOT NULL | Name of the bank (e.g., "Chase", "Bank of America") |
| `account_number` | TEXT | NOT NULL | Full account number (stored encrypted or hashed) |
| `account_type` | TEXT | NOT NULL, CHECK (account_type IN ('checking', 'savings')) | Type of bank account |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT 1 | Whether this method can be used (soft delete) |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When method was added |

**Validations**:
- `account_number`: 8-17 digits (varies by bank)
- `account_type`: Must be one of: `checking`, `savings`
- `bank_name`: 2-50 characters

**Security**:
- `account_number` should be encrypted at rest (consider using SQLite encryption extension or application-level encryption)
- When displayed in UI, mask all but last 4 digits: `****1234`

**Computed Properties**:
- `masked_account_number`: Returns account number with all but last 4 digits masked

**Relationships**:
- Belongs to `User`
- Has many `Withdrawal` records

---

### 4. Withdrawal

Represents a request to transfer funds from rewards balance to a bank account.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique withdrawal identifier |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → User(id) | User requesting withdrawal |
| `method_id` | INTEGER | NOT NULL, FOREIGN KEY → WithdrawalMethod(id) | Selected bank account |
| `transaction_id` | INTEGER | NULL, FOREIGN KEY → Transaction(id) | Corresponding transaction record (set after processing) |
| `amount` | DECIMAL(10,2) | NOT NULL, CHECK (amount > 0) | Withdrawal amount (stored as positive, creates negative transaction) |
| `status` | TEXT | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'processing', 'completed', 'failed')) | Current status |
| `requested_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When withdrawal was requested |
| `completed_at` | DATETIME | NULL | When withdrawal reached final state (completed/failed) |

**Validations**:
- `amount`: Must be positive, max 2 decimal places
- `status`: Must be one of: `pending`, `processing`, `completed`, `failed`

**State Transitions**:

```text
   pending
      │
      ▼
  processing ──┐
      │        │
      ▼        ▼
  completed  failed
```

**Valid Transitions**:
- `pending` → `processing`: When withdrawal begins processing
- `processing` → `completed`: When funds successfully transferred
- `processing` → `failed`: When transfer fails (insufficient balance, invalid method, etc.)
- Direct `pending` → `completed` allowed (for simple implementations without async processing)

**Relationships**:
- Belongs to `User`
- Belongs to `WithdrawalMethod`
- References `Transaction` (after completion)

---

## Database Schema (SQLite DDL)

```sql
-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cashback', 'referral_bonus', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX idx_transactions_user_timestamp
    ON transactions(user_id, timestamp DESC);

CREATE INDEX idx_transactions_duplicate_check
    ON transactions(user_id, type, amount, timestamp);

-- Withdrawal methods table
CREATE TABLE withdrawal_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    method_id INTEGER NOT NULL,
    transaction_id INTEGER,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (method_id) REFERENCES withdrawal_methods(id) ON DELETE RESTRICT,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
```

---

## Sample Data

### Seed Data for Testing

```sql
-- Insert test user
INSERT INTO users (name, email) VALUES ('John Doe', 'john.doe@example.com');
-- user_id = 1

-- Insert withdrawal methods
INSERT INTO withdrawal_methods (user_id, bank_name, account_number, account_type)
VALUES
    (1, 'Chase Bank', '1234567890', 'checking'),
    (1, 'Bank of America', '9876543210', 'savings');

-- Insert sample transactions
INSERT INTO transactions (user_id, type, amount, description, timestamp) VALUES
    -- Cashback earnings
    (1, 'cashback', 25.50, 'Purchase reward from Amazon', '2026-01-15 10:30:00'),
    (1, 'cashback', 15.75, 'Purchase reward from Walmart', '2026-01-20 14:20:00'),
    (1, 'cashback', 30.00, 'Purchase reward from Target', '2026-02-01 09:15:00'),

    -- Referral bonuses
    (1, 'referral_bonus', 50.00, 'Referral bonus - Friend signed up', '2026-01-25 16:00:00'),
    (1, 'referral_bonus', 50.00, 'Referral bonus - Friend signed up', '2026-02-05 11:30:00'),

    -- Withdrawals
    (1, 'withdrawal', -50.00, 'Withdrawal to Chase Bank ****7890', '2026-02-06 13:45:00');

-- Calculate balance: 25.50 + 15.75 + 30.00 + 50.00 + 50.00 - 50.00 = 121.25

-- Insert corresponding withdrawal record
INSERT INTO withdrawals (user_id, method_id, amount, status, completed_at, transaction_id)
VALUES (1, 1, 50.00, 'completed', '2026-02-06 13:46:00', 6);
```

**Expected Balance**: $121.25

**Transaction History by Month**:
- **February 2026**: 3 transactions (1 cashback, 1 referral_bonus, 1 withdrawal)
- **January 2026**: 4 transactions (2 cashback, 1 referral_bonus)

---

## Queries for Common Operations

### Calculate User Balance

```sql
SELECT COALESCE(SUM(amount), 0) as balance
FROM transactions
WHERE user_id = ?;
```

### Get Transaction History (sorted by date descending)

```sql
SELECT id, type, amount, description, timestamp
FROM transactions
WHERE user_id = ?
ORDER BY timestamp DESC
LIMIT ? OFFSET ?;
```

### Check for Duplicate Withdrawal (5-minute window)

```sql
SELECT id, amount, timestamp
FROM transactions
WHERE user_id = ?
  AND type = 'withdrawal'
  AND amount = ?
  AND timestamp > datetime('now', '-5 minutes')
LIMIT 1;
```

### Get Active Withdrawal Methods

```sql
SELECT id, bank_name, account_number, account_type
FROM withdrawal_methods
WHERE user_id = ? AND is_active = 1
ORDER BY created_at DESC;
```

### Create Withdrawal (transactional)

```sql
BEGIN TRANSACTION;

-- 1. Insert withdrawal record
INSERT INTO withdrawals (user_id, method_id, amount)
VALUES (?, ?, ?);

-- 2. Create corresponding transaction
INSERT INTO transactions (user_id, type, amount, description)
VALUES (?, 'withdrawal', ?, ?);

-- 3. Link withdrawal to transaction
UPDATE withdrawals
SET transaction_id = last_insert_rowid(),
    status = 'completed',
    completed_at = CURRENT_TIMESTAMP
WHERE id = ?;

COMMIT;
```

---

## Data Integrity Rules

1. **Balance Consistency**: User balance must always equal `SUM(transactions.amount)`
2. **No Negative Balances**: Before creating a withdrawal transaction, validate that `current_balance - withdrawal_amount >= 0`
3. **Withdrawal-Transaction Link**: Every completed withdrawal must have a corresponding transaction with `type='withdrawal'` and negative amount
4. **Soft Deletes**: Withdrawal methods use `is_active` flag instead of hard deletes to maintain referential integrity
5. **Timestamp Precision**: SQLite `CURRENT_TIMESTAMP` produces `YYYY-MM-DD HH:MM:SS` format (no timezone suffix). Use SQLite's `datetime()` function for time comparisons (e.g., `datetime('now', '-5 minutes')`) rather than JS-computed ISO strings
6. **Amount Precision**: All monetary amounts use `DECIMAL(10,2)` to prevent floating-point errors

---

## Migration Strategy

### Initial Migration (v1)

File: `backend/src/db/migrations/001_initial_schema.sql`

```sql
-- Contains all CREATE TABLE statements above
-- Run on first application startup
```

### Future Migrations (examples)

**v2 - Add email verification**:
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verified_at DATETIME;
```

**v3 - Add withdrawal notes**:
```sql
ALTER TABLE withdrawals ADD COLUMN notes TEXT;
```

### Migration Execution

```javascript
// backend/src/db/migrate.js
const migrations = [
  { version: 1, file: '001_initial_schema.sql' },
  { version: 2, file: '002_add_email_verification.sql' }
];

function runMigrations(db) {
  // Create migrations table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get current version
  const currentVersion = db.prepare(
    'SELECT MAX(version) as version FROM schema_migrations'
  ).get()?.version || 0;

  // Run pending migrations
  migrations
    .filter(m => m.version > currentVersion)
    .forEach(m => {
      const sql = fs.readFileSync(`./migrations/${m.file}`, 'utf8');
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(m.version);
      console.log(`✅ Applied migration ${m.version}`);
    });
}
```

---

## Testing Considerations

### Test Database

- Use in-memory SQLite for tests: `new Database(':memory:')`
- Seed test data before each test suite
- Clean up between tests (truncate tables or recreate database)

### Test Scenarios

1. **Balance Calculation**:
   - Insert various transaction types
   - Assert balance equals sum of all amounts

2. **Duplicate Detection**:
   - Create withdrawal at time T
   - Attempt same amount at T+2min → expect warning
   - Attempt same amount at T+6min → expect success

3. **Concurrent Withdrawals**:
   - Simulate two withdrawal requests at same time
   - Assert only one succeeds (balance validation)

4. **Foreign Key Constraints**:
   - Delete user → assert cascades to transactions
   - Delete withdrawal method with pending withdrawal → assert RESTRICT error

---

**Data model complete. Ready for API contract definition.**
