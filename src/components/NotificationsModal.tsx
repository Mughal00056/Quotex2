import React from 'react';
import { X, Bell, Zap, Gift, ShieldCheck } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenDeposit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Notifications (1)
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Notification item */}
          <div className="p-3 bg-[#151c28] border border-emerald-500/30 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Gift className="w-4 h-4" />
              <span>50% Deposit Bonus Activated!</span>
            </div>
            <p className="text-xs text-slate-300">
              Get an extra 50% added to your real account on any offline deposit. Code: <strong className="text-amber-400">BONUS50</strong>.
            </p>
            <div className="pt-1 flex justify-between items-center text-[10px] text-slate-500">
              <span>Just now</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                Deposit Now →
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#131924] border border-[#1e2738] rounded-xl space-y-1.5 opacity-80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Offline System Ready</span>
            </div>
            <p className="text-xs text-slate-400">
              Your trades and balance persist offline in local storage without requiring internet connection.
            </p>
            <div className="text-[10px] text-slate-500">System notice</div>
          </div>
        </div>
      </div>
    </div>
  );
};
