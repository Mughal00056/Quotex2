import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign,
  Plus,
  Minus,
  TrendingUp,
  History,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatPrice } from '../utils/chartMath';

interface TradingSidebarProps {
  onOpenHistory?: () => void;
}

export const TradingSidebar: React.FC<TradingSidebarProps> = ({ onOpenHistory }) => {
  const {
    activeAsset,
    accountType,
    demoBalance,
    realBalance,
    placeTrade,
    activeTrades,
    tradeHistory
  } = useTrading();

  const [investmentAmount, setInvestmentAmount] = useState<number>(50);
  const [durationSeconds, setDurationSeconds] = useState<number>(30); // 30s default
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentBalance = accountType === 'DEMO' ? demoBalance : realBalance;
  const payoutRate = activeAsset.payout;
  const projectedProfit = Number(((investmentAmount * payoutRate) / 100).toFixed(2));
  const totalPayout = Number((investmentAmount + projectedProfit).toFixed(2));

  const durationOptions = [
    { label: '5s', seconds: 5 },
    { label: '15s', seconds: 15 },
    { label: '30s', seconds: 30 },
    { label: '1m', seconds: 60 },
    { label: '2m', seconds: 120 },
    { label: '5m', seconds: 300 }
  ];

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountChange = (val: number) => {
    setErrorMessage(null);
    setInvestmentAmount(Math.max(1, Math.min(100000, val)));
  };

  const handleTrade = (direction: 'UP' | 'DOWN') => {
    if (investmentAmount > currentBalance) {
      setErrorMessage(`Insufficient ${accountType.toLowerCase()} balance ($${currentBalance.toFixed(2)})`);
      return;
    }
    setErrorMessage(null);
    const success = placeTrade(direction, investmentAmount, durationSeconds);
    if (!success) {
      setErrorMessage('Failed to place trade. Check your balance.');
    }
  };

  return (
    <div className="w-80 h-full bg-[#111622] border-l border-[#1d2636] flex flex-col justify-between overflow-y-auto">
      {/* Top Controls Area */}
      <div className="p-4 space-y-4">
        {/* Error notification if any */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Time / Expiration Duration Picker */}
        <div className="bg-[#171f2e] border border-[#232f44] rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time Expiration</span>
            </div>
            <span className="font-mono-num text-cyan-300 font-semibold">{durationSeconds}s</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            {durationOptions.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => setDurationSeconds(opt.seconds)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  durationSeconds === opt.seconds
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-[#1e273a] text-slate-300 hover:bg-[#28344c] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#232f44]">
            <button
              onClick={() => setDurationSeconds((s) => Math.max(5, s - 5))}
              className="p-1 rounded bg-[#202b3d] hover:bg-[#2a384f] text-slate-300 transition-colors"
              title="Minus 5s"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-400">Duration: {durationSeconds} seconds</span>
            <button
              onClick={() => setDurationSeconds((s) => s + 5)}
              className="p-1 rounded bg-[#202b3d] hover:bg-[#2a384f] text-slate-300 transition-colors"
              title="Plus 5s"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Investment Amount Box */}
        <div className="bg-[#171f2e] border border-[#232f44] rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Investment Amount</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Avail: <strong className="text-slate-200">${currentBalance.toFixed(2)}</strong>
            </span>
          </div>

          {/* Stepper Input */}
          <div className="flex items-center bg-[#101520] border border-[#26334a] rounded-xl px-2 py-1.5 mb-2.5">
            <button
              onClick={() => handleAmountChange(investmentAmount - 10)}
              className="p-1.5 rounded-lg bg-[#1a2333] hover:bg-[#243147] text-slate-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center justify-center font-mono-num text-lg font-bold text-white px-2">
              <span className="text-slate-400 mr-1">$</span>
              <input
                type="number"
                min="1"
                max={currentBalance || 100000}
                value={investmentAmount}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                className="w-24 text-center bg-transparent outline-none font-bold text-white text-lg"
              />
            </div>

            <button
              onClick={() => handleAmountChange(investmentAmount + 10)}
              className="p-1.5 rounded-lg bg-[#1a2333] hover:bg-[#243147] text-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Amount Pills */}
          <div className="grid grid-cols-3 gap-1.5">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleAmountChange(amt)}
                className={`py-1 rounded-md text-[11px] font-semibold transition-all ${
                  investmentAmount === amt
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#1b2333] text-slate-300 hover:bg-[#222d42]'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Payout Rate & Profit Calculation Box */}
        <div className="bg-gradient-to-r from-[#14231e] to-[#121a28] border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-medium">Payout Rate</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono-num">
              +{payoutRate}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 uppercase font-medium">Profit Return</div>
            <div className="text-base font-bold text-emerald-300 font-mono-num">
              +{formatCurrency(projectedProfit)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono-num">
              Total: {formatCurrency(totalPayout)}
            </div>
          </div>
        </div>

        {/* 4. Large Action Buttons: UP (Call) & DOWN (Put) */}
        <div className="space-y-3 pt-1">
          {/* UP Button (Green) */}
          <button
            onClick={() => handleTrade('UP')}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#00d084] to-[#00f2a0] hover:from-[#00df8e] hover:to-[#17ffad] active:scale-[0.98] transition-all duration-150 rounded-xl p-3.5 text-slate-950 font-black flex items-center justify-between shadow-[0_4px_20px_rgba(0,208,132,0.35)] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center">
                <ArrowUp className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-left">
                <div className="text-base font-black tracking-wide leading-tight">UP / CALL</div>
                <div className="text-[11px] font-bold text-slate-900/80">Higher than strike</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black font-mono-num">
                +${projectedProfit.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-slate-900/70">+{payoutRate}%</div>
            </div>
          </button>

          {/* DOWN Button (Red) */}
          <button
            onClick={() => handleTrade('DOWN')}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#e62e4d] to-[#ff4766] hover:from-[#f33454] hover:to-[#ff5c78] active:scale-[0.98] transition-all duration-150 rounded-xl p-3.5 text-white font-black flex items-center justify-between shadow-[0_4px_20px_rgba(230,46,77,0.35)] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center">
                <ArrowDown className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-left">
                <div className="text-base font-black tracking-wide leading-tight">DOWN / PUT</div>
                <div className="text-[11px] font-bold text-white/80">Lower than strike</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black font-mono-num">
                +${projectedProfit.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-white/70">+{payoutRate}%</div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Area: Active Trades & Quick History */}
      <div className="border-t border-[#1d2636] bg-[#0e131d] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Orders ({activeTrades.length})</span>
          </div>
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <History className="w-3 h-3" />
              <span>History</span>
            </button>
          )}
        </div>

        {/* Active Trades list */}
        {activeTrades.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500 bg-[#121824] rounded-lg border border-[#1b2230]">
            No open trades. Click UP or DOWN to trade.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activeTrades.map((trade) => {
              const remainingMs = trade.closeTime - Date.now();
              const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
              const isUp = trade.direction === 'UP';
              const isProfitCurrently =
                isUp
                  ? activeAsset.currentPrice > trade.entryPrice
                  : activeAsset.currentPrice < trade.entryPrice;

              return (
                <div
                  key={trade.id}
                  className="bg-[#151c2a] border border-[#212c3f] rounded-lg p-2 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-black text-[11px] px-1.5 py-0.5 rounded ${
                          isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isUp ? '▲ UP' : '▼ DOWN'} ${trade.amount}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono-num">
                        Strike: {formatPrice(trade.entryPrice, activeAsset.decimalPlaces)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Now: {formatPrice(activeAsset.currentPrice, activeAsset.decimalPlaces)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono-num text-cyan-400 animate-pulse">
                      ⏱ {remainingSec}s
                    </div>
                    <div
                      className={`text-[10px] font-bold font-mono-num ${
                        isProfitCurrently ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfitCurrently ? `+$${trade.potentialProfit.toFixed(2)}` : `-$${trade.amount}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
