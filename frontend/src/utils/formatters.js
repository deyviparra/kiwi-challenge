export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  const month = date.toLocaleDateString('es-ES', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}, ${year}`;
}
