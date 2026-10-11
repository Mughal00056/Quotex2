import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  Asset,
  Candle,
  Trade,
  TradeDirection,
  TradeStatus,
  AccountType,
  DepositTransaction,
  WithdrawalTransaction,
  ChartType,
  IndicatorSettings,
  MarketBehaviorMode,
  DrawnLine,
  DrawingToolType,
  OrderToast
} from '../types/trading';
import { INITIAL_ASSETS, generateHistoricalCandles } from '../constants/assets';
import { sounds } from '../utils/audio';

interface TradingContextType {
  // Accounts
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  demoBalance: number;
  realBalance: number;
  resetDemoBalance: () => void;
  setRealBalanceDirect: (amount: number) => void;
  removeRealMoney: (amount?: number) => void;
  isVipPurpleLive: boolean;

  // Assets & Separate Graphs per Asset
  assets: Asset[];
  activeAsset: Asset;
  setActiveAsset: (asset: Asset) => void;
  candles: Candle[];
  timeframe: number;
  setTimeframe: (seconds: number) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  indicators: IndicatorSettings;
  setIndicators: React.Dispatch<React.SetStateAction<IndicatorSettings>>;

  // Drawing Tools (Interactive Pen Tool on Chart)
  drawnLines: DrawnLine[];
  addDrawnLine: (line: Omit<DrawnLine, 'id'>) => void;
  removeDrawnLine: (id: string) => void;
  undoLastDrawnLine: () => void;
  clearDrawnLines: () => void;
  activeDrawingTool: DrawingToolType;
  setActiveDrawingTool: (tool: DrawingToolType) => void;
  drawingColor: string;
  setDrawingColor: (color: string) => void;

  // UI & Visibility Toggles
  showChartButtons: boolean;
  setShowChartButtons: (show: boolean) => void;
  showOrderToastEnabled: boolean;
  setShowOrderToastEnabled: (enabled: boolean) => void;

  // Leaderboard User Identity
  traderName: string;
  setTraderName: (name: string) => void;
  traderFlag: string;
  setTraderFlag: (flag: string) => void;
  customLeaderboardProfit: number | null;
  setCustomLeaderboardProfit: (profit: number | null) => void;
  customLeaderboardRank: number | null;
  setCustomLeaderboardRank: (rank: number | null) => void;

  // Market & Engine Mode (Win / Force Loss / Real Mix)
  isOnlineMode: boolean;
  setIsOnlineMode: (online: boolean) => void;
  marketBehaviorMode: MarketBehaviorMode;
  setMarketBehaviorMode: (mode: MarketBehaviorMode) => void;

  // Trading Actions
  activeTrades: Trade[];
  tradeHistory: Trade[];
  placeTrade: (direction: TradeDirection, amount: number, durationSeconds: number) => boolean;
  lastClosedTrade: Trade | null;
  clearLastClosedTrade: () => void;
  orderToast: OrderToast | null;
  clearOrderToast: () => void;

  // Cashier
  deposits: DepositTransaction[];
  withdrawals: WithdrawalTransaction[];
  depositFunds: (amount: number, method: string, promoCode?: string) => DepositTransaction;
  withdrawFunds: (amount: number, method: string, destinationAccount: string) => { success: boolean; message: string; transaction?: WithdrawalTransaction };
  approveWithdrawal: (id: string) => void;
  clearAllHistory: () => void;

