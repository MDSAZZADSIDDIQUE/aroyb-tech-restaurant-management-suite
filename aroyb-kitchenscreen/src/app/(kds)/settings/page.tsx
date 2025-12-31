'use client';

import { useState, useEffect } from 'react';
import type { KDSSettings, StationId } from '@/types';
import KDSHeader from '@/components/layout/KDSHeader';
import DemoBanner from '@/components/layout/DemoBanner';
import ToastContainer, { showToast } from '@/components/ui/Toast';
import { getStoredSettings, setStoredSettings, initializeStorage, resetStorage } from '@/lib/storage';
import { stations, getStationIcon, getStationName } from '@/lib/formatting';

export default function SettingsPage() {
  const [settings, setSettings] = useState<KDSSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    initializeStorage();
    setSettings(getStoredSettings());
    setLoading(false);
  }, []);
  
  const updateSettings = (updates: Partial<KDSSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...updates };
    setSettings(updated);
    setStoredSettings(updated);
    showToast({ type: 'success', title: 'Settings Saved' });
  };
  
  const updateStationConfig = (stationId: StationId, bumpDestination: 'ready' | 'completed') => {
    if (!settings) return;
    const updated = {
      ...settings,
      stationConfigs: {
        ...settings.stationConfigs,
        [stationId]: {
          ...settings.stationConfigs[stationId],
          bumpDestination,
        },
      },
    };
    setSettings(updated);
    setStoredSettings(updated);
    showToast({ type: 'success', title: 'Station Config Updated' });
  };
  
  const handleReset = () => {
    resetStorage();
    setSettings(getStoredSettings());
    showToast({ type: 'success', title: 'Demo Reset', message: 'All data cleared' });
  };
  
  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <KDSHeader title="Settings" showBackLink />
      
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* General Settings */}
        <div className="bg-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">⚙️ General Settings</h2>
          
          <div className="space-y-4">
            {/* Late Threshold */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Late Threshold</p>
                <p className="text-sm text-neutral-500">Mark tickets as late after this many minutes</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.lateThresholdMinutes}
                  onChange={(e) => updateSettings({ lateThresholdMinutes: parseInt(e.target.value) || 15 })}
                  className="w-20 px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-center"
                  min="5"
                  max="60"
                />
                <span className="text-neutral-500">min</span>
              </div>
            </div>
            
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sound Alerts</p>
                <p className="text-sm text-neutral-500">Play sound for new tickets and late warnings</p>
              </div>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  settings.soundEnabled 
                    ? 'bg-green-600 text-white' 
                    : 'bg-neutral-700 text-neutral-400'
                }`}
              >
                {settings.soundEnabled ? '🔊 ON' : '🔇 OFF'}
              </button>
            </div>
            
            {/* Refresh Interval */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Refresh</p>
                <p className="text-sm text-neutral-500">Refresh ticket data interval</p>
              </div>
              <select
                value={settings.autoRefreshSeconds}
                onChange={(e) => updateSettings({ autoRefreshSeconds: parseInt(e.target.value) })}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600"
              >
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Station Configuration */}
        <div className="bg-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">🍳 Station Configuration</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Configure where tickets go when bumped from each station
          </p>
          
          <div className="space-y-3">
            {stations.filter(s => s.active).map(station => (
              <div key={station.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-700">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStationIcon(station.id as StationId)}</span>
                  <span className="font-medium">{getStationName(station.id as StationId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">Bump to:</span>
                  <select
                    value={settings.stationConfigs[station.id as StationId]?.bumpDestination || 'ready'}
                    onChange={(e) => updateStationConfig(station.id as StationId, e.target.value as 'ready' | 'completed')}
                    className="px-3 py-2 rounded-lg bg-neutral-600 border border-neutral-500"
                  >
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Demo Controls */}
        <div className="bg-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">🎮 Demo Controls</h2>
          
          <div className="space-y-4">
            {/* Kitchen Load */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Kitchen Load</p>
                <p className="text-sm text-neutral-500">Affects AI priority calculations and bottleneck detection</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.kitchenLoad}
                  onChange={(e) => updateSettings({ kitchenLoad: parseInt(e.target.value) })}
                  className="w-32 accent-orange-500"
                />
                <span className="font-bold w-12 text-right">{settings.kitchenLoad}%</span>
              </div>
            </div>
            
            {/* Rush Simulator */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rush Simulator</p>
                <p className="text-sm text-neutral-500">Auto-generate new orders</p>
              </div>
              <button
                onClick={() => updateSettings({ rushSimulatorEnabled: !settings.rushSimulatorEnabled })}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  settings.rushSimulatorEnabled 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-neutral-700 text-neutral-400'
                }`}
              >
                {settings.rushSimulatorEnabled ? '🔥 Active' : 'Off'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Reset */}
        <div className="bg-red-600/10 border border-red-600/50 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-2 text-red-400">⚠️ Reset Demo</h2>
          <p className="text-sm text-neutral-400 mb-4">
            Clear all tickets, logs, and settings. This will restore demo to initial state.
          </p>
          <button
            onClick={handleReset}
            className="btn-kds btn-danger"
          >
            🔄 Reset All Data
          </button>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}
