import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Tag,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { DepositTransaction } from '../types/trading';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onOpenHistory
}) => {
  const { depositFunds, setAccountType } = useTrading();

  const [selectedMethod, setSelectedMethod] = useState<string>('USDT (TRC20)');
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [promoCode, setPromoCode] = useState<string>('BONUS50');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [recentTransaction, setRecentTransaction] = useState<DepositTransaction | null>(null);

  if (!isOpen) return null;

  const methods = [
    {
      id: 'USDT (TRC20)',
      name: 'USDT Tether',
      network: 'TRC-20 Network',
      icon: '₮',
      color: 'from-emerald-600 to-teal-700',
      address: 'TY5aW8z3nFkd28KSm6L29uVx37fN9e1pZ4',
      badge: 'Zero Fee • Fast'
    },
    {
      id: 'Bitcoin (BTC)',
      name: 'Bitcoin',
      network: 'BTC Network',
      icon: '₿',
      color: 'from-amber-600 to-orange-700',
      address: 'bc1q9v8t7u6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1',
      badge: 'Decentralized'
    },
    {
      id: 'Bank Transfer',
      name: 'Bank Transfer / Wire',
      network: 'SWIFT / Local IBAN',
      icon: '🏦',
      color: 'from-blue-600 to-indigo-700',
      address: 'PK36SCBL0000001234567801 (Habib Bank)',
      badge: 'Direct Bank'
    },
    {
      id: 'EasyPaisa / JazzCash',
      name: 'EasyPaisa / JazzCash',
      network: 'Local Mobile Wallet',
      icon: '📱',
      color: 'from-green-600 to-emerald-700',
      address: '0304-9876543 (Trade Fox Agent)',
      badge: 'Instant Wallet'
    },
    {
      id: 'Visa / MasterCard',
      name: 'Credit / Debit Card',
      network: 'Visa, Mastercard',
      icon: '💳',
      color: 'from-purple-600 to-indigo-800',
      address: 'Gateway Ref: CC-PAY-882193',
      badge: 'Instant Card'
    },
    {
      id: 'Binance Pay',
      name: 'Binance Pay / Crypto',
      network: 'Binance ID: 84930218',
      icon: '🟡',
      color: 'from-yellow-600 to-amber-700',
      address: 'Binance Pay ID: 49201948',
      badge: '0% Gas Fee'
    }
  ];

  const quickAmounts = [25, 50, 100, 250, 500, 1000];

  const currentMethodObj = methods.find((m) => m.id === selectedMethod) || methods[0];

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentMethodObj.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    const tx = depositFunds(depositAmount, selectedMethod, promoCode.trim());
    setRecentTransaction(tx);
    // Switch to Real account so user can trade with the deposited money
    setAccountType('REAL');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Deposit Cashier
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  INSTANT SECURE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Fund your live trading account with zero fees and instant record
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {recentTransaction ? (
            /* Success Receipt View */
            <div className="p-6 bg-[#162132] border border-emerald-500/40 rounded-2xl text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Deposit Successful!</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Your Live Account has been credited with{' '}
                  <strong className="text-emerald-400 font-mono-num text-base">
                    ${recentTransaction.totalCredited.toFixed(2)}
                  </strong>
                </p>
              </div>

              {recentTransaction.bonusAmount > 0 && (
                <div className="inline-block bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
                  🎁 Bonus applied: +${recentTransaction.bonusAmount.toFixed(2)} ({recentTransaction.promoCode})
                </div>
              )}

              {/* Receipt metadata */}
              <div className="bg-[#0f1522] rounded-xl p-4 text-left text-xs space-y-2 border border-[#212d40] font-mono-num">
                <div className="flex justify-between text-slate-400">
                  <span>Transaction ID:</span>
                  <span className="text-slate-200">{recentTransaction.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Gateway:</span>
                  <span className="text-slate-200">{recentTransaction.method}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">APPROVED & RECORDED</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tx Hash:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">
                    {recentTransaction.txHash}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setRecentTransaction(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#202b3d] hover:bg-[#2b3a52] text-slate-200 text-xs font-bold transition-colors"
                >
                  Deposit More
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenHistory) onOpenHistory();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>View in History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all shadow-lg"
                >
                  Start Trading
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleDepositSubmit} className="space-y-6">
              {/* Payment Methods Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {methods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#1b263b] border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                            : 'bg-[#151c2a] border-[#222e42] hover:bg-[#1b2436] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{method.icon}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#202c3e] text-slate-300 font-medium">
                            {method.badge}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-white">{method.name}</div>
                        <div className="text-[10px] text-slate-400">{method.network}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">Deposit Amount ($):</label>
                  <span className="text-[11px] text-emerald-400 font-medium">Min: $10 • Max: $50,000</span>
                </div>

                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#151c2a] border border-[#26354d] focus:border-cyan-500 rounded-xl py-3 pl-9 pr-4 text-xl font-bold text-white outline-none font-mono-num"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="grid grid-cols-6 gap-1.5">
                  {quickAmounts.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDepositAmount(amt)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        depositAmount === amt
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-[#182131] text-slate-300 hover:bg-[#202c40]'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo code input */}
              <div className="bg-[#151c2a] border border-[#212d3f] rounded-xl p-3 flex items-center gap-3">
                <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-[11px] text-slate-400">Promo Code (Optional)</div>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. BONUS50 or QUOTEX100"
                    className="w-full bg-transparent text-xs font-bold text-amber-300 outline-none uppercase"
                  />
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-1 rounded">
                  +50% BONUS
                </span>
              </div>

              {/* Destination Address / QR simulation */}
              <div className="bg-[#141b27] border border-[#222e42] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">{selectedMethod} Address:</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Channel
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-[#0d121c] p-2.5 rounded-lg border border-[#1b2536]">
                  <span className="text-xs text-slate-300 font-mono-num truncate flex-1">
                    {currentMethodObj.address}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-[#1e283b] hover:bg-[#27344d] rounded text-xs text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {copiedAddress ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[10px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide shadow-[0_4px_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>CONFIRM DEPOSIT (${depositAmount.toFixed(2)})</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
