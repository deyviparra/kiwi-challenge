import { createWithdrawalMethodModel } from '../../models/withdrawalMethod.js';
import { getDatabase } from '../../db/database.js';

export function getMethods(req, res, next) {
  try {
    const db = req.db || getDatabase();
    const WithdrawalMethod = createWithdrawalMethodModel(db);

    const userId = req.userId || 1;
    const methods = WithdrawalMethod.findByUserId(userId);

    res.json({
      success: true,
      data: { methods },
    });
  } catch (err) {
    next(err);
  }
}
