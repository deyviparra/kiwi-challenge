import { formatCurrency } from '../utils/formatters';

export default function DuplicateWarningModal({ amount, onConfirm, onCancel, isProcessing }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 slide-up">
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Duplicate Withdrawal</h3>
        </div>

        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          You recently withdrew {formatCurrency(amount)}. Are you sure you want to proceed?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-xl font-semibold text-white bg-cyan-500 hover:bg-cyan-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                Processing...
              </>
            ) : 'Yes, proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}
