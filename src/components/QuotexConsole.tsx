import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  Minus,
  Plus,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface QuotexConsoleProps {
  onOpenAssetModal: () => void;
}

export const QuotexConsole: React.FC<QuotexConsoleProps> = ({ onOpenAssetModal }) => {
  const {
    activeAsset,
    accountType,
    demoBalance,
    realBalance,
    placeTrade
  } = useTrading();

  // Investment state directly editable by user
  const [investmentAmount, setInvestmentAmount] = useState<number>(1500);
  const [investmentInputStr, setInvestmentInputStr] = useState<string>('1500');
  const [durationSeconds, setDurationSeconds] = useState<number>(5); // 00:00:05 default matching screenshot!
  const [showTimerPicker, setShowTimerPicker] = useState<boolean>(false);
  const [pendingTrade, setPendingTrade] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentBalance = accountType === 'DEMO' ? demoBalance : realBalance;
  const payoutRate = activeAsset.payout;
  // Total payout return: investment + profit (e.g. 1500 + 1500 * 0.77 = 2655 $ or 1500 * (1 + payoutRate/100))
  const totalPayout = Number((investmentAmount + (investmentAmount * payoutRate) / 100).toFixed(0));

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerOptions = [
    { label: '00:00:05', seconds: 5 },
    { label: '00:00:15', seconds: 15 },
    { label: '00:00:30', seconds: 30 },
    { label: '00:01:00', seconds: 60 },
    { label: '00:02:00', seconds: 120 },
    { label: '00:05:00', seconds: 300 }
  ];

  // Direct editing of money amount
  const handleInvestmentNumberChange = (val: number) => {
    setErrorMessage(null);
    const clamped = Math.max(1, Math.min(100000, val));
    setInvestmentAmount(clamped);
    setInvestmentInputStr(clamped.toString());
  };

  const handleInvestmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setInvestmentInputStr(rawVal);
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setInvestmentAmount(Math.min(100000, parsed));
    } else if (rawVal === '') {
      setInvestmentAmount(0);
    }
  };

  const handleInvestmentBlur = () => {
    if (investmentAmount <= 0) {
      setInvestmentAmount(50);
      setInvestmentInputStr('50');
    } else {
      setInvestmentInputStr(investmentAmount.toString());
    }
  };

  const handleTrade = (direction: 'UP' | 'DOWN') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(40); } catch {}
    }

    if (investmentAmount <= 0) {
      setErrorMessage('Please enter an investment amount');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (investmentAmount > currentBalance) {
      setErrorMessage(`Insufficient balance ($${currentBalance.toFixed(2)})`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setErrorMessage(null);
    placeTrade(direction, investmentAmount, durationSeconds);
  };

  const cycleInvestmentSwitch = () => {
    const presets = [500, 1000, 1500, 2000, 2500, 50, 100];
    const currentIndex = presets.indexOf(investmentAmount);
    const nextIndex = (currentIndex + 1) % presets.length;
    handleInvestmentNumberChange(presets[nextIndex]);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch {}
    }
  };

  return (
    <div className="bg-[#0b0e14] border-t border-[#1a2230] px-3.5 pt-2 pb-2 select-none relative">
      {/* Error alert toast if balance is insufficient */}
      {errorMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 bg-rose-900 border border-rose-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xl animate-shake">
          <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Row 1: Asset Selector & Pending Trade Toggle */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onOpenAssetModal}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {/* Circular flag badges */}
          <div className="flex items-center -space-x-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-[10px] font-bold border border-[#1b2230] shadow-sm">
              🇪🇺
            </span>
            <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold border border-[#1b2230] shadow-sm">
              🇨🇭
            </span>
          </div>

          <span className="font-extrabold text-sm text-white tracking-wide">
            {activeAsset.symbol} ...
          </span>

          <div className="flex items-center gap-0.5 text-amber-400 font-extrabold text-sm font-mono-num">
            <span>{payoutRate}%</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
          </div>
        </button>

        {/* Right: Pending Trade Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase">
            PENDING TRADE
          </span>
          <button
            onClick={() => setPendingTrade(!pendingTrade)}
            className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
              pendingTrade ? 'bg-[#0284c7] justify-end' : 'bg-[#1e2634] justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>
      </div>

      {/* Row 2: Two Side-by-Side Input Boxes: Timer and Editable Investment */}
      <div className="grid grid-cols-2 gap-2.5 mb-2 relative">
        {/* Box 1: Timer Picker */}
        <div className="relative">
          <button
            onClick={() => setShowTimerPicker(!showTimerPicker)}
            className="w-full bg-[#0d1118] border border-[#273244] hover:border-[#384760] rounded-xl px-3 py-2.5 text-left transition-colors relative cursor-pointer"
          >
            <span className="absolute -top-2 left-3 bg-[#0b0e14] px-1 text-[10px] font-bold text-slate-400 tracking-wider">
              Timer
            </span>
            <span className="font-mono-num text-sm sm:text-base font-bold text-white tracking-wider block text-center sm:text-left">
              {formatTimerDisplay(durationSeconds)}
            </span>
          </button>

          {/* Timer Dropdown menu */}
          {showTimerPicker && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowTimerPicker(false)}
              />
              <div className="absolute bottom-full left-0 mb-1.5 w-full bg-[#141b26] border border-[#263246] rounded-xl shadow-2xl p-2.5 z-40">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#212c3f]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Select Expiration
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDurationSeconds((s) => Math.max(5, s - 5))}
                      className="px-1.5 py-0.5 rounded bg-[#1e273a] text-slate-300 text-[10px] font-bold hover:bg-[#28354e]"
                    >
                      -5s
                    </button>
                    <button
                      onClick={() => setDurationSeconds((s) => s + 5)}
                      className="px-1.5 py-0.5 rounded bg-[#1e273a] text-slate-300 text-[10px] font-bold hover:bg-[#28354e]"
                    >
                      +5s
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {timerOptions.map((opt) => (
                    <button
                      key={opt.seconds}
                      onClick={() => {
                        setDurationSeconds(opt.seconds);
                        setShowTimerPicker(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        durationSeconds === opt.seconds
                          ? 'bg-[#0284c7] text-white font-bold'
                          : 'bg-[#192230] text-slate-300 hover:bg-[#202b3d]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Box 2: Investment Directly Editable with Input Field and - / + */}
        <div className="bg-[#0d1118] border border-[#273244] hover:border-[#384760] rounded-xl px-2 py-1.5 relative flex flex-col justify-between">
          <span className="absolute -top-2 left-3 bg-[#0b0e14] px-1 text-[10px] font-bold text-slate-400 tracking-wider">
            Investment
          </span>

          <div className="flex items-center justify-between mt-0.5">
            <button
              onClick={() => handleInvestmentNumberChange(investmentAmount - 100)}
              className="w-6 h-6 rounded-md bg-[#18202d] hover:bg-[#222c3d] text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Minus $100"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Editable Input for Money */}
            <div className="flex items-center justify-center font-mono-num font-bold text-sm sm:text-base text-white tracking-wide">
              <input
                type="text"
                inputMode="numeric"
                value={investmentInputStr}
                onChange={handleInvestmentInputChange}
                onBlur={handleInvestmentBlur}
                className="w-16 sm:w-20 bg-transparent text-center font-bold text-white outline-none border-b border-transparent focus:border-cyan-400 py-0.5"
                placeholder="1500"
              />
              <span className="text-slate-200 ml-0.5">$</span>
            </div>

            <button
              onClick={() => handleInvestmentNumberChange(investmentAmount + 100)}
              className="w-6 h-6 rounded-md bg-[#18202d] hover:bg-[#222c3d] text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Plus $100"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          <div className="text-center -mt-0.5">
            <button
              onClick={cycleInvestmentSwitch}
              className="text-[10px] font-bold text-[#0284c7] hover:underline uppercase tracking-wider py-0.5 cursor-pointer active:opacity-75"
              title="Cycle Presets"
            >
              SWITCH
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Payout preview with dotted leader line */}
      <div className="flex items-center justify-between text-xs mb-2.5 px-1 font-mono-num">
        <span className="text-slate-400 font-medium">Payout</span>
        <div className="flex-1 mx-2 border-b border-dotted border-slate-700/80"></div>
        <span className="font-bold text-white text-sm tracking-wide">
          {totalPayout.toLocaleString()} $
        </span>
      </div>

      {/* Row 4: Two Action Buttons (Buy & Sell) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Buy (Green Button) */}
        <button
          onClick={() => handleTrade('UP')}
          className="w-full bg-[#00e599] hover:bg-[#00f7a5] active:scale-[0.98] transition-all rounded-xl py-3.5 px-4 text-slate-950 font-black text-base flex items-center justify-between shadow-[0_4px_16px_rgba(0,229,153,0.3)] cursor-pointer"
        >
          <span className="tracking-wide">Buy</span>
          <ArrowUp className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Sell (Red Button) */}
        <button
          onClick={() => handleTrade('DOWN')}
          className="w-full bg-[#ff3355] hover:bg-[#ff4d6b] active:scale-[0.98] transition-all rounded-xl py-3.5 px-4 text-white font-black text-base flex items-center justify-between shadow-[0_4px_16px_rgba(255,51,85,0.3)] cursor-pointer"
        >
          <span className="tracking-wide">Sell</span>
          <ArrowDown className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
