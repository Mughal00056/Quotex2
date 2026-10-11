import React from 'react';
import { useTrading } from '../context/TradingContext';
import {
  X,
  CandlestickChart,
  LineChart,
  Activity,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';
import { ChartType } from '../types/trading';

interface ChartSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChartSettingsModal: React.FC<ChartSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    timeframe,
    setTimeframe,
    chartType,
    setChartType,
    indicators,
    setIndicators,
    soundEnabled,
    setSoundEnabled,
    marketBehaviorMode,
    setMarketBehaviorMode
  } = useTrading();

  if (!isOpen) return null;

  const timeframes = [
    { label: '5s', seconds: 5 },
    { label: '15s', seconds: 15 },
    { label: '30s', seconds: 30 },
    { label: '1m', seconds: 60 },
    { label: '5m', seconds: 300 }
  ];

  const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'candlestick', label: 'Candles', icon: <CandlestickChart className="w-4 h-4" /> },
    { type: 'heikinAshi', label: 'Heikin Ashi', icon: <Layers className="w-4 h-4" /> },
    { type: 'area', label: 'Area', icon: <Activity className="w-4 h-4" /> },
    { type: 'line', label: 'Line', icon: <LineChart className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Chart & Engine Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Timeframe (Locked to 1m per candle as requested) */}
          <div>
            <div className="font-semibold text-slate-300 mb-2">Candle Timeframe (Fixed 1 Minute):</div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => setTimeframe(60)}
                className="py-2 rounded-lg font-black bg-[#00e599] text-slate-950 text-xs"
              >
                1m (1 Minute Per Candle - Locked)
              </button>
            </div>
          </div>

          {/* Chart Types */}
          <div>
            <div className="font-semibold text-slate-300 mb-2">Chart Style:</div>
            <div className="grid grid-cols-2 gap-2">
              {chartTypes.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => setChartType(ct.type)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    chartType === ct.type
                      ? 'bg-[#1b263b] border-cyan-500 text-cyan-300'
                      : 'bg-[#151c28] border-[#222e40] text-slate-300 hover:bg-[#1b2434]'
                  }`}
                >
                  {ct.icon}
                  <span className="font-medium">{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div>
            <div className="font-semibold text-slate-300 mb-2">Indicators:</div>
            <div className="space-y-1.5 bg-[#0e141f] p-2.5 rounded-xl border border-[#1e2738]">
              <label className="flex items-center justify-between p-1.5 hover:bg-[#151d2a] rounded cursor-pointer">
                <span className="text-slate-300">SMA Moving Average</span>
                <input
                  type="checkbox"
                  checked={indicators.sma}
                  onChange={(e) => setIndicators((prev) => ({ ...prev, sma: e.target.checked }))}
                  className="accent-[#00e599] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 hover:bg-[#151d2a] rounded cursor-pointer">
                <span className="text-slate-300">EMA Exponential MA</span>
                <input
                  type="checkbox"
                  checked={indicators.ema}
                  onChange={(e) => setIndicators((prev) => ({ ...prev, ema: e.target.checked }))}
                  className="accent-cyan-400 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 hover:bg-[#151d2a] rounded cursor-pointer">
                <span className="text-slate-300">Bollinger Bands</span>
                <input
                  type="checkbox"
                  checked={indicators.bbands}
                  onChange={(e) => setIndicators((prev) => ({ ...prev, bbands: e.target.checked }))}
                  className="accent-purple-400 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Candle Dynamics / User requested rule */}
          <div>
            <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Candle Response on Trade:</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setMarketBehaviorMode('smart_push')}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  marketBehaviorMode === 'smart_push'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-[#151c28] border-[#222e40] text-slate-300'
                }`}
              >
                <div className="font-bold">⚡ Always Win Mode (Smart Follow)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  When you tap Buy, candle moves green upward; when Sell, moves red downward.
                </div>
              </button>

              <button
                onClick={() => setMarketBehaviorMode('force_loss')}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  marketBehaviorMode === 'force_loss'
                    ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                    : 'bg-[#151c28] border-[#222e40] text-slate-300'
                }`}
              >
                <div className="font-bold">📉 Force Lose Mode (Loss ON)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  When turned ON, trades move against entry direction and result in a loss.
                </div>
              </button>

              <button
                onClick={() => setMarketBehaviorMode('realistic')}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  marketBehaviorMode === 'realistic'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                    : 'bg-[#151c28] border-[#222e40] text-slate-300'
                }`}
              >
                <div className="font-bold">📊 Real Trading (Lose & Win Mix)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Realistic trading behavior where trades naturally both win and lose.
                </div>
              </button>
            </div>
          </div>

          {/* Sound FX */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1e2738]">
            <span className="text-slate-300 font-semibold">Sound FX:</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18212f] text-slate-300 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00e599]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-[#0e141f] border-t border-[#1f2a3d]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
