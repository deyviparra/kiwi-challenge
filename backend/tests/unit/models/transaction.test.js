import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, seedTestDatabase } from '../../fixtures/testDb.js';
import { createTransactionModel } from '../../../src/models/transaction.js';

describe('Transaction Model', () => {
  let db, Transaction;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestDatabase(db);
    Transaction = createTransactionModel(db);
  });

  describe('findByUserId', () => {
    it('returns transactions sorted by timestamp DESC', () => {
      const txns = Transaction.findByUserId(1);
      expect(txns.length).toBe(6);
      for (let i = 0; i < txns.length - 1; i++) {
        expect(new Date(txns[i].timestamp) >= new Date(txns[i + 1].timestamp)).toBe(true);
      }
    });

    it('respects limit parameter', () => {
      const txns = Transaction.findByUserId(1, { limit: 2 });
      expect(txns.length).toBe(2);
    });

    it('respects offset parameter', () => {
      const all = Transaction.findByUserId(1);
      const offset = Transaction.findByUserId(1, { offset: 2 });
      expect(offset[0].id).toBe(all[2].id);
    });

    it('filters by type', () => {
      const cashback = Transaction.findByUserId(1, { type: 'cashback' });
      expect(cashback.length).toBe(3);
      cashback.forEach((t) => expect(t.type).toBe('cashback'));
    });
  });

  describe('countByUserId', () => {
    it('returns total count', () => {
      expect(Transaction.countByUserId(1)).toBe(6);
    });

    it('returns filtered count', () => {
      expect(Transaction.countByUserId(1, { type: 'withdrawal' })).toBe(1);
    });
  });
});
