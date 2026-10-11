import React from 'react';
import { useTrading } from '../context/TradingContext';
import { ArrowUp, ArrowDown, X, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPrice } from '../utils/chartMath';

export const OrderNotificationToast: React.FC = () => {
  const { orderToast, clearOrderToast, activeAsset } = useTrading();

  if (!orderToast) return null;

  const isUp = orderToast.direction === 'UP';
  const payoutPotential = Number((orderToast.amount * (orderToast.payoutRate / 100)).toFixed(2));
  const totalReturn = orderToast.amount + payoutPotential;

  return (
    <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm select-none animate-slideDown pointer-events-auto">
      <div
        className={`relative rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl border transition-all ${
          isUp
            ? 'bg-[#00281b]/95 border-[#00e599]/60 shadow-[0_10px_35px_rgba(0,229,153,0.35)]'
            : 'bg-[#29080e]/95 border-[#ff3355]/60 shadow-[0_10px_35px_rgba(255,51,85,0.35)]'
        }`}
      >
        {/* Glow accent bar at top */}
        <div
          className={`absolute top-0 left-4 right-4 h-0.5 rounded-full ${
            isUp ? 'bg-[#00e599] shadow-[0_0_8px_#00e599]' : 'bg-[#ff3355] shadow-[0_0_8px_#ff3355]'
          }`}
        />

        <div className="flex items-start justify-between gap-3">
          {/* Direction Badge */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              isUp
                ? 'bg-[#00e599] text-slate-950 font-black'
                : 'bg-[#ff3355] text-white font-black'
            }`}
          >
            {isUp ? (
              <ArrowUp className="w-6 h-6 stroke-[3]" />
            ) : (
              <ArrowDown className="w-6 h-6 stroke-[3]" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                  isUp ? 'text-[#00e599]' : 'text-[#ff4d6b]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-ping ${
                    isUp ? 'bg-[#00e599]' : 'bg-[#ff3355]'
                  }`}
                />
                {isUp ? 'BUY / CALL ORDER' : 'SELL / PUT ORDER'}
              </span>

              <span className="text-[10px] text-slate-400 font-mono">
                {orderToast.assetSymbol}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span className="text-white font-black text-base font-mono-num">
                ${orderToast.amount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-400 font-mono-num">
                +{orderToast.payoutRate}% Payout
              </span>
            </div>

            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-300 font-mono">
              <span className="text-slate-400">
                Entry: {formatPrice(orderToast.price, activeAsset.decimalPlaces)}
              </span>
              <span className={isUp ? 'text-[#00e599] font-bold' : 'text-[#ff4d6b] font-bold'}>
                Return: ${totalReturn.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={clearOrderToast}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
