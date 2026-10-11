import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  X,
  Sliders,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  PenTool,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { formatPrice } from '../utils/chartMath';

interface IndicatorsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'ALL' | 'TREND' | 'VOLATILITY' | 'OSCILLATORS' | 'DRAWING';
}

export const IndicatorsDrawerModal: React.FC<IndicatorsDrawerModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'ALL'
}) => {
  const {
    indicators,
    setIndicators,
    drawnLines,
    addDrawnLine,
    removeDrawnLine,
    clearDrawnLines,
    activeAsset,
    activeDrawingTool,
    setActiveDrawingTool
  } = useTrading();

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'TREND' | 'VOLATILITY' | 'OSCILLATORS' | 'DRAWING'>(defaultTab);
  const [selectedColor, setSelectedColor] = useState<string>('#eab308'); // yellow default
  const [customPriceInput, setCustomPriceInput] = useState<string>(activeAsset.currentPrice.toString());

  if (!isOpen) return null;

  const resetAll = () => {
    setIndicators({
      sma: false,
      smaPeriod: 10,
      ema: false,
      emaPeriod: 21,
      bbands: false,
      bbandsPeriod: 20,
      bbandsStdDev: 2,
      rsi: false,
      rsiPeriod: 14,
      macd: false,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      stoch: false,
      stochK: 14,
      stochD: 3,
      parabolicSar: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Live Technical Indicators
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 tracking-wider">
                  LIVE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Live real-time overlay of moving averages, volatility bands, drawing lines & oscillators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f283a] transition-colors"
              title="Reset All Indicators"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f283a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0f1420] border-b border-[#1d2738] overflow-x-auto text-xs">
          {(['ALL', 'TREND', 'VOLATILITY', 'OSCILLATORS', 'DRAWING'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-[#161f2e] text-slate-400 hover:text-white hover:bg-[#1c283a]'
              }`}
            >
              {cat === 'DRAWING' && <PenTool className="w-3 h-3" />}
              {cat === 'ALL'
                ? 'All Tools'
                : cat === 'TREND'
                ? 'Trend (MA)'
                : cat === 'VOLATILITY'
                ? 'Volatility'
                : cat === 'OSCILLATORS'
                ? 'Oscillators'
                : 'Drawing Lines (خطوط)'}
              {cat === 'DRAWING' && drawnLines.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                  {drawnLines.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Indicator Cards List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* 1. SMA (Simple Moving Average) */}
          {(activeCategory === 'ALL' || activeCategory === 'TREND') && (
            <div className="bg-[#141c2a] border border-[#222e42] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                  <span className="font-bold text-slate-100 text-sm">SMA (Simple Moving Average)</span>
                </div>
                <button
                  onClick={() => setIndicators((prev) => ({ ...prev, sma: !prev.sma }))}
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    indicators.sma ? 'bg-amber-400 justify-end' : 'bg-[#222d3e] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#0a0d14] shadow-md" />
                </button>
              </div>

              {indicators.sma && (
                <div className="flex items-center justify-between pt-2 border-t border-[#1e2738] text-[11px] text-slate-300">
                  <span>Period: {indicators.smaPeriod}</span>
                  <div className="flex gap-1.5">
                    {[5, 10, 20, 50, 100].map((p) => (
                      <button
                        key={p}
                        onClick={() => setIndicators((prev) => ({ ...prev, smaPeriod: p }))}
                        className={`px-2 py-0.5 rounded font-mono font-bold ${
                          indicators.smaPeriod === p
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-[#1b2536] text-slate-300 hover:bg-[#233146]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. EMA (Exponential Moving Average) */}
          {(activeCategory === 'ALL' || activeCategory === 'TREND') && (
            <div className="bg-[#141c2a] border border-[#222e42] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" />
                  <span className="font-bold text-slate-100 text-sm">EMA (Exponential MA)</span>
                </div>
                <button
                  onClick={() => setIndicators((prev) => ({ ...prev, ema: !prev.ema }))}
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    indicators.ema ? 'bg-cyan-400 justify-end' : 'bg-[#222d3e] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#0a0d14] shadow-md" />
                </button>
              </div>

              {indicators.ema && (
                <div className="flex items-center justify-between pt-2 border-t border-[#1e2738] text-[11px] text-slate-300">
                  <span>Period: {indicators.emaPeriod}</span>
                  <div className="flex gap-1.5">
                    {[9, 14, 21, 55, 200].map((p) => (
                      <button
                        key={p}
                        onClick={() => setIndicators((prev) => ({ ...prev, emaPeriod: p }))}
                        className={`px-2 py-0.5 rounded font-mono font-bold ${
                          indicators.emaPeriod === p
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-[#1b2536] text-slate-300 hover:bg-[#233146]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Bollinger Bands */}
          {(activeCategory === 'ALL' || activeCategory === 'VOLATILITY') && (
            <div className="bg-[#141c2a] border border-[#222e42] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-400 shadow-sm" />
                  <span className="font-bold text-slate-100 text-sm">Bollinger Bands (Upper/Lower)</span>
                </div>
                <button
                  onClick={() => setIndicators((prev) => ({ ...prev, bbands: !prev.bbands }))}
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    indicators.bbands ? 'bg-purple-400 justify-end' : 'bg-[#222d3e] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#0a0d14] shadow-md" />
                </button>
              </div>

              {indicators.bbands && (
                <div className="pt-2 border-t border-[#1e2738] space-y-2 text-[11px] text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>Period: {indicators.bbandsPeriod}</span>
                    <div className="flex gap-1.5">
                      {[14, 20, 25].map((p) => (
                        <button
                          key={p}
                          onClick={() => setIndicators((prev) => ({ ...prev, bbandsPeriod: p }))}
                          className={`px-2 py-0.5 rounded font-mono font-bold ${
                            indicators.bbandsPeriod === p
                              ? 'bg-purple-400 text-slate-950'
                              : 'bg-[#1b2536] text-slate-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>StdDev Multiplier: {indicators.bbandsStdDev}σ</span>
                    <div className="flex gap-1.5">
                      {[1.5, 2, 2.5].map((d) => (
                        <button
                          key={d}
                          onClick={() => setIndicators((prev) => ({ ...prev, bbandsStdDev: d }))}
                          className={`px-2 py-0.5 rounded font-mono font-bold ${
                            indicators.bbandsStdDev === d
                              ? 'bg-purple-400 text-slate-950'
                              : 'bg-[#1b2536] text-slate-300'
                          }`}
                        >
                          {d}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. RSI Oscillator */}
          {(activeCategory === 'ALL' || activeCategory === 'OSCILLATORS') && (
            <div className="bg-[#141c2a] border border-[#222e42] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm" />
                  <span className="font-bold text-slate-100 text-sm">RSI Oscillator (70/30)</span>
                </div>
                <button
                  onClick={() => setIndicators((prev) => ({ ...prev, rsi: !prev.rsi }))}
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    indicators.rsi ? 'bg-sky-400 justify-end' : 'bg-[#222d3e] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#0a0d14] shadow-md" />
                </button>
              </div>

              {indicators.rsi && (
                <div className="flex items-center justify-between pt-2 border-t border-[#1e2738] text-[11px] text-slate-300">
                  <span>Period: {indicators.rsiPeriod}</span>
                  <div className="flex gap-1.5">
                    {[7, 14, 21].map((p) => (
                      <button
                        key={p}
                        onClick={() => setIndicators((prev) => ({ ...prev, rsiPeriod: p }))}
                        className={`px-2 py-0.5 rounded font-mono font-bold ${
                          indicators.rsiPeriod === p
                            ? 'bg-sky-400 text-slate-950'
                            : 'bg-[#1b2536] text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. MACD */}
          {(activeCategory === 'ALL' || activeCategory === 'OSCILLATORS') && (
            <div className="bg-[#141c2a] border border-[#222e42] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                  <span className="font-bold text-slate-100 text-sm">MACD (12, 26, 9)</span>
                </div>
                <button
                  onClick={() => setIndicators((prev) => ({ ...prev, macd: !prev.macd }))}
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    indicators.macd ? 'bg-emerald-400 justify-end' : 'bg-[#222d3e] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#0a0d14] shadow-md" />
                </button>
              </div>

              {indicators.macd && (
                <div className="pt-2 border-t border-[#1e2738] text-[11px] text-slate-400">
                  Fast: 12 • Slow: 26 • Signal: 9 (Displays MACD Line & Histogram)
                </div>
              )}
            </div>
          )}

          {/* 6. Stochastic Oscillator */}
          {(activeCategory === 'ALL' || activeCategory === 'OSCILLATORS') && (
            <div className="bg-[#141c2a] border border-[#222e42] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 shadow-sm" />
                  <span className="font-bold text-slate-100 text-sm">Stochastic Oscillator (%K, %D)</span>
                </div>
                <button
                  onClick={() => setIndicators((prev) => ({ ...prev, stoch: !prev.stoch }))}
                  className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    indicators.stoch ? 'bg-rose-400 justify-end' : 'bg-[#222d3e] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#0a0d14] shadow-md" />
                </button>
              </div>

              {indicators.stoch && (
                <div className="pt-2 border-t border-[#1e2738] text-[11px] text-slate-400">
                  %K: 14 • %D: 3 • Overbought: 80 • Oversold: 20
                </div>
              )}
            </div>
          )}

          {/* 7. Drawing Tools & Custom Lines (Support, Resistance, Trendlines) */}
          {(activeCategory === 'ALL' || activeCategory === 'DRAWING') && (
            <div className="bg-[#141c2a] border border-[#222e42] rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <PenTool className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 text-sm block">Drawing Tools (Custom Lines)</span>
                    <span className="text-[10px] text-slate-400">Draw Support, Resistance & Trend Lines on chart</span>
                  </div>
                </div>

                {drawnLines.length > 0 && (
                  <button
                    onClick={clearDrawnLines}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear ({drawnLines.length})
                  </button>
                )}
              </div>

              {/* Color Chooser for New Line */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-300 font-medium">Line Color:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#eab308', name: 'Yellow' },
                    { color: '#00e599', name: 'Green' },
                    { color: '#ff3355', name: 'Red' },
                    { color: '#38bdf8', name: 'Cyan' },
                    { color: '#ffffff', name: 'White' },
                    { color: '#c084fc', name: 'Purple' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setSelectedColor(c.color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColor === c.color
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Action Buttons to Add Lines */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    addDrawnLine({
                      type: 'horizontal',
                      price1: activeAsset.currentPrice,
                      color: selectedColor,
                      label: 'PRICE LINE'
                    });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#1a2436] hover:bg-[#233149] border border-[#2d3d57] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Line @ Current</span>
                </button>

                <button
                  onClick={() => {
                    const supportPrice = Number((activeAsset.currentPrice - activeAsset.volatility * 1.5).toFixed(activeAsset.decimalPlaces));
                    addDrawnLine({
                      type: 'horizontal',
                      price1: supportPrice,
                      color: '#00e599',
                      label: 'SUPPORT'
                    });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#003823]/70 hover:bg-[#004a2f] border border-[#00e599]/40 text-[#00e599] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 text-[#00e599]" />
                  <span>+ Support Line</span>
                </button>

                <button
                  onClick={() => {
                    const resistPrice = Number((activeAsset.currentPrice + activeAsset.volatility * 1.5).toFixed(activeAsset.decimalPlaces));
                    addDrawnLine({
                      type: 'horizontal',
                      price1: resistPrice,
                      color: '#ff3355',
                      label: 'RESISTANCE'
                    });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#3b0d14]/70 hover:bg-[#4f111b] border border-[#ff3355]/40 text-[#ff4d6b] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ff3355]" />
                  <span>+ Resistance Line</span>
                </button>

                <button
                  onClick={() => {
                    const price1 = Number((activeAsset.currentPrice - activeAsset.volatility * 0.8).toFixed(activeAsset.decimalPlaces));
                    const price2 = Number((activeAsset.currentPrice + activeAsset.volatility * 0.8).toFixed(activeAsset.decimalPlaces));
                    addDrawnLine({
                      type: 'trendline',
                      price1,
                      price2,
                      color: selectedColor,
                      label: 'TRENDLINE'
                    });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#1a2436] hover:bg-[#233149] border border-[#2d3d57] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Trend Line</span>
                </button>
              </div>

              {/* Tap or Drag to Draw on Chart Toggle */}
              <div className="pt-2 border-t border-[#1f2b3e] flex items-center justify-between">
                <span className="text-[11px] text-slate-300">
                  Draw custom line directly on chart:
                </span>
                <button
                  onClick={() => {
                    setActiveDrawingTool('trendline');
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer"
                >
                  Start Hand Drawing
                </button>
              </div>

              {/* Active Lines List */}
              {drawnLines.length > 0 && (
                <div className="pt-2 border-t border-[#1f2b3e] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Active Lines on Chart ({drawnLines.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {drawnLines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between bg-[#0e1420] border border-[#1e2a3c] rounded-lg px-2.5 py-1.5 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: line.color }}
                          />
                          <span className="font-bold text-slate-200">
                            {line.label || (line.type === 'horizontal' ? 'Horizontal' : 'Trendline')}
                          </span>
                          <span className="font-mono text-slate-400">
                            {formatPrice(line.price1, activeAsset.decimalPlaces)}
                            {line.price2 && ` → ${formatPrice(line.price2, activeAsset.decimalPlaces)}`}
                          </span>
                        </div>

                        <button
                          onClick={() => removeDrawnLine(line.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title="Remove line"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0e141f] border-t border-[#1f2a3d] flex gap-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            Apply to Live Chart
          </button>
        </div>
      </div>
    </div>
  );
};
