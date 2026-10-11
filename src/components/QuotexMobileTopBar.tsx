import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  Bell,
  ChevronDown,
  RotateCcw,
  X,
  Menu,
  Crown,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Shuffle,
  Trash2,
  PenTool,
  Trophy,
  Send,
  Palette
} from 'lucide-react';
import { formatCurrency } from '../utils/chartMath';
import { CANDLE_COLOR_SCHEMES, CandleColorScheme } from '../types/trading';
import { PWAInstallButton } from './PWAInstallButton';

interface QuotexMobileTopBarProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenHistory: () => void;
  onOpenNotifications: () => void;
  onOpenLeaderboard?: () => void;
}

export const QuotexMobileTopBar: React.FC<QuotexMobileTopBarProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenNotifications,
  onOpenLeaderboard
}) => {
  const {
    accountType,
    setAccountType,
    demoBalance,
    realBalance,
    resetDemoBalance,
    setRealBalanceDirect,
    removeRealMoney,
    isVipPurpleLive,
    marketBehaviorMode,
    setMarketBehaviorMode,
    showChartButtons,
    setShowChartButtons,
    showOrderToastEnabled,
    setShowOrderToastEnabled,
    activeDrawingTool,
    setActiveDrawingTool,
    clearDrawnLines,
    drawnLines,
    traderName,
    setTraderName,
    traderFlag,
    setTraderFlag,
    customLeaderboardProfit,
    setCustomLeaderboardProfit,
    customLeaderboardRank,
    setCustomLeaderboardRank,
    candleColorScheme,
    setCandleColorScheme
  } = useTrading();

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [showThreeLineMenu, setShowThreeLineMenu] = useState(false);
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('');
  const [profitInput, setProfitInput] = useState<string>(
    customLeaderboardProfit !== null ? customLeaderboardProfit.toString() : '-5.21'
  );
  const [rankInput, setRankInput] = useState<string>(
    customLeaderboardRank !== null ? customLeaderboardRank.toString() : '37019'
  );

  const flags = ['🇵🇰', '🇮🇳', '🇦🇪', '🇸🇦', '🇧🇷', '🇺🇸', '🇬🇧', '🇪🇬', '🇮🇩', '🇹🇷'];

  return (
    <div className="flex flex-col z-30 select-none bg-[#0a0d14]">
      {/* 1. Header Row with 3-Line Menu + LIVE/DEMO Account Selector */}
      <div className="h-13 px-2.5 sm:px-3 flex items-center justify-between border-b border-[#18212f]">
        {/* Left Side: 3-Line Hamburger Menu + Account Selector */}
        <div className="flex items-center gap-2">
          {/* 3-Line Hamburger Menu Button next to LIVE ("meanu 3line ho live ka sath aus ma feature add karo") */}
          <button
            onClick={() => setShowThreeLineMenu(true)}
            className="w-9 h-9 rounded-xl bg-[#141b27] hover:bg-[#1b2435] border border-[#232f44] flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Trading Control Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Account Selector Pill (No money emoji on LIVE; Purple + Crown when >= $100,000) */}
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all cursor-pointer border ${
                accountType === 'REAL' && isVipPurpleLive
                  ? 'bg-[#1b122c] hover:bg-[#231739] border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-[#141b27] hover:bg-[#1a2333] border-[#232f44]'
              }`}
            >
              {/* Icon: Crown when REAL >= $100,000, Paper plane when REAL < $100,000 (NO money emoji!), Graduation cap when DEMO */}
              {accountType === 'REAL' ? (
                isVipPurpleLive ? (
                  <Crown className="w-4 h-4 text-purple-400 fill-purple-400 shrink-0 drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-[#00e599] -rotate-12 shrink-0" />
                )
              ) : (
                <span className="text-xs sm:text-sm">🎓</span>
              )}

              <span
                className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${
                  accountType === 'REAL'
                    ? isVipPurpleLive
                      ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]'
                      : 'text-[#00e599]'
                    : 'text-amber-400'
                }`}
              >
                {accountType === 'REAL' ? 'LIVE' : 'DEMO'}
              </span>

              <span className="text-xs sm:text-sm font-bold font-mono-num text-white">
                {accountType === 'REAL'
                  ? formatCurrency(realBalance)
                  : formatCurrency(demoBalance)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Account Dropdown */}
            {showAccountDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/30"
                  onClick={() => setShowAccountDropdown(false)}
                />
                <div className="absolute left-0 mt-2 w-72 bg-[#141b26] border border-[#273245] rounded-xl shadow-2xl p-3 z-50 animate-scaleUp">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-2 flex items-center justify-between">
                    <span>Switch Trading Account</span>
                    {isVipPurpleLive && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                        <Crown className="w-3 h-3 text-purple-400 fill-purple-400" />
                        VIP STATUS
                      </span>
                    )}
                  </div>

                  {/* Demo Account */}
                  <div
                    onClick={() => {
                      setAccountType('DEMO');
                      setShowAccountDropdown(false);
                    }}
                    className={`p-2.5 rounded-lg border mb-2 cursor-pointer transition-colors ${
                      accountType === 'DEMO'
                        ? 'bg-[#1b263b] border-cyan-500 text-white'
                        : 'bg-[#151c2a] border-[#222e42] text-slate-300 hover:bg-[#1b2536]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">🎓 Demo Account</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetDemoBalance();
                        }}
                        className="p-1 rounded hover:bg-[#283850] text-slate-400 hover:text-cyan-300"
                        title="Reset to $10,000"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-base font-extrabold font-mono-num text-white mt-1">
                      {formatCurrency(demoBalance)}
                    </div>
                  </div>

                  {/* Live Account (No money icon; Purple + Crown when >= $100,000) */}
                  <div
                    onClick={() => {
                      setAccountType('REAL');
                      setShowAccountDropdown(false);
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      accountType === 'REAL'
                        ? isVipPurpleLive
                          ? 'bg-[#211538] border-purple-500 text-white'
                          : 'bg-[#1b263b] border-emerald-500 text-white'
                        : 'bg-[#151c2a] border-[#222e42] text-slate-300 hover:bg-[#1b2536]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold flex items-center gap-1.5 ${
                          isVipPurpleLive ? 'text-purple-400' : 'text-emerald-400'
                        }`}
                      >
                        {isVipPurpleLive ? (
                          <Crown className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                        ) : (
                          <Send className="w-3 h-3 text-emerald-400 -rotate-12" />
                        )}
                        <span>Live Account</span>
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider flex items-center gap-1 ${
                          isVipPurpleLive
                            ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {isVipPurpleLive && <Crown className="w-2.5 h-2.5 fill-current" />}
                        LIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-base font-extrabold font-mono-num text-white">
                        {formatCurrency(realBalance)}
                      </div>
                      {realBalance > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRealMoney();
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold"
                          title="Remove Live Money ($0.00)"
                        >
                          Remove $
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#222c3d] flex gap-2">
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onOpenDeposit();
                      }}
                      className="flex-1 py-1.5 bg-[#00e599] hover:bg-[#00d084] rounded-lg text-xs font-black text-slate-950 transition-colors cursor-pointer"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onOpenWithdraw();
                      }}
                      className="flex-1 py-1.5 bg-[#1f2838] hover:bg-[#28354a] rounded-lg text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right side: PWA Install + Bell icon with badge + Deposit button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <PWAInstallButton compact />

          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-lg bg-[#141b27] border border-[#232f44] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              1
            </span>
          </button>

          <button
            onClick={onOpenDeposit}
            className="px-4 py-1.5 rounded-lg bg-[#00e599] hover:bg-[#00f7a5] active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_2px_12px_rgba(0,229,153,0.35)] transition-all cursor-pointer"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* 2. Promo Banner */}
      {showPromoBanner && (
        <div className="bg-[#00c874] text-slate-950 px-3 py-1.5 flex items-center justify-between text-xs font-bold shadow-sm animate-fadeIn">
          <div
            onClick={onOpenDeposit}
            className="flex items-center gap-2 cursor-pointer flex-1"
          >
            <span className="text-base">🚀</span>
            <span className="text-[11px] sm:text-xs">
              Get a 50% bonus on your deposit!
            </span>
            <span className="bg-[#009e5b] text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              50%
            </span>
          </div>

          <button
            onClick={() => setShowPromoBanner(false)}
            className="p-1 text-slate-900 hover:text-black transition-colors cursor-pointer"
            title="Close Banner"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* 3. 3-LINE CONTROL MENU DRAWER (Next to LIVE) */}
      {showThreeLineMenu && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setShowThreeLineMenu(false)}
          />
          <div className="relative w-80 max-w-[88vw] h-full bg-[#0e131d] border-r border-[#1f2b3e] shadow-2xl flex flex-col z-10 overflow-hidden">
            {/* Drawer Header */}
            <div className="px-4 py-3.5 bg-[#131a28] border-b border-[#1f2a3c] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">Quotex Control Menu</div>
                  <div className="text-[10px] text-slate-400">Trade Mode, Live VIP & UI Controls</div>
                </div>
              </div>
              <button
                onClick={() => setShowThreeLineMenu(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c2638] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* SECTION 1: Trade Outcome Mode (Win / Force Lose / Real Trading Mix) */}
              <div className="bg-[#141c2b] border border-[#223049] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Trade Result Mode
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-300">
                    {marketBehaviorMode === 'force_loss'
                      ? 'LOSE ON'
                      : marketBehaviorMode === 'realistic'
                      ? 'REAL MIX'
                      : 'WIN ON'}
                  </span>
                </div>

                {/* Quick Force Lose Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#191219] border border-rose-500/30">
                  <div>
                    <div className="font-bold text-rose-300 text-xs">Force Lose Mode (Loss ON)</div>
                    <div className="text-[10px] text-slate-400">Jab ON karein to trade lose hogi</div>
                  </div>
                  <button
                    onClick={() =>
                      setMarketBehaviorMode(
                        marketBehaviorMode === 'force_loss' ? 'smart_push' : 'force_loss'
                      )
                    }
                    className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                      marketBehaviorMode === 'force_loss'
                        ? 'bg-rose-500 justify-end'
                        : 'bg-[#253146] justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* 3 Mode Buttons: Smart Win, Force Lose, Real Trading (Win & Lose) */}
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  <button
                    onClick={() => setMarketBehaviorMode('smart_push')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      marketBehaviorMode === 'smart_push'
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                        : 'bg-[#101723] border-[#1f2c40] text-slate-300 hover:bg-[#162030]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-xs">Always Win Mode</div>
                        <div className="text-[10px] text-slate-400">Candle follows your Buy/Sell trade</div>
                      </div>
                    </div>
                    {marketBehaviorMode === 'smart_push' && (
                      <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                        ON
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setMarketBehaviorMode('force_loss')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      marketBehaviorMode === 'force_loss'
                        ? 'bg-rose-950/50 border-rose-500 text-rose-300'
                        : 'bg-[#101723] border-[#1f2c40] text-slate-300 hover:bg-[#162030]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-bold text-xs">Force Lose Mode</div>
                        <div className="text-[10px] text-slate-400">Candle goes opposite (Trade Lose)</div>
                      </div>
                    </div>
                    {marketBehaviorMode === 'force_loss' && (
                      <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded">
                        ON
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setMarketBehaviorMode('realistic')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      marketBehaviorMode === 'realistic'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-300'
                        : 'bg-[#101723] border-[#1f2c40] text-slate-300 hover:bg-[#162030]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shuffle className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-xs">Real Trading (Win & Lose)</div>
                        <div className="text-[10px] text-slate-400">Real market mix — Lose bhi aur Win bhi</div>
                      </div>
                    </div>
                    {marketBehaviorMode === 'realistic' && (
                      <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                        ON
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 2: Hide / Show Chart Floating Buttons */}
              <div className="bg-[#141c2b] border border-[#223049] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showChartButtons ? (
                      <Eye className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <div className="font-bold text-white text-xs">Chart Floating Buttons</div>
                      <div className="text-[10px] text-slate-400">Hide or Show left & right chart buttons</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChartButtons(!showChartButtons)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      showChartButtons
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[#222e42] text-slate-300'
                    }`}
                  >
                    {showChartButtons ? 'Shown' : 'Hidden'}
                  </button>
                </div>

                {/* Order Placement Notification Toggle (Default OFF) */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1e2a3d]">
                  <div>
                    <div className="font-bold text-slate-200 text-xs">Trade Order Notification</div>
                    <div className="text-[10px] text-slate-400">Popup toast when placing trade (Default OFF)</div>
                  </div>
                  <button
                    onClick={() => setShowOrderToastEnabled(!showOrderToastEnabled)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      showOrderToastEnabled
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-[#222e42] text-slate-400'
                    }`}
                  >
                    {showOrderToastEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* SECTION 3: Pen Tool Quick Launch */}
              <div className="bg-[#141c2b] border border-[#223049] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-white text-xs">Pen Tool (Draw Custom Line)</div>
                      <div className="text-[10px] text-slate-400">Draw lines yourself directly on chart</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveDrawingTool(activeDrawingTool === 'none' ? 'trendline' : 'none');
                      setShowThreeLineMenu(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    Draw Line
                  </button>
                </div>
                {drawnLines.length > 0 && (
                  <button
                    onClick={clearDrawnLines}
                    className="w-full py-1.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Drawn Lines ({drawnLines.length})</span>
                  </button>
                )}
              </div>

              {/* SECTION 3.5: Candle Color Scheme Quick Selector */}
              <div className="bg-[#141c2b] border border-[#223049] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Candle Color Scheme</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {(Object.keys(CANDLE_COLOR_SCHEMES) as CandleColorScheme[]).map((schemeKey) => {
                    const palette = CANDLE_COLOR_SCHEMES[schemeKey];
                    const active = candleColorScheme === schemeKey;
                    return (
                      <button
                        key={schemeKey}
                        onClick={() => setCandleColorScheme(schemeKey)}
                        className={`px-2.5 py-2 rounded-lg border flex items-center justify-between text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#1a263b] border-cyan-400 text-white'
                            : 'bg-[#0d121c] border-[#1f2c40] text-slate-300 hover:bg-[#151e2e]'
                        }`}
                      >
                        <span className="font-bold text-[11px]">{palette.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-xs inline-block"
                            style={{ backgroundColor: palette.bullish }}
                          />
                          <span
                            className="w-3 h-3 rounded-xs inline-block"
                            style={{ backgroundColor: palette.bearish }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3.8: Offline Mode & PWA App Install */}
              <PWAInstallButton />

              {/* SECTION 4: Live Account Money & $100,000+ Purple Crown VIP */}
              <div className="bg-[#141c2b] border border-[#223049] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span>Live Balance & VIP Crown</span>
                  </span>
                  <span className="font-mono-num font-bold text-white">
                    {formatCurrency(realBalance)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Cross $100,000 in LIVE to activate Purple LIVE + Crown icon.
                </p>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      removeRealMoney();
                      setAccountType('REAL');
                    }}
                    className="py-2 px-2.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-[11px] cursor-pointer"
                  >
                    Remove Money ($0)
                  </button>
                  <button
                    onClick={() => {
                      setRealBalanceDirect(105000);
                      setAccountType('REAL');
                    }}
                    className="py-2 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/50 text-purple-300 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                    <span>Set $105,000 VIP</span>
                  </button>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <input
                    type="number"
                    placeholder="Enter custom Live $"
                    value={customBalanceInput}
                    onChange={(e) => setCustomBalanceInput(e.target.value)}
                    className="flex-1 bg-[#0d121c] border border-[#25334a] rounded-lg px-2.5 py-1.5 text-white font-mono-num text-xs outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => {
                      const val = parseFloat(customBalanceInput);
                      if (!isNaN(val) && val >= 0) {
                        setRealBalanceDirect(val);
                        setAccountType('REAL');
                        setCustomBalanceInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    Set $
                  </button>
                </div>
              </div>

              {/* SECTION 5: Leaderboard Trader Name & Position Setup */}
              <div className="bg-[#141c2b] border border-[#223049] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Leaderboard Profile</span>
                  </span>
                  {onOpenLeaderboard && (
                    <button
                      onClick={() => {
                        setShowThreeLineMenu(false);
                        onOpenLeaderboard();
                      }}
                      className="text-[10px] text-cyan-400 hover:underline font-bold cursor-pointer"
                    >
                      Open Board →
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Your Trader Name:</label>
                  <input
                    type="text"
                    value={traderName}
                    onChange={(e) => setTraderName(e.target.value)}
                    placeholder="YA TRADER"
                    className="w-full bg-[#0d121c] border border-[#25334a] rounded-lg px-2.5 py-1.5 text-white font-bold text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Country Flag:</label>
                  <div className="flex flex-wrap gap-1">
                    {flags.map((flg) => (
                      <button
                        key={flg}
                        onClick={() => setTraderFlag(flg)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border cursor-pointer ${
                          traderFlag === flg
                            ? 'bg-cyan-500/20 border-cyan-400'
                            : 'bg-[#0d121c] border-[#223049]'
                        }`}
                      >
                        {flg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Your Profit ($):</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={profitInput}
                        onChange={(e) => {
                          setProfitInput(e.target.value);
                          const parsed = parseFloat(e.target.value);
                          if (!isNaN(parsed)) {
                            setCustomLeaderboardProfit(parsed);
                          } else {
                            setCustomLeaderboardProfit(null);
                          }
                        }}
                        className="w-full bg-[#0d121c] border border-[#25334a] rounded-lg px-2 py-1 text-white font-mono-num text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Your Position:</label>
                    <input
                      type="number"
                      value={rankInput}
                      onChange={(e) => {
                        setRankInput(e.target.value);
                        const parsed = parseInt(e.target.value, 10);
                        if (!isNaN(parsed) && parsed > 0) {
                          setCustomLeaderboardRank(parsed);
                        } else {
                          setCustomLeaderboardRank(null);
                        }
                      }}
                      className="w-full bg-[#0d121c] border border-[#25334a] rounded-lg px-2 py-1 text-white font-mono-num text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#111723] border-t border-[#1f2a3c]">
              <button
                onClick={() => setShowThreeLineMenu(false)}
                className="w-full py-2.5 rounded-xl bg-[#00e599] hover:bg-[#00d084] text-slate-950 font-black text-xs cursor-pointer"
              >
                Done & Return to Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
