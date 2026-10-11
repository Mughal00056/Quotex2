import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, WifiOff, Wifi } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return compact ? null : (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Installed & Offline Ready</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
          ACTIVE
        </span>
      </div>
    );
  }

  return (
    <>
      {compact ? (
        <button
          onClick={() => {
            if (isInstallable) {
              install();
            } else {
              setShowGuideModal(true);
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141b27] hover:bg-[#1c2638] border border-[#232f44] text-cyan-400 text-[11px] font-bold transition-colors cursor-pointer"
          title="Install Offline App"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">App</span>
        </button>
      ) : (
        <div className="bg-[#141c2b] border border-[#223049] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400" />
              )}
              <div>
                <div className="font-bold text-white text-xs">
                  Offline Mode & App Install
                </div>
                <div className="text-[10px] text-slate-400">
                  {isOnline
                    ? '100% Offline compatible — trade anytime without internet'
                    : 'Running in Offline Mode — local trading engine active'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  setShowGuideModal(true);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          </div>
        </div>
      )}

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#111723] border border-[#232f45] p-5 shadow-2xl text-xs text-slate-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Install Quotex Pro Offline App
                </h3>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  Works 100% Offline Without Internet
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-2 bg-[#16202f] p-3 rounded-xl border border-[#222e42]">
                <p className="text-slate-200 font-semibold">Install on iPhone / iPad:</p>
                <p>1. Tap the <strong className="text-white">Share</strong> button in Safari toolbar.</p>
                <p>2. Scroll down and tap <strong className="text-cyan-400">Add to Home Screen</strong>.</p>
              </div>
            ) : (
              <div className="space-y-2 bg-[#16202f] p-3 rounded-xl border border-[#222e42]">
                <p className="text-slate-200 font-semibold">Offline Caching Active:</p>
                <p>All charts, candles, assets, balances, and 1-day trades are cached locally on your device so you can trade seamlessly even when offline.</p>
                <p className="text-slate-400 text-[11px] pt-1">
                  To add to your home screen, open your browser menu (⋮) and tap <strong className="text-cyan-400">"Install App"</strong> or <strong className="text-cyan-400">"Add to Home screen"</strong>.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full rounded-xl bg-[#00e599] hover:bg-[#00d084] py-2.5 text-xs font-black text-slate-950 transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