  // Zoom
  zoomVisibleCount: number;
  setZoomVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Sound
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Loading state
  isAssetLoading: boolean;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DEMO_BALANCE: 'quotex_demo_balance',
  REAL_BALANCE: 'quotex_real_balance_v2',
  ACCOUNT_TYPE: 'quotex_account_type',
  ACTIVE_ASSET_ID: 'quotex_active_asset_id',
  TRADE_HISTORY: 'quotex_trade_history',
  DEPOSITS: 'quotex_deposits_history_v2',
  WITHDRAWALS: 'quotex_withdrawals_history',
  MARKET_MODE: 'quotex_market_mode',
  SOUND_ENABLED: 'quotex_sound_enabled',
  DRAWN_LINES: 'quotex_drawn_lines',
  SHOW_CHART_BUTTONS: 'quotex_show_chart_buttons',
  SHOW_ORDER_TOAST: 'quotex_show_order_toast',
  TRADER_NAME: 'quotex_trader_name',
  TRADER_FLAG: 'quotex_trader_flag',
  CUSTOM_LB_PROFIT: 'quotex_custom_lb_profit',
  CUSTOM_LB_RANK: 'quotex_custom_lb_rank',
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Account balances (Live starts at $0.00 with money removed as requested, customizable anytime)
  const [accountType, setAccountTypeState] = useState<AccountType>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ACCOUNT_TYPE) as AccountType) || 'DEMO';
  });

  const [demoBalance, setDemoBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEMO_BALANCE);
    return saved !== null ? parseFloat(saved) : 10000;
  });

  const [realBalance, setRealBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REAL_BALANCE);
    return saved !== null ? parseFloat(saved) : 0.00;
  });

  // Purple LIVE + Crown when Live balance crosses $100,000
  const isVipPurpleLive = realBalance >= 100000;

  // 2. Assets & Active Asset
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [activeAssetId, setActiveAssetId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ASSET_ID) || INITIAL_ASSETS[0].id;
  });

  const activeAsset = assets.find((a) => a.id === activeAssetId) || assets[0];
  const [isAssetLoading, setIsAssetLoading] = useState<boolean>(false);

  // 3. Timeframe & Chart (Strictly 60s / 1 min per candle)
  const [timeframe, setTimeframeState] = useState<number>(60);
  const setTimeframe = useCallback((_seconds: number) => {
    // Locked to 60s (1 minute per candle) as requested: "har candle 1 min ke ho"
    setTimeframeState(60);
  }, []);

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    sma: true,
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

  // 4. UI Toggles & Leaderboard Profile
  const [showChartButtons, setShowChartButtonsState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOW_CHART_BUTTONS);
    return saved !== null ? saved === 'true' : true;
  });

  const setShowChartButtons = useCallback((show: boolean) => {
    setShowChartButtonsState(show);
    localStorage.setItem(STORAGE_KEYS.SHOW_CHART_BUTTONS, String(show));
  }, []);

  // Notification when placing trade OFF by default ("jab hum trade lagaya ju notification show horaha ha wo off ho")
  const [showOrderToastEnabled, setShowOrderToastEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOW_ORDER_TOAST);
    return saved !== null ? saved === 'true' : false;
  });

  const setShowOrderToastEnabled = useCallback((enabled: boolean) => {
    setShowOrderToastEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.SHOW_ORDER_TOAST, String(enabled));
    if (!enabled) setOrderToast(null);
  }, []);

  const [traderName, setTraderNameState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TRADER_NAME) || 'YA TRADER';
  });

  const setTraderName = useCallback((name: string) => {
    setTraderNameState(name);
    localStorage.setItem(STORAGE_KEYS.TRADER_NAME, name);
  }, []);

  const [traderFlag, setTraderFlagState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TRADER_FLAG) || '🇵🇰';
  });

  const setTraderFlag = useCallback((flag: string) => {
    setTraderFlagState(flag);
    localStorage.setItem(STORAGE_KEYS.TRADER_FLAG, flag);
  }, []);

  const [customLeaderboardProfit, setCustomLeaderboardProfitState] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_LB_PROFIT);
    return saved !== null && saved !== '' ? parseFloat(saved) : null;
  });

  const setCustomLeaderboardProfit = useCallback((profit: number | null) => {
    setCustomLeaderboardProfitState(profit);
    if (profit === null) {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_LB_PROFIT);
    } else {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LB_PROFIT, profit.toString());
    }
  }, []);

  const [customLeaderboardRank, setCustomLeaderboardRankState] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_LB_RANK);
    return saved !== null && saved !== '' ? parseInt(saved, 10) : null;
  });

  const setCustomLeaderboardRank = useCallback((rank: number | null) => {
    setCustomLeaderboardRankState(rank);
    if (rank === null) {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_LB_RANK);
    } else {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LB_RANK, rank.toString());
    }
  }, []);

  // 5. Market Mode & Engine behavior
  const [marketBehaviorMode, setMarketBehaviorModeState] = useState<MarketBehaviorMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MARKET_MODE);
    return (saved as MarketBehaviorMode) || 'smart_push';
  });

  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return saved !== null ? saved === 'true' : true;
  });

  // 6. INDEPENDENT 1-MINUTE GRAPH PER ASSET
  const [assetCandlesMap, setAssetCandlesMap] = useState<Record<string, Candle[]>>(() => {
    const map: Record<string, Candle[]> = {};
    INITIAL_ASSETS.forEach((ast) => {
      map[ast.id] = generateHistoricalCandles(ast, 60, 180);
    });
    return map;
  });

  const candles = assetCandlesMap[activeAsset.id] || generateHistoricalCandles(activeAsset, 60, 180);

  // 7. Trades & Drawing Tools
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRADE_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastClosedTrade, setLastClosedTrade] = useState<Trade | null>(null);

  // Per-trade target outcome map for 'realistic' mode (mix of win and lose)
  const tradeOutcomeTargetRef = useRef<Record<string, 'WIN' | 'LOSS'>>({});
  const realisticCounterRef = useRef<number>(0);

  const [orderToast, setOrderToast] = useState<OrderToast | null>(null);
  const orderToastTimerRef = useRef<any>(null);

  const clearOrderToast = useCallback(() => {
    if (orderToastTimerRef.current) clearTimeout(orderToastTimerRef.current);
    setOrderToast(null);
  }, []);

  // Drawing Tools (Interactive user-drawn lines on chart)
  const [drawnLines, setDrawnLines] = useState<DrawnLine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRAWN_LINES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingToolType>('none');
  const [drawingColor, setDrawingColor] = useState<string>('#eab308');

  const addDrawnLine = useCallback((line: Omit<DrawnLine, 'id'>) => {
    const newLine: DrawnLine = {
      ...line,
      id: 'LINE-' + Math.random().toString(36).substring(2, 9)
    };
    setDrawnLines((prev) => {
      const updated = [...prev, newLine];
      localStorage.setItem(STORAGE_KEYS.DRAWN_LINES, JSON.stringify(updated));
      return updated;
    });
    sounds.playBeep(600, 0.08);
  }, []);

  const removeDrawnLine = useCallback((id: string) => {
    setDrawnLines((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      localStorage.setItem(STORAGE_KEYS.DRAWN_LINES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const undoLastDrawnLine = useCallback(() => {
    setDrawnLines((prev) => {
      const updated = prev.slice(0, -1);
      localStorage.setItem(STORAGE_KEYS.DRAWN_LINES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearDrawnLines = useCallback(() => {
    setDrawnLines([]);
    localStorage.removeItem(STORAGE_KEYS.DRAWN_LINES);
  }, []);

  // Zoom Controls
  const [zoomVisibleCount, setZoomVisibleCount] = useState<number>(42);

  const zoomIn = useCallback(() => {
    setZoomVisibleCount((prev) => Math.max(14, prev - 6));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomVisibleCount((prev) => Math.min(120, prev + 6));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomVisibleCount(42);
  }, []);

  // 8. Cashier History
  const [deposits, setDeposits] = useState<DepositTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const activeBiasRef = useRef<number>(0);
  const activeTradesRef = useRef<Trade[]>(activeTrades);
  activeTradesRef.current = activeTrades;

  const marketModeRef = useRef<MarketBehaviorMode>(marketBehaviorMode);
  marketModeRef.current = marketBehaviorMode;

  const currentPriceRef = useRef<number>(activeAsset.currentPrice);
  currentPriceRef.current = activeAsset.currentPrice;

  // Persist State helpers
  const setAccountType = (type: AccountType) => {
    setAccountTypeState(type);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, type);
  };

  const setMarketBehaviorMode = (mode: MarketBehaviorMode) => {
    setMarketBehaviorModeState(mode);
    marketModeRef.current = mode;
    localStorage.setItem(STORAGE_KEYS.MARKET_MODE, mode);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sounds.setEnabled(enabled);
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
  };

  const setRealBalanceDirect = useCallback((amount: number) => {
    const clean = Math.max(0, Number(amount.toFixed(2)));
    setRealBalance(clean);
  }, []);

  const removeRealMoney = useCallback((amount?: number) => {
    if (amount === undefined) {
      setRealBalance(0);
    } else {
      setRealBalance((prev) => Math.max(0, Number((prev - amount).toFixed(2))));
    }
  }, []);

  // Switch Active Asset with individual unique 1-minute graph
  const setActiveAsset = (asset: Asset) => {
    setIsAssetLoading(true);
    setActiveAssetId(asset.id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ASSET_ID, asset.id);

    if (!assetCandlesMap[asset.id]) {
      const newCandles = generateHistoricalCandles(asset, 60, 180);
      setAssetCandlesMap((prev) => ({ ...prev, [asset.id]: newCandles }));
    }

    setTimeout(() => {
      setIsAssetLoading(false);
    }, 220);
  };

  // Balance persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_BALANCE, demoBalance.toString());
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REAL_BALANCE, realBalance.toString());
  }, [realBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRADE_HISTORY, JSON.stringify(tradeHistory.slice(0, 200)));
  }, [tradeHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
  }, [withdrawals]);

  const resetDemoBalance = () => {
    setDemoBalance(10000);
    sounds.playCashRegister();
  };

  const clearAllHistory = () => {
    setTradeHistory([]);
    setDeposits([]);
    setWithdrawals([]);
    localStorage.removeItem(STORAGE_KEYS.TRADE_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.DEPOSITS);
    localStorage.removeItem(STORAGE_KEYS.WITHDRAWALS);
  };

  // Market bias calculation based on active trades and selected outcome mode
  useEffect(() => {
    if (activeTrades.length === 0) {
      if (marketBehaviorMode === 'bull_trend') {
        activeBiasRef.current = 0.12;
      } else if (marketBehaviorMode === 'bear_trend') {
        activeBiasRef.current = -0.12;
      } else {
        activeBiasRef.current = 0;
      }
      return;
    }

    let bias = 0;
    activeTrades.forEach((t) => {
      if (t.assetId === activeAsset.id) {
        let desiredOutcome: 'WIN' | 'LOSS' = 'WIN';
        if (marketBehaviorMode === 'force_loss') {
          desiredOutcome = 'LOSS';
        } else if (marketBehaviorMode === 'realistic') {
          desiredOutcome = tradeOutcomeTargetRef.current[t.id] || 'WIN';
        } else {
          desiredOutcome = 'WIN';
        }

        const dirMultiplier = t.direction === 'UP' ? 1 : -1;
        const outcomeMultiplier = desiredOutcome === 'WIN' ? 1 : -1;
        bias += dirMultiplier * outcomeMultiplier * 0.14;
      }
    });
    activeBiasRef.current = Math.max(-0.28, Math.min(0.28, bias));
  }, [activeTrades, marketBehaviorMode, activeAsset.id]);

  // Real-time Tick Engine: Strict 1-Minute (60,000ms) Candle Alignment
  // Placing a trade NEVER resets or alters the candle timing!
  useEffect(() => {
    const tickInterval = 140; // ms
    const timeframeMs = 60 * 1000; // Strictly 1 minute per candle

    const timer = setInterval(() => {
      setAssetCandlesMap((prevMap) => {
        const curCandles = prevMap[activeAsset.id];
        if (!curCandles || curCandles.length === 0) return prevMap;

        const now = Date.now();
        const currentBucket = Math.floor(now / timeframeMs) * timeframeMs;
        const lastCandle = curCandles[curCandles.length - 1];

        const volatility = activeAsset.volatility;
        let delta = (Math.random() - 0.5) * volatility * 0.05;

        // Check active trades on this asset to synchronize candle color & price direction
        const currentTradesOnAsset = activeTradesRef.current.filter((t) => t.assetId === activeAsset.id);
        if (currentTradesOnAsset.length > 0) {
          const latest = currentTradesOnAsset[0];
          const timeLeftMs = Math.max(100, latest.closeTime - now);
          let targetOutcome: 'WIN' | 'LOSS' = 'WIN';
          if (marketModeRef.current === 'force_loss') {
            targetOutcome = 'LOSS';
          } else if (marketModeRef.current === 'realistic') {
            targetOutcome = tradeOutcomeTargetRef.current[latest.id] || 'WIN';
          }

          // Determine if price should move UP (Green candle) or DOWN (Red candle)
          const wantGreenUp =
            (latest.direction === 'UP' && targetOutcome === 'WIN') ||
            (latest.direction === 'DOWN' && targetOutcome === 'LOSS');

          const minStep = Math.pow(10, -activeAsset.decimalPlaces) * 3;
          const ticksLeft = Math.max(2, Math.min(25, Math.floor(timeLeftMs / tickInterval)));

          if (wantGreenUp) {
            // Target above both entryPrice and current candle open so the candle is visibly GREEN
            const targetPrice = Math.max(latest.entryPrice, lastCandle.open) + volatility * 0.45 + minStep;
            if (lastCandle.close < targetPrice) {
              delta = (targetPrice - lastCandle.close) / ticksLeft + Math.random() * volatility * 0.03;
            } else {
              delta = Math.abs(delta) * 0.6 + volatility * 0.012;
            }
          } else {
            // Target below both entryPrice and current candle open so the candle is visibly RED
            const targetPrice = Math.min(latest.entryPrice, lastCandle.open) - volatility * 0.45 - minStep;
            if (lastCandle.close > targetPrice) {
              delta = (targetPrice - lastCandle.close) / ticksLeft - Math.random() * volatility * 0.03;
            } else {
              delta = -Math.abs(delta) * 0.6 - volatility * 0.012;
            }
          }
        } else if (activeBiasRef.current !== 0) {
          delta += activeBiasRef.current * volatility * 0.018;
        }

        const newPrice = Number((lastCandle.close + delta).toFixed(activeAsset.decimalPlaces));
        currentPriceRef.current = newPrice;

        setAssets((prev) =>
          prev.map((a) => (a.id === activeAsset.id ? { ...a, currentPrice: newPrice } : a))
        );

        let updatedList: Candle[];
        // Only start a new candle when the real clock crosses into a new 1-minute bucket
        if (currentBucket > lastCandle.time) {
          const newCandle: Candle = {
            time: currentBucket,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newPrice),
            low: Math.min(lastCandle.close, newPrice),
            close: newPrice,
            volume: 15 + Math.floor(Math.random() * 20)
          };
          updatedList = [...curCandles.slice(-240), newCandle];
        } else {
          const updatedCandle: Candle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, newPrice),
            low: Math.min(lastCandle.low, newPrice),
            close: newPrice,
            volume: lastCandle.volume + 1
          };
          updatedList = [...curCandles.slice(0, -1), updatedCandle];
        }

        return { ...prevMap, [activeAsset.id]: updatedList };
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [activeAsset.id, activeAsset.volatility, activeAsset.decimalPlaces]);

  // Trade Expiration Monitor
  useEffect(() => {
    const checkInterval = 100;
    const interval = setInterval(() => {
      const now = Date.now();
      const currentTrades = activeTradesRef.current;
      if (currentTrades.length === 0) return;

      const expiringTrades: Trade[] = [];
      const remainingTrades: Trade[] = [];

      currentTrades.forEach((trade) => {
        const remainingSeconds = Math.ceil((trade.closeTime - now) / 1000);
        if (remainingSeconds <= 3 && remainingSeconds > 0 && Math.random() < 0.15) {
          sounds.playCountdownTick(remainingSeconds === 1 ? 950 : 750);
        }

        if (now >= trade.closeTime) {
          expiringTrades.push(trade);
        } else {
          remainingTrades.push(trade);
        }
      });

      if (expiringTrades.length > 0) {
        setActiveTrades(remainingTrades);

        expiringTrades.forEach((trade) => {
          let exitPrice = currentPriceRef.current;
          const minTick = Math.pow(10, -activeAsset.decimalPlaces) * 2;

          let targetOutcome: 'WIN' | 'LOSS' = 'WIN';
          if (marketModeRef.current === 'force_loss') {
            targetOutcome = 'LOSS';
          } else if (marketModeRef.current === 'realistic') {
            targetOutcome = tradeOutcomeTargetRef.current[trade.id] || 'WIN';
          } else {
            targetOutcome = 'WIN';
          }

          // Ensure final exitPrice matches the active mode cleanly
          if (marketModeRef.current === 'smart_push' || marketModeRef.current === 'force_loss' || marketModeRef.current === 'realistic') {
            const shouldBeAbove =
              (trade.direction === 'UP' && targetOutcome === 'WIN') ||
              (trade.direction === 'DOWN' && targetOutcome === 'LOSS');

            if (shouldBeAbove && exitPrice <= trade.entryPrice) {
              exitPrice = Number((trade.entryPrice + minTick).toFixed(activeAsset.decimalPlaces));
            } else if (!shouldBeAbove && exitPrice >= trade.entryPrice) {
              exitPrice = Number((trade.entryPrice - minTick).toFixed(activeAsset.decimalPlaces));
            }
            currentPriceRef.current = exitPrice;
            setAssets((prev) =>
              prev.map((a) => (a.id === trade.assetId ? { ...a, currentPrice: exitPrice } : a))
            );
            setAssetCandlesMap((prevMap) => {
              const list = prevMap[trade.assetId];
              if (!list || list.length === 0) return prevMap;
              const last = list[list.length - 1];
              const adjOpen = shouldBeAbove
                ? Math.min(last.open, Number((exitPrice - minTick).toFixed(activeAsset.decimalPlaces)))
                : Math.max(last.open, Number((exitPrice + minTick).toFixed(activeAsset.decimalPlaces)));
              const updatedLast: Candle = {
                ...last,
                open: adjOpen,
                high: Math.max(last.high, exitPrice, adjOpen),
                low: Math.min(last.low, exitPrice, adjOpen),
                close: exitPrice
              };
              return { ...prevMap, [trade.assetId]: [...list.slice(0, -1), updatedLast] };
            });
          }

          let status: TradeStatus = 'LOST';
          let actualProfit = 0;

          if (trade.direction === 'UP') {
            if (exitPrice > trade.entryPrice) {
              status = 'WON';
              actualProfit = Number((trade.amount * (trade.payoutRate / 100)).toFixed(2));
            } else if (exitPrice === trade.entryPrice) {
              status = 'TIE';
              actualProfit = 0;
            } else {
              status = 'LOST';
              actualProfit = -trade.amount;
            }
          } else {
            if (exitPrice < trade.entryPrice) {
              status = 'WON';
              actualProfit = Number((trade.amount * (trade.payoutRate / 100)).toFixed(2));
            } else if (exitPrice === trade.entryPrice) {
              status = 'TIE';
              actualProfit = 0;
            } else {
              status = 'LOST';
              actualProfit = -trade.amount;
            }
          }

          const resolvedTrade: Trade = {
            ...trade,
            status,
            exitPrice,
            actualProfit
          };

          delete tradeOutcomeTargetRef.current[trade.id];

          if (status === 'WON') {
            const returnAmount = trade.amount + actualProfit;
            if (trade.accountType === 'DEMO') {
              setDemoBalance((b) => Number((b + returnAmount).toFixed(2)));
            } else {
              setRealBalance((b) => Number((b + returnAmount).toFixed(2)));
            }
            // Dynamically update Leaderboard Profit & allow Position to recalculate automatically
            setCustomLeaderboardProfitState((prev: number | null) => {
              if (prev === null) return null;
              const base = prev < 0 ? 0 : prev;
              const nextVal = Number((base + actualProfit).toFixed(2));
              localStorage.setItem(STORAGE_KEYS.CUSTOM_LB_PROFIT, nextVal.toString());
              return nextVal;
            });
            setCustomLeaderboardRank(null);
            sounds.playWin();
          } else if (status === 'TIE') {
            if (trade.accountType === 'DEMO') {
              setDemoBalance((b) => Number((b + trade.amount).toFixed(2)));
            } else {
              setRealBalance((b) => Number((b + trade.amount).toFixed(2)));
            }
          } else {
            setCustomLeaderboardProfitState((prev: number | null) => {
              if (prev === null) return null;
              const nextVal = Number((prev - trade.amount).toFixed(2));
              localStorage.setItem(STORAGE_KEYS.CUSTOM_LB_PROFIT, nextVal.toString());
              return nextVal;
            });
            setCustomLeaderboardRank(null);
            sounds.playLoss();
          }

          setTradeHistory((prev) => [resolvedTrade, ...prev]);
          setLastClosedTrade(resolvedTrade);
        });
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [activeAsset.decimalPlaces]);

  // Place Trade Action: Does NOT change candle timing or trade timer!
  const placeTrade = useCallback(
    (direction: TradeDirection, amount: number, durationSeconds: number): boolean => {
      const balance = accountType === 'DEMO' ? demoBalance : realBalance;
      if (amount <= 0 || balance < amount) {
        return false;
      }

      if (accountType === 'DEMO') {
        setDemoBalance((b) => Number((b - amount).toFixed(2)));
      } else {
        setRealBalance((b) => Number((b - amount).toFixed(2)));
      }

      const now = Date.now();
      const currentPrice = currentPriceRef.current;
      const payoutAmount = Number((amount * (activeAsset.payout / 100)).toFixed(2));
      const tradeId = 'TRD-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      // Determine outcome target for this trade based on mode
      if (marketBehaviorMode === 'force_loss') {
        tradeOutcomeTargetRef.current[tradeId] = 'LOSS';
      } else if (marketBehaviorMode === 'realistic') {
        // Real trading mix: realistic alternating & random wins and losses
        realisticCounterRef.current += 1;
        const isWin = realisticCounterRef.current % 2 === 1 ? Math.random() < 0.65 : Math.random() < 0.35;
        tradeOutcomeTargetRef.current[tradeId] = isWin ? 'WIN' : 'LOSS';
      } else {
        tradeOutcomeTargetRef.current[tradeId] = 'WIN';
      }

      const newTrade: Trade = {
        id: tradeId,
        assetId: activeAsset.id,
        assetName: activeAsset.name,
        direction,
        amount,
        entryPrice: currentPrice,
        payoutRate: activeAsset.payout,
        potentialProfit: payoutAmount,
        status: 'OPEN',
        openTime: now,
        closeTime: now + durationSeconds * 1000,
        durationSeconds,
        accountType
      };

      sounds.playTradePlaced();

      // Immediately nudge the live candle so Buy shows a Green candle and Sell shows a Red candle
      const wantGreenCandle =
        (direction === 'UP' && tradeOutcomeTargetRef.current[tradeId] === 'WIN') ||
        (direction === 'DOWN' && tradeOutcomeTargetRef.current[tradeId] === 'LOSS');
      const minStep = Math.pow(10, -activeAsset.decimalPlaces) * 3;
      const step = activeAsset.volatility * 0.22 * (wantGreenCandle ? 1 : -1);
      const nudgedPrice = Number((currentPrice + step).toFixed(activeAsset.decimalPlaces));
      currentPriceRef.current = nudgedPrice;

      setAssets((prev) =>
        prev.map((a) => (a.id === activeAsset.id ? { ...a, currentPrice: nudgedPrice } : a))
      );

      setAssetCandlesMap((prevMap) => {
        const list = prevMap[activeAsset.id];
        if (!list || list.length === 0) return prevMap;
        const last = list[list.length - 1];
        const adjOpen = wantGreenCandle
          ? Math.min(last.open, Number((nudgedPrice - minStep).toFixed(activeAsset.decimalPlaces)))
          : Math.max(last.open, Number((nudgedPrice + minStep).toFixed(activeAsset.decimalPlaces)));
        const updatedLast: Candle = {
          ...last,
          open: adjOpen,
          high: Math.max(last.high, nudgedPrice, adjOpen),
          low: Math.min(last.low, nudgedPrice, adjOpen),
          close: nudgedPrice
        };
        return { ...prevMap, [activeAsset.id]: [...list.slice(0, -1), updatedLast] };
      });

      // Only trigger order toast if user explicitly enabled it (OFF by default as requested!)
      if (showOrderToastEnabled) {
        const newOrderToast: OrderToast = {
          id: 'ORD-' + Math.random().toString(36).substring(2, 8),
          direction,
          amount,
          assetSymbol: activeAsset.symbol,
          price: currentPrice,
          payoutRate: activeAsset.payout,
          timestamp: now
        };
        setOrderToast(newOrderToast);
        if (orderToastTimerRef.current) clearTimeout(orderToastTimerRef.current);
        orderToastTimerRef.current = setTimeout(() => {
          setOrderToast(null);
        }, 3000);
      }

      setActiveTrades((prev) => [newTrade, ...prev]);
      return true;
    },
    [accountType, demoBalance, realBalance, activeAsset, marketBehaviorMode, showOrderToastEnabled]
  );

  const clearLastClosedTrade = () => {
    setLastClosedTrade(null);
  };

  // Cashier: Deposit
  const depositFunds = useCallback(
    (amount: number, method: string, promoCode?: string): DepositTransaction => {
      let bonusPercent = 0;
      if (promoCode && promoCode.toUpperCase() === 'BONUS50') {
        bonusPercent = 50;
      } else if (promoCode && promoCode.toUpperCase() === 'QUOTEX100') {
        bonusPercent = 100;
      }

      const bonusAmount = Number((amount * (bonusPercent / 100)).toFixed(2));
      const totalCredited = amount + bonusAmount;

      const tx: DepositTransaction = {
        id: 'DEP-' + Math.floor(100000 + Math.random() * 900000),
        amount,
        bonusAmount,
        totalCredited,
        method,
        txHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: 'APPROVED',
        createdAt: Date.now(),
        accountType: 'REAL',
        promoCode
      };

      setRealBalance((b) => Number((b + totalCredited).toFixed(2)));
      setDeposits((prev) => [tx, ...prev]);
      sounds.playCashRegister();

      return tx;
    },
    []
  );

  // Cashier: Withdrawal
  const withdrawFunds = useCallback(
    (amount: number, method: string, destinationAccount: string) => {
      if (amount <= 0) {
        return { success: false, message: 'Invalid withdrawal amount' };
      }
      if (realBalance < amount) {
        return { success: false, message: 'Insufficient live balance' };
      }

      setRealBalance((b) => Number((b - amount).toFixed(2)));

      const tx: WithdrawalTransaction = {
        id: 'WTH-' + Math.floor(100000 + Math.random() * 900000),
        amount,
        method,
        destinationAccount,
        status: 'APPROVED',
        createdAt: Date.now(),
        accountType: 'REAL',
        txId: 'TXW-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      };

      setWithdrawals((prev) => [tx, ...prev]);
      sounds.playCashRegister();

      return {
        success: true,
        message: `Withdrawal of $${amount.toFixed(2)} to ${method} processed successfully!`,
        transaction: tx
      };
    },
    [realBalance]
  );

  const approveWithdrawal = useCallback((id: string) => {
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'APPROVED' } : w))
    );
    sounds.playCashRegister();
  }, []);

  return (
    <TradingContext.Provider
      value={{
        accountType,
        setAccountType,
        demoBalance,
        realBalance,
        resetDemoBalance,
        setRealBalanceDirect,
        removeRealMoney,
        isVipPurpleLive,
        assets,
        activeAsset,
        setActiveAsset,
        candles,
        timeframe,
        setTimeframe,
        chartType,
        setChartType,
        indicators,
        setIndicators,
        isOnlineMode,
        setIsOnlineMode,
        marketBehaviorMode,
        setMarketBehaviorMode,
        activeTrades,
        tradeHistory,
        placeTrade,
        lastClosedTrade,
        clearLastClosedTrade,
        orderToast,
        clearOrderToast,
        drawnLines,
        addDrawnLine,
        removeDrawnLine,
        undoLastDrawnLine,
        clearDrawnLines,
        activeDrawingTool,
        setActiveDrawingTool,
        drawingColor,
        setDrawingColor,
        showChartButtons,
        setShowChartButtons,
        showOrderToastEnabled,
        setShowOrderToastEnabled,
        traderName,
        setTraderName,
        traderFlag,
        setTraderFlag,
        customLeaderboardProfit,
        setCustomLeaderboardProfit,
        customLeaderboardRank,
        setCustomLeaderboardRank,
        zoomVisibleCount,
        setZoomVisibleCount,
        zoomIn,
        zoomOut,
        resetZoom,
        deposits,
        withdrawals,
        depositFunds,
        withdrawFunds,
        approveWithdrawal,
        clearAllHistory,
        soundEnabled,
        setSoundEnabled,
        isAssetLoading
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
