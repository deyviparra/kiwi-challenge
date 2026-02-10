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

describe('Duplicate Withdrawal Warning', () => {
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

  it('shows duplicate warning modal when API returns 409', async () => {
    const duplicateError = new Error(
      'You recently withdrew this amount. Are you sure you want to proceed?',
    );
    duplicateError.code = 'DUPLICATE_WITHDRAWAL';
    duplicateError.status = 409;
    api.createWithdrawal.mockRejectedValue(duplicateError);

    renderWithdrawalFlow();
    await navigateToConfirm();

    fireEvent.click(screen.getByRole('button', { name: 'Retirar fondos' }));

    await waitFor(() => {
      expect(screen.getByText('Duplicate Withdrawal')).toBeTruthy();
      expect(screen.getByText(/You recently withdrew/)).toBeTruthy();
    });
  });

  it('cancels duplicate warning and returns to amount entry', async () => {
    const duplicateError = new Error('Duplicate');
    duplicateError.code = 'DUPLICATE_WITHDRAWAL';
    api.createWithdrawal.mockRejectedValue(duplicateError);

    renderWithdrawalFlow();
    await navigateToConfirm();

    fireEvent.click(screen.getByRole('button', { name: 'Retirar fondos' }));

    await waitFor(() => {
      expect(screen.getByText('Duplicate Withdrawal')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.getByText('Elige tu método de retiro')).toBeTruthy();
  });

  it('proceeds with override when user confirms duplicate', async () => {
    const duplicateError = new Error('Duplicate');
    duplicateError.code = 'DUPLICATE_WITHDRAWAL';
    api.createWithdrawal
      .mockRejectedValueOnce(duplicateError)
      .mockResolvedValueOnce({
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
      expect(screen.getByText('Duplicate Withdrawal')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Yes, proceed'));

    await waitFor(() => {
      expect(screen.getByText('¡Tu retiro fue exitoso!')).toBeTruthy();
    });

    expect(api.createWithdrawal).toHaveBeenCalledTimes(2);
    expect(api.createWithdrawal).toHaveBeenLastCalledWith(1, 15, true);
  });
});
