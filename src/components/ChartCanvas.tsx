import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateRSI,
  calculateMACD,
  calculateStochastic,
  toHeikinAshi,
  formatPrice
} from '../utils/chartMath';
import { Candle } from '../types/trading';
import {
  MoreHorizontal,
  Briefcase,
  Sliders,
  Plus,
  Minus,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Undo2,
  Trash2,
  X
} from 'lucide-react';

interface ChartCanvasProps {
  className?: string;
  onOpenSettings?: () => void;
  onOpenIndicators?: (tab?: 'ALL' | 'TREND' | 'VOLATILITY' | 'OSCILLATORS' | 'DRAWING') => void;
  onOpenActiveTrades?: () => void;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  className,
  onOpenSettings,
  onOpenIndicators,
  onOpenActiveTrades
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    activeAsset,
    candles,
    chartType,
    indicators,
    activeTrades,
    timeframe,
    accountType,
    isAssetLoading,
    zoomVisibleCount,
    setZoomVisibleCount,
    zoomIn,
    zoomOut,
    resetZoom,
    drawnLines,
    addDrawnLine,
    undoLastDrawnLine,
    clearDrawnLines,
    activeDrawingTool,
    setActiveDrawingTool,
    drawingColor,
    setDrawingColor,
    showChartButtons,
    setShowChartButtons
  } = useTrading();

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState<number>(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; initialPan: number } | null>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(zoomVisibleCount);

  // Interactive Pen Drawing State (Drag or 2-Tap custom line / freehand)
  const [draftLine, setDraftLine] = useState<{
    type: 'trendline' | 'freehand' | 'horizontal';
    time1: number;
    price1: number;
    time2: number;
    price2: number;
    points: { time: number; price: number }[];
  } | null>(null);
  const isDrawingRef = useRef(false);

  const chartDimsRef = useRef<{
    minPrice: number;
    maxPrice: number;
    topPadding: number;
    chartHeight: number;
    chartWidth: number;
    expandedRange: number;
    candleWidth: number;
    firstCandleTime: number;
    timeframeMs: number;
  } | null>(null);

  // Prepare display candles (Heikin Ashi or standard)
  const displayCandles = useMemo<Candle[]>(() => {
    if (chartType === 'heikinAshi') {
      return toHeikinAshi(candles);
    }
    return candles;
  }, [candles, chartType]);

  // Compute indicators
  const smaValues = useMemo(() => {
    if (!indicators.sma) return [];
    return calculateSMA(displayCandles, indicators.smaPeriod);
  }, [displayCandles, indicators.sma, indicators.smaPeriod]);

  const emaValues = useMemo(() => {
    if (!indicators.ema) return [];
    return calculateEMA(displayCandles, indicators.emaPeriod);
  }, [displayCandles, indicators.ema, indicators.emaPeriod]);

  const bbands = useMemo(() => {
    if (!indicators.bbands) return null;
    return calculateBollingerBands(displayCandles, indicators.bbandsPeriod, indicators.bbandsStdDev);
  }, [displayCandles, indicators.bbands, indicators.bbandsPeriod, indicators.bbandsStdDev]);

  const rsiValues = useMemo(() => {
    if (!indicators.rsi) return [];
    return calculateRSI(displayCandles, indicators.rsiPeriod);
  }, [displayCandles, indicators.rsi, indicators.rsiPeriod]);

  const macdValues = useMemo(() => {
    if (!indicators.macd) return null;
    return calculateMACD(displayCandles, indicators.macdFast, indicators.macdSlow, indicators.macdSignal);
  }, [displayCandles, indicators.macd, indicators.macdFast, indicators.macdSlow, indicators.macdSignal]);

  const stochValues = useMemo(() => {
    if (!indicators.stoch) return null;
    return calculateStochastic(displayCandles, indicators.stochK, indicators.stochD);
  }, [displayCandles, indicators.stoch, indicators.stochK, indicators.stochD]);

  // Helper to convert screen (x, y) into chart (time, price)
  const screenToChartCoords = (x: number, y: number) => {
    if (!chartDimsRef.current) return null;
    const {
      maxPrice,
      topPadding,
      chartHeight,
      expandedRange,
      candleWidth,
      firstCandleTime,
      timeframeMs
    } = chartDimsRef.current;

    const price = Number(
      (maxPrice - ((y - topPadding) / chartHeight) * expandedRange).toFixed(activeAsset.decimalPlaces)
    );
    const indexFloat = (x - candleWidth / 2) / candleWidth;
    const time = Math.round(firstCandleTime + indexFloat * timeframeMs);
    return { time, price };
  };

  // Main rendering loop on high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Deep dark background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    if (displayCandles.length < 2) {
      ctx.restore();
      return;
    }

    // Allocate sub-chart space for oscillators
    let subChartTotal = 0;
    if (indicators.rsi) subChartTotal += 55;
    if (indicators.macd) subChartTotal += 55;
    if (indicators.stoch) subChartTotal += 55;

    const rightPadding = 75;
    const bottomPadding = 30 + subChartTotal;
    const topPadding = 18;
    const chartWidth = width - rightPadding;
    const chartHeight = height - bottomPadding - topPadding;

    // Dynamic visible candles & horizontal panning
    const visibleCount = Math.max(14, Math.min(130, zoomVisibleCount));
    const maxPan = Math.max(0, displayCandles.length - visibleCount);
    const clampedPan = Math.max(0, Math.min(maxPan, panOffset));
    const endIdx = displayCandles.length - clampedPan;
    const startIdx = Math.max(0, endIdx - visibleCount);
    const candleSlice = displayCandles.slice(startIdx, endIdx);
    const startIndex = startIdx;

    // Calculate Min & Max Price
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minPriceIndex = 0;

    candleSlice.forEach((c, idx) => {
      if (c.low < minPrice) {
        minPrice = c.low;
        minPriceIndex = idx;
      }
      if (c.high > maxPrice) {
        maxPrice = c.high;
      }
    });

    if (bbands) {
      for (let i = startIndex; i < displayCandles.length; i++) {
        const u = bbands.upper[i];
        const l = bbands.lower[i];
        if (u !== null && u > maxPrice) maxPrice = u;
        if (l !== null && l < minPrice) minPrice = l;
      }
    }

    // Add vertical headroom
    const priceRange = maxPrice - minPrice || 0.0005;
    minPrice -= priceRange * 0.14;
    maxPrice += priceRange * 0.14;
    const expandedRange = maxPrice - minPrice;

    // Coordinates helpers
    const candleWidth = chartWidth / visibleCount;
    const bodyWidth = Math.max(3, candleWidth * 0.68);
    const timeframeMs = 60 * 1000; // 1 minute per candle
    const firstCandleTime = candleSlice[0]?.time || Date.now();

    chartDimsRef.current = {
      minPrice,
      maxPrice,
      topPadding,
      chartHeight,
      chartWidth,
      expandedRange,
      candleWidth,
      firstCandleTime,
      timeframeMs
    };

    const getY = (price: number) => {
      return topPadding + chartHeight - ((price - minPrice) / expandedRange) * chartHeight;
    };

    const getX = (indexInSlice: number) => {
      return indexInSlice * candleWidth + candleWidth / 2;
    };

    const getXFromTime = (timestamp: number) => {
      const idxFloat = (timestamp - firstCandleTime) / timeframeMs;
      return idxFloat * candleWidth + candleWidth / 2;
    };

    // 1. Subtle Grid Lines
    ctx.strokeStyle = '#141a24';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Horizontal price grid lines
    const gridRows = 5;
    for (let i = 0; i <= gridRows; i++) {
      const y = topPadding + (chartHeight / gridRows) * i;
      const priceAtY = maxPrice - (i / gridRows) * expandedRange;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price labels on right axis
      ctx.fillStyle = '#64748b';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatPrice(priceAtY, activeAsset.decimalPlaces), chartWidth + 8, y + 4);
    }

    // Vertical time grid lines
    const gridCols = 5;
    for (let i = 0; i <= gridCols; i++) {
      const x = (chartWidth / gridCols) * i;
      ctx.beginPath();
      ctx.moveTo(x, topPadding);
      ctx.lineTo(x, topPadding + chartHeight);
      ctx.stroke();

      const candleIndex = Math.min(
        candleSlice.length - 1,
        Math.floor((i / gridCols) * candleSlice.length)
      );
      if (candleSlice[candleIndex]) {
        const date = new Date(candleSlice[candleIndex].time);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        ctx.fillStyle = '#64748b';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${hours}:${minutes}`, x, topPadding + chartHeight + 18);
      }
    }

    // 2. Bollinger Bands Fill
    if (bbands) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candleSlice.length; i++) {
        const u = bbands.upper[startIndex + i];
        if (u !== null) {
          const x = getX(i);
          const y = getY(u);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = candleSlice.length - 1; i >= 0; i--) {
        const l = bbands.lower[startIndex + i];
        if (l !== null) {
          const x = getX(i);
          const y = getY(l);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
      ctx.lineWidth = 1;
      ['upper', 'lower'].forEach((b) => {
        ctx.beginPath();
        let s = false;
        for (let i = 0; i < candleSlice.length; i++) {
          const bandsRecord = bbands as unknown as Record<string, (number | null)[]>;
          const val = bandsRecord[b][startIndex + i];
          if (val !== null) {
            const x = getX(i);
            const y = getY(val);
            if (!s) {
              ctx.moveTo(x, y);
              s = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
      });
    }

    // 3. Moving Averages
    if (indicators.sma && smaValues.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.6;
      let started = false;
      for (let i = 0; i < candleSlice.length; i++) {
        const val = smaValues[startIndex + i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    if (indicators.ema && emaValues.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.6;
      let started = false;
      for (let i = 0; i < candleSlice.length; i++) {
        const val = emaValues[startIndex + i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    // 4. Draw Candlesticks / Area / Line
    if (chartType === 'line' || chartType === 'area') {
      ctx.beginPath();
      ctx.strokeStyle = '#00e599';
      ctx.lineWidth = 2;
      candleSlice.forEach((c, idx) => {
        const x = getX(idx);
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      if (chartType === 'area' && candleSlice.length > 0) {
        ctx.lineTo(getX(candleSlice.length - 1), topPadding + chartHeight);
        ctx.lineTo(getX(0), topPadding + chartHeight);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 229, 153, 0.08)';
        ctx.fill();
      }
    } else {
      candleSlice.forEach((c, idx) => {
        const x = getX(idx);
        const isBullish = c.close >= c.open;
        const color = isBullish ? '#00e599' : '#ff4766';

        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.8, Math.abs(closeY - openY));

        ctx.fillStyle = color;
        ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
      });
    }

    // 5. Vertical Lines: Beginning of trade & End of trade (Fixed minute time so it NEVER flickers on trade!)
    const beginningIdx = Math.floor(candleSlice.length * 0.42);
    const beginningX = getX(beginningIdx);
    const endX = getX(Math.floor(candleSlice.length * 0.72));

    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(beginningX, topPadding);
    ctx.lineTo(beginningX, topPadding + chartHeight);
    ctx.stroke();

    const latestCandleTime = candleSlice[candleSlice.length - 1]?.time || Date.now();
    const fixedDate = new Date(latestCandleTime);
    const fixedTimeStr = `${fixedDate.getHours().toString().padStart(2, '0')}:${fixedDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}:00`;

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(beginningX - 45, topPadding + 6, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${fixedTimeStr} Beginning of trade`, beginningX - 35, topPadding + 9);
    ctx.restore();

    // End of trade line
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(endX, topPadding);
    ctx.lineTo(endX, topPadding + chartHeight);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('◀ End of trade', endX + 8, topPadding + 9);
    ctx.restore();

    // 6. Lowest Price Tag
    if (minPriceIndex >= 0 && minPriceIndex < candleSlice.length) {
      const minX = getX(minPriceIndex);
      const lowestActual = candleSlice[minPriceIndex].low;
      const minY = getY(lowestActual);

      ctx.fillStyle = '#18202c';
      ctx.beginPath();
      ctx.roundRect(minX - 25, minY + 8, 50, 16, 4);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(formatPrice(lowestActual, activeAsset.decimalPlaces), minX, minY + 20);
    }

    // 7. User-Drawn Lines (Horizontal, Custom Point-to-Point Trendline, Freehand Pen)
    const renderLineItem = (
      line: {
        type: 'horizontal' | 'trendline' | 'freehand';
        price1: number;
        time1?: number;
        price2?: number;
        time2?: number;
        points?: { time: number; price: number }[];
        color: string;
        label?: string;
      },
      isDraft = false
    ) => {
      if (line.type === 'horizontal') {
        const lineY = getY(line.price1);
        if (lineY >= topPadding && lineY <= topPadding + chartHeight) {
          ctx.save();
          ctx.strokeStyle = line.color || '#eab308';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 3]);
          ctx.beginPath();
          ctx.moveTo(0, lineY);
          ctx.lineTo(chartWidth, lineY);
          ctx.stroke();

          ctx.fillStyle = line.color || '#eab308';
          ctx.beginPath();
          ctx.roundRect(chartWidth + 3, lineY - 10, 68, 20, 4);
          ctx.fill();

          ctx.fillStyle = '#0a0d14';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(formatPrice(line.price1, activeAsset.decimalPlaces), chartWidth + 37, lineY + 4);
          ctx.restore();
        }
      } else if (line.type === 'trendline' && line.price2 !== undefined) {
        const y1 = getY(line.price1);
        const y2 = getY(line.price2);
        const x1 = line.time1 !== undefined ? getXFromTime(line.time1) : candleWidth * 4;
        const x2 = line.time2 !== undefined ? getXFromTime(line.time2) : chartWidth - candleWidth * 4;

        ctx.save();
        ctx.strokeStyle = line.color || '#eab308';
        ctx.lineWidth = 2.2;
        ctx.setLineDash(isDraft ? [4, 3] : []);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Anchor handles at both ends of user-drawn line
        ctx.fillStyle = line.color || '#eab308';
        ctx.beginPath();
        ctx.arc(x1, y1, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y2, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (line.type === 'freehand' && line.points && line.points.length > 1) {
        ctx.save();
        ctx.strokeStyle = line.color || '#eab308';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([]);
        ctx.beginPath();
        line.points.forEach((pt, idx) => {
          const px = getXFromTime(pt.time);
          const py = getY(pt.price);
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.restore();
      }
    };

    drawnLines.forEach((l) => renderLineItem(l, false));
    if (draftLine) {
      renderLineItem({ ...draftLine, color: drawingColor }, true);
    }

    // 8. Active Trades Strike Lines on Chart
    activeTrades.forEach((trade) => {
      if (trade.assetId !== activeAsset.id) return;
      const tradeY = getY(trade.entryPrice);
      const isUp = trade.direction === 'UP';
      const color = isUp ? '#00e599' : '#ff4766';
      const remSec = Math.max(0, Math.ceil((trade.closeTime - Date.now()) / 1000));

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(0, tradeY);
      ctx.lineTo(chartWidth, tradeY);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(8, tradeY - 10, 92, 20, 4);
      ctx.fill();

      ctx.fillStyle = '#0b0e14';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${isUp ? '▲' : '▼'} $${trade.amount} (${remSec}s)`, 54, tradeY + 4);
      ctx.restore();
    });

    // 9. Live Strike Price Line & Strictly 1-Minute Candle Countdown Timer
    // Fixed: Placing a trade NEVER changes or overrides this 1-minute candle countdown timer!
    const currentPrice = activeAsset.currentPrice;
    const currentY = getY(currentPrice);

    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.restore();

    // Strictly 1-minute (60s) candle countdown pill on the current price line
    const candleRemainingSec = 60 - (Math.floor(Date.now() / 1000) % 60);
    const mins = Math.floor(candleRemainingSec / 60);
    const secs = candleRemainingSec % 60;
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const timerPillWidth = 46;
    const timerPillHeight = 18;
    const timerPillX = chartWidth - timerPillWidth - 10;
    const timerPillY = currentY - timerPillHeight / 2;

    ctx.fillStyle = '#1c2430';
    ctx.beginPath();
    ctx.roundRect(timerPillX, timerPillY, timerPillWidth, timerPillHeight, 4);
    ctx.fill();

    ctx.strokeStyle = '#2b3648';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(timeFormatted, timerPillX + timerPillWidth / 2, timerPillY + 13);

    // Cyan Price Badge on Right Axis
    const tagWidth = 66;
    const tagHeight = 22;
    const tagX = chartWidth + 3;
    const tagY = currentY - tagHeight / 2;

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(formatPrice(currentPrice, activeAsset.decimalPlaces), tagX + tagWidth / 2, tagY + 15);

    // 10. Sub-charts: RSI, MACD, Stochastic
    let currentSubY = topPadding + chartHeight + 25;

    if (indicators.rsi && rsiValues.length > 0) {
      const subH = 50;
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, currentSubY, chartWidth, subH);
      ctx.strokeStyle = '#1b2332';
      ctx.strokeRect(0, currentSubY, chartWidth, subH);

      const y70 = currentSubY + subH * 0.3;
      const y30 = currentSubY + subH * 0.7;
      ctx.strokeStyle = '#ef444455';
      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(chartWidth, y70);
      ctx.stroke();
      ctx.strokeStyle = '#22c55e55';
      ctx.beginPath();
      ctx.moveTo(0, y30);
      ctx.lineTo(chartWidth, y30);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      const curRsi = rsiValues[rsiValues.length - 1];
      ctx.fillText(`RSI (${indicators.rsiPeriod}): ${curRsi ? curRsi.toFixed(1) : '--'}`, 6, currentSubY + 12);

      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      let s = false;
      for (let i = 0; i < candleSlice.length; i++) {
        const val = rsiValues[startIndex + i];
        if (val !== null) {
          const x = getX(i);
          const y = currentSubY + subH - (val / 100) * subH;
          if (!s) {
            ctx.moveTo(x, y);
            s = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
      currentSubY += 55;
    }

    if (indicators.macd && macdValues) {
      const subH = 50;
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, currentSubY, chartWidth, subH);
      ctx.strokeStyle = '#1b2332';
      ctx.strokeRect(0, currentSubY, chartWidth, subH);

      ctx.fillStyle = '#10b981';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MACD (12, 26, 9)', 6, currentSubY + 12);

      const midY = currentSubY + subH / 2;
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(chartWidth, midY);
      ctx.stroke();

      for (let i = 0; i < candleSlice.length; i++) {
        const h = macdValues.histogram[startIndex + i];
        if (h !== null) {
          const x = getX(i);
          const barH = Math.min(22, Math.max(-22, h * 1200));
          ctx.fillStyle = barH >= 0 ? '#10b981' : '#f43f5e';
          ctx.fillRect(x - 1.5, midY - barH, 3, barH);
        }
      }
      currentSubY += 55;
    }

    if (indicators.stoch && stochValues) {
      const subH = 50;
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, currentSubY, chartWidth, subH);
      ctx.strokeStyle = '#1b2332';
      ctx.strokeRect(0, currentSubY, chartWidth, subH);

      ctx.fillStyle = '#fb7185';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Stochastic (14, 3)', 6, currentSubY + 12);

      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.3;
      let s = false;
      for (let i = 0; i < candleSlice.length; i++) {
        const val = stochValues.k[startIndex + i];
        if (val !== null) {
          const x = getX(i);
          const y = currentSubY + subH - (val / 100) * subH;
          if (!s) {
            ctx.moveTo(x, y);
            s = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    // 11. Crosshair on touch / mouse
    if (
      mousePos &&
      mousePos.x >= 0 &&
      mousePos.x <= chartWidth &&
      mousePos.y >= topPadding &&
      mousePos.y <= topPadding + chartHeight
    ) {
      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);

      ctx.beginPath();
      ctx.moveTo(mousePos.x, topPadding);
      ctx.lineTo(mousePos.x, topPadding + chartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [
    displayCandles,
    activeAsset,
    chartType,
    indicators,
    activeTrades,
    mousePos,
    smaValues,
    emaValues,
    bbands,
    rsiValues,
    macdValues,
    stochValues,
    timeframe,
    accountType,
    drawnLines,
    draftLine,
    drawingColor,
    zoomVisibleCount,
    panOffset
  ]);

  // ResizeObserver for reliable layout updates
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Start drawing or panning with Mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeDrawingTool !== 'none') {
      const coords = screenToChartCoords(x, y);
      if (!coords) return;

      if (activeDrawingTool === 'horizontal') {
        addDrawnLine({
          type: 'horizontal',
          price1: coords.price,
          color: drawingColor
        });
        return;
      }

      isDrawingRef.current = true;
      setDraftLine({
        type: activeDrawingTool === 'freehand' ? 'freehand' : 'trendline',
        time1: coords.time,
        price1: coords.price,
        time2: coords.time,
        price2: coords.price,
        points: [{ time: coords.time, price: coords.price }]
      });
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = { startX: e.clientX, initialPan: panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawingRef.current && draftLine) {
      const coords = screenToChartCoords(x, y);
      if (coords) {
        setDraftLine((prev) =>
          prev
            ? {
                ...prev,
                time2: coords.time,
                price2: coords.price,
                points: [...prev.points, { time: coords.time, price: coords.price }]
              }
            : null
        );
      }
      setMousePos({ x, y });
      return;
    }

    if (isDraggingRef.current && dragStartRef.current && chartDimsRef.current) {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const candleW = Math.max(4, chartDimsRef.current.candleWidth || 8);
      const deltaCandles = Math.round(deltaX / candleW);
      const newPan = Math.max(0, dragStartRef.current.initialPan + deltaCandles);
      setPanOffset(newPan);
    }

    setMousePos({ x, y });
  };

  const finishDrawing = () => {
    if (isDrawingRef.current && draftLine) {
      isDrawingRef.current = false;
      if (draftLine.type === 'freehand' && draftLine.points.length > 1) {
        addDrawnLine({
          type: 'freehand',
          price1: draftLine.price1,
          points: draftLine.points,
          color: drawingColor
        });
      } else {
        // If user tapped without dragging, create a clean visible segment around the tap point
        const timeSpan =
          Math.abs(draftLine.time2 - draftLine.time1) < 1000
            ? 60 * 1000 * 6
            : draftLine.time2 - draftLine.time1;
        addDrawnLine({
          type: 'trendline',
          time1: draftLine.time1,
          price1: draftLine.price1,
          time2: draftLine.time1 + timeSpan,
          price2: draftLine.price2,
          color: drawingColor
        });
      }
      setDraftLine(null);
    }
    isDraggingRef.current = false;
    dragStartRef.current = null;
  };

  const handleMouseUp = () => {
    finishDrawing();
  };

  const handleMouseLeave = () => {
    finishDrawing();
    setMousePos(null);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.touches.length === 2) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDistRef.current = dist;
      initialZoomRef.current = zoomVisibleCount;
    } else if (e.touches.length === 1) {
      const clickX = e.touches[0].clientX - rect.left;
      const clickY = e.touches[0].clientY - rect.top;

      // Interactive Pen Tool Drawing on Touch
      if (activeDrawingTool !== 'none') {
        const coords = screenToChartCoords(clickX, clickY);
        if (!coords) return;

        if (activeDrawingTool === 'horizontal') {
          addDrawnLine({
            type: 'horizontal',
            price1: coords.price,
            color: drawingColor
          });
          return;
        }

        isDrawingRef.current = true;
        setDraftLine({
          type: activeDrawingTool === 'freehand' ? 'freehand' : 'trendline',
          time1: coords.time,
          price1: coords.price,
          time2: coords.time,
          price2: coords.price,
          points: [{ time: coords.time, price: coords.price }]
        });
        return;
      }

      isDraggingRef.current = true;
      dragStartRef.current = { startX: e.touches[0].clientX, initialPan: panOffset };
      setMousePos({ x: clickX, y: clickY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.touches.length === 1 && isDrawingRef.current && draftLine) {
      const moveX = e.touches[0].clientX - rect.left;
      const moveY = e.touches[0].clientY - rect.top;
      const coords = screenToChartCoords(moveX, moveY);
      if (coords) {
        setDraftLine((prev) =>
          prev
            ? {
                ...prev,
                time2: coords.time,
                price2: coords.price,
                points: [...prev.points, { time: coords.time, price: coords.price }]
              }
            : null
        );
      }
      setMousePos({ x: moveX, y: moveY });
      return;
    }

    if (e.touches.length === 2 && touchStartDistRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (currentDist > 10 && touchStartDistRef.current > 10) {
        const scale = currentDist / touchStartDistRef.current;
        const targetCount = Math.round(initialZoomRef.current / scale);
        const clamped = Math.max(14, Math.min(130, targetCount));
        setZoomVisibleCount(clamped);
      }
    } else if (e.touches.length === 1 && isDraggingRef.current && dragStartRef.current && chartDimsRef.current) {
      const deltaX = e.touches[0].clientX - dragStartRef.current.startX;
      const candleW = Math.max(4, chartDimsRef.current.candleWidth || 8);
      const deltaCandles = Math.round(deltaX / candleW);
      const newPan = Math.max(0, dragStartRef.current.initialPan + deltaCandles);
      setPanOffset(newPan);

      setMousePos({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      });
    }
  };

  const handleTouchEnd = () => {
    if (isDrawingRef.current) {
      finishDrawing();
    }
    touchStartDistRef.current = null;
    isDraggingRef.current = false;
    dragStartRef.current = null;
    setTimeout(() => {
      setMousePos(null);
    }, 1200);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  const anyIndicatorActive =
    indicators.sma ||
    indicators.ema ||
    indicators.bbands ||
    indicators.rsi ||
    indicators.macd ||
    indicators.stoch;

  const penColors = ['#eab308', '#00e599', '#ff3355', '#38bdf8', '#c084fc', '#ffffff'];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden touch-none ${className || ''}`}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="block w-full h-full cursor-crosshair touch-none"
      />

      {/* When Chart Buttons are HIDDEN: tiny discrete toggle button in top-left to Show them again */}
      {!showChartButtons && (
        <button
          onClick={() => setShowChartButtons(true)}
          className="absolute left-2.5 top-2.5 z-20 w-7 h-7 rounded-lg bg-[#141b27]/60 hover:bg-[#1b2332] border border-[#2b374c]/60 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Show Chart Buttons"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Floating Buttons on the Left (Can be hidden & shown anytime) */}
      {showChartButtons && (
        <div className="absolute left-3 top-3.5 flex flex-col gap-2 z-10">
          {/* Three dots options */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl bg-[#1b2332]/90 backdrop-blur-md border border-[#2b374c] text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            title="Chart Options & Settings"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Indicators Manager Tool */}
          <button
            onClick={() => onOpenIndicators && onOpenIndicators('ALL')}
            className={`relative w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
              anyIndicatorActive
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-400'
                : 'bg-[#1b2332]/90 border-[#2b374c] text-slate-300 hover:text-white'
            }`}
            title="Technical Indicators"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Pen Tool: Toggles Direct Interactive Line Drawing on Chart */}
          <button
            onClick={() => {
              setActiveDrawingTool(activeDrawingTool === 'none' ? 'trendline' : 'none');
            }}
            className={`relative w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
              activeDrawingTool !== 'none'
                ? 'bg-amber-400 border-amber-300 text-slate-950'
                : drawnLines.length > 0
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-400'
                : 'bg-[#1b2332]/90 border-[#2b374c] text-slate-300 hover:text-white'
            }`}
            title="Pen Tool (Draw Lines Yourself on Chart)"
          >
            <PenTool className="w-4 h-4" />
            {drawnLines.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {drawnLines.length}
              </span>
            )}
          </button>

          {/* Briefcase active trades button with badge */}
          <button
            onClick={onOpenActiveTrades}
            className="relative w-10 h-10 rounded-xl bg-[#1b2332]/90 backdrop-blur-md border border-[#2b374c] text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            title="Active Orders"
          >
            <Briefcase className="w-5 h-5 text-slate-300" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#0284c7] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
              {activeTrades.length}
            </span>
          </button>

          {/* Hide Floating Buttons Toggle */}
          <button
            onClick={() => setShowChartButtons(false)}
            className="w-10 h-8 rounded-xl bg-[#141b27]/85 backdrop-blur-md border border-[#232f42] text-slate-400 hover:text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
            title="Hide Chart Buttons"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Pen Tool Floating Toolbar (When Pen Tool is Active) */}
      {activeDrawingTool !== 'none' && (
        <div className="absolute top-3.5 left-15 right-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-[#121926]/95 backdrop-blur-md border border-amber-400/50 rounded-xl px-2.5 py-1.5 shadow-2xl">
          {/* Drawing Mode Selector */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveDrawingTool('trendline')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                activeDrawingTool === 'trendline'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-[#1c2638] text-slate-300 hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setActiveDrawingTool('freehand')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                activeDrawingTool === 'freehand'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-[#1c2638] text-slate-300 hover:text-white'
              }`}
            >
              Pen
            </button>
            <button
              onClick={() => setActiveDrawingTool('horizontal')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                activeDrawingTool === 'horizontal'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-[#1c2638] text-slate-300 hover:text-white'
              }`}
            >
              Level
            </button>
          </div>

          {/* Color Dots */}
          <div className="flex items-center gap-1">
            {penColors.map((c) => (
              <button
                key={c}
                onClick={() => setDrawingColor(c)}
                className={`w-4 h-4 rounded-full border cursor-pointer transition-transform ${
                  drawingColor === c ? 'border-white scale-125' : 'border-transparent opacity-75'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Actions: Undo, Clear, Close */}
          <div className="flex items-center gap-1">
            {drawnLines.length > 0 && (
              <>
                <button
                  onClick={undoLastDrawnLine}
                  className="p-1 rounded-lg bg-[#1c2638] text-slate-300 hover:text-white cursor-pointer"
                  title="Undo Last Line"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={clearDrawnLines}
                  className="p-1 rounded-lg bg-rose-950/60 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Clear All Lines"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={() => setActiveDrawingTool('none')}
              className="p-1 rounded-lg bg-[#1c2638] text-slate-300 hover:text-white cursor-pointer"
              title="Done Drawing"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Zoom & Pan Controls (Shown when showChartButtons is true) */}
      {showChartButtons && (
        <div className="absolute right-3 bottom-12 flex flex-col items-center gap-1.5 z-10 bg-[#121824]/90 backdrop-blur-md p-1 rounded-xl border border-[#232f42] shadow-2xl">
          <button
            onClick={zoomIn}
            className="w-8 h-8 rounded-lg bg-[#1a2332] hover:bg-[#253348] text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>

          <span className="text-[9px] font-mono font-bold text-cyan-400 px-0.5 select-none">
            1m
          </span>

          <button
            onClick={zoomOut}
            className="w-8 h-8 rounded-lg bg-[#1a2332] hover:bg-[#253348] text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setPanOffset((prev) => prev + 12)}
            className="w-8 h-7 rounded-lg bg-[#161f2e] hover:bg-[#223046] text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer border-t border-[#222e40]"
            title="Scroll Back"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setPanOffset((prev) => Math.max(0, prev - 12))}
            disabled={panOffset === 0}
            className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
              panOffset === 0
                ? 'opacity-40 text-slate-600 bg-transparent'
                : 'bg-[#161f2e] hover:bg-[#223046] text-slate-300 hover:text-white'
            }`}
            title="Scroll Forward"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              resetZoom();
              setPanOffset(0);
            }}
            className="w-8 h-6 rounded-md bg-[#141b27] hover:bg-[#1d2738] text-slate-400 hover:text-slate-200 text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer"
            title="Reset Zoom & Snap to Live"
          >
            1:1
          </button>
        </div>
      )}

      {/* Mini Asset Switching Loading Overlay */}
      {isAssetLoading && (
        <div className="absolute inset-0 bg-[#0a0d14]/70 backdrop-blur-xs flex items-center justify-center z-20 animate-fadeIn">
          <div className="bg-[#141b27] px-4 py-2 rounded-xl border border-[#253246] flex items-center gap-2 text-xs font-bold text-cyan-400 shadow-xl">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span>Loading {activeAsset.symbol} Market...</span>
          </div>
        </div>
      )}
    </div>
  );
};
