import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  CandlestickChart,
  LineChart,
  Activity,
  Sliders,
  ChevronDown,
  Layers,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ChartType } from '../types/trading';

export const ChartControls: React.FC = () => {
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

  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const [showEngineModeModal, setShowEngineModeModal] = useState(false);

  const timeframes = [
    { label: '5s', seconds: 5 },
    { label: '15s', seconds: 15 },
    { label: '30s', seconds: 30 },
    { label: '1m', seconds: 60 },
    { label: '5m', seconds: 300 }
  ];

  const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'candlestick', label: 'Candles', icon: <CandlestickChart className="w-3.5 h-3.5" /> },
    { type: 'heikinAshi', label: 'Heikin Ashi', icon: <Layers className="w-3.5 h-3.5" /> },
    { type: 'area', label: 'Area', icon: <Activity className="w-3.5 h-3.5" /> },
    { type: 'line', label: 'Line', icon: <LineChart className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#10151f] border-b border-[#1b2230] text-xs">
      {/* Left: Timeframe and Chart Type */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Timeframe Pills */}
        <div className="flex items-center bg-[#161c28] p-0.5 rounded-lg border border-[#232c3d]">
          {timeframes.map((tf) => (
            <button
              key={tf.seconds}
              onClick={() => setTimeframe(tf.seconds)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                timeframe === tf.seconds
                  ? 'bg-[#00e599] text-[#0b0e14] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2839]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center bg-[#161c28] p-0.5 rounded-lg border border-[#232c3d]">
          {chartTypes.map((ct) => (
            <button
              key={ct.type}
              onClick={() => setChartType(ct.type)}
              title={ct.label}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                chartType === ct.type
                  ? 'bg-[#253246] text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2839]'
              }`}
            >
              {ct.icon}
              <span className="hidden sm:inline font-medium">{ct.label}</span>
            </button>
          ))}
        </div>

        {/* Indicators Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowIndicatorsModal(!showIndicatorsModal)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              showIndicatorsModal || indicators.sma || indicators.ema || indicators.bbands || indicators.rsi
                ? 'bg-[#1b263b] border-cyan-500/40 text-cyan-300'
                : 'bg-[#161c28] border-[#232c3d] text-slate-300 hover:bg-[#1f2839]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Indicators</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Indicators Dropdown */}
          {showIndicatorsModal && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#141a26] border border-[#273245] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#222b3b]">
                <span className="font-semibold text-slate-200">Technical Indicators</span>
                <span className="text-[10px] text-cyan-400 font-mono">LIVE OVERLAYS</span>
              </div>

              <div className="space-y-2.5">
                {/* SMA */}
                <label className="flex items-center justify-between cursor-pointer hover:bg-[#1a2333] p-1.5 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="text-slate-200 text-xs font-medium">SMA (Moving Average)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={indicators.sma}
                    onChange={(e) => setIndicators((prev) => ({ ...prev, sma: e.target.checked }))}
                    className="accent-amber-400 rounded w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* EMA */}
                <label className="flex items-center justify-between cursor-pointer hover:bg-[#1a2333] p-1.5 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    <span className="text-slate-200 text-xs font-medium">EMA (Exponential MA)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={indicators.ema}
                    onChange={(e) => setIndicators((prev) => ({ ...prev, ema: e.target.checked }))}
                    className="accent-cyan-400 rounded w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* Bollinger Bands */}
                <label className="flex items-center justify-between cursor-pointer hover:bg-[#1a2333] p-1.5 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                    <span className="text-slate-200 text-xs font-medium">Bollinger Bands</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={indicators.bbands}
                    onChange={(e) => setIndicators((prev) => ({ ...prev, bbands: e.target.checked }))}
                    className="accent-purple-400 rounded w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* RSI */}
                <label className="flex items-center justify-between cursor-pointer hover:bg-[#1a2333] p-1.5 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    <span className="text-slate-200 text-xs font-medium">RSI Oscillator (14)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={indicators.rsi}
                    onChange={(e) => setIndicators((prev) => ({ ...prev, rsi: e.target.checked }))}
                    className="accent-sky-400 rounded w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              <div className="mt-3 pt-2 border-t border-[#222b3b] flex justify-end">
                <button
                  onClick={() => setShowIndicatorsModal(false)}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-xs font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Strategy Engine Mode & Sound FX */}
      <div className="flex items-center gap-2">
        {/* Candle Engine Response Mode (Quotex Strategy / Push Controller) */}
        <div className="relative">
          <button
            onClick={() => setShowEngineModeModal(!showEngineModeModal)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
              marketBehaviorMode === 'smart_push'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                : 'bg-[#161c28] border-[#232c3d] text-slate-300 hover:bg-[#1f2839]'
            }`}
            title="Configure candle trade reaction"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">Engine:</span>
            <span className="capitalize">
              {marketBehaviorMode === 'smart_push'
                ? 'UP/DOWN Follow'
                : marketBehaviorMode === 'realistic'
                ? 'Realistic'
                : marketBehaviorMode === 'bull_trend'
                ? 'Bullish'
                : 'Bearish'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showEngineModeModal && (
            <div className="absolute top-full right-0 mt-1.5 w-72 bg-[#141a26] border border-[#273245] rounded-xl shadow-2xl p-3.5 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#222b3b]">
                <span className="font-semibold text-slate-200">Trade Candle Dynamics</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Fixes Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Select how candle price reacts when you click BUY (UP) or SELL (DOWN):
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMarketBehaviorMode('smart_push');
                    setShowEngineModeModal(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    marketBehaviorMode === 'smart_push'
                      ? 'bg-emerald-900/30 border-emerald-500 text-white'
                      : 'bg-[#18202d] border-[#253043] text-slate-300 hover:bg-[#202b3d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-emerald-300">
                      ⚡ UP → Candle UP / DOWN → Candle DOWN
                    </span>
                    {marketBehaviorMode === 'smart_push' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    When you place UP trade, candle pushes green UP; when DOWN, pushes red DOWN.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setMarketBehaviorMode('realistic');
                    setShowEngineModeModal(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    marketBehaviorMode === 'realistic'
                      ? 'bg-blue-900/30 border-blue-500 text-white'
                      : 'bg-[#18202d] border-[#253043] text-slate-300 hover:bg-[#202b3d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-blue-300">
                      📊 Realistic Market Stochastic
                    </span>
                    {marketBehaviorMode === 'realistic' && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Authentic OTC stochastic algorithmic random walk without artificial momentum bias.
                  </p>
                </button>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      setMarketBehaviorMode('bull_trend');
                      setShowEngineModeModal(false);
                    }}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                      marketBehaviorMode === 'bull_trend'
                        ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300'
                        : 'bg-[#18202d] border-[#253043] text-slate-300 hover:bg-[#202b3d]'
                    }`}
                  >
                    🟢 Bullish Trend
                  </button>

                  <button
                    onClick={() => {
                      setMarketBehaviorMode('bear_trend');
                      setShowEngineModeModal(false);
                    }}
                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                      marketBehaviorMode === 'bear_trend'
                        ? 'bg-rose-900/40 border-rose-500 text-rose-300'
                        : 'bg-[#18202d] border-[#253043] text-slate-300 hover:bg-[#202b3d]'
                    }`}
                  >
                    🔴 Bearish Trend
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio FX Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded-lg border transition-colors ${
            soundEnabled
              ? 'bg-[#161c28] border-[#232c3d] text-slate-300 hover:text-white'
              : 'bg-[#161c28] border-[#232c3d] text-slate-500 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
