export type AssetCategory = 'Forex OTC' | 'Crypto' | 'Commodities' | 'Indices' | 'Stocks OTC';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  category: AssetCategory;
  payout: number; // e.g. 92%
  currentPrice: number;
  change24h: number;
  decimalPlaces: number;
  basePrice: number;
  volatility: number;
  isOtc?: boolean;
}

export interface Candle {
  time: number; // timestamp in ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TradeDirection = 'UP' | 'DOWN';
export type TradeStatus = 'OPEN' | 'WON' | 'LOST' | 'TIE';
export type AccountType = 'DEMO' | 'REAL';

export interface OrderToast {
  id: string;
  direction: 'UP' | 'DOWN';
  amount: number;
  assetSymbol: string;
  price: number;
  payoutRate: number;
  timestamp: number;
}

export interface Trade {
  id: string;
  assetId: string;
  assetName: string;
  direction: TradeDirection;
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  payoutRate: number; // e.g. 90
  potentialProfit: number;
  actualProfit?: number;
  status: TradeStatus;
  openTime: number; // timestamp in ms
  closeTime: number; // timestamp in ms
  durationSeconds: number;
  accountType: AccountType;
}

export type DepositStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
export type WithdrawalStatus = 'APPROVED' | 'PENDING' | 'PROCESSING' | 'REJECTED';

export interface DepositTransaction {
  id: string;
  amount: number;
  bonusAmount: number;
  totalCredited: number;
  method: string;
  txHash: string;
  status: DepositStatus;
  createdAt: number;
  accountType: AccountType;
  network?: string;
  promoCode?: string;
}

export interface WithdrawalTransaction {
  id: string;
  amount: number;
  method: string;
  destinationAccount: string;
  status: WithdrawalStatus;
  createdAt: number;
  accountType: AccountType;
  txId?: string;
}

export type ChartType = 'candlestick' | 'line' | 'area' | 'heikinAshi';

export type CandleColorScheme = 'classic' | 'blue_orange' | 'neon' | 'gold_purple' | 'hollow_pro';

export interface CandleColorPalette {
  id: CandleColorScheme;
  label: string;
  subtitle: string;
  bullish: string;
  bearish: string;
}

export const CANDLE_COLOR_SCHEMES: Record<CandleColorScheme, CandleColorPalette> = {
  classic: {
    id: 'classic',
    label: 'Classic (Green / Red)',
    subtitle: 'Standard Quotex Emerald & Crimson',
    bullish: '#10b981',
    bearish: '#ef4444'
  },
  blue_orange: {
    id: 'blue_orange',
    label: 'Blue / Orange',
    subtitle: 'High-contrast Electric Blue & Vivid Orange',
    bullish: '#3b82f6',
    bearish: '#f97316'
  },
  neon: {
    id: 'neon',
    label: 'Neon (Cyan / Magenta)',
    subtitle: 'Cyberpunk Neon Mint & Hot Pink',
    bullish: '#00f5d4',
    bearish: '#ff007f'
  },
  gold_purple: {
    id: 'gold_purple',
    label: 'VIP (Gold / Purple)',
    subtitle: 'Luxury Gold Bullish & Royal Violet Bearish',
    bullish: '#facc15',
    bearish: '#a855f7'
  },
  hollow_pro: {
    id: 'hollow_pro',
    label: 'Vibrant (Lime / Coral)',
    subtitle: 'Ultra-bright Lime & Coral Red',
    bullish: '#00e599',
    bearish: '#ff3355'
  }
};

export interface IndicatorSettings {
  sma: boolean;
  smaPeriod: number;
  ema: boolean;
  emaPeriod: number;
  bbands: boolean;
  bbandsPeriod: number;
  bbandsStdDev: number;
  rsi: boolean;
  rsiPeriod: number;
  macd: boolean;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  stoch: boolean;
  stochK: number;
  stochD: number;
  parabolicSar: boolean;
}

export type DrawingToolType = 'none' | 'horizontal' | 'trendline' | 'freehand';

export interface DrawnLine {
  id: string;
  type: 'horizontal' | 'trendline' | 'freehand';
  price1: number;
  time1?: number;
  price2?: number;
  time2?: number;
  points?: { time: number; price: number }[];
  color: string;
  label?: string;
}

export type MarketBehaviorMode = 
  | 'smart_push' // Smooth gentle upward/downward follow (Win mode)
  | 'force_loss' // Force lose mode when toggled ON
  | 'realistic'  // Realistic trading mix of both Win and Lose
  | 'bull_trend' // Strong uptrend
  | 'bear_trend'; // Strong downtrend
