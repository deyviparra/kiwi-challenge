import { createWithdrawalService } from '../../services/withdrawalService.js';
import { createDuplicateDetectionService } from '../../services/duplicateDetectionService.js';
import { getDatabase } from '../../db/database.js';
import { ValidationError, ConflictError } from '../middleware/errorHandler.js';

export function createWithdrawal(req, res, next) {
  try {
    const db = req.db || getDatabase();
    const service = createWithdrawalService(db);
    const duplicateService = createDuplicateDetectionService(db);

    const userId = req.userId || 1;
    const { method_id, amount, override_duplicate_check } = req.body;

    if (!method_id) {
      throw new ValidationError('Missing required field: method_id', {
        field: 'method_id',
      });
    }

    if (amount === undefined || amount === null) {
      throw new ValidationError('Missing required field: amount', {
        field: 'amount',
      });
    }

    const parsedAmount = parseFloat(amount);

    // Check for duplicate withdrawal unless override is set
    if (!override_duplicate_check) {
      const duplicate = duplicateService.checkDuplicate(userId, parsedAmount);
      if (duplicate) {
        throw new ConflictError(
          'You recently withdrew this amount. Are you sure you want to proceed?',
          {
            amount: parsedAmount,
            last_withdrawal_at: duplicate.requested_at,
            allow_override: true,
          },
        );
      }
    }

    const result = service.processWithdrawal(userId, method_id, parsedAmount);

    res.status(201).json({
      success: true,
      data: {
        withdrawal: result.withdrawal,
        new_balance: result.newBalance,
      },
      message: 'Withdrawal completed successfully',
    });
  } catch (err) {
    next(err);
  }
}
