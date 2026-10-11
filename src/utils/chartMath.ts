import { Candle } from '../types/trading';

export function calculateSMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[i - j].close;
      }
      result.push(sum / period);
    }
  }
  return result;
}

export function calculateEMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prevEma: number | null = null;

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[i - j].close;
      }
      prevEma = sum / period;
      result.push(prevEma);
    } else {
      const currentClose = candles[i].close;
      const baseEma: number = prevEma !== null ? prevEma : currentClose;
      const currentEma: number = (currentClose - baseEma) * k + baseEma;
      prevEma = currentEma;
      result.push(currentEma);
    }
  }
  return result;
}

export interface BollingerBandsResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsResult {
  const middle = calculateSMA(candles, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    const smaVal = middle[i];
    if (smaVal === null) {
      upper.push(null);
      lower.push(null);
    } else {
      let varianceSum = 0;
      for (let j = 0; j < period; j++) {
        varianceSum += Math.pow(candles[i - j].close - smaVal, 2);
      }
      const stdDev = Math.sqrt(varianceSum / period);
      upper.push(smaVal + stdDev * stdDevMultiplier);
      lower.push(smaVal - stdDev * stdDevMultiplier);
    }
  }

  return { upper, middle, lower };
}

export function calculateRSI(candles: Candle[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (candles.length < period + 1) {
    return candles.map(() => null);
  }

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    gains.push(diff >= 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  result.push(null); // first candle has no diff

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
    result.push(null);
  }

  avgGain /= period;
  avgLoss /= period;

  const firstRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + firstRs)));

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }
  }

  return result;
}

export interface MACDResult {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);
  const macdLine: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f !== null && s !== null) {
      macdLine.push(f - s);
    } else {
      macdLine.push(null);
    }
  }

  // Calculate signal line as EMA of macdLine
  const signalLine: (number | null)[] = [];
  const k = 2 / (signalPeriod + 1);
  let prevSignal: number | null = null;
  const validMacd: { val: number; origIdx: number }[] = [];

  macdLine.forEach((val, idx) => {
    if (val !== null) validMacd.push({ val, origIdx: idx });
  });

  const signalMap = new Map<number, number>();

  if (validMacd.length >= signalPeriod) {
    let sum = 0;
    for (let i = 0; i < signalPeriod; i++) {
      sum += validMacd[i].val;
    }
    prevSignal = sum / signalPeriod;
    signalMap.set(validMacd[signalPeriod - 1].origIdx, prevSignal);

    for (let i = signalPeriod; i < validMacd.length; i++) {
      const cur = validMacd[i].val;
      const baseSignal: number = prevSignal !== null ? prevSignal : cur;
      const sig: number = (cur - baseSignal) * k + baseSignal;
      prevSignal = sig;
      signalMap.set(validMacd[i].origIdx, sig);
    }
  }

  const histogram: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    const sig = signalMap.get(i) ?? null;
    signalLine.push(sig);
    const m = macdLine[i];
    if (m !== null && sig !== null) {
      histogram.push(m - sig);
    } else {
      histogram.push(null);
    }
  }

  return { macdLine, signalLine, histogram };
}

export interface StochasticResult {
  k: (number | null)[];
  d: (number | null)[];
}

export function calculateStochastic(
  candles: Candle[],
  periodK: number = 14,
  periodD: number = 3
): StochasticResult {
  const kList: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < periodK - 1) {
      kList.push(null);
    } else {
      let lowest = Infinity;
      let highest = -Infinity;
      for (let j = 0; j < periodK; j++) {
        const c = candles[i - j];
        if (c.low < lowest) lowest = c.low;
        if (c.high > highest) highest = c.high;
      }
      const range = highest - lowest;
      if (range === 0) {
        kList.push(50);
      } else {
        const currentClose = candles[i].close;
        kList.push(((currentClose - lowest) / range) * 100);
      }
    }
  }

  // Smooth K with SMA to get D
  const dList: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < periodK - 1 + periodD - 1) {
      dList.push(null);
    } else {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < periodD; j++) {
        const val = kList[i - j];
        if (val !== null) {
          sum += val;
          count++;
        }
      }
      dList.push(count > 0 ? sum / count : null);
    }
  }

  return { k: kList, d: dList };
}

export function toHeikinAshi(candles: Candle[]): Candle[] {
  if (candles.length === 0) return [];
  const haCandles: Candle[] = [];

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const haClose = (c.open + c.high + c.low + c.close) / 4;
    let haOpen: number;
    if (i === 0) {
      haOpen = (c.open + c.close) / 2;
    } else {
      haOpen = (haCandles[i - 1].open + haCandles[i - 1].close) / 2;
    }
    const haHigh = Math.max(c.high, haOpen, haClose);
    const haLow = Math.min(c.low, haOpen, haClose);

    haCandles.push({
      time: c.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: c.volume
    });
  }

  return haCandles;
}

export function formatPrice(price: number, decimalPlaces: number = 5): string {
  return price.toFixed(decimalPlaces);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
