'use client';

import Link from 'next/link';
import { useState } from 'react';

interface KDSHeaderProps {
  title: string;
  showBackLink?: boolean;
  simulatorActive?: boolean;
  onToggleSimulator?: () => void;
  onResetDemo?: () => void;
  kitchenLoad?: number;
  onKitchenLoadChange?: (load: number) => void;
}

export default function KDSHeader({
  title,
  showBackLink = false,
  simulatorActive = false,
  onToggleSimulator,
  onResetDemo,
  kitchenLoad = 50,
  onKitchenLoadChange,
}: KDSHeaderProps) {
  const [showControls, setShowControls] = useState(false);
  
  return (
    <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          {showBackLink && (
            <Link href="/kds" className="text-neutral-400 hover:text-white">
              ← Back
            </Link>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-xl font-bold shadow-lg">
              K
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-xs text-neutral-500">Aroyb KitchenScreen</p>
            </div>
          </div>
        </div>
        
        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Current Time */}
          <div className="text-sm text-neutral-400">
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          {/* Demo Controls Toggle */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="px-3 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-sm"
          >
            ⚙️ Controls
          </button>
          
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/kds" className="px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800">
              📋 KDS
            </Link>
            <Link href="/expo" className="px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800">
              🍽️ Expo
            </Link>
            <Link href="/stats" className="px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800">
              📊 Stats
            </Link>
            <Link href="/settings" className="px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800">
              ⚙️ Settings
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Demo Controls Panel */}
      {showControls && (
        <div className="mt-4 p-4 rounded-lg bg-neutral-800 border border-neutral-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Simulate Rush */}
            {onToggleSimulator && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400">Simulate Rush:</span>
                <button
                  onClick={onToggleSimulator}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                    simulatorActive 
                      ? 'bg-green-600 text-white' 
                      : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {simulatorActive ? '🔥 ACTIVE' : 'OFF'}
                </button>
              </div>
            )}
            
            {/* Kitchen Load */}
            {onKitchenLoadChange && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400">Kitchen Load:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={kitchenLoad}
                  onChange={(e) => onKitchenLoadChange(parseInt(e.target.value))}
                  className="w-32 accent-orange-500"
                />
                <span className="text-sm font-semibold text-white w-10">{kitchenLoad}%</span>
              </div>
            )}
            
            {/* Reset Demo */}
            {onResetDemo && (
              <button
                onClick={onResetDemo}
                className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-semibold"
              >
                🔄 Reset Demo
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
