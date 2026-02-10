import CardIcon from '../icons/CardIcon';

export default function SelectedMethodCard({ method, onClick, showChangeButton = false }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-2 bg-white border border-kiwi-border rounded-xl ${onClick ? 'cursor-pointer hover:border-kiwi-blue transition-colors group' : ''}`}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-kiwi-accent">
          <CardIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-kiwi-dark">{method.bank_name}</p>
        <p className="text-[13px] text-kiwi-muted mt-0.5">{method.account_number}</p>
      </div>
      {showChangeButton && (
        <svg className="w-5 h-5 text-gray-300 group-hover:text-kiwi-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </div>
  );
}
