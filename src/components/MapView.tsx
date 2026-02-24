import React from 'react';
import { useGameEngine } from '../useGameEngine';
import { Location } from '../types';
import { MapPin, Building2, Home, Building, Zap } from 'lucide-react';

export default function MapView({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state, travel } = engine;

  const locations: { id: Location; name: string; description: string; icon: React.ReactNode; color: string; x: number; y: number }[] = [
    {
      id: 'village',
      name: 'Quiet Village',
      description: 'Your home and starting point. Peaceful and cheap.',
      icon: <Home size={32} />,
      color: 'text-emerald-400',
      x: 20,
      y: 70
    },
    {
      id: 'city',
      name: 'Bustling City',
      description: 'The main commercial hub. Supermarkets and banks.',
      icon: <Building size={32} />,
      color: 'text-blue-400',
      x: 50,
      y: 40
    },
    {
      id: 'downtown',
      name: 'Downtown District',
      description: 'High-end real estate and corporate headquarters.',
      icon: <Building2 size={32} />,
      color: 'text-purple-400',
      x: 80,
      y: 20
    }
  ];

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">World Map</h2>
        <p className="text-neutral-400 mt-1">Travel between locations to access different facilities.</p>
      </div>

      <div className="flex-1 relative bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden min-h-[400px]">
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path 
            d="M 20% 70% L 50% 40% L 80% 20%" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="4" 
            strokeDasharray="8 8" 
          />
        </svg>

        {/* Locations */}
        {locations.map(loc => {
          const isCurrent = state.location === loc.id;
          return (
            <div 
              key={loc.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group`}
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            >
              <button
                onClick={() => travel(loc.id)}
                disabled={isCurrent || state.energy < 10}
                className={`relative p-4 rounded-full transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-emerald-500/20 ring-4 ring-emerald-500/50' 
                    : 'bg-neutral-900 hover:bg-neutral-800 ring-2 ring-neutral-700 hover:ring-neutral-500'
                } ${!isCurrent && state.energy < 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`${isCurrent ? 'text-emerald-400' : loc.color}`}>
                  {loc.icon}
                </div>
                {isCurrent && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-neutral-950 text-xs font-bold px-2 py-1 rounded-full">
                    You
                  </div>
                )}
              </button>
              
              <div className="mt-4 bg-neutral-900/90 backdrop-blur-sm p-3 rounded-xl border border-neutral-800 text-center w-48 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute top-full z-10">
                <div className="font-bold text-white mb-1">{loc.name}</div>
                <div className="text-xs text-neutral-400 mb-2">{loc.description}</div>
                {!isCurrent && (
                  <div className="flex items-center justify-center space-x-1 text-xs font-medium text-amber-400">
                    <Zap size={12} />
                    <span>Cost: 10 Energy, 1 Hour</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {locations.map(loc => (
          <div key={loc.id} className={`p-4 rounded-xl border ${state.location === loc.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-neutral-950 border-neutral-800'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={loc.color}>{loc.icon}</div>
              <div className="font-bold">{loc.name}</div>
            </div>
            <p className="text-sm text-neutral-400 mb-4">{loc.description}</p>
            <button
              onClick={() => travel(loc.id)}
              disabled={state.location === loc.id || state.energy < 10}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                state.location === loc.id
                  ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {state.location === loc.id ? 'Current Location' : 'Travel Here'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
