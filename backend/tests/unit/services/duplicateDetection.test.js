import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, seedTestDatabase } from '../../fixtures/testDb.js';
import { createDuplicateDetectionService } from '../../../src/services/duplicateDetectionService.js';
import { createWithdrawalModel } from '../../../src/models/withdrawal.js';

describe('DuplicateDetectionService', () => {
  let db, service;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestDatabase(db);
    service = createDuplicateDetectionService(db);
  });

  it('returns null when no recent withdrawal exists', () => {
    const result = service.checkDuplicate(1, 99);
    expect(result).toBeNull();
  });

  it('detects a duplicate withdrawal of the same amount', () => {
    const Withdrawal = createWithdrawalModel(db);
    Withdrawal.create(1, 1, 50, 'Withdrawal to Chase ****7890');

    const result = service.checkDuplicate(1, 50);
    expect(result).not.toBeNull();
    expect(result.amount).toBe(50);
  });

  it('does not flag different amounts', () => {
    const Withdrawal = createWithdrawalModel(db);
    Withdrawal.create(1, 1, 50, 'Withdrawal to Chase ****7890');

    const result = service.checkDuplicate(1, 75);
    expect(result).toBeNull();
  });

  it('does not flag withdrawals from a different user', () => {
    // Insert a second user
    db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(
      'Jane Doe',
      'jane@example.com',
    );
    db.prepare(
      'INSERT INTO withdrawal_methods (user_id, bank_name, account_number, account_type) VALUES (?, ?, ?, ?)',
    ).run(2, 'Wells Fargo', '1111222233', 'checking');

    const Withdrawal = createWithdrawalModel(db);
    Withdrawal.create(2, 3, 50, 'Withdrawal to Wells Fargo');

    const result = service.checkDuplicate(1, 50);
    expect(result).toBeNull();
  });
});
