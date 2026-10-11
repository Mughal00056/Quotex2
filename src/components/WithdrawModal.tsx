import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { WithdrawalTransaction } from '../types/trading';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onOpenHistory
}) => {
  const { realBalance, withdrawFunds } = useTrading();

  const [selectedMethod, setSelectedMethod] = useState<string>('USDT (TRC20)');
  const [amount, setAmount] = useState<number>(50);
  const [destinationAccount, setDestinationAccount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<WithdrawalTransaction | null>(null);

  if (!isOpen) return null;

  const withdrawalMethods = [
    {
      id: 'USDT (TRC20)',
      name: 'USDT (TRC-20)',
      placeholder: 'Enter TRC20 Wallet Address (e.g. T...)',
      icon: '₮',
      min: 15
    },
    {
      id: 'Bitcoin (BTC)',
      name: 'Bitcoin (BTC)',
      placeholder: 'Enter Bitcoin Address (bc1... or 1...)',
      icon: '₿',
      min: 50
    },
    {
      id: 'Bank Transfer',
      name: 'Bank Transfer / Wire',
      placeholder: 'Enter Bank Name, Account Title & IBAN',
      icon: '🏦',
      min: 30
    },
    {
      id: 'EasyPaisa / JazzCash',
      name: 'EasyPaisa / JazzCash',
      placeholder: 'Enter Mobile Account Number & Full Name',
      icon: '📱',
      min: 10
    },
    {
      id: 'Visa / MasterCard',
      name: 'Bank Card Refund',
      placeholder: 'Enter 16-Digit Card Number',
      icon: '💳',
      min: 20
    }
  ];

  const currentMethodObj = withdrawalMethods.find((m) => m.id === selectedMethod) || withdrawalMethods[0];

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Please specify a valid withdrawal amount.');
      return;
    }

    if (amount > realBalance) {
      setError(`Requested amount ($${amount.toFixed(2)}) exceeds available live balance ($${realBalance.toFixed(2)}).`);
      return;
    }

    if (!destinationAccount.trim()) {
      setError(`Please provide your ${selectedMethod} destination account/address.`);
      return;
    }

    const result = withdrawFunds(amount, selectedMethod, destinationAccount.trim());
    if (result.success && result.transaction) {
      setSuccessTx(result.transaction);
    } else {
      setError(result.message || 'Withdrawal failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Withdrawal Cashier
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  OFFICIAL GATEWAY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Fast & secure withdrawals directly recorded in your history
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {successTx ? (
            /* Success Receipt */
            <div className="p-6 bg-[#162132] border border-cyan-500/40 rounded-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Withdrawal Dispatched!</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Amount of{' '}
                  <strong className="text-cyan-400 font-mono-num text-base">
                    ${successTx.amount.toFixed(2)}
                  </strong>{' '}
                  has been approved & recorded.
                </p>
              </div>

              <div className="bg-[#0f1522] rounded-xl p-4 text-left text-xs space-y-2 border border-[#212d40] font-mono-num">
                <div className="flex justify-between text-slate-400">
                  <span>Reference ID:</span>
                  <span className="text-slate-200">{successTx.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Method:</span>
                  <span className="text-slate-200">{successTx.method}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="text-slate-200 truncate max-w-[220px]">
                    {successTx.destinationAccount}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">APPROVED & RECORDED</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSuccessTx(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#202b3d] hover:bg-[#2b3a52] text-slate-200 text-xs font-bold transition-colors"
                >
                  Withdraw Again
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-5">
              {/* Live Balance Banner */}
              <div className="bg-gradient-to-r from-[#172336] to-[#121a28] border border-cyan-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-medium">
                      Available Live Balance
                    </div>
                    <div className="text-lg font-extrabold text-white font-mono-num">
                      ${realBalance.toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAmount(realBalance)}
                  className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-lg font-bold border border-cyan-500/40 transition-colors"
                >
                  Withdraw All
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Payout Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {withdrawalMethods.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#1b263b] border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                            : 'bg-[#151c2a] border-[#222e42] hover:bg-[#1b2436] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{m.icon}</span>
                          <span className="font-bold text-xs text-white">{m.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Min: ${m.min}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Withdrawal Amount ($):
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Min: ${currentMethodObj.min}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min={currentMethodObj.min}
                    max={realBalance}
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#151c2a] border border-[#26354d] focus:border-cyan-500 rounded-xl py-3 pl-9 pr-4 text-xl font-bold text-white outline-none font-mono-num"
                  />
                </div>
              </div>

              {/* Destination Address / Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Recipient Account / Address:
                </label>
                <input
                  type="text"
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  placeholder={currentMethodObj.placeholder}
                  className="w-full bg-[#151c2a] border border-[#26354d] focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none font-mono-num"
                />
              </div>

              <div className="p-3 bg-[#131a26] border border-[#1f2838] rounded-xl flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Withdrawal requests are processed immediately and tracked in your transaction records.
                </span>
              </div>

              <button
                type="submit"
                disabled={realBalance <= 0}
                className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 ${
                  realBalance > 0
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>REQUEST WITHDRAWAL (${amount.toFixed(2)})</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
