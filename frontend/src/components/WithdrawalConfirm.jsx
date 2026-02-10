import { formatCurrency } from '../utils/formatters';
import SelectedMethodCard from './common/SelectedMethodCard';
import { WarningIcon } from './icons/TransactionIcons';

export default function WithdrawalConfirm({
  method,
  amount,
  onConfirm,
  onCancel,
  isProcessing,
}) {
  return (
    <div className="space-y-6 fade-in h-full flex-1 flex flex-col">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-kiwi-dark">
          Retirar tus fondos
        </h3>

        <div className="mt-6">
          <p className="text-[13px] text-kiwi-muted font-medium">Monto total a retirar</p>
          <p className="text-4xl font-extrabold text-kiwi-dark mt-1">
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="mt-8 space-y-2">
          <p className="text-[13px] text-kiwi-muted font-medium">Selecciona tu método de retiro</p>
          <SelectedMethodCard 
            method={method} 
            onClick={onCancel} 
            showChangeButton 
          />
        </div>
      </div>

      <div className="pt-4 pb-4">
        <div className="flex gap-3 p-4 mb-6 bg-white border border-kiwi-border rounded-xl mt-6 items-center">
          <div className="text-kiwi-blue shrink-0">
            <img src={WarningIcon} alt="Warning" className="w-6 h-6" />
          </div>
          <p className="text-[12px] text-kiwi-muted leading-tight">
            <span className="font-bold text-kiwi-dark">Debes esperar unos minutos</span> antes de realizar otro retiro con el mismo monto.
          </p>
        </div>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full py-2 rounded-xl font-bold text-white bg-kiwi-accent hover:opacity-90 disabled:bg-kiwi-disabled disabled:text-kiwi-white transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
          ) : 'Retirar fondos'}
        </button>
      </div>
    </div>
  );
}
