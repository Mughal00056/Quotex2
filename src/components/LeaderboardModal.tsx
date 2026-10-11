import React, { useState } from 'react';
import { ChevronLeft, Edit3, Check } from 'lucide-react';
import { useTrading } from '../context/TradingContext';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  name: string;
  flag: string;
  profit: number;
  capAt30k?: boolean;
  avatarType: 'blue' | 'dark' | 'photo1' | 'photo2';
  isCurrentUser?: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const {
    tradeHistory,
    traderName,
    setTraderName,
    traderFlag,
    setTraderFlag,
    customLeaderboardProfit,
    setCustomLeaderboardProfit,
    customLeaderboardRank,
    setCustomLeaderboardRank
  } = useTrading();

  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showRatingInfo, setShowRatingInfo] = useState(false);

  if (!isOpen) return null;

  // Calculate user's live profit from tradeHistory if customLeaderboardProfit is not set
  const calculatedNetProfit = tradeHistory.reduce((sum, t) => sum + (t.actualProfit || 0), 0);
  const userProfit =
    customLeaderboardProfit !== null
      ? customLeaderboardProfit
      : tradeHistory.length > 0
      ? Number(calculatedNetProfit.toFixed(2))
      : -5.21;

  // Distinct realistic traders list matching the Quotex Leader Board of the Day layout
  const baseTraders: LeaderboardEntry[] = [
    { name: 'Zain Fx', flag: '🇵🇰', profit: 34500.0, capAt30k: true, avatarType: 'blue' },
    { name: '#Aryan Vip', flag: '🇮🇳', profit: 31200.0, capAt30k: true, avatarType: 'blue' },
    { name: '@QUOTEX_KING...', flag: '🇮🇳', profit: 21277.96, avatarType: 'dark' },
    { name: 'HAMZA PRO', flag: '🇵🇰', profit: 15755.5, avatarType: 'blue' },
    { name: '#VTO SNIPER', flag: '🇮🇳', profit: 12834.0, avatarType: 'blue' },
    { name: 'Salman Trad...', flag: '🇵🇰', profit: 12621.7, avatarType: 'blue' },
    { name: '$100k Club', flag: '🇮🇳', profit: 12618.53, avatarType: 'blue' },
    { name: 'Vikram_FX', flag: '🇮🇳', profit: 11180.0, avatarType: 'photo1' },
    { name: 'اسد التداول...', flag: '🇪🇬', profit: 10600.0, avatarType: 'photo2' },
    { name: 'Lucas_OTC', flag: '🇧🇷', profit: 9840.25, avatarType: 'blue' },
    { name: 'Bilal_Trader', flag: '🇵🇰', profit: 9120.8, avatarType: 'blue' },
    { name: 'Sultan_DXB', flag: '🇦🇪', profit: 8450.0, avatarType: 'dark' },
    { name: 'Karan_Scalp', flag: '🇮🇳', profit: 7930.4, avatarType: 'blue' },
    { name: 'Faisal_VIP', flag: '🇸🇦', profit: 7215.9, avatarType: 'blue' },
    { name: 'Rizwan_PK', flag: '🇵🇰', profit: 6580.0, avatarType: 'blue' }
  ];

  // Combine user into the leaderboard if their profit qualifies for the top 15
  const allEntries: LeaderboardEntry[] = [...baseTraders];
  if (userProfit >= baseTraders[baseTraders.length - 1].profit) {
    allEntries.push({
      name: traderName || 'YA TRADER',
      flag: traderFlag || '🇵🇰',
      profit: userProfit,
      capAt30k: userProfit >= 30000,
      avatarType: 'blue',
      isCurrentUser: true
    });
    allEntries.sort((a, b) => b.profit - a.profit);
  }

  const rankedList = allEntries.slice(0, 15);
  const userIndexInTop = allEntries.findIndex((e) => e.isCurrentUser);

  // Determine user's displayed position
  const displayedPosition =
    customLeaderboardRank !== null
      ? customLeaderboardRank
      : userIndexInTop !== -1
      ? userIndexInTop + 1
      : userProfit > 0
      ? Math.max(16, Math.floor(15000 / (1 + userProfit / 100)))
      : 37019;

  // Progress bar percentage for user's top card (matching screenshot green bar)
  const progressPercent =
    userIndexInTop === 0
      ? 100
      : userProfit > 0
      ? Math.min(95, Math.max(38, Math.floor((userProfit / 30000) * 100) + 35))
      : 36;

  // Format user profit on top right of card (e.g. "-5.21$" or "$1,250.00")
  const formatUserCardProfit = (val: number) => {
    if (val < 0) {
      return `-${Math.abs(val).toFixed(2)}$`;
    }
    return `$${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format leaderboard row profit (e.g. "$30,000.00+" or "$21,277.96")
  const formatRowProfit = (entry: LeaderboardEntry) => {
    if (entry.capAt30k || entry.profit >= 30000) {
      return '$30,000.00+';
    }
    return `$${entry.profit.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#07090e] select-none animate-fadeIn">
      {/* Mobile / Container Frame matching App */}
      <div className="relative w-full h-full max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl bg-[#121622] flex flex-col justify-between overflow-hidden">
        {/* 1. Top Header: < Leader Board / of the Day */}
        <div className="px-4 pt-3.5 pb-2.5 flex items-start justify-between bg-[#121622]">
          <div className="flex items-start gap-2.5">
            <button
              onClick={onClose}
              className="mt-1 p-1 -ml-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Back to Chart"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">
                Leader Board
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">of the Day</p>
            </div>
          </div>

          {/* Quick Edit Button to customize Name / Profit / Position directly */}
          <button
            onClick={() => setShowEditPanel(!showEditPanel)}
            className="p-1.5 rounded-lg bg-[#1a2030] hover:bg-[#232b40] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Customize Trader Name & Position"
          >
            {showEditPanel ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4" />}
          </button>
        </div>

        {/* Optional Quick Customizer Drawer */}
        {showEditPanel && (
          <div className="mx-3.5 mb-2 p-3 rounded-xl bg-[#182032] border border-cyan-500/40 space-y-2.5 text-xs">
            <div className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
              Customize Your Leaderboard Card
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 block mb-0.5">Trader Name</label>
                <input
                  type="text"
                  value={traderName}
                  onChange={(e) => setTraderName(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#2a3650] rounded px-2 py-1 text-white font-bold text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Flag</label>
                <input
                  type="text"
                  value={traderFlag}
                  onChange={(e) => setTraderFlag(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#2a3650] rounded px-2 py-1 text-white text-center text-xs outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Your Profit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={customLeaderboardProfit !== null ? customLeaderboardProfit : userProfit}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCustomLeaderboardProfit(isNaN(val) ? null : val);
                  }}
                  className="w-full bg-[#0e131f] border border-[#2a3650] rounded px-2 py-1 text-white font-mono-num text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Your Position</label>
                <input
                  type="number"
                  value={customLeaderboardRank !== null ? customLeaderboardRank : displayedPosition}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setCustomLeaderboardRank(isNaN(val) ? null : val);
                  }}
                  className="w-full bg-[#0e131f] border border-[#2a3650] rounded px-2 py-1 text-white font-mono-num text-xs outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3.5 pb-4">
          {/* 2. User Position Card (Matches screenshot: Flag + YA TRADER, -5.21$, Green progress bar, Your position: 37019) */}
          <div className="bg-[#1b202e] rounded-lg px-3.5 py-3 shadow-md">
            {/* Top Row: Flag + Name on left, Profit/Loss on right */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#252d3f] flex items-center justify-center text-sm shadow-inner overflow-hidden shrink-0">
                  <span>{traderFlag || '🇵🇰'}</span>
                </div>
                <span className="font-bold text-white text-sm tracking-wide">
                  {traderName || 'YA TRADER'}
                </span>
              </div>

              <span
                className={`font-mono-num font-bold text-sm ${
                  userProfit < 0 ? 'text-[#ff4766]' : 'text-[#00c874]'
                }`}
              >
                {formatUserCardProfit(userProfit)}
              </span>
            </div>

            {/* Middle Progress Bar: Green bar on left, dark gray track on right */}
            <div className="w-full h-[2px] bg-[#2a3142] my-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00c874] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Bottom Row: Your position: 37019 */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Your position:</span>
              <span className="text-white font-extrabold font-mono-num">
                {displayedPosition}
              </span>
            </div>
          </div>

          {/* 3. "How does this rating work?" Blue Box */}
          <button
            onClick={() => setShowRatingInfo(!showRatingInfo)}
            className="w-full mt-2.5 bg-[#122238] hover:bg-[#162944] rounded-lg py-2.5 px-4 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            {/* 3 Gold Podium Bars Icon */}
            <div className="flex items-end gap-[2px] h-4">
              <div className="w-1.5 h-2.5 bg-amber-400 rounded-t-[1px] flex items-center justify-center text-[6px] font-black text-slate-950">
                2
              </div>
              <div className="w-1.5 h-4 bg-yellow-300 rounded-t-[1px] flex items-center justify-center text-[6px] font-black text-slate-950">
                1
              </div>
              <div className="w-1.5 h-2 bg-amber-500 rounded-t-[1px] flex items-center justify-center text-[6px] font-black text-slate-950">
                3
              </div>
            </div>
            <span className="text-[#2b99ff] text-xs font-bold">
              How does this rating work?
            </span>
          </button>

          {showRatingInfo && (
            <div className="mt-2 p-3 rounded-lg bg-[#161c2a] border border-[#232d42] text-[11px] text-slate-300 leading-relaxed">
              The Leader Board ranks active Live Account traders by total net profit earned during the current trading day (UTC).
            </div>
          )}

          {/* 4. Ranked Traders List (1 to 15) */}
          <div className="mt-3 divide-y divide-[#1a2030]">
            {rankedList.map((trader, index) => {
              const rank = index + 1;
              return (
                <div
                  key={`${trader.name}-${rank}`}
                  className={`py-3 px-1 flex items-center justify-between ${
                    trader.isCurrentUser ? 'bg-[#1a2438]/60 rounded-lg px-2' : ''
                  }`}
                >
                  {/* Left: Rank Badge + Overlapping Flag & User Avatar + Trader Name */}
                  <div className="flex items-center min-w-0">
                    {/* Rank Indicator */}
                    <div className="w-6 flex items-center justify-center shrink-0">
                      {rank === 1 ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#fde047] to-[#ca8a04] text-slate-950 font-extrabold text-[11px] flex items-center justify-center shadow-sm">
                          1
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#f1f5f9] to-[#94a3b8] text-slate-950 font-extrabold text-[11px] flex items-center justify-center shadow-sm">
                          2
                        </div>
                      ) : rank === 3 ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#fb923c] to-[#b45309] text-slate-950 font-extrabold text-[11px] flex items-center justify-center shadow-sm">
                          3
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold font-mono-num">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Overlapping Flag Circle + Avatar Circle */}
                    <div className="flex items-center -space-x-1.5 ml-2.5 mr-3 shrink-0">
                      {/* Country Flag Circle */}
                      <div className="w-5 h-5 rounded-full bg-[#1e2638] border border-[#121622] flex items-center justify-center text-[11px] z-10 shadow-xs">
                        {trader.flag}
                      </div>

                      {/* Avatar Circle */}
                      {trader.avatarType === 'dark' ? (
                        <div className="w-5 h-5 rounded-full bg-[#262f40] border border-[#121622] flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-sm bg-slate-500/60" />
                        </div>
                      ) : trader.avatarType === 'photo1' ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 border border-[#121622] flex items-center justify-center text-[9px] font-bold text-slate-950">
                          V
                        </div>
                      ) : trader.avatarType === 'photo2' ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-700 to-stone-500 border border-[#121622] flex items-center justify-center text-[9px] font-bold text-white">
                          A
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#2b99ff] border border-[#121622] flex items-center justify-center">
                          <svg
                            className="w-3.5 h-3.5 text-white fill-current mt-0.5"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Trader Name */}
                    <span className="text-white text-xs sm:text-[13px] font-medium truncate">
                      {trader.name}
                    </span>
                  </div>

                  {/* Right: Green Profit Amount */}
                  <div className="text-[#00c874] font-mono-num text-xs sm:text-[13px] font-bold shrink-0 ml-2">
                    {formatRowProfit(trader)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
