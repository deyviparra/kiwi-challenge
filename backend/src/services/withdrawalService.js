import { createUserModel } from '../models/user.js';
import { createWithdrawalMethodModel } from '../models/withdrawalMethod.js';
import { createWithdrawalModel } from '../models/withdrawal.js';
import {
  ValidationError,
  NotFoundError,
  BusinessLogicError,
} from '../api/middleware/errorHandler.js';

export function createWithdrawalService(db) {
  const User = createUserModel(db);
  const WithdrawalMethod = createWithdrawalMethodModel(db);
  const Withdrawal = createWithdrawalModel(db);

  return {
    processWithdrawal(userId, methodId, amount) {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new ValidationError('Amount must be a positive number', {
          field: 'amount',
        });
      }

      const decimalParts = String(amount).split('.');
      if (decimalParts[1] && decimalParts[1].length > 2) {
        throw new ValidationError(
          'Amount must have at most 2 decimal places',
          { field: 'amount' },
        );
      }

      // Validate method exists and belongs to user
      const method = WithdrawalMethod.findById(methodId);
      if (!method || method.user_id !== userId || !method.is_active) {
        throw new NotFoundError('Withdrawal method not found', {
          method_id: methodId,
        });
      }

      // Validate balance
      const balance = User.getBalance(userId);
      if (balance < amount) {
        throw new BusinessLogicError(
          'Insufficient balance for withdrawal',
          'INSUFFICIENT_BALANCE',
          { requested: amount, available: balance },
        );
      }

      // Process withdrawal
      const description = `Retiro a ${method.bank_name} ${method.account_number}`;
      const withdrawalId = Withdrawal.create(
        userId,
        methodId,
        amount,
        description,
      );

      const withdrawal = Withdrawal.findById(withdrawalId);
      const newBalance = User.getBalance(userId);

      return {
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          status: withdrawal.status,
          method: {
            bank_name: method.bank_name,
            account_number: method.account_number,
          },
          requested_at: withdrawal.requested_at,
          completed_at: withdrawal.completed_at,
        },
        newBalance,
      };
    },
  };
}
