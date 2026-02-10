export function createUserModel(db) {
  return {
    findById(id) {
      return db
        .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
        .get(id);
    },

    getBalance(userId) {
      const row = db
        .prepare(
          'SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ?',
        )
        .get(userId);
      return parseFloat(row.balance.toFixed(2));
    },
  };
}
