export function createDuplicateDetectionService(db) {
  return {
    checkDuplicate(userId, amount) {
      const recent = db
        .prepare(
          `SELECT w.id, w.amount, w.requested_at
           FROM withdrawals w
           WHERE w.user_id = ? AND w.amount = ? AND w.status = 'completed'
             AND w.requested_at >= datetime('now', '-5 minutes')
           ORDER BY w.requested_at DESC
           LIMIT 1`,
        )
        .get(userId, amount);

      return recent || null;
    },
  };
}
