import React, { useState } from 'react';
import { useGameEngine } from '../useGameEngine';

export default function StockMarket({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state, marketStocks, buyStock, sellStock } = engine;
  const [tradeQuantities, setTradeQuantities] = useState<Record<string, string>>({});

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Stock Exchange</h2>
        <p className="text-neutral-400 mt-1">Invest your profits. Prices update daily.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {marketStocks.map(stock => {
          const owned = state.stocks[stock.id]?.owned || 0;
          const avgPrice = state.stocks[stock.id]?.avgPrice || 0;
          const currentVal = owned * stock.currentPrice;
          const profit = currentVal - (owned * avgPrice);
          const profitPercent = avgPrice > 0 ? (profit / (owned * avgPrice)) * 100 : 0;
          
          const qtyStr = tradeQuantities[stock.id] || '';
          const qty = parseInt(qtyStr) || 0;
          const tradeCost = qty * stock.currentPrice;

          // Simple sparkline calculation
          const minPrice = Math.min(...stock.history);
          const maxPrice = Math.max(...stock.history);
          const range = maxPrice - minPrice || 1;
          
          return (
            <div key={stock.id} className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold">{stock.name}</h3>
                  <p className="font-mono text-2xl mt-1">${stock.currentPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500 uppercase tracking-wider">Your Position</p>
                  <p className="font-mono">{owned} shares</p>
                  {owned > 0 && (
                    <p className={`text-sm font-mono mt-1 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Mini chart */}
              <div className="h-16 flex items-end space-x-1 mb-6 opacity-50">
                {stock.history.map((price, i) => {
                  const height = ((price - minPrice) / range) * 100;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 bg-emerald-500/50 rounded-t-sm" 
                      style={{ height: `${Math.max(10, height)}%` }}
                    />
                  );
                })}
              </div>

              <div className="flex space-x-4">
                <input
                  type="number"
                  min="1"
                  value={qtyStr}
                  onChange={(e) => setTradeQuantities(prev => ({ ...prev, [stock.id]: e.target.value }))}
                  placeholder="Qty"
                  className="w-24 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    buyStock(stock.id, qty);
                    setTradeQuantities(prev => ({ ...prev, [stock.id]: '' }));
                  }}
                  disabled={qty <= 0 || state.money < tradeCost}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-medium rounded-lg disabled:opacity-50 transition-colors py-2"
                >
                  Buy
                </button>
                <button
                  onClick={() => {
                    sellStock(stock.id, qty);
                    setTradeQuantities(prev => ({ ...prev, [stock.id]: '' }));
                  }}
                  disabled={qty <= 0 || owned < qty}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg disabled:opacity-50 transition-colors py-2"
                >
                  Sell
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
