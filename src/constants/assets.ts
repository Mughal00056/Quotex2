import { Asset, Candle } from '../types/trading';

export const INITIAL_ASSETS: Asset[] = [
  // Forex OTC (Matching Screenshot first!)
  {
    id: 'eur_chf_otc',
    name: 'EUR/CHF (OTC)',
    symbol: 'EUR/CHF',
    category: 'Forex OTC',
    payout: 85,
    currentPrice: 0.93093,
    change24h: 0.12,
    decimalPlaces: 5,
    basePrice: 0.93093,
    volatility: 0.00010,
    isOtc: true
  },
  {
    id: 'eur_usd_otc',
    name: 'EUR/USD (OTC)',
    symbol: 'EUR/USD',
    category: 'Forex OTC',
    payout: 93,
    currentPrice: 1.08425,
    change24h: 0.35,
    decimalPlaces: 5,
    basePrice: 1.08425,
    volatility: 0.00014,
    isOtc: true
  },
  {
    id: 'gbp_usd_otc',
    name: 'GBP/USD (OTC)',
    symbol: 'GBP/USD',
    category: 'Forex OTC',
    payout: 91,
    currentPrice: 1.29180,
    change24h: -0.18,
    decimalPlaces: 5,
    basePrice: 1.29180,
    volatility: 0.00018,
    isOtc: true
  },
  {
    id: 'usd_jpy_otc',
    name: 'USD/JPY (OTC)',
    symbol: 'USD/JPY',
    category: 'Forex OTC',
    payout: 89,
    currentPrice: 154.620,
    change24h: 0.74,
    decimalPlaces: 3,
    basePrice: 154.620,
    volatility: 0.035,
    isOtc: true
  },
  {
    id: 'aud_cad_otc',
    name: 'AUD/CAD (OTC)',
    symbol: 'AUD/CAD',
    category: 'Forex OTC',
    payout: 88,
    currentPrice: 0.89240,
    change24h: -0.42,
    decimalPlaces: 5,
    basePrice: 0.89240,
    volatility: 0.00016,
    isOtc: true
  },
  {
    id: 'eur_jpy_otc',
    name: 'EUR/JPY (OTC)',
    symbol: 'EUR/JPY',
    category: 'Forex OTC',
    payout: 90,
    currentPrice: 167.580,
    change24h: 0.52,
    decimalPlaces: 3,
    basePrice: 167.580,
    volatility: 0.038,
    isOtc: true
  },
  {
    id: 'gbp_jpy_otc',
    name: 'GBP/JPY (OTC)',
    symbol: 'GBP/JPY',
    category: 'Forex OTC',
    payout: 92,
    currentPrice: 199.450,
    change24h: 0.85,
    decimalPlaces: 3,
    basePrice: 199.450,
    volatility: 0.045,
    isOtc: true
  },
  {
    id: 'usd_cad_otc',
    name: 'USD/CAD (OTC)',
    symbol: 'USD/CAD',
    category: 'Forex OTC',
    payout: 87,
    currentPrice: 1.39120,
    change24h: 0.22,
    decimalPlaces: 5,
    basePrice: 1.39120,
    volatility: 0.00017,
    isOtc: true
  },
  {
    id: 'nzd_usd_otc',
    name: 'NZD/USD (OTC)',
    symbol: 'NZD/USD',
    category: 'Forex OTC',
    payout: 86,
    currentPrice: 0.59840,
    change24h: -0.31,
    decimalPlaces: 5,
    basePrice: 0.59840,
    volatility: 0.00015,
    isOtc: true
  },
  {
    id: 'eur_gbp_otc',
    name: 'EUR/GBP (OTC)',
    symbol: 'EUR/GBP',
    category: 'Forex OTC',
    payout: 89,
    currentPrice: 0.83940,
    change24h: 0.14,
    decimalPlaces: 5,
    basePrice: 0.83940,
    volatility: 0.00012,
    isOtc: true
  },
  {
    id: 'usd_chf_otc',
    name: 'USD/CHF (OTC)',
    symbol: 'USD/CHF',
    category: 'Forex OTC',
    payout: 87,
    currentPrice: 0.88450,
    change24h: -0.09,
    decimalPlaces: 5,
    basePrice: 0.88450,
    volatility: 0.00013,
    isOtc: true
  },

  // Crypto
  {
    id: 'btc_usd_otc',
    name: 'BTC/USD (OTC)',
    symbol: 'BTC/USD',
    category: 'Crypto',
    payout: 92,
    currentPrice: 89450.00,
    change24h: 3.25,
    decimalPlaces: 2,
    basePrice: 89450.00,
    volatility: 22.50,
    isOtc: true
  },
  {
    id: 'eth_usd_otc',
    name: 'ETH/USD (OTC)',
    symbol: 'ETH/USD',
    category: 'Crypto',
    payout: 89,
    currentPrice: 3420.50,
    change24h: 1.85,
    decimalPlaces: 2,
    basePrice: 3420.50,
    volatility: 1.85,
    isOtc: true
  },
  {
    id: 'sol_usd_otc',
    name: 'SOL/USD (OTC)',
    symbol: 'SOL/USD',
    category: 'Crypto',
    payout: 91,
    currentPrice: 198.40,
    change24h: 4.60,
    decimalPlaces: 2,
    basePrice: 198.40,
    volatility: 0.28,
    isOtc: true
  },
  {
    id: 'xrp_usd_otc',
    name: 'XRP/USD (OTC)',
    symbol: 'XRP/USD',
    category: 'Crypto',
    payout: 88,
    currentPrice: 1.8420,
    change24h: 2.10,
    decimalPlaces: 4,
    basePrice: 1.8420,
    volatility: 0.0025,
    isOtc: true
  },
  {
    id: 'doge_usd_otc',
    name: 'DOGE/USD (OTC)',
    symbol: 'DOGE/USD',
    category: 'Crypto',
    payout: 86,
    currentPrice: 0.3840,
    change24h: 5.40,
    decimalPlaces: 4,
    basePrice: 0.3840,
    volatility: 0.0012,
    isOtc: true
  },

  // Commodities
  {
    id: 'gold_otc',
    name: 'Gold (OTC)',
    symbol: 'XAU/USD',
    category: 'Commodities',
    payout: 94,
    currentPrice: 2684.30,
    change24h: 0.65,
    decimalPlaces: 2,
    basePrice: 2684.30,
    volatility: 0.75,
    isOtc: true
  },
  {
    id: 'silver_otc',
    name: 'Silver (OTC)',
    symbol: 'XAG/USD',
    category: 'Commodities',
    payout: 88,
    currentPrice: 31.45,
    change24h: 0.90,
    decimalPlaces: 2,
    basePrice: 31.45,
    volatility: 0.045,
    isOtc: true
  },
  {
    id: 'crude_oil_otc',
    name: 'Crude Oil (OTC)',
    symbol: 'USOIL',
    category: 'Commodities',
    payout: 86,
    currentPrice: 71.45,
    change24h: -1.15,
    decimalPlaces: 2,
    basePrice: 71.45,
    volatility: 0.065,
    isOtc: true
  },
  {
    id: 'brent_oil_otc',
    name: 'Brent Oil (OTC)',
    symbol: 'UKOIL',
    category: 'Commodities',
    payout: 87,
    currentPrice: 75.80,
    change24h: -0.85,
    decimalPlaces: 2,
    basePrice: 75.80,
    volatility: 0.070,
    isOtc: true
  },

  // Stocks OTC
  {
    id: 'apple_otc',
    name: 'Apple Inc. (OTC)',
    symbol: 'AAPL',
    category: 'Stocks OTC',
    payout: 91,
    currentPrice: 228.60,
    change24h: 1.25,
    decimalPlaces: 2,
    basePrice: 228.60,
    volatility: 0.18,
    isOtc: true
  },
  {
    id: 'tesla_otc',
    name: 'Tesla Inc. (OTC)',
    symbol: 'TSLA',
    category: 'Stocks OTC',
    payout: 92,
    currentPrice: 315.40,
    change24h: 4.10,
    decimalPlaces: 2,
    basePrice: 315.40,
    volatility: 0.35,
    isOtc: true
  },
  {
    id: 'microsoft_otc',
    name: 'Microsoft (OTC)',
    symbol: 'MSFT',
    category: 'Stocks OTC',
    payout: 89,
    currentPrice: 424.80,
    change24h: 0.70,
    decimalPlaces: 2,
    basePrice: 424.80,
    volatility: 0.25,
    isOtc: true
  },
  {
    id: 'amazon_otc',
    name: 'Amazon (OTC)',
    symbol: 'AMZN',
    category: 'Stocks OTC',
    payout: 88,
    currentPrice: 206.50,
    change24h: 1.45,
    decimalPlaces: 2,
    basePrice: 206.50,
    volatility: 0.22,
    isOtc: true
  }
];

