'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { showToast } from '@/components/ui/Toast';
import { channelConfig } from '@/lib/formatting';
import { getStoredSettings, setStoredSettings } from '@/lib/storage';
import type { Settings, AutoAcceptRule, SourceChannel } from '@/types';

export default function AutoAcceptSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredSettings();
    setSettings(stored);
    setLoading(false);
  }, []);

  const updateRule = (channel: SourceChannel, enabled: boolean) => {
    if (!settings) return;
    
    const updatedRules = settings.autoAcceptRules.map(r =>
      r.channel === channel ? { ...r, enabled } : r
    );
    
    const updated = { ...settings, autoAcceptRules: updatedRules };
    setSettings(updated);
    setStoredSettings(updated);
    showToast({ type: 'success', title: `Auto-accept ${enabled ? 'enabled' : 'disabled'} for ${channelConfig[channel].label}` });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Auto-Accept Rules" subtitle="Configure automatic order acceptance per channel" />
      
      <div className="p-6 space-y-6">
        {/* Rules by Channel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold">Channel Rules</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {settings.autoAcceptRules.map(rule => {
              const channel = channelConfig[rule.channel];
              return (
                <div key={rule.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded ${channel.bgColor} ${channel.color} text-sm font-medium`}>
                        {channel.label}
                      </span>
                      <span className={rule.enabled ? 'text-green-600' : 'text-gray-400'}>
                        {rule.enabled ? 'Auto-accept enabled' : 'Manual review required'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => updateRule(rule.channel, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  
                  {rule.enabled && rule.conditions.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Conditions:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rule.conditions.map((cond, idx) => (
                          <li key={idx}>
                            • {cond.type.replace(/_/g, ' ')} {cond.operator.replace(/_/g, ' ')} {String(cond.value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 className="font-semibold text-purple-900 flex items-center gap-2 mb-2">
            🤖 AI Auto-Accept
          </h4>
          <p className="text-sm text-purple-800">
            When auto-accept is enabled, orders are automatically accepted if all conditions are met.
            The system checks kitchen load, operating hours, and order value before accepting.
            Orders that don&apos;t meet criteria are held for manual review.
          </p>
        </div>
      </div>
    </div>
  );
}
