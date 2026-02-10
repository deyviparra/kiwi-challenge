import { useState } from 'react';
import { BankIcon } from './icons/TransactionIcons';

export default function WithdrawalMethodSelect({
  methods,
  isLoading,
  onSelect,
}) {
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-gray-200 border-t-cyan-500" />
      </div>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
        </svg>
        <p className="text-sm">No bank accounts linked.</p>
      </div>
    );
  }

  const handleContinue = () => {
    const selected = methods.find((m) => m.id === selectedMethodId);
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="space-y-6 fade-in h-full flex-1 flex flex-col">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-kiwi-dark mb-6">
          Elige tu método de retiro
        </h3>
        <div className="space-y-3">
          {methods.map((method) => {
            const isSelected = selectedMethodId === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethodId(method.id)}
                className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-all text-left group ${
                  isSelected
                    ? 'border-kiwi-blue bg-blue-50/10 shadow-sm ring-1 ring-kiwi-blue'
                    : 'border-kiwi-border bg-white hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-kiwi-gray-bg flex items-center justify-center shrink-0">
                  <img src={BankIcon} alt="Bank" className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-kiwi-dark text-[15px]">{method.bank_name}</p>
                  <p className="text-[13px] text-kiwi-muted mt-0.5">
                    {method.account_number}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-kiwi-blue flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="pt-4 pb-4">
        <button
          onClick={handleContinue}
          disabled={!selectedMethodId}
          className={`w-full py-2 rounded-xl font-bold transition-colors ${
            selectedMethodId
              ? 'bg-kiwi-accent text-white'
              : 'bg-kiwi-disabled text-kiwi-white cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
