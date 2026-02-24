import React from 'react';
import { useGameEngine } from '../useGameEngine';
import { AVAILABLE_ROOMS } from '../hooks/constants';
import { Hammer, Warehouse, Store, Briefcase } from 'lucide-react';

export default function Construction({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state, buildRoom, demolishRoom } = engine;

  const getIcon = (type: string) => {
    switch (type) {
      case 'storage': return <Warehouse className="text-amber-400" size={24} />;
      case 'sales': return <Store className="text-emerald-400" size={24} />;
      case 'office': return <Briefcase className="text-blue-400" size={24} />;
      default: return <Hammer className="text-neutral-400" size={24} />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Construction</h2>
        <p className="text-neutral-400 mt-1">Expand your shop and build new facilities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_ROOMS.map(room => {
          const isBuilt = state.rooms[room.id]?.built;
          const canAfford = state.money >= room.cost;

          return (
            <div key={room.id} className={`bg-neutral-950 p-6 rounded-2xl border ${isBuilt ? 'border-emerald-500/50' : 'border-neutral-800'} flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {getIcon(room.type)}
                  <div>
                    <h3 className="text-xl font-bold">{room.name}</h3>
                    <span className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-neutral-400 uppercase tracking-wider">
                      {room.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="my-4 space-y-2">
                {room.capacityBonus > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Capacity Bonus</span>
                    <span className="font-mono text-emerald-400">+{room.capacityBonus} items</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Construction Cost</span>
                  <span className="font-mono">${room.cost.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-neutral-800">
                {isBuilt ? (
                  <div className="space-y-2">
                    <div className="w-full py-2 rounded-xl font-medium text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Constructed
                    </div>
                    <button
                      onClick={() => demolishRoom(room.id)}
                      className="w-full py-2 rounded-xl font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    >
                      Demolish (Refund ${(room.cost * 0.5).toFixed(2)})
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => buildRoom(room.id)}
                    disabled={!canAfford}
                    className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 text-neutral-950"
                  >
                    Build Room
                  </button>
                )}
                {!canAfford && !isBuilt && (
                  <p className="text-red-400 text-xs mt-2 text-center">Not enough money</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
