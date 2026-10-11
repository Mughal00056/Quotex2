import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  X,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  Trash2,
  Filter,
  BarChart3,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatPrice } from '../utils/chartMath';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'trades' | 'deposits' | 'withdrawals' | 'stats';
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'trades'
}) => {
  const {
    tradeHistory,
    deposits,
    withdrawals,
    approveWithdrawal,
    clearAllHistory
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'trades' | 'deposits' | 'withdrawals' | 'stats'>(defaultTab);
  const [filterAccount, setFilterAccount] = useState<'ALL' | 'REAL' | 'DEMO'>('ALL');

  if (!isOpen) return null;

  // Filtered lists
  const filteredTrades = tradeHistory.filter((t) => {
    if (filterAccount === 'ALL') return true;
    return t.accountType === filterAccount;
  });

  const filteredDeposits = deposits.filter((d) => {
    if (filterAccount === 'ALL') return true;
    return d.accountType === filterAccount;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filterAccount === 'ALL') return true;
    return w.accountType === filterAccount;
  });

  // Calculate quick stats
  const totalTrades = tradeHistory.length;
  const wonTrades = tradeHistory.filter((t) => t.status === 'WON').length;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(1) : '0';
  const totalVolume = tradeHistory.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = tradeHistory.reduce((sum, t) => sum + (t.actualProfit || 0), 0);
  const totalDeposited = deposits.reduce((sum, d) => sum + d.totalCredited, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1f2b3e] text-cyan-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Finance & Trading History
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  VERIFIED RECORDS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed records of all trades, deposits, and withdrawal transactions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f283a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0f1420] border-b border-[#1d2738] flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('trades')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'trades'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#1b2434]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trades ({tradeHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('deposits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'deposits'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#1b2434]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposits ({deposits.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'withdrawals'
                  ? 'bg-purple-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#1b2434]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdrawals ({withdrawals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'stats'
                  ? 'bg-blue-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#1b2434]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistics</span>
            </button>
          </div>

          {/* Account Filter & Clear button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#17202d] rounded-lg p-0.5 border border-[#232f42] text-[11px]">
              {(['ALL', 'REAL', 'DEMO'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterAccount(type)}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                    filterAccount === type
                      ? 'bg-[#29374d] text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={clearAllHistory}
              title="Clear all stored history"
              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: Trades History */}
          {activeTab === 'trades' && (
            <div>
              {filteredTrades.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No trades recorded yet. Place an UP or DOWN trade to see records here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#212c3f] text-slate-400 font-semibold">
                        <th className="pb-3 pl-2">Asset / Time</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Account</th>
                        <th className="pb-3">Strike Price</th>
                        <th className="pb-3">Exit Price</th>
                        <th className="pb-3">Invest</th>
                        <th className="pb-3">Result</th>
                        <th className="pb-3 pr-2 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b2333]">
                      {filteredTrades.map((t) => {
                        const isWon = t.status === 'WON';
                        const isTie = t.status === 'TIE';
                        const dateStr = new Date(t.openTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });

                        return (
                          <tr key={t.id} className="hover:bg-[#151c2a] transition-colors">
                            <td className="py-2.5 pl-2 font-medium text-slate-200">
                              <div>{t.assetName}</div>
                              <div className="text-[10px] text-slate-500">{dateStr} • {t.durationSeconds}s</div>
                            </td>
                            <td className="py-2.5 font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  t.direction === 'UP'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {t.direction === 'UP' ? '▲ UP' : '▼ DOWN'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  t.accountType === 'REAL'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-700/50 text-slate-300'
                                }`}
                              >
                                {t.accountType}
                              </span>
                            </td>
                            <td className="py-2.5 font-mono-num text-slate-300">
                              {formatPrice(t.entryPrice)}
                            </td>
                            <td className="py-2.5 font-mono-num text-slate-300">
                              {t.exitPrice ? formatPrice(t.exitPrice) : '--'}
                            </td>
                            <td className="py-2.5 font-mono-num font-semibold text-slate-300">
                              ${t.amount.toFixed(2)}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isWon
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : isTie
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className="py-2.5 pr-2 text-right font-mono-num font-black">
                              <span
                                className={
                                  isWon
                                    ? 'text-emerald-400'
                                    : isTie
                                    ? 'text-slate-400'
                                    : 'text-rose-400'
                                }
                              >
                                {isWon
                                  ? `+$${t.actualProfit?.toFixed(2)}`
                                  : isTie
                                  ? '$0.00'
                                  : `-$${t.amount.toFixed(2)}`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Deposits History */}
          {activeTab === 'deposits' && (
            <div>
              {filteredDeposits.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No deposit transactions recorded yet. Click Deposit to add funds offline.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#212c3f] text-slate-400 font-semibold">
                        <th className="pb-3 pl-2">Transaction ID</th>
                        <th className="pb-3">Method</th>
                        <th className="pb-3">Date & Time</th>
                        <th className="pb-3">Base Amount</th>
                        <th className="pb-3">Bonus</th>
                        <th className="pb-3">Total Credited</th>
                        <th className="pb-3 pr-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b2333]">
                      {filteredDeposits.map((d) => {
                        const dateStr = new Date(d.createdAt).toLocaleString();
                        return (
                          <tr key={d.id} className="hover:bg-[#151c2a] transition-colors">
                            <td className="py-3 pl-2 font-mono-num font-bold text-slate-200">
                              {d.id}
                            </td>
                            <td className="py-3 text-slate-300 font-medium">{d.method}</td>
                            <td className="py-3 text-[11px] text-slate-400">{dateStr}</td>
                            <td className="py-3 font-mono-num text-slate-300">
                              ${d.amount.toFixed(2)}
                            </td>
                            <td className="py-3 font-mono-num text-amber-400">
                              {d.bonusAmount > 0 ? `+$${d.bonusAmount.toFixed(2)}` : '--'}
                            </td>
                            <td className="py-3 font-mono-num font-bold text-emerald-400">
                              ${d.totalCredited.toFixed(2)}
                            </td>
                            <td className="py-3 pr-2 text-right">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Withdrawals History */}
          {activeTab === 'withdrawals' && (
            <div>
              {filteredWithdrawals.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No withdrawal records found. Submit a withdrawal request from the cashier.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#212c3f] text-slate-400 font-semibold">
                        <th className="pb-3 pl-2">Reference ID</th>
                        <th className="pb-3">Method</th>
                        <th className="pb-3">Destination</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 pr-2 text-right">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b2333]">
                      {filteredWithdrawals.map((w) => {
                        const dateStr = new Date(w.createdAt).toLocaleString();
                        const isApproved = w.status === 'APPROVED';

                        return (
                          <tr key={w.id} className="hover:bg-[#151c2a] transition-colors">
                            <td className="py-3 pl-2 font-mono-num font-bold text-slate-200">
                              {w.id}
                            </td>
                            <td className="py-3 text-slate-300 font-medium">{w.method}</td>
                            <td className="py-3 text-[11px] font-mono-num text-slate-400 truncate max-w-[180px]">
                              {w.destinationAccount}
                            </td>
                            <td className="py-3 text-[11px] text-slate-400">{dateStr}</td>
                            <td className="py-3 font-mono-num font-bold text-purple-400">
                              -${w.amount.toFixed(2)}
                            </td>
                            <td className="py-3 pr-2 text-right">
                              {isApproved ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  APPROVED
                                </span>
                              ) : (
                                <button
                                  onClick={() => approveWithdrawal(w.id)}
                                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold"
                                >
                                  Instant Approve
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Statistics Summary */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#151c2a] border border-[#222e42] rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400">Total Trades</div>
                  <div className="text-xl font-bold text-white font-mono-num mt-1">{totalTrades}</div>
                </div>

                <div className="bg-[#151c2a] border border-[#222e42] rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400">Win Rate</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono-num mt-1">
                    {winRate}%
                  </div>
                </div>

                <div className="bg-[#151c2a] border border-[#222e42] rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400">Net Profit / P&L</div>
                  <div
                    className={`text-xl font-bold font-mono-num mt-1 ${
                      netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
                  </div>
                </div>

                <div className="bg-[#151c2a] border border-[#222e42] rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400">Trading Volume</div>
                  <div className="text-xl font-bold text-cyan-400 font-mono-num mt-1">
                    ${totalVolume.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#141d2c] border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Lifetime Deposits Credited</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono-num mt-1">
                      ${totalDeposited.toFixed(2)}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ArrowDownLeft className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#141d2c] border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Lifetime Withdrawals Processed</div>
                    <div className="text-2xl font-black text-purple-400 font-mono-num mt-1">
                      ${totalWithdrawn.toFixed(2)}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
