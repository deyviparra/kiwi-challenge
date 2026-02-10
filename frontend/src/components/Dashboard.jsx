import { useUser } from '../context/UserContext';
import { formatCurrency } from '../utils/formatters';
import TransactionList from './TransactionList';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { balance, transactions, isLoading, error, withdrawalMethods } =
    useUser();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-700 font-medium">Error loading dashboard</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  const hasWithdrawalMethods = withdrawalMethods && withdrawalMethods.length > 0;
  const canWithdraw = hasWithdrawalMethods && balance > 0;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 fade-in">
      {/* Header */}
      <h1 className="text-2xl font-bold text-kiwi-dark pt-2">Rewards</h1>

      {/* Balance Card */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-kiwi-border flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] text-kiwi-muted font-medium leading-none">
            Monto acumulado
          </p>
          <p className="text-3xl font-semibold text-kiwi-blue leading-none tracking-tight">
            {formatCurrency(balance)}
          </p>
        </div>
        <button
          onClick={() => navigate('/withdraw')}
          disabled={!canWithdraw}
          className="px-2 pt-[5px] pb-[7px] rounded-full text-[13px] leading-none font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 bg-kiwi-blue"
        >
          {canWithdraw ? (
            <>
              Retirar
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          ) : !hasWithdrawalMethods ? 'Sin cuentas' : 'Sin saldo'}
        </button>
      </div>

      {/* Transaction History */}
      <TransactionList transactions={transactions} />
    </div>
  );
}
