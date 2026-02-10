import { describe, it, expect } from 'vitest';
import { groupByMonth } from '../../src/utils/groupByMonth';

describe('groupByMonth', () => {
  it('groups transactions by month', () => {
    const transactions = [
      { id: 1, timestamp: '2026-02-10T10:00:00Z', type: 'cashback', amount: 10 },
      { id: 2, timestamp: '2026-02-05T10:00:00Z', type: 'cashback', amount: 20 },
      { id: 3, timestamp: '2026-01-15T10:00:00Z', type: 'cashback', amount: 30 },
    ];

    const result = groupByMonth(transactions);
    expect(result).toHaveLength(2);
    expect(result[0].month).toBe('February 2026');
    expect(result[0].transactions).toHaveLength(2);
    expect(result[1].month).toBe('January 2026');
    expect(result[1].transactions).toHaveLength(1);
  });

  it('returns empty array for empty input', () => {
    expect(groupByMonth([])).toHaveLength(0);
  });

  it('handles single month', () => {
    const transactions = [
      { id: 1, timestamp: '2026-03-01T10:00:00Z', type: 'cashback', amount: 10 },
      { id: 2, timestamp: '2026-03-15T10:00:00Z', type: 'cashback', amount: 20 },
    ];

    const result = groupByMonth(transactions);
    expect(result).toHaveLength(1);
    expect(result[0].transactions).toHaveLength(2);
  });

  it('orders months most recent first', () => {
    const transactions = [
      { id: 1, timestamp: '2026-01-01T10:00:00Z', type: 'cashback', amount: 10 },
      { id: 2, timestamp: '2026-03-01T10:00:00Z', type: 'cashback', amount: 20 },
      { id: 3, timestamp: '2026-02-01T10:00:00Z', type: 'cashback', amount: 30 },
    ];

    const result = groupByMonth(transactions);
    expect(result[0].month).toBe('March 2026');
    expect(result[1].month).toBe('February 2026');
    expect(result[2].month).toBe('January 2026');
  });

  it('handles year boundaries', () => {
    const transactions = [
      { id: 1, timestamp: '2026-01-05T10:00:00Z', type: 'cashback', amount: 10 },
      { id: 2, timestamp: '2025-12-20T10:00:00Z', type: 'cashback', amount: 20 },
    ];

    const result = groupByMonth(transactions);
    expect(result).toHaveLength(2);
    expect(result[0].month).toBe('January 2026');
    expect(result[1].month).toBe('December 2025');
  });
});
