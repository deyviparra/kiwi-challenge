import { createUserModel } from '../../models/user.js';
import { getDatabase } from '../../db/database.js';

export function getProfile(req, res, next) {
  try {
    const db = req.db || getDatabase();
    const User = createUserModel(db);

    const userId = req.userId || 1;
    const user = User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const balance = User.getBalance(userId);

    res.json({
      success: true,
      data: {
        user: { ...user, balance },
      },
    });
  } catch (err) {
    next(err);
  }
}
