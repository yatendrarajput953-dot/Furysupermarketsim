/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameEngine } from './useGameEngine';
import { LayoutDashboard, Store, ShoppingCart, Landmark, TrendingUp, Pause, Play, Hammer, Users, Car, Heart, Map } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Wholesale from './components/Wholesale';
import MyShop from './components/MyShop';
import Construction from './components/Construction';
import Vehicles from './components/Vehicles';
import Bank from './components/Bank';
import StockMarket from './components/StockMarket';
import Tutorial from './components/Tutorial';
import Personal from './components/Personal';
import MapView from './components/MapView';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomId, setRoomId] = useState('');

  if (!gameStarted) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-neutral-100 font-sans">
        <div className="bg-neutral-950 p-8 rounded-2xl border border-neutral-800 max-w-md w-full">
          <h1 className="text-4xl font-bold text-emerald-400 tracking-tight text-center mb-2">Fury Sim</h1>
          <p className="text-sm text-neutral-500 uppercase tracking-wider text-center mb-8">Supermarket Tycoon</p>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                setIsMultiplayer(false);
                setGameStarted(true);
              }}
              className="w-full py-4 rounded-xl font-medium transition-colors bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center space-x-2"
            >
              <Store size={20} />
              <span>Single Player (Start with $10,000)</span>
            </button>
            
            <div className="pt-4 border-t border-neutral-800">
              <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Multiplayer Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room name..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-emerald-500 mb-4"
              />
              <button
                onClick={() => {
                  if (roomId.trim()) {
                    setIsMultiplayer(true);
                    setGameStarted(true);
                  }
                }}
                disabled={!roomId.trim()}
                className="w-full py-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 text-neutral-950 flex items-center justify-center space-x-2"
              >
                <Users size={20} />
                <span>Join/Create Multiplayer (Start with $40,000)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <GameUI isMultiplayer={isMultiplayer} roomId={roomId} />;
}

function GameUI({ isMultiplayer, roomId }: { isMultiplayer: boolean, roomId: string }) {
  const engine = useGameEngine(isMultiplayer, roomId);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTutorial, setShowTutorial] = useState(true);

  const { state, isPaused, setIsPaused, playerCount } = engine;

  const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'map', name: 'World Map', icon: <Map size={20} /> },
    { id: 'personal', name: 'Personal', icon: <Heart size={20} /> },
    { id: 'wholesale', name: 'Wholesale', icon: <ShoppingCart size={20} /> },
    { id: 'shop', name: 'My Shop', icon: <Store size={20} /> },
    { id: 'construction', name: 'Construction', icon: <Hammer size={20} /> },
    { id: 'vehicles', name: 'Vehicles', icon: <Car size={20} /> },
    { id: 'bank', name: 'Bank', icon: <Landmark size={20} /> },
    { id: 'stocks', name: 'Stock Market', icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">Fury Sim</h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">Supermarket Tycoon</p>
          {isMultiplayer && (
            <div className="mt-4 px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Room: {roomId}</span>
              <div className="flex items-center space-x-1 text-emerald-400">
                <Users size={14} />
                <span className="text-xs font-mono">{playerCount}</span>
              </div>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            {isPaused ? <Play size={18} className="text-emerald-400" /> : <Pause size={18} className="text-amber-400" />}
            <span>{isPaused ? 'Resume Game' : 'Pause Game'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-8">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Day</span>
              <span className="font-mono text-lg">{state.day}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Time</span>
              <span className="font-mono text-lg">{formatTime(state.hour)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Status</span>
              <span className={`font-medium ${state.hour >= 8 && state.hour <= 22 ? 'text-emerald-400' : 'text-neutral-500'}`}>
                {state.hour >= 8 && state.hour <= 22 ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Cash</span>
              <span className="font-mono text-xl text-emerald-400">{formatMoney(state.money)}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-neutral-900">
          {activeTab === 'dashboard' && <Dashboard engine={engine} />}
          {activeTab === 'personal' && <Personal engine={engine} />}
          {activeTab === 'wholesale' && <Wholesale engine={engine} />}
          {activeTab === 'shop' && <MyShop engine={engine} />}
          {activeTab === 'construction' && <Construction engine={engine} />}
          {activeTab === 'vehicles' && <Vehicles engine={engine} />}
          {activeTab === 'bank' && <Bank engine={engine} />}
          {activeTab === 'stocks' && <StockMarket engine={engine} />}
          {activeTab === 'map' && <MapView engine={engine} />}
        </main>
      </div>
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
