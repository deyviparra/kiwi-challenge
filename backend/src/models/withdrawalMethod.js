function maskAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber.length <= 4) return accountNumber;
  return '****' + accountNumber.slice(-4);
}

export function createWithdrawalMethodModel(db) {
  return {
    findByUserId(userId) {
      const methods = db
        .prepare(
          'SELECT id, user_id, bank_name, account_number, account_type, is_active FROM withdrawal_methods WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
        )
        .all(userId);

      return methods.map((m) => ({
        ...m,
        account_number: maskAccountNumber(m.account_number),
      }));
    },

    findById(id) {
      const method = db
        .prepare(
          'SELECT id, user_id, bank_name, account_number, account_type, is_active FROM withdrawal_methods WHERE id = ?',
        )
        .get(id);

      if (method) {
        return {
          ...method,
          raw_account_number: method.account_number,
          account_number: maskAccountNumber(method.account_number),
        };
      }
      return null;
    },
  };
}
