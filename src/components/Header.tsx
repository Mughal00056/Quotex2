import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  ChevronDown,
  RotateCcw,
  Plus,
  Zap,
  CreditCard,
  History,
  Wifi,
  WifiOff,
  Sparkles,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatPrice } from '../utils/chartMath';

interface HeaderProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenHistory: () => void;
  onOpenAssetModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenHistory,
  onOpenAssetModal
}) => {
  const {
    accountType,
    setAccountType,
    demoBalance,
    realBalance,
    resetDemoBalance,
    activeAsset,
    assets,
    setActiveAsset,
    isOnlineMode,
    setIsOnlineMode,
    marketBehaviorMode
  } = useTrading();

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Quick tabs for top popular assets
  const quickAssetTabs = assets.slice(0, 3);

  return (
    <header className="h-14 bg-[#0d121b] border-b border-[#1b2332] px-4 flex items-center justify-between select-none z-30">
      {/* Left: Logo & Asset Tabs */}
      <div className="flex items-center gap-3">
        {/* Quotex Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer pr-2 border-r border-[#1b2332]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00e599] to-[#00b4d8] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,153,0.35)]">
            <svg
              className="w-5 h-5 text-slate-950 font-black fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-base tracking-wider text-white">QUOTEX</span>
            <span className="text-[9px] block text-cyan-400 font-bold -mt-1 tracking-widest">
              PRO BROKER
            </span>
          </div>
        </div>

        {/* Asset Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[320px] md:max-w-none">
          {quickAssetTabs.map((asset) => {
            const isActive = activeAsset.id === asset.id;
            return (
              <button
                key={asset.id}
                onClick={() => setActiveAsset(asset)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#182333] border border-cyan-500/50 text-white shadow-sm'
                    : 'bg-[#121824] border border-[#1e2738] text-slate-400 hover:text-slate-200 hover:bg-[#182130]'
                }`}
              >
                <span>{asset.symbol}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-mono-num font-bold">
                  {asset.payout}%
                </span>
              </button>
            );
          })}

          {/* Plus button to open full asset list */}
          <button
            onClick={onOpenAssetModal}
            className="p-1.5 rounded-lg bg-[#141b27] border border-[#1f2838] text-slate-300 hover:text-white hover:bg-[#1f283a] transition-colors"
            title="All Markets & Pairs"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Offline/Online status badge */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          onClick={() => setIsOnlineMode(!isOnlineMode)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131a26] border border-[#212c3f] text-xs font-semibold text-slate-300 hover:border-cyan-500/40 transition-colors"
          title="Click to toggle offline/online simulation"
        >
          {isOnlineMode ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-300">Live Simulator</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <WifiOff className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] text-cyan-300">Offline Standalone</span>
            </>
          )}
        </button>

        {marketBehaviorMode === 'smart_push' && (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> UP/DOWN Follow Active
          </span>
        )}
      </div>

      {/* Right: Balance Dropdown & Cashier Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Account Balance Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center gap-2 bg-[#141c2a] hover:bg-[#192336] border border-[#222f42] rounded-xl px-3 py-1.5 transition-colors"
          >
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    accountType === 'REAL' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                ></span>
                <span>{accountType === 'REAL' ? 'Live Account' : 'Demo Account'}</span>
              </div>
              <div className="text-xs sm:text-sm font-black font-mono-num text-white">
                {accountType === 'REAL'
                  ? formatCurrency(realBalance)
                  : formatCurrency(demoBalance)}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Balance Switcher Menu */}
          {showAccountDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-[#141b26] border border-[#263246] rounded-xl shadow-2xl p-3 z-50 animate-scaleUp">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">
                Select Active Account
              </div>

              {/* Demo Option */}
              <div
                onClick={() => {
                  setAccountType('DEMO');
                  setShowAccountDropdown(false);
                }}
                className={`p-2.5 rounded-lg border mb-2 cursor-pointer transition-colors ${
                  accountType === 'DEMO'
                    ? 'bg-[#1c2738] border-cyan-500 text-white'
                    : 'bg-[#161e2b] border-[#222e40] text-slate-300 hover:bg-[#1c2638]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">Demo Account</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetDemoBalance();
                    }}
                    className="p-1 rounded hover:bg-[#283850] text-slate-400 hover:text-cyan-300 transition-colors"
                    title="Reset Demo to $10,000"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-base font-extrabold font-mono-num text-white mt-1">
                  {formatCurrency(demoBalance)}
                </div>
              </div>

              {/* Real Option */}
              <div
                onClick={() => {
                  setAccountType('REAL');
                  setShowAccountDropdown(false);
                }}
                className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  accountType === 'REAL'
                    ? 'bg-[#1c2738] border-amber-500 text-white'
                    : 'bg-[#161e2b] border-[#222e40] text-slate-300 hover:bg-[#1c2638]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Live Account</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                    Real Funds
                  </span>
                </div>
                <div className="text-base font-extrabold font-mono-num text-white mt-1">
                  {formatCurrency(realBalance)}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#222c3d] flex gap-2">
                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    onOpenDeposit();
                  }}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-slate-950 transition-colors"
                >
                  Deposit
                </button>
                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    onOpenWithdraw();
                  }}
                  className="flex-1 py-1.5 bg-[#202b3d] hover:bg-[#2b3a50] rounded text-xs font-bold text-slate-200 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Deposit Button (Quotex Signature Vibrant Green) */}
        <button
          onClick={onOpenDeposit}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d084] to-[#00f2a0] hover:from-[#00df8e] hover:to-[#17ffad] active:scale-[0.98] text-slate-950 font-black text-xs shadow-[0_0_18px_rgba(0,208,132,0.3)] transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-slate-950" />
          <span className="hidden sm:inline">Deposit</span>
        </button>

        {/* Withdraw Button */}
        <button
          onClick={onOpenWithdraw}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#17202e] hover:bg-[#202c40] border border-[#243145] text-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
          <span>Withdraw</span>
        </button>

        {/* History Records Button */}
        <button
          onClick={onOpenHistory}
          className="p-2 rounded-xl bg-[#17202e] hover:bg-[#202c40] border border-[#243145] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="History & Records"
        >
          <History className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </header>
  );
};
