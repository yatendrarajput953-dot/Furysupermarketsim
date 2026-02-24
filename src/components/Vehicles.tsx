import React from 'react';
import { useGameEngine } from '../useGameEngine';
import { AVAILABLE_VEHICLES } from '../hooks/constants';
import { Bike, Truck, Car } from 'lucide-react';

export default function Vehicles({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state, buyVehicle } = engine;

  const getIcon = (type: string) => {
    switch (type) {
      case 'bike': return <Bike className="text-amber-400" size={24} />;
      case 'van': return <Car className="text-blue-400" size={24} />;
      case 'truck': return <Truck className="text-emerald-400" size={24} />;
      default: return <Car className="text-neutral-400" size={24} />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vehicle Showroom</h2>
        <p className="text-neutral-400 mt-1">Purchase vehicles to increase your transport capacity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_VEHICLES.map(vehicle => {
          const isOwned = !!state.vehicles[vehicle.id];
          const canAfford = state.money >= vehicle.cost;

          return (
            <div key={vehicle.id} className={`bg-neutral-950 p-6 rounded-2xl border ${isOwned ? 'border-emerald-500/50' : 'border-neutral-800'} flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {getIcon(vehicle.type)}
                  <div>
                    <h3 className="text-xl font-bold">{vehicle.name}</h3>
                    <span className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-neutral-400 uppercase tracking-wider">
                      {vehicle.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="my-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Transport Capacity</span>
                  <span className="font-mono text-emerald-400">+{vehicle.capacityBonus} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Price</span>
                  <span className="font-mono">${vehicle.cost.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-neutral-800">
                {isOwned ? (
                  <div className="w-full py-3 rounded-xl font-medium text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Owned
                  </div>
                ) : (
                  <button
                    onClick={() => buyVehicle(vehicle.id)}
                    disabled={!canAfford}
                    className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 text-neutral-950"
                  >
                    Purchase Vehicle
                  </button>
                )}
                {!canAfford && !isOwned && (
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
