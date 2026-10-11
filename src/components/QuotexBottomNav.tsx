import React from 'react';
import {
  CandlestickChart,
  HelpCircle,
  User,
  Trophy,
  MessageSquare
} from 'lucide-react';

interface QuotexBottomNavProps {
  activeTab: 'chart' | 'help' | 'profile' | 'leaderboard' | 'messages';
  onChangeTab: (tab: 'chart' | 'help' | 'profile' | 'leaderboard' | 'messages') => void;
}

export const QuotexBottomNav: React.FC<QuotexBottomNavProps> = ({
  activeTab,
  onChangeTab
}) => {
  return (
    <nav className="h-14 bg-[#0a0d14] border-t border-[#18212f] px-4 flex items-center justify-around select-none z-30">
      {/* 1. Chart / Markets */}
      <button
        onClick={() => onChangeTab('chart')}
        className={`p-2 rounded-xl transition-all ${
          activeTab === 'chart'
            ? 'text-cyan-400 bg-[#16202e]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Live Chart"
      >
        <CandlestickChart className="w-5 h-5 stroke-[2]" />
      </button>

      {/* 2. Help / Onboarding (?) */}
      <button
        onClick={() => onChangeTab('help')}
        className={`relative p-2 rounded-xl transition-all ${
          activeTab === 'help'
            ? 'text-cyan-400 bg-[#16202e]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Help & Guide"
      >
        <div className="w-6 h-6 rounded-lg bg-[#141d2a] border border-[#233144] flex items-center justify-center">
          <HelpCircle className="w-4 h-4 text-slate-300 stroke-[2.2]" />
        </div>
      </button>

      {/* 3. User Profile */}
      <button
        onClick={() => onChangeTab('profile')}
        className={`p-2 rounded-xl transition-all ${
          activeTab === 'profile'
            ? 'text-cyan-400 bg-[#16202e]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Profile & Settings"
      >
        <User className="w-5 h-5 stroke-[2]" />
      </button>

      {/* 4. Trophy / Leaderboard with badge 4 */}
      <button
        onClick={() => onChangeTab('leaderboard')}
        className={`relative p-2 rounded-xl transition-all ${
          activeTab === 'leaderboard'
            ? 'text-amber-400 bg-[#16202e]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Top Traders"
      >
        <Trophy className="w-5 h-5 stroke-[2]" />
        <span className="absolute top-1 right-1 bg-[#0284c7] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
          4
        </span>
      </button>

      {/* 5. Messages / Support with badge 4 */}
      <button
        onClick={() => onChangeTab('messages')}
        className={`relative p-2 rounded-xl transition-all ${
          activeTab === 'messages'
            ? 'text-cyan-400 bg-[#16202e]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Support & Signals"
      >
        <MessageSquare className="w-5 h-5 stroke-[2]" />
        <span className="absolute top-1 right-1 bg-[#0284c7] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
          4
        </span>
      </button>
    </nav>
  );
};
