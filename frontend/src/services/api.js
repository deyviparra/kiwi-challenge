const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json();

  if (!data.success) {
    const error = new Error(data.error?.message || 'Request failed');
    error.code = data.error?.code;
    error.details = data.error?.details;
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getUserProfile() {
  return request('/user/profile');
}

export function getTransactions(limit = 100, offset = 0, type) {
  const params = new URLSearchParams({ limit, offset });
  if (type) params.set('type', type);
  return request(`/transactions?${params}`);
}

export function getWithdrawalMethods() {
  return request('/withdrawal-methods');
}

export function createWithdrawal(methodId, amount, overrideDuplicateCheck = false) {
  return request('/withdrawals', {
    method: 'POST',
    body: JSON.stringify({
      method_id: methodId,
      amount,
      override_duplicate_check: overrideDuplicateCheck,
    }),
  });
}
