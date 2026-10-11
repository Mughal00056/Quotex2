import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { Asset, AssetCategory } from '../types/trading';
import { X, Search, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { formatPrice } from '../utils/chartMath';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose }) => {
  const { assets, activeAsset, setActiveAsset } = useTrading();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'Forex OTC', 'Crypto', 'Commodities', 'Stocks OTC'];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (asset: Asset) => {
    setActiveAsset(asset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Asset Market Selector
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
              UP TO 94% PAYOUT
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f283a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-[#1b2536] bg-[#0f1420] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pairs (e.g. EUR/USD, BTC, Gold)..."
              className="w-full bg-[#161e2b] border border-[#253246] focus:border-cyan-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-[#17202e] text-slate-400 hover:text-slate-200 hover:bg-[#1e2a3c]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Table List */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            {filteredAssets.map((asset) => {
              const isSelected = activeAsset.id === asset.id;
              const isPositive = asset.change24h >= 0;

              return (
                <button
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#182436] border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-[#141b27] border-[#202b3c] hover:bg-[#1b2536] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#202b3e] text-cyan-400 flex items-center justify-center font-bold text-xs">
                      {asset.symbol.split('/')[0] || asset.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        {asset.name}
                        {asset.isOtc && (
                          <span className="text-[9px] bg-slate-700/60 text-slate-300 px-1 py-0.2 rounded font-mono">
                            OTC
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{asset.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Price & 24h Change */}
                    <div className="text-right">
                      <div className="font-mono-num text-xs font-bold text-white">
                        {formatPrice(asset.currentPrice, asset.decimalPlaces)}
                      </div>
                      <div
                        className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{isPositive ? `+${asset.change24h}%` : `${asset.change24h}%`}</span>
                      </div>
                    </div>

                    {/* High Payout Badge */}
                    <div className="min-w-[65px] text-right">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg text-xs font-black font-mono-num">
                        +{asset.payout}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
