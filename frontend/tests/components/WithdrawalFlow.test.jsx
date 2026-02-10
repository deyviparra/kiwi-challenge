import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WithdrawalFlow from '../../src/components/WithdrawalFlow';
import * as UserContext from '../../src/context/UserContext';
import * as api from '../../src/services/api';

vi.mock('../../src/services/api');

function renderWithdrawalFlow(contextOverrides = {}) {
  const defaultContext = {
    balance: 100,
    refetch: vi.fn(),
    ...contextOverrides,
  };
  vi.spyOn(UserContext, 'useUser').mockReturnValue(defaultContext);
  return render(
    <MemoryRouter>
      <WithdrawalFlow />
    </MemoryRouter>,
  );
}

async function navigateToConfirm() {
  // Submit amount form to go to SELECT_METHOD
  const form = screen.getByPlaceholderText('0.00').closest('form');
  fireEvent.submit(form);

  // Wait for methods to load then select one
  await waitFor(() => {
    fireEvent.click(screen.getByText('Chase Bank'));
  });
}

describe('WithdrawalFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getWithdrawalMethods.mockResolvedValue({
      data: {
        methods: [
          {
            id: 1,
            bank_name: 'Chase Bank',
            account_number: '****7890',
            account_type: 'checking',
          },
        ],
      },
    });
  });

  it('shows amount entry screen initially', () => {
    renderWithdrawalFlow();
    expect(screen.getByText('Elige tu método de retiro')).toBeTruthy();
    expect(screen.getByPlaceholderText('0.00')).toBeTruthy();
  });

  it('shows bank accounts after submitting amount', async () => {
    renderWithdrawalFlow();
    const form = screen.getByPlaceholderText('0.00').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Chase Bank')).toBeTruthy();
    });
  });

  it('validates amount is within balance', async () => {
    renderWithdrawalFlow({ balance: 50 });
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.submit(input.closest('form'));
    await waitFor(() => {
      expect(screen.getByText(/Saldo insuficiente/)).toBeTruthy();
    });
  });

  it('shows confirmation after selecting method', async () => {
    renderWithdrawalFlow();
    await navigateToConfirm();
    expect(screen.getByText('Retirar tus fondos')).toBeTruthy();
  });

  it('shows success after confirming withdrawal', async () => {
    api.createWithdrawal.mockResolvedValue({
      data: {
        withdrawal: {
          id: 1,
          amount: 15,
          status: 'completed',
          method: { bank_name: 'Chase Bank', account_number: '****7890' },
        },
        new_balance: 85,
      },
    });

    renderWithdrawalFlow();
    await navigateToConfirm();

    fireEvent.click(screen.getByRole('button', { name: 'Retirar fondos' }));

    await waitFor(() => {
      expect(screen.getByText('¡Tu retiro fue exitoso!')).toBeTruthy();
    });
  });
});
