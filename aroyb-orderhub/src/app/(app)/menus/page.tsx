'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { showToast } from '@/components/ui/Toast';
import { formatCurrency, stationLabels } from '@/lib/formatting';
import { getStoredMenuItems, setStoredMenuItems, getStoredSettings } from '@/lib/storage';
import type { MenuItem, Settings } from '@/types';

export default function MenusPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const items = getStoredMenuItems() || [];
    const storedSettings = getStoredSettings();
    setMenuItems(items);
    setSettings(storedSettings);
    setLoading(false);
  }, []);

  const toggleItemPause = (itemId: string) => {
    const updatedItems = menuItems.map(item =>
      item.id === itemId ? { ...item, paused: !item.paused } : item
    );
    setMenuItems(updatedItems);
    setStoredMenuItems(updatedItems);
    const item = updatedItems.find(i => i.id === itemId);
    showToast({
      type: item?.paused ? 'warning' : 'success',
      title: item?.paused ? `${item.name} is now 86'd` : `${item?.name} is available`,
    });
  };

  const filteredItems = menuItems.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categories = [...new Set(menuItems.map(i => i.category))];
  const pausedCount = menuItems.filter(i => i.paused).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Menu Management" 
        subtitle={`${menuItems.length} items • ${pausedCount} paused`}
      />
      
      <div className="p-6 space-y-6">
        {/* Menu Schedules */}
        {settings?.menuSchedules && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Active Schedules</h3>
            <div className="flex flex-wrap gap-2">
              {settings.menuSchedules.filter(s => s.active).map(schedule => (
                <div key={schedule.id} className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
                  <span className="font-medium">{schedule.name}</span>
                  <span className="text-gray-500 ml-2">{schedule.startTime} - {schedule.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-4 ${
                item.paused ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className={`font-medium ${item.paused ? 'text-red-800 line-through' : ''}`}>
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <span className="font-bold">{formatCurrency(item.price)}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span className="px-2 py-0.5 bg-gray-100 rounded">{stationLabels[item.station]}</span>
                <span>Prep: {item.prepTimeBase} min</span>
              </div>
              
              {/* Allergens & Tags */}
              {(item.allergens.length > 0 || item.dietaryTags.length > 0) && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.dietaryTags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {item.allergens.map(allergen => (
                    <span key={allergen} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                      {allergen}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Actions */}
              <button
                onClick={() => toggleItemPause(item.id)}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.paused
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {item.paused ? 'Mark Available' : "86 Item"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
