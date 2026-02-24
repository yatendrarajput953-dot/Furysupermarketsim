import React, { useState } from 'react';
import { useGameEngine } from '../useGameEngine';
import { PRODUCTS } from '../hooks/constants';

export default function Wholesale({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state, buyProduct } = engine;
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (id: string, val: string) => {
    const num = parseInt(val) || 0;
    setQuantities(prev => ({ ...prev, [id]: num }));
  };

  const currentTotalItems = Object.values(state.inventory).reduce((acc, item: any) => acc + item.quantity, 0);
  const remainingSpace = Number(state.maxInventory) - Number(currentTotalItems);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Wholesale Market</h2>
          <p className="text-neutral-400 mt-1">Buy products to sell in your shop.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500 uppercase tracking-wider">Storage Space</p>
          <p className="font-mono text-xl">{remainingSpace} items left</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map(product => {
          const qty = quantities[product.id] || 0;
          const cost = qty * product.baseCost;
          const canAfford = state.money >= cost;
          const hasSpace = remainingSpace >= qty;

          return (
            <div key={product.id} className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <span className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-neutral-400 uppercase tracking-wider block mt-2 w-fit">
                    {product.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Cost per unit</p>
                  <p className="font-mono text-lg text-amber-400">${product.baseCost.toFixed(2)}</p>
                </div>
              </div>
              
              <p className="text-sm text-neutral-400 mb-4">{product.description}</p>

              <div className="mt-auto pt-4 border-t border-neutral-800">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Quantity</label>
                    <input 
                      type="number" 
                      min="0"
                      value={quantities[product.id] || ''}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Total Cost</label>
                    <div className="px-3 py-2 font-mono text-lg">${cost.toFixed(2)}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (qty > 0 && canAfford && hasSpace) {
                      buyProduct(product.id, qty);
                      setQuantities(prev => ({ ...prev, [product.id]: 0 }));
                    }
                  }}
                  disabled={qty <= 0 || !canAfford || !hasSpace}
                  className="w-full mt-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 text-neutral-950"
                >
                  Buy Stock
                </button>
                {!canAfford && qty > 0 && <p className="text-red-400 text-xs mt-2 text-center">Not enough money</p>}
                {!hasSpace && qty > 0 && <p className="text-red-400 text-xs mt-2 text-center">Not enough storage space</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
