import React, { useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { X, TrendingUp, TrendingDown, Trophy } from 'lucide-react';

export const TradeResultPopup: React.FC = () => {
  const { lastClosedTrade, clearLastClosedTrade, showOrderToastEnabled } = useTrading();

  useEffect(() => {
    if (!lastClosedTrade) return;
    const timer = setTimeout(() => {
      clearLastClosedTrade();
    }, 7000);
    return () => clearTimeout(timer);
  }, [lastClosedTrade, clearLastClosedTrade]);

  if (!lastClosedTrade || !showOrderToastEnabled) return null;

  const isWon = lastClosedTrade.status === 'WON';
  const isTie = lastClosedTrade.status === 'TIE';
  const isSell = lastClosedTrade.direction === 'DOWN';

  // Total payout return
  const totalReturn = isWon
    ? Number((lastClosedTrade.amount + (lastClosedTrade.actualProfit || 0)).toFixed(2))
    : lastClosedTrade.amount;

  return (
    // Positioned directly ON THE TRADING CHART area (top-left of chart, completely removed from bottom!)
    <div className="absolute top-3.5 left-3 sm:left-4 z-30 animate-scaleUp select-none pointer-events-auto">
      <div className="relative">
        {/* Main Result Bubble Box */}
        <div
          className={`px-3.5 py-2.5 rounded-xl shadow-2xl text-white min-w-[185px] border ${
            isWon
              ? isSell
                ? 'bg-gradient-to-r from-[#ff3355] to-[#e11d48] border-rose-300 shadow-[0_10px_35px_rgba(255,51,85,0.65)]' // SELL WIN -> RED
                : 'bg-gradient-to-r from-[#00c874] to-[#00e599] text-slate-950 border-emerald-300 shadow-[0_10px_35px_rgba(0,200,116,0.65)]' // BUY WIN -> GREEN
              : isTie
              ? 'bg-[#f59e0b] border-amber-300 shadow-[0_8px_25px_rgba(245,158,11,0.4)]'
              : 'bg-[#1e1016] border-[#ff3355]/80 text-rose-300 shadow-[0_8px_25px_rgba(255,51,85,0.45)]' // LOSS
          }`}
        >
          {/* Top Row: RESULT (P/F) with SELL / BUY indicator and Close X button */}
          <div className="flex items-center justify-between text-[11px] font-black tracking-wider uppercase mb-1">
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>
                {isWon
                  ? isSell
                    ? 'RESULT (P/F) • SELL WON'
                    : 'RESULT (P/F) • BUY WON'
                  : isTie
                  ? 'RESULT (P/F) • REFUND'
                  : 'RESULT (P/F) • LOSS'}
              </span>
            </span>
            <button
              onClick={clearLastClosedTrade}
              className="p-0.5 rounded hover:bg-black/20 transition-colors ml-2 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Amount Row: e.g. +$2,655.00 */}
          <div className={`font-mono-num text-lg font-black tracking-tight ${
            isWon && !isSell ? 'text-slate-950' : 'text-white'
          }`}>
            {isWon
              ? `+$${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : isTie
              ? `$0.00`
              : `-$${lastClosedTrade.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>

          {/* Asset & Direction Note */}
          <div className={`text-[10px] font-bold mt-0.5 ${
            isWon && !isSell ? 'text-slate-900/80' : 'text-white/80'
          }`}>
            {lastClosedTrade.assetName} • {isSell ? '▼ SELL' : '▲ BUY'}
          </div>
        </div>

        {/* Pointer indicator */}
        <div
          className={`absolute left-6 -bottom-1.5 w-3 h-3 rotate-45 ${
            isWon
              ? isSell
                ? 'bg-[#ff3355]'
                : 'bg-[#00c874]'
              : isTie
              ? 'bg-[#f59e0b]'
              : 'bg-[#ff3355]'
          }`}
        />
      </div>
    </div>
  );
};