// Generates independent deterministic-seeded historical candles per asset
export function generateHistoricalCandles(
  asset: Asset,
  timeframeSeconds: number = 60,
  count: number = 220
): Candle[] {
  const candles: Candle[] = [];
  let currentClose = asset.basePrice;
  const timeStep = timeframeSeconds * 1000;
  const currentBucket = Math.floor(Date.now() / timeStep) * timeStep;
  const startTime = currentBucket - (count - 1) * timeStep;

  // Simple pseudo-random hash generator based on asset ID for completely distinct graph shape
  let seed = 0;
  for (let c = 0; c < asset.id.length; c++) {
    seed = (seed * 31 + asset.id.charCodeAt(c)) & 0xffffffff;
  }

  const pseudoRandom = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    const candleTime = startTime + i * timeStep;
    const open = currentClose;
    // Mean reversion + asset-specific wave
    const meanPull = (asset.basePrice - open) * 0.04;
    const wave = Math.sin(i / 14 + (seed % 10)) * asset.volatility * 0.8;
    const noise = (pseudoRandom() - 0.495) * asset.volatility * 1.8;
    const change = noise + meanPull + wave * 0.25;
    const close = Number((open + change).toFixed(asset.decimalPlaces));

    const wickSpread = asset.volatility * (0.3 + pseudoRandom() * 0.7);
    const high = Number((Math.max(open, close) + wickSpread).toFixed(asset.decimalPlaces));
    const low = Number((Math.min(open, close) - wickSpread).toFixed(asset.decimalPlaces));
    const volume = Math.floor(40 + pseudoRandom() * 220);

    candles.push({
      time: candleTime,
      open,
      high,
      low,
      close,
      volume
    });

    currentClose = close;
  }

  return candles;
}
