'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { showToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/formatting';
import { getStoredSettings, setStoredSettings } from '@/lib/storage';
import type { Settings, DeliveryZone } from '@/types';

export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredSettings();
    setSettings(stored);
    setLoading(false);
  }, []);

  const updateZone = (zoneId: string, updates: Partial<DeliveryZone>) => {
    if (!settings) return;
    
    const updatedZones = settings.deliveryZones.map(z =>
      z.id === zoneId ? { ...z, ...updates } : z
    );
    
    const updated = { ...settings, deliveryZones: updatedZones };
    setSettings(updated);
    setStoredSettings(updated);
    showToast({ type: 'success', title: 'Zone updated' });
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
      <Header title="Delivery Settings" subtitle="Configure delivery zones, fees, and minimums" />
      
      <div className="p-6 space-y-6">
        {/* Delivery Zones */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold">Delivery Zones</h3>
          </div>
          <div className="p-4 space-y-4">
            {settings.deliveryZones.map(zone => (
              <div key={zone.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{zone.name}</h4>
                    <p className="text-sm text-gray-500">{zone.minDistance} - {zone.maxDistance} miles</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zone.active}
                      onChange={(e) => updateZone(zone.id, { active: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className={zone.active ? 'text-green-600' : 'text-gray-400'}>
                      {zone.active ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Delivery Fee</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400">£</span>
                      <input
                        type="number"
                        step="0.01"
                        value={zone.fee}
                        onChange={(e) => updateZone(zone.id, { fee: parseFloat(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Free Delivery Over</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400">£</span>
                      <input
                        type="number"
                        step="0.01"
                        value={zone.freeDeliveryThreshold || ''}
                        onChange={(e) => updateZone(zone.id, { freeDeliveryThreshold: parseFloat(e.target.value) || undefined })}
                        placeholder="None"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Minimum Order</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400">£</span>
                      <input
                        type="number"
                        step="0.01"
                        value={zone.minimumOrder}
                        onChange={(e) => updateZone(zone.id, { minimumOrder: parseFloat(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium mb-2">Current Fee Structure</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {settings.deliveryZones.filter(z => z.active).map(zone => (
              <div key={zone.id} className="bg-white rounded-lg p-3">
                <p className="font-medium">{zone.name}</p>
                <p className="text-gray-500">
                  Fee: {formatCurrency(zone.fee)}
                  {zone.freeDeliveryThreshold && ` (free over ${formatCurrency(zone.freeDeliveryThreshold)})`}
                </p>
                <p className="text-gray-500">Min: {formatCurrency(zone.minimumOrder)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
