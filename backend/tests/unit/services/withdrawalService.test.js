import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, seedTestDatabase } from '../../fixtures/testDb.js';
import { createWithdrawalService } from '../../../src/services/withdrawalService.js';

describe('WithdrawalService', () => {
  let db, service;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestDatabase(db);
    service = createWithdrawalService(db);
  });

  it('processes a valid withdrawal', () => {
    const result = service.processWithdrawal(1, 1, 50);
    expect(result.withdrawal.amount).toBe(50);
    expect(result.withdrawal.status).toBe('completed');
    expect(result.newBalance).toBe(71.25); // 121.25 - 50
  });

  it('throws on insufficient balance', () => {
    expect(() => service.processWithdrawal(1, 1, 200)).toThrow(
      'Insufficient balance',
    );
  });

  it('provides balance details on insufficient balance error', () => {
    try {
      service.processWithdrawal(1, 1, 200);
    } catch (err) {
      expect(err.code).toBe('INSUFFICIENT_BALANCE');
      expect(err.details.requested).toBe(200);
      expect(err.details.available).toBe(121.25);
    }
  });

  it('throws on invalid method', () => {
    expect(() => service.processWithdrawal(1, 999, 10)).toThrow(
      'Withdrawal method not found',
    );
  });

  it('throws on negative amount', () => {
    expect(() => service.processWithdrawal(1, 1, -10)).toThrow(
      'Amount must be a positive number',
    );
  });

  it('throws on amount with more than 2 decimal places', () => {
    expect(() => service.processWithdrawal(1, 1, 10.123)).toThrow(
      'at most 2 decimal places',
    );
  });

  it('updates balance after successful withdrawal', () => {
    const result = service.processWithdrawal(1, 1, 20);
    expect(result.newBalance).toBe(101.25);

    const result2 = service.processWithdrawal(1, 1, 30);
    expect(result2.newBalance).toBe(71.25);
  });
});
