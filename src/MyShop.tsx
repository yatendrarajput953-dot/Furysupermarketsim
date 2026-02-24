import React from 'react';
import { useGameEngine } from '../useGameEngine';
import { PRODUCTS, SHOP_UPGRADES } from '../hooks/constants';
import Shop3DView from './Shop3DView';

export default function MyShop({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state, setSellPrice, upgradeShop } = engine;

  const nextUpgrade = SHOP_UPGRADES.find(u => u.level === state.shopLevel + 1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Shop</h2>
        <p className="text-neutral-400 mt-1">Manage inventory and prices.</p>
      </div>

      <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold">Shop Upgrades</h3>
            <p className="text-neutral-400 text-sm">Current Level: {state.shopLevel} (Capacity: {state.maxInventory})</p>
          </div>
          {nextUpgrade ? (
            <button
              onClick={upgradeShop}
              disabled={state.money < nextUpgrade.cost}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Upgrade to Level {nextUpgrade.level} (${nextUpgrade.cost.toFixed(2)})
            </button>
          ) : (
            <span className="px-4 py-2 bg-neutral-800 text-neutral-400 rounded-lg text-sm">Max Level Reached</span>
          )}
        </div>
      </div>

      <Shop3DView state={state} setSellPrice={setSellPrice} />

      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50">
              <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">Product</th>
              <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">In Stock</th>
              <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">Base Cost</th>
              <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">Sell Price</th>
              <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-medium">Markup</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(state.inventory).map(([productId, item]: [string, any]) => {
              const product = PRODUCTS.find(p => p.id === productId);
              if (!product) return null;
              
              const markup = ((item.sellPrice - product.baseCost) / product.baseCost) * 100;

              return (
                <tr key={productId} className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 font-mono">{item.quantity}</td>
                  <td className="p-4 font-mono text-neutral-400">${product.baseCost.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-neutral-500">$</span>
                      <input
                        type="number"
                        min={product.baseCost}
                        step="0.1"
                        value={item.sellPrice}
                        onChange={(e) => setSellPrice(productId, parseFloat(e.target.value) || product.baseCost)}
                        className="w-24 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">
                    <span className={markup > 100 ? 'text-emerald-400' : markup < 20 ? 'text-amber-400' : 'text-neutral-300'}>
                      {markup.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {Object.keys(state.inventory).length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No items in inventory. Go to Wholesale to buy products.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
