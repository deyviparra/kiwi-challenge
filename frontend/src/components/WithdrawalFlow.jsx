import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getWithdrawalMethods, createWithdrawal } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import WithdrawalMethodSelect from './WithdrawalMethodSelect';
import WithdrawalConfirm from './WithdrawalConfirm';
import WithdrawalSuccess from './WithdrawalSuccess';
import DuplicateWarningModal from './DuplicateWarningModal';
import { WarningIcon } from './icons/TransactionIcons';
import SelectedMethodCard from './common/SelectedMethodCard';

const STEPS = {
  SELECT_METHOD: 'select_method',
  ENTER_AMOUNT: 'enter_amount',
  CONFIRM: 'confirm',
  SUCCESS: 'success',
};

export default function WithdrawalFlow() {
  const { balance, refetch } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.ENTER_AMOUNT);
  const [methods, setMethods] = useState([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useEffect(() => {
    getWithdrawalMethods()
      .then((res) => setMethods(res.data.methods))
      .catch(() => setError('Failed to load bank accounts'))
      .finally(() => setIsLoadingMethods(false));
  }, []);

  function handleMethodSelect(method) {
    setSelectedMethod(method);
    setStep(STEPS.CONFIRM);
  }

  function validateAmount(value) {
    const num = parseFloat(value);
    if (!value || isNaN(num)) return 'Por favor ingresa un monto';
    if (num <= 0) return 'El monto debe ser positivo';
    if (num > balance) return `Saldo insuficiente (disponible: ${formatCurrency(balance)})`;
    const parts = value.split('.');
    if (parts[1] && parts[1].length > 2) return 'Máximo 2 decimales';
    return '';
  }

  function handleAmountSubmit(e) {
    e.preventDefault();
    const err = validateAmount(amount);
    if (err) {
      setAmountError(err);
      return;
    }
    setAmountError('');
    setStep(STEPS.SELECT_METHOD);
  }

  async function handleConfirm(overrideDuplicate = false) {
    setIsProcessing(true);
    setError('');
    try {
      const res = await createWithdrawal(
        selectedMethod.id,
        parseFloat(amount),
        overrideDuplicate,
      );
      setResult(res.data);
      setStep(STEPS.SUCCESS);
      setShowDuplicateWarning(false);
      refetch();
    } catch (err) {
      if (err.code === 'DUPLICATE_WITHDRAWAL' || err.status === 409) {
        setShowDuplicateWarning(true);
      } else {
        setError(err.message || 'Error al procesar el retiro');
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDuplicateCancel() {
    setShowDuplicateWarning(false);
    setStep(STEPS.ENTER_AMOUNT);
  }

  function handleDuplicateConfirm() {
    handleConfirm(true);
  }

  return (
    <div className="max-w-lg mx-auto p-4 min-h-screen flex flex-col fade-in">
      {showDuplicateWarning && (
        <DuplicateWarningModal
          amount={parseFloat(amount)}
          onConfirm={handleDuplicateConfirm}
          onCancel={handleDuplicateCancel}
          isProcessing={isProcessing}
        />
      )}

      {/* Back button */}
      {step !== STEPS.SUCCESS && (
        <button
          onClick={() => {
            if (step === STEPS.ENTER_AMOUNT) navigate('/');
            else if (step === STEPS.SELECT_METHOD) setStep(STEPS.ENTER_AMOUNT);
            else if (step === STEPS.CONFIRM) setStep(STEPS.SELECT_METHOD);
          }}
          className="mb-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {step === STEPS.ENTER_AMOUNT && (
          <form onSubmit={handleAmountSubmit} className="flex-1 flex flex-col fade-in px-2">
            <div className="flex-1">
              <h3 className="text-[22px] font-bold text-kiwi-dark">Elige tu método de retiro</h3>
              <div className="pt-4">
                <p className="text-[14px] text-kiwi-muted font-medium">Monto total a retirar</p>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-5xl font-bold text-kiwi-dark tracking-tighter">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balance}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setAmountError('');
                    }}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 border-none text-5xl font-bold text-kiwi-dark outline-none transition-all tracking-tighter"
                    autoFocus
                  />
                </div>
                
                <div className="mt-6 space-y-2">
                  <p className="text-[14px] text-kiwi-muted font-medium">Selecciona tu método de retiro</p>
                  <SelectedMethodCard
                    method={{ bank_name: 'Seleccionar', account_number: '' }}
                    onClick={() => {
                      const err = validateAmount(amount);
                      if (err) {
                        setAmountError(err);
                        return;
                      }
                      setAmountError('');
                      setStep(STEPS.SELECT_METHOD);
                    }}
                    showChangeButton={!amountError && validateAmount(amount) === ''}
                  />
                </div>

                {amountError && (
                  <p className="text-red-500 text-sm mt-2">{amountError}</p>
                )}
              </div>
            </div>

            <div className="pt-4 pb-4">
               {/* Info Alert */}
              <div className="flex gap-3 p-4 bg-white border border-kiwi-border rounded-xl mb-6 items-center">
                <div className="text-kiwi-blue shrink-0">
                  <img src={WarningIcon} alt="Warning" className="w-6 h-6" />
                </div>
                <p className="text-[12px] text-kiwi-muted leading-tight">
                  <span className="font-bold text-kiwi-dark">Debes esperar unos minutos</span> antes de realizar otro retiro con el mismo monto.
                </p>
              </div>

              <button
                type="submit"
                disabled={validateAmount(amount) !== ''}
                className={`w-full py-2 rounded-xl font-semibold text-kiwi-white transition-colors ${validateAmount(amount) !== '' ? 'bg-kiwi-disabled cursor-not-allowed' : 'bg-kiwi-blue hover:bg-kiwi-blue/90'}`}
              >
                Retirar fondos
              </button>
            </div>
          </form>
        )}

        {step === STEPS.SELECT_METHOD && (
          <WithdrawalMethodSelect
            methods={methods}
            isLoading={isLoadingMethods}
            onSelect={handleMethodSelect}
          />
        )}

        {step === STEPS.CONFIRM && (
          <WithdrawalConfirm
            method={selectedMethod}
            amount={parseFloat(amount)}
            onConfirm={() => handleConfirm(false)}
            onCancel={() => setStep(STEPS.SELECT_METHOD)}
            isProcessing={isProcessing}
          />
        )}

        {step === STEPS.SUCCESS && result && (
          <WithdrawalSuccess
            withdrawal={result.withdrawal}
            newBalance={result.new_balance}
          />
        )}
      </div>
    </div>
  );
}
