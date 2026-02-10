import { createTransactionModel } from '../../models/transaction.js';
import { createUserModel } from '../../models/user.js';
import { getDatabase } from '../../db/database.js';
import { ValidationError } from '../middleware/errorHandler.js';

const VALID_TYPES = ['cashback', 'referral_bonus', 'withdrawal'];

export function getTransactions(req, res, next) {
  try {
    const db = req.db || getDatabase();
    const Transaction = createTransactionModel(db);
    const User = createUserModel(db);

    const userId = req.userId || 1;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 500);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const type = req.query.type;

    if (type && !VALID_TYPES.includes(type)) {
      throw new ValidationError('Invalid transaction type', {
        field: 'type',
        allowed: VALID_TYPES,
      });
    }

    const transactions = Transaction.findByUserId(userId, { limit, offset, type });
    const total = Transaction.countByUserId(userId, { type });
    const balance = User.getBalance(userId);

    res.json({
      success: true,
      data: { transactions, total, balance },
    });
  } catch (err) {
    next(err);
  }
}
