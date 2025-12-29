'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { showToast } from '@/components/ui/Toast';
import { getStoredSettings, setStoredSettings } from '@/lib/storage';
import type { Settings, OpeningHours, DayOfWeek } from '@/types';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
};

export default function HoursSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredSettings();
    setSettings(stored);
    setLoading(false);
  }, []);

  const updateHours = (day: DayOfWeek, updates: Partial<OpeningHours>) => {
    if (!settings) return;
    
    const updatedHours = settings.openingHours.map(h =>
      h.day === day ? { ...h, ...updates } : h
    );
    
    const updated = { ...settings, openingHours: updatedHours };
    setSettings(updated);
    setStoredSettings(updated);
    showToast({ type: 'success', title: 'Hours updated' });
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
      <Header title="Opening Hours" subtitle="Configure your restaurant's operating hours" />
      
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Day</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Open</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Opening Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Closing Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {DAYS.map(day => {
                const hours = settings.openingHours.find(h => h.day === day);
                if (!hours) return null;
                
                return (
                  <tr key={day}>
                    <td className="px-4 py-4">
                      <span className="font-medium">{DAY_LABELS[day]}</span>
                    </td>
                    <td className="px-4 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hours.open}
                          onChange={(e) => updateHours(day, { open: e.target.checked })}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className={hours.open ? 'text-green-600' : 'text-gray-400'}>
                          {hours.open ? 'Open' : 'Closed'}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="time"
                        value={hours.openTime}
                        onChange={(e) => updateHours(day, { openTime: e.target.value })}
                        disabled={!hours.open}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="time"
                        value={hours.closeTime}
                        onChange={(e) => updateHours(day, { closeTime: e.target.value })}
                        disabled={!hours.open}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Holiday Overrides */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Holiday Overrides</h3>
          <div className="space-y-2">
            {settings.holidayOverrides.map(holiday => (
              <div key={holiday.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{holiday.name}</span>
                  <span className="text-sm text-gray-500 ml-2">{holiday.date}</span>
                </div>
                <span className={holiday.closed ? 'text-red-600' : 'text-green-600'}>
                  {holiday.closed ? 'Closed' : `${holiday.openTime} - ${holiday.closeTime}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
