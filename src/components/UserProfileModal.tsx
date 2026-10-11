import React from 'react';
import { useTrading } from '../context/TradingContext';
import { FoxLogo } from './FoxLogo';
import {
  X,
  User,
  ShieldCheck,
  CreditCard,
  History,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { formatCurrency } from '../utils/chartMath';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenHistory: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenHistory
}) => {
  const {
    accountType,
    demoBalance,
    realBalance,
    resetDemoBalance,
    tradeHistory
  } = useTrading();

  if (!isOpen) return null;

  const totalTrades = tradeHistory.length;
  const wonTrades = tradeHistory.filter((t) => t.status === 'WON').length;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Trader Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* User badge */}
          <div className="flex items-center gap-3 bg-[#151c28] p-3 rounded-xl border border-[#222e40]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-600/30 border border-orange-500/40 flex items-center justify-center shadow-md">
              <FoxLogo size={32} glow={true} />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>Trade Fox Trader #984210</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-[11px] text-orange-400 font-bold">Verified Trade Fox Member</div>
            </div>
          </div>

          {/* Balances */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-[#131924] rounded-xl border border-[#1e2738]">
              <div className="text-[10px] text-slate-400">Live Account</div>
              <div className="text-base font-extrabold text-amber-400 font-mono-num mt-0.5">
                {formatCurrency(realBalance)}
              </div>
            </div>
            <div className="p-3 bg-[#131924] rounded-xl border border-[#1e2738]">
              <div className="text-[10px] text-slate-400">Demo Account</div>
              <div className="text-base font-extrabold text-cyan-400 font-mono-num mt-0.5">
                {formatCurrency(demoBalance)}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#131924] p-3 rounded-xl border border-[#1e2738] space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Total Orders Placed:</span>
              <span className="text-white font-bold">{totalTrades}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Win Rate Ratio:</span>
              <span className="text-emerald-400 font-bold">{winRate}%</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenDeposit();
              }}
              className="w-full py-2.5 bg-[#00e599] hover:bg-[#00d084] text-slate-950 font-black rounded-xl text-xs transition-colors"
            >
              Deposit Funds
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenWithdraw();
              }}
              className="w-full py-2.5 bg-[#192230] hover:bg-[#202b3d] text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              Withdraw Funds
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
              className="w-full py-2 bg-[#141b27] hover:bg-[#1c2436] text-cyan-400 font-bold rounded-xl text-xs transition-colors"
            >
              Trading & Cashier History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
