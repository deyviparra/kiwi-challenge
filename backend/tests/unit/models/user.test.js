import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase, seedTestDatabase } from '../../fixtures/testDb.js';
import { createUserModel } from '../../../src/models/user.js';

describe('User Model', () => {
  let db, User;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestDatabase(db);
    User = createUserModel(db);
  });

  describe('findById', () => {
    it('returns user when found', () => {
      const user = User.findById(1);
      expect(user).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john.doe@example.com');
    });

    it('returns undefined when not found', () => {
      const user = User.findById(999);
      expect(user).toBeUndefined();
    });
  });

  describe('getBalance', () => {
    it('calculates correct balance from all transactions', () => {
      // 25.5 + 15.75 + 30 + 50 + 50 - 50 = 121.25
      const balance = User.getBalance(1);
      expect(balance).toBe(121.25);
    });

    it('returns 0 for user with no transactions', () => {
      db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(
        'Empty User',
        'empty@test.com',
      );
      const balance = User.getBalance(2);
      expect(balance).toBe(0);
    });
  });
});
