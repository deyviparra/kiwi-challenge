export function createTransactionModel(db) {
  return {
    findByUserId(userId, { limit = 100, offset = 0, type } = {}) {
      let sql = 'SELECT id, user_id, type, amount, description, timestamp FROM transactions WHERE user_id = ?';
      const params = [userId];

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      return db.prepare(sql).all(...params);
    },

    countByUserId(userId, { type } = {}) {
      let sql = 'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?';
      const params = [userId];

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      return db.prepare(sql).get(...params).count;
    },

    create(userId, type, amount, description) {
      const result = db
        .prepare(
          'INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)',
        )
        .run(userId, type, amount, description);
      return result.lastInsertRowid;
    },
  };
}
