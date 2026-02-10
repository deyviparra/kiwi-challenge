export function groupByMonth(transactions) {
  const groups = {};

  for (const txn of transactions) {
    const date = new Date(txn.timestamp);
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    const year = date.getFullYear();
    const monthKey = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;

    if (!groups[monthKey]) {
      groups[monthKey] = { month: monthKey, sortDate: date, transactions: [] };
    }
    groups[monthKey].transactions.push(txn);
  }

  return Object.values(groups).sort((a, b) => b.sortDate - a.sortDate);
}
