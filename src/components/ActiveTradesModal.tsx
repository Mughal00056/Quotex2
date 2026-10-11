import React from 'react';
import { useTrading } from '../context/TradingContext';
import { X, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';
import { formatPrice } from '../utils/chartMath';

interface ActiveTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory?: () => void;
}

export const ActiveTradesModal: React.FC<ActiveTradesModalProps> = ({
  isOpen,
  onClose,
  onOpenHistory
}) => {
  const { activeTrades, activeAsset } = useTrading();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Active Orders ({activeTrades.length})
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {activeTrades.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No active trades right now. Click Buy or Sell to open a position.
            </div>
          ) : (
            activeTrades.map((t) => {
              const remainingSec = Math.max(0, Math.ceil((t.closeTime - Date.now()) / 1000));
              const isUp = t.direction === 'UP';
              const isProfit =
                isUp
                  ? activeAsset.currentPrice > t.entryPrice
                  : activeAsset.currentPrice < t.entryPrice;

              return (
                <div
                  key={t.id}
                  className="bg-[#151c28] border border-[#232f42] rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                          isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isUp ? '▲ BUY' : '▼ SELL'} ${t.amount}
                      </span>
                      <span className="font-bold text-slate-200">{t.assetName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Strike: {formatPrice(t.entryPrice)} | Now: {formatPrice(activeAsset.currentPrice)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-cyan-400 font-mono-num font-bold">
                      ⏱ {remainingSec}s
                    </div>
                    <div
                      className={`text-xs font-bold font-mono-num ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? `+$${t.potentialProfit.toFixed(2)}` : `-$${t.amount}`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {onOpenHistory && (
          <div className="p-3 bg-[#0e141f] border-t border-[#1f2a3d] text-center">
            <button
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
            >
              View Full Trading History →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
