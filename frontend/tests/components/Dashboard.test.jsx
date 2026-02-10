import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../src/components/Dashboard';
import * as UserContext from '../../src/context/UserContext';

function renderDashboard(contextValue) {
  vi.spyOn(UserContext, 'useUser').mockReturnValue(contextValue);
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard', () => {
  it('shows loading spinner when loading', () => {
    renderDashboard({ isLoading: true, transactions: [], withdrawalMethods: [] });
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows error message on error', () => {
    renderDashboard({
      isLoading: false,
      error: 'Network error',
      transactions: [],
      withdrawalMethods: [],
    });
    expect(screen.getByText('Network error')).toBeTruthy();
  });

  it('displays balance correctly', () => {
    renderDashboard({
      isLoading: false,
      error: null,
      user: { name: 'John Doe' },
      balance: 150.5,
      transactions: [],
      withdrawalMethods: [{ id: 1 }],
    });
    expect(screen.getByText('$150.50')).toBeTruthy();
  });

  it('shows transactions grouped by month', () => {
    renderDashboard({
      isLoading: false,
      error: null,
      user: { name: 'John Doe' },
      balance: 100,
      transactions: [
        {
          id: 1,
          type: 'cashback',
          amount: 25,
          description: 'Test cashback',
          timestamp: '2026-02-10T10:00:00Z',
        },
        {
          id: 2,
          type: 'withdrawal',
          amount: -50,
          description: 'Test withdrawal',
          timestamp: '2026-01-15T10:00:00Z',
        },
      ],
      withdrawalMethods: [{ id: 1 }],
    });
    expect(screen.getByText('Test cashback')).toBeTruthy();
    expect(screen.getByText('Test withdrawal')).toBeTruthy();
  });

  it('shows empty state when no transactions', () => {
    renderDashboard({
      isLoading: false,
      error: null,
      user: { name: 'John Doe' },
      balance: 0,
      transactions: [],
      withdrawalMethods: [],
    });
    expect(screen.getByText('No hay historial de transacciones.')).toBeTruthy();
  });
});
