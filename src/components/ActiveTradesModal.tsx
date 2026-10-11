import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { X, Briefcase, Trash2, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatPrice } from '../utils/chartMath';

interface ActiveTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory?: () => void;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const ActiveTradesModal: React.FC<ActiveTradesModalProps> = ({
  isOpen,
  onClose,
  onOpenHistory
}) => {
  const {
    activeTrades,
    tradeHistory,
    activeAsset,
    assets,
    removeTradeFromHistory
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'trades' | 'orders'>('trades');
  const [, setTick] = useState(0);

  // Live 1-second refresh while drawer is open for smooth countdowns and 1-day expiry display
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter tradeHistory to strictly within 1 day (24 hours)
  const now = Date.now();
  const oneDayTrades = tradeHistory.filter((t) => (t.closeTime || t.openTime) >= now - ONE_DAY_MS);
  const totalTradesCount = activeTrades.length + oneDayTrades.length;

  const formatDateHeader = (timestamp: number) => {
    const d = new Date(timestamp);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTimeHMS = (timestamp: number) => {
    const d = new Date(timestamp);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatDurationStr = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAssetFlags = (assetName: string) => {
    const upper = assetName.toUpperCase();
    const flagMap: Record<string, string> = {
      EUR: '🇪🇺',
      USD: '🇺🇸',
      GBP: '🇬🇧',
      JPY: '🇯🇵',
      CHF: '🇨🇭',
      AUD: '🇦🇺',
      CAD: '🇨🇦',
      NZD: '🇳🇿',
      PKR: '🇵🇰',
      INR: '🇮🇳',
      BRL: '🇧🇷',
      TRY: '🇹🇷',
      BTC: '₿',
      ETH: 'Ξ'
    };
    const parts = upper.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(Boolean);
    const f1 = flagMap[parts[0]] || '🇪🇺';
    const f2 = flagMap[parts[1]] || '🇺🇸';
    return [f1, f2];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-[2px] select-none animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Bottom Sheet Drawer ("Jab hum bag par click kara tu nicha se asa kola") */}
      <div className="relative z-10 w-full max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl bg-[#131824] border-t border-[#242f46] rounded-t-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.75)] flex flex-col max-h-[72dvh] overflow-hidden">
        {/* Top Pull Handle Bar */}
        <div
          onClick={onClose}
          className="pt-2.5 pb-1 flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="w-10 h-1 rounded-full bg-slate-600/80" />
        </div>

        {/* Quotex Bottom Sheet Header Tabs: Trades | Orders | Close */}
        <div className="px-4 pt-1 pb-2.5 border-b border-[#1e273a] flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setActiveTab('trades')}
              className={`relative pb-1.5 text-sm font-extrabold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'trades'
                  ? 'text-white border-b-2 border-[#2596ff]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Trades</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#1e293b] text-[#38bdf8] text-[11px] font-mono-num font-bold">
                {totalTradesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`relative pb-1.5 text-sm font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'text-white border-b-2 border-[#2596ff]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Orders</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#1e293b] text-slate-400 text-[11px] font-mono-num font-bold">
                0
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 bg-[#1a2234] border border-[#26324a] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>1-Day Auto Reset</span>
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1b2335] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-3.5 overflow-y-auto flex-1 space-y-2.5">
          {activeTab === 'orders' ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
              <div>No pending orders right now.</div>
            </div>
          ) : totalTradesCount === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs space-y-1.5">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
              <div className="font-bold text-slate-300">Your trades list is empty</div>
              <div className="text-[11px] text-slate-500">
                Trades opened today stay here for 1 day (24h) and then automatically remove.
              </div>
            </div>
          ) : (
            <>
              {/* Today's Date Group Label */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-400 tracking-wide">
                  {formatDateHeader(now)}
                </span>
                <span className="text-[10px] text-slate-500">
                  Kept for 24h (1 Day)
                </span>
              </div>

              {/* 1. Active Running Trades */}
              {activeTrades.map((t) => {
                const remainingSec = Math.max(0, Math.ceil((t.closeTime - Date.now()) / 1000));
                const isUp = t.direction === 'UP';
                const assetObj = assets.find((a) => a.id === t.assetId) || activeAsset;
                const livePrice = assetObj.currentPrice;
                const isProfit = isUp ? livePrice > t.entryPrice : livePrice < t.entryPrice;
                const [flag1, flag2] = getAssetFlags(t.assetName);
                const totalReturnOnWin = Number((t.amount + t.potentialProfit).toFixed(2));

                return (
                  <div
                    key={t.id}
                    className="bg-[#192132] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-md"
                  >
                    {/* Left: Flags + Asset + Payout + Direction + Countdown */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        <span className="w-5 h-5 rounded-full bg-[#243048] border border-[#131824] flex items-center justify-center text-[11px]">
                          {flag1}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-[#243048] border border-[#131824] flex items-center justify-center text-[11px]">
                          {flag2}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate">
                            {t.assetName}
                          </span>
                          <span className="text-[11px] font-bold text-amber-400 font-mono-num">
                            {t.payoutRate}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                          <span
                            className={`flex items-center font-bold ${
                              isUp ? 'text-[#00c874]' : 'text-[#ff4766]'
                            }`}
                          >
                            {isUp ? (
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            )}
                          </span>
                          <span className="text-cyan-400 font-mono-num font-bold">
                            {formatDurationStr(remainingSec)}
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono-num">
                            @ {formatPrice(t.entryPrice, assetObj.decimalPlaces)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Live Potential Return & Investment */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs font-extrabold font-mono-num ${
                          isProfit ? 'text-[#00c874]' : 'text-slate-300'
                        }`}
                      >
                        {isProfit
                          ? `+${totalReturnOnWin.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} $`
                          : '0.00 $'}
                      </div>
                      <div className="text-[11px] font-mono-num text-slate-400 mt-0.5">
                        -{t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 2. Closed 1-Day Trades (Automatically removed after 24 hours) */}
              {oneDayTrades.map((t) => {
                const isUp = t.direction === 'UP';
                const isWon = t.status === 'WON';
                const isTie = t.status === 'TIE';
                const [flag1, flag2] = getAssetFlags(t.assetName);
                const totalReturn = isWon
                  ? Number((t.amount + (t.actualProfit || 0)).toFixed(2))
                  : isTie
                  ? t.amount
                  : 0;
                const hoursLeft = Math.max(
                  1,
                  Math.ceil((ONE_DAY_MS - (now - (t.closeTime || t.openTime))) / (60 * 60 * 1000))
                );

                return (
                  <div
                    key={t.id}
                    className="bg-[#181f2e] hover:bg-[#1c2436] border border-[#232d42] rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-colors"
                  >
                    {/* Left: Flags + Asset + Payout % + Time & Direction */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        <span className="w-5 h-5 rounded-full bg-[#243048] border border-[#131824] flex items-center justify-center text-[11px]">
                          {flag1}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-[#243048] border border-[#131824] flex items-center justify-center text-[11px]">
                          {flag2}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate">
                            {t.assetName}
                          </span>
                          <span className="text-[11px] font-bold text-amber-400 font-mono-num">
                            {t.payoutRate}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                          <span
                            className={`flex items-center font-bold ${
                              isUp ? 'text-[#00c874]' : 'text-[#ff4766]'
                            }`}
                          >
                            {isUp ? (
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            )}
                          </span>
                          <span className="font-mono-num">
                            {formatTimeHMS(t.closeTime || t.openTime)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            • {hoursLeft}h left
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Payout Return + Investment + Remove Button */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-xs font-extrabold font-mono-num ${
                            isWon
                              ? 'text-[#00c874]'
                              : isTie
                              ? 'text-slate-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {isWon
                            ? `+${totalReturn.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} $`
                            : '0.00 $'}
                        </div>
                        <div className="text-[11px] font-mono-num text-slate-400 mt-0.5">
                          -{t.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} $
                        </div>
                      </div>

                      <button
                        onClick={() => removeTradeFromHistory(t.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-[#232d42] transition-colors cursor-pointer"
                        title="Remove trade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        {onOpenHistory && (
          <div className="px-4 py-2.5 bg-[#0f141f] border-t border-[#1e273a] flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              Trades auto-expire after 24 hours (1 day)
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
              className="text-xs text-[#2596ff] hover:text-cyan-300 font-bold cursor-pointer"
            >
              Full History →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
