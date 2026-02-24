import React from 'react';
import { useGameEngine } from '../useGameEngine';
import { Store, TrendingUp, Package, Landmark } from 'lucide-react';

export default function Dashboard({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state } = engine;

  const totalItems = Object.values(state.inventory).reduce((acc, item: any) => acc + item.quantity, 0);
  const totalStockValue = Object.entries(state.stocks).reduce((acc, [id, stock]: [string, any]) => {
    const marketStock = engine.marketStocks.find(s => s.id === id);
    return acc + (stock.owned * (marketStock?.currentPrice || 0));
  }, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium">Shop Level</h3>
            <Store className="text-emerald-400" size={24} />
          </div>
          <p className="text-3xl font-mono">{state.shopLevel}</p>
          <p className="text-sm text-neutral-500 mt-2">Reputation: {state.reputation.toFixed(0)}/100</p>
        </div>

        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium">Inventory</h3>
            <Package className="text-emerald-400" size={24} />
          </div>
          <p className="text-3xl font-mono">{totalItems} <span className="text-lg text-neutral-500">/ {state.maxInventory}</span></p>
          <p className="text-sm text-neutral-500 mt-2">Items in stock</p>
        </div>

        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium">Bank Balance</h3>
            <Landmark className="text-emerald-400" size={24} />
          </div>
          <p className="text-3xl font-mono">${state.bankBalance.toFixed(2)}</p>
          <p className="text-sm text-neutral-500 mt-2">Loan: ${state.loanAmount.toFixed(2)}</p>
        </div>

        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium">Stock Portfolio</h3>
            <TrendingUp className="text-emerald-400" size={24} />
          </div>
          <p className="text-3xl font-mono">${totalStockValue.toFixed(2)}</p>
          <p className="text-sm text-neutral-500 mt-2">Current value</p>
        </div>
      </div>

      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6">
        <h3 className="text-xl font-bold mb-4">Activity Log</h3>
        <div className="space-y-2 h-64 overflow-y-auto font-mono text-sm">
          {state.messages.slice().reverse().map((msg, i) => (
            <div key={i} className="text-neutral-400 border-b border-neutral-800/50 pb-2">
              {msg}
            </div>
          ))}
          {state.messages.length === 0 && (
            <div className="text-neutral-600">No activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
