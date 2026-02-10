import { groupByMonth } from '../utils/groupByMonth';
import { formatCurrency, formatDate } from '../utils/formatters';
import SendIcon from './icons/send.svg';
import ReferralIcon from './icons/referral.svg';
import CashbackIcon from './icons/cashback.svg';

const TYPE_CONFIG = {
  referral_bonus: {
    label: 'Bono de referido',
    icon: ReferralIcon,
    bg: 'bg-kiwi-gray-bg',
  },
  withdrawal: {
    label: 'Retiro a cuenta',
    icon: SendIcon,
    bg: 'bg-kiwi-gray-bg',
  },
  cashback: {
    label: 'Cashback',
    icon: CashbackIcon,
    bg: 'bg-kiwi-gray-bg',
  },
};

function TransactionItem({ transaction }) {
  const isCredit = transaction.amount > 0;
  const config = TYPE_CONFIG[transaction.type] || TYPE_CONFIG.withdrawal;
  const displayName = transaction.description || config.label;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-11 h-11 shrink-0 aspect-square rounded-full flex items-center justify-center ${config.bg}`}
        >
          <img src={config.icon} alt={config.label} className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-kiwi-dark leading-tight">
            {displayName}
          </p>
          <p className="text-[13px] text-kiwi-muted mt-0.5">
            {formatDate(transaction.timestamp)}
          </p>
        </div>
      </div>
      <span className={`text-[15px] font-bold ${isCredit ? 'text-kiwi-green' : 'text-kiwi-dark'}`}>
        {isCredit ? '+' : ''}
        {formatCurrency(transaction.amount)}
      </span>
    </div>
  );
}

export default function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 text-kiwi-muted">
        <p className="text-sm">No hay historial de transacciones.</p>
      </div>
    );
  }

  const grouped = groupByMonth(transactions);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.month}>
          <h3 className="text-[13px] font-semibold text-kiwi-muted mb-3 px-1">
            {group.month.replace(/^\w/, (c) => c.toUpperCase())}
          </h3>
          <div className="divide-y divide-gray-50">
            {group.transactions.map((txn) => (
              <TransactionItem key={txn.id} transaction={txn} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
