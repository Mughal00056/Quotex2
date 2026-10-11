import React, { useEffect, useState } from 'react';
import { FoxLogo } from './FoxLogo';

interface LoadingScreenProps {
  onLoaded?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(12);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsDone(true);
            if (onLoaded) onLoaded();
          }, 350);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 14;
      });
    }, 110);

    return () => clearInterval(timer);
  }, [onLoaded]);

  if (isDone) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#06080e] flex flex-col items-center justify-center p-6 select-none transition-opacity duration-300">
      {/* Background ambient glow */}
      <div className="absolute w-80 h-80 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -bottom-10" />

      {/* Trade Fox Glowing Fox Logo */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#1b1511] to-[#251f19] border-2 border-orange-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.45)] animate-pulse p-3">
          <FoxLogo size={72} glow={true} />
        </div>
      </div>

      {/* Brand title: TRADE FOX */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-black tracking-widest bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            TRADE FOX
          </h1>
        </div>
        <p className="text-[11px] font-extrabold text-orange-400 tracking-[0.3em] uppercase mt-1">
          LIVE PRO BINARY BROKER
        </p>
      </div>

      {/* Sleek progress bar */}
      <div className="w-64 max-w-full bg-[#121620] rounded-full h-2.5 overflow-hidden border border-[#272f42] p-0.5 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-[#00e599] rounded-full transition-all duration-150 ease-out shadow-[0_0_14px_rgba(249,115,22,0.85)]"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Status note */}
      <div className="mt-3.5 text-[11px] font-mono font-bold text-slate-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
        <span>Syncing Live Fox Feeds... {Math.min(100, progress)}%</span>
      </div>
    </div>
  );
};
