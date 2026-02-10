export function createWithdrawalModel(db) {
  return {
    create(userId, methodId, amount, description) {
      const createTransaction = db.transaction(() => {
        // Insert withdrawal record
        const withdrawalResult = db
          .prepare(
            'INSERT INTO withdrawals (user_id, method_id, amount) VALUES (?, ?, ?)',
          )
          .run(userId, methodId, amount);

        const withdrawalId = withdrawalResult.lastInsertRowid;

        // Insert corresponding transaction (negative amount)
        const txnResult = db
          .prepare(
            'INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)',
          )
          .run(userId, 'withdrawal', -amount, description);

        const transactionId = txnResult.lastInsertRowid;

        // Link and complete withdrawal
        db.prepare(
          "UPDATE withdrawals SET transaction_id = ?, status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?",
        ).run(transactionId, withdrawalId);

        return withdrawalId;
      });

      return createTransaction();
    },

    findById(id) {
      return db
        .prepare(
          'SELECT id, user_id, method_id, transaction_id, amount, status, requested_at, completed_at FROM withdrawals WHERE id = ?',
        )
        .get(id);
    },
  };
}
