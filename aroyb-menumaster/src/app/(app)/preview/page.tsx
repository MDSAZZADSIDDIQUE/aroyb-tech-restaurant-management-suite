'use client';

import { useEffect, useState } from 'react';
import { getCategories, getItems, getModifierGroups, getSchedules, getHappyHourRules } from '@/lib/storage';
import { getActiveSchedule, getActiveHappyHours, calculateDiscount } from '@/lib/schedule-engine';
import { formatCurrency, dietaryTagConfig } from '@/lib/formatting';
import type { Category, Item, ModifierGroup, Schedule, HappyHourRule } from '@/types';

export default function CustomerPreviewPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [happyHours, setHappyHours] = useState<HappyHourRule[]>([]);
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [activeHH, setActiveHH] = useState<HappyHourRule[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setCategories(getCategories());
    setItems(getItems());
    setModifierGroups(getModifierGroups());
    setSchedules(getSchedules());
    setHappyHours(getHappyHourRules());
    
    const now = new Date();
    const scheds = getSchedules();
    const hhs = getHappyHourRules();
    setActiveSchedule(getActiveSchedule(scheds, now));
    setActiveHH(getActiveHappyHours(hhs, now));
    setLoading(false);
  }, []);
  
  const getVisibleCategories = () => {
    if (!activeSchedule) return categories.filter(c => c.channelsEnabled.includes('web'));
    return categories.filter(c => c.channelsEnabled.includes('web') && activeSchedule.includedCategoryIds.includes(c.id));
  };
  
  const getItemPrice = (item: Item) => {
    const rule = activeHH.find(h => h.appliesToCategoryIds.includes(item.categoryId) || h.appliesToItemIds.includes(item.id));
    if (rule) return calculateDiscount(item.basePrice, rule);
    return item.basePrice;
  };
  
  const visibleCategories = getVisibleCategories();
  const visibleItems = items.filter(i => i.availability.inStock);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-black"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Aroyb Restaurant</h1>
              <p className="text-xs text-gray-500">View Menu</p>
            </div>
          </div>
          {activeSchedule && (
            <span className="px-3 py-1 rounded-full text-sm" style={{ background: activeSchedule.color + '20', color: activeSchedule.color }}>
              {activeSchedule.name} Menu
            </span>
          )}
        </div>
        
        {activeHH.length > 0 && (
          <div className="bg-amber-500 text-white text-center py-2 text-sm">
            🎉 {activeHH[0].name} — {activeHH[0].discountType === 'percentage' ? `${activeHH[0].discountAmount}% off` : formatCurrency(activeHH[0].discountAmount) + ' off'} selected items!
          </div>
        )}
      </header>
      
      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {visibleCategories.map(cat => {
          const catItems = visibleItems.filter(i => i.categoryId === cat.id);
          if (catItems.length === 0) return null;
          
          return (
            <section key={cat.id} className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h2>
              {cat.description && <p className="text-gray-500 text-sm mb-4">{cat.description}</p>}
              
              <div className="space-y-3">
                {catItems.map(item => {
                  const originalPrice = item.basePrice;
                  const discountedPrice = getItemPrice(item);
                  const hasDiscount = discountedPrice < originalPrice;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                          
                          <div className="flex gap-1 mt-2">
                            {item.dietaryTags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                {dietaryTagConfig[tag]?.icon} {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          {hasDiscount ? (
                            <>
                              <div className="text-gray-400 line-through text-sm">{formatCurrency(originalPrice)}</div>
                              <div className="font-bold text-amber-600">{formatCurrency(discountedPrice)}</div>
                            </>
                          ) : (
                            <div className="font-bold text-gray-900">{formatCurrency(originalPrice)}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedItem.name}</h2>
              <p className="text-gray-500 mt-2">{selectedItem.description}</p>
              
              <div className="text-2xl font-bold text-gray-900 mt-4">
                {formatCurrency(getItemPrice(selectedItem))}
              </div>
              
              {selectedItem.sizes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Size</h3>
                  <div className="space-y-2">
                    {selectedItem.sizes.map(size => (
                      <div key={size.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span>{size.name}</span>
                        <span className="font-semibold">{formatCurrency(size.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedItem.modifierGroupIds.length > 0 && (
                <div className="mt-4 space-y-4">
                  {selectedItem.modifierGroupIds.map(mgId => {
                    const mg = modifierGroups.find(m => m.id === mgId);
                    if (!mg) return null;
                    return (
                      <div key={mgId}>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          {mg.name} {mg.required && <span className="text-red-500">*</span>}
                        </h3>
                        <div className="space-y-2">
                          {mg.options.filter(o => o.inStock).map(opt => (
                            <div key={opt.id} className="flex items-center justify-between p-2 border rounded-lg">
                              <span>{opt.name}</span>
                              {opt.price > 0 && <span className="text-gray-500">+{formatCurrency(opt.price)}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {selectedItem.allergens.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-semibold text-amber-800 text-sm mb-1">⚠️ Contains Allergens</h3>
                  <p className="text-amber-700 text-sm">{selectedItem.allergens.join(', ')}</p>
                </div>
              )}
              
              <button onClick={() => setSelectedItem(null)} className="w-full mt-6 bg-[#ed7424] text-white py-3 rounded-xl font-semibold">
                Add to Order — {formatCurrency(getItemPrice(selectedItem))}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        Powered by Aroyb MenuMaster
      </footer>
    </div>
  );
}
