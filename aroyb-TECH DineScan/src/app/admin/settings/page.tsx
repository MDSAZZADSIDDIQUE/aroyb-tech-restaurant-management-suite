'use client';

import { useState, useEffect } from 'react';
import locationsData from '@/data/locations.json';
import { Location, FeatureToggles, ServiceChargeConfig } from '@/types';

export default function AdminSettingsPage() {
  const [locations, setLocations] = useState<Location[]>(locationsData.locations as Location[]);
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0].id);
  const [saved, setSaved] = useState(false);

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  const handleToggleChange = (toggle: keyof FeatureToggles) => {
    setLocations(prev => prev.map(loc => {
      if (loc.id === selectedLocationId) {
        return {
          ...loc,
          featureToggles: {
            ...loc.featureToggles,
            [toggle]: !loc.featureToggles[toggle],
          },
        };
      }
      return loc;
    }));
  };

  const handleServiceChargeChange = (field: keyof ServiceChargeConfig, value: any) => {
    setLocations(prev => prev.map(loc => {
      if (loc.id === selectedLocationId) {
        return {
          ...loc,
          serviceCharge: {
            ...loc.serviceCharge,
            [field]: value,
          },
        };
      }
      return loc;
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    // For demo, we just show a success message
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Save to localStorage for demo persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinescan-locations', JSON.stringify(locations));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-500">Configure features and service charges</p>
        </div>
        
        <select
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          className="input-field w-auto"
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.shortName}
            </option>
          ))}
        </select>
      </div>

      {selectedLocation && (
        <div className="space-y-8">
          {/* Feature Toggles */}
          <div className="card">
            <h2 className="font-semibold text-neutral-900 mb-4">Feature Toggles</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Enable or disable features for this location
            </p>
            
            <div className="space-y-4">
              <ToggleRow
                label="Pay at Table"
                description="Allow customers to pay directly from their phone"
                enabled={selectedLocation.featureToggles.payAtTable}
                onChange={() => handleToggleChange('payAtTable')}
              />
              
              <ToggleRow
                label="Call Waiter"
                description="Show 'Call Waiter' button for customers"
                enabled={selectedLocation.featureToggles.callWaiter}
                onChange={() => handleToggleChange('callWaiter')}
              />
              
              <ToggleRow
                label="Request Bill"
                description="Show 'Request Bill' button for customers"
                enabled={selectedLocation.featureToggles.requestBill}
                onChange={() => handleToggleChange('requestBill')}
              />
              
              <ToggleRow
                label="Course Pacing"
                description="Allow customers to stagger courses (starters first, mains later)"
                enabled={selectedLocation.featureToggles.coursePacing}
                onChange={() => handleToggleChange('coursePacing')}
              />
            </div>
          </div>

          {/* Service Charge */}
          <div className="card">
            <h2 className="font-semibold text-neutral-900 mb-4">Service Charge</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Configure optional service charge for dine-in orders
            </p>
            
            <div className="space-y-4">
              <ToggleRow
                label="Enable Service Charge"
                description="Add automatic service charge to bills"
                enabled={selectedLocation.serviceCharge.enabled}
                onChange={() => handleServiceChargeChange('enabled', !selectedLocation.serviceCharge.enabled)}
              />
              
              {selectedLocation.serviceCharge.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Charge Type
                    </label>
                    <select
                      value={selectedLocation.serviceCharge.type}
                      onChange={(e) => handleServiceChargeChange('type', e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (£)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {selectedLocation.serviceCharge.type === 'percentage' ? 'Percentage' : 'Amount (£)'}
                    </label>
                    <input
                      type="number"
                      value={selectedLocation.serviceCharge.value}
                      onChange={(e) => handleServiceChargeChange('value', parseFloat(e.target.value))}
                      className="input-field w-full"
                      step={selectedLocation.serviceCharge.type === 'percentage' ? '0.5' : '0.50'}
                      min="0"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button onClick={handleSave} className="btn-primary">
              Save Changes
            </button>
            {saved && (
              <span className="text-success-600 text-sm animate-fade-in">
                ✓ Settings saved (demo mode)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div>
        <p className="font-medium text-neutral-900">{label}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-neutral-200'
        }`}
      >
        <span
          className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
