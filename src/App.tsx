import React, { useState } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { QuotexMobileTopBar } from './components/QuotexMobileTopBar';
import { ChartCanvas } from './components/ChartCanvas';
import { QuotexConsole } from './components/QuotexConsole';
import { QuotexBottomNav } from './components/QuotexBottomNav';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { HistoryModal } from './components/HistoryModal';
import { AssetModal } from './components/AssetModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ChartSettingsModal } from './components/ChartSettingsModal';
import { IndicatorsDrawerModal } from './components/IndicatorsDrawerModal';
import { ActiveTradesModal } from './components/ActiveTradesModal';
import { NotificationsModal } from './components/NotificationsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SupportMessagesModal } from './components/SupportMessagesModal';
import { TradeResultPopup } from './components/TradeResultPopup';
import { OrderNotificationToast } from './components/OrderNotificationToast';
import { LoadingScreen } from './components/LoadingScreen';

const QuotexPlatform: React.FC = () => {
  // Navigation & Modals state
  const [navTab, setNavTab] = useState<'chart' | 'help' | 'profile' | 'leaderboard' | 'messages'>('chart');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<'trades' | 'deposits' | 'withdrawals' | 'stats'>('trades');
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false);
  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const [indicatorsDefaultTab, setIndicatorsDefaultTab] = useState<'ALL' | 'TREND' | 'VOLATILITY' | 'OSCILLATORS' | 'DRAWING'>('ALL');
  const [activeTradesOpen, setActiveTradesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [supportMessagesOpen, setSupportMessagesOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);

  const handleBottomTabChange = (tab: 'chart' | 'help' | 'profile' | 'leaderboard' | 'messages') => {
    setNavTab(tab);
    if (tab === 'help') setHelpGuideOpen(true);
    if (tab === 'profile') setProfileOpen(true);
    if (tab === 'leaderboard') setLeaderboardOpen(true);
    if (tab === 'messages') setSupportMessagesOpen(true);
  };

  const openHistoryWithTab = (tab: 'trades' | 'deposits' | 'withdrawals' | 'stats') => {
    setHistoryTab(tab);
    setHistoryOpen(true);
  };

  return (
    <>
      {/* 0. Quotex Premium Initial Loading Screen */}
      <LoadingScreen />

      <div className="fixed inset-0 w-full h-[100dvh] bg-[#07090e] select-none overflow-hidden flex justify-center items-center overscroll-none">
        {/* Quotex Mobile Container */}
        <div className="relative w-full h-full max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl bg-[#0a0d14] flex flex-col justify-between overflow-hidden shadow-2xl sm:border-x sm:border-[#1a2333]">
          {/* 1. Header with 3-Line Menu, Account pill, Bell badge, Deposit CTA, and 50% bonus banner */}
          <QuotexMobileTopBar
            onOpenDeposit={() => setDepositOpen(true)}
            onOpenWithdraw={() => setWithdrawOpen(true)}
            onOpenHistory={() => openHistoryWithTab('trades')}
            onOpenNotifications={() => setNotificationsOpen(true)}
            onOpenLeaderboard={() => setLeaderboardOpen(true)}
          />

          {/* 2. Main Live Chart Area with DEMO watermark, vertical trade lines, countdown pill, floating buttons */}
          <div className="flex-1 relative overflow-hidden bg-[#0a0d14]">
            <ChartCanvas
              onOpenSettings={() => setChartSettingsOpen(true)}
              onOpenIndicators={(tab) => {
                setIndicatorsDefaultTab(tab || 'ALL');
                setIndicatorsOpen(true);
              }}
              onOpenActiveTrades={() => setActiveTradesOpen(true)}
            />
            {/* Results P/F placed directly ON THE TRADING CHART area where trading is happening! */}
            <TradeResultPopup />
          </div>

          {/* 3. Lower Quotex Console (EUR/CHF 85% ▾, PENDING TRADE, Timer, Investment, Payout, Buy & Sell) */}
          <QuotexConsole onOpenAssetModal={() => setAssetModalOpen(true)} />

          {/* 4. Bottom 5-Tab Navigation Bar */}
          <QuotexBottomNav
            activeTab={navTab}
            onChangeTab={handleBottomTabChange}
          />

          {/* 5. Order Notification Toast (Green for Buy, Red for Sell) */}
          <OrderNotificationToast />
        </div>

        {/* Modals & Dialogs */}
        <DepositModal
          isOpen={depositOpen}
          onClose={() => setDepositOpen(false)}
          onOpenHistory={() => openHistoryWithTab('deposits')}
        />

        <WithdrawModal
          isOpen={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          onOpenHistory={() => openHistoryWithTab('withdrawals')}
        />

        <HistoryModal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          defaultTab={historyTab}
        />

        <AssetModal
          isOpen={assetModalOpen}
          onClose={() => setAssetModalOpen(false)}
        />

        <ChartSettingsModal
          isOpen={chartSettingsOpen}
          onClose={() => setChartSettingsOpen(false)}
        />

        <IndicatorsDrawerModal
          isOpen={indicatorsOpen}
          onClose={() => setIndicatorsOpen(false)}
          defaultTab={indicatorsDefaultTab}
        />

        <ActiveTradesModal
          isOpen={activeTradesOpen}
          onClose={() => setActiveTradesOpen(false)}
          onOpenHistory={() => openHistoryWithTab('trades')}
        />

        <NotificationsModal
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          onOpenDeposit={() => setDepositOpen(true)}
        />

        <UserProfileModal
          isOpen={profileOpen}
          onClose={() => {
            setProfileOpen(false);
            setNavTab('chart');
          }}
          onOpenDeposit={() => setDepositOpen(true)}
          onOpenWithdraw={() => setWithdrawOpen(true)}
          onOpenHistory={() => openHistoryWithTab('trades')}
        />

        <LeaderboardModal
          isOpen={leaderboardOpen}
          onClose={() => {
            setLeaderboardOpen(false);
            setNavTab('chart');
          }}
        />

        <SupportMessagesModal
          isOpen={supportMessagesOpen}
          onClose={() => {
            setSupportMessagesOpen(false);
            setNavTab('chart');
          }}
        />

        {/* Help / Onboarding Guide Modal */}
        {helpGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-sm bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl p-5 text-xs text-slate-300">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>Quotex Quick Guide</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  PRO BROKER
                </span>
              </h3>

              <div className="space-y-2.5 mt-3">
                <div className="p-2.5 bg-[#16202f] rounded-xl border border-[#222e42]">
                  <strong className="text-emerald-400 block mb-0.5">
                    1. Green Buy ⬆ & Red Sell ⬇:
                  </strong>
                  Smooth realistic candle movement with upward trend on Buy and downward trend on Sell.
                </div>

                <div className="p-2.5 bg-[#16202f] rounded-xl border border-[#222e42]">
                  <strong className="text-cyan-400 block mb-0.5">
                    2. Instant Cashier & Records:
                  </strong>
                  Deposit and withdraw funds through verified channels. All transactions are logged in History.
                </div>

                <div className="p-2.5 bg-[#16202f] rounded-xl border border-[#222e42]">
                  <strong className="text-amber-400 block mb-0.5">
                    3. Technical Indicators:
                  </strong>
                  Tap the <strong className="text-white">Sliders icon</strong> on the chart to overlay SMA, EMA, Bollinger Bands, RSI, MACD, and Stochastic.
                </div>
              </div>

              <button
                onClick={() => {
                  setHelpGuideOpen(false);
                  setNavTab('chart');
                }}
                className="mt-4 w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Start Trading
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default function App() {
  return (
    <TradingProvider>
      <QuotexPlatform />
    </TradingProvider>
  );
}
