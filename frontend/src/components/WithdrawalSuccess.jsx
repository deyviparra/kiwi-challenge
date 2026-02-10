import { useNavigate } from 'react-router-dom';
import successBg from './icons/success.png';
import { WarningIcon } from './icons/TransactionIcons';

export default function WithdrawalSuccess({ withdrawal }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col text-center space-y-8 pt-12 justify-around slide-up">
      <div>
        {/* Success Icon */}
        <div className="relative w-32 h-32 mx-auto">
          <img 
            src={successBg} 
            alt="Success" 
            className="w-full h-full object-contain"
          />
        </div>
        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-kiwi-dark">
            ¡Tu retiro fue exitoso!
          </h3>
          <p className="text-[15px] text-kiwi-muted px-4 leading-relaxed">
            Procesamos tu solicitud y enviamos tu recompensa a tu cuenta bancaria terminada en {withdrawal.method.account_number.slice(-4)}.
          </p>
        </div>
      </div>

      <div>
        {/* Info Alert */}
        <div className="flex gap-3 px-2 py-1 bg-white border border-kiwi-border rounded-xl text-left flex items-center">
          <div className="mt-0.5">
            <img src={WarningIcon} alt="Warning" className="w-12 h-12" />
          </div>
          <p className="text-[12px] text-kiwi-muted leading-relaxed">
            El pago puede tardar hasta 3 (tres) días hábiles en reflejarse en tu cuenta.
          </p>
        </div>

        {/* Action */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 py-2 rounded-xl font-semibold text-white bg-kiwi-accent hover:opacity-90 transition-all shadow-md"
        >
          Regresar a Rewards
        </button>
      </div>
    </div>
  );
}
