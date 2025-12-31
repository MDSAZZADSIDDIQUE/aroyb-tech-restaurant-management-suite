'use client';

import { useEffect, useState } from 'react';
import { getItems, getCategories, getModifierGroups, updateItem, saveItems, saveModifierGroups } from '@/lib/storage';
import type { Item, Category, ModifierGroup } from '@/types';

export default function AvailabilityPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setItems(getItems());
    setCategories(getCategories());
    setModifierGroups(getModifierGroups());
    setLoading(false);
  }, []);
  
  const toggleItem = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, availability: { ...i.availability, inStock: !i.availability.inStock } } : i);
    saveItems(updated);
    setItems(updated);
  };
  
  const toggleModifierOption = (groupId: string, optionId: string) => {
    const updated = modifierGroups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        options: g.options.map(o => o.id === optionId ? { ...o, inStock: !o.inStock } : o),
      };
    });
    saveModifierGroups(updated);
    setModifierGroups(updated);
  };
  
  const bulkSetCategory = (categoryId: string, inStock: boolean) => {
    const updated = items.map(i => i.categoryId === categoryId ? { ...i, availability: { ...i.availability, inStock } } : i);
    saveItems(updated);
    setItems(updated);
  };
  
  const soldOutItems = items.filter(i => !i.availability.inStock);
  const soldOutOptions = modifierGroups.flatMap(g => g.options.filter(o => !o.inStock).map(o => ({ group: g.name, option: o.name, groupId: g.id, optionId: o.id })));
  
  const filteredItems = items.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && i.categoryId !== filterCategory) return false;
    return true;
  });
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">86 / Sold Out Controls</h1>
      
      {/* Live Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h2 className="font-bold text-red-400 mb-3">🚫 Currently 86&apos;d Items</h2>
          {soldOutItems.length === 0 ? (
            <p className="text-green-400">✅ Everything in stock</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-auto">
              {soldOutItems.map(i => (
                <div key={i.id} className="flex items-center justify-between p-2 rounded bg-red-500/10">
                  <span>{i.name}</span>
                  <button onClick={() => toggleItem(i.id)} className="btn btn-sm btn-success">Mark In Stock</button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card">
          <h2 className="font-bold text-amber-400 mb-3">⚠️ Unavailable Options</h2>
          {soldOutOptions.length === 0 ? (
            <p className="text-green-400">✅ All options available</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-auto">
              {soldOutOptions.map((o, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-amber-500/10">
                  <div>
                    <span className="font-medium">{o.option}</span>
                    <span className="text-xs text-neutral-500 ml-2">in "{o.group}"</span>
                  </div>
                  <button onClick={() => toggleModifierOption(o.groupId, o.optionId)} className="btn btn-sm btn-ghost">Restore</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Bulk Actions */}
      <div className="card mb-6">
        <h2 className="font-bold mb-3">Bulk Actions</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <div key={c.id} className="flex gap-1">
              <button onClick={() => bulkSetCategory(c.id, false)} className="btn btn-ghost btn-sm text-red-400">{c.name} → 86 All</button>
              <button onClick={() => bulkSetCategory(c.id, true)} className="btn btn-ghost btn-sm text-green-400">Restock</button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Item List */}
      <div className="card">
        <div className="flex gap-4 mb-4">
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="input w-64" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="select">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3 rounded-lg text-left transition-all ${item.availability.inStock ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20' : 'bg-red-500/10 border border-red-500/30'}`}
            >
              <div className="flex items-center justify-between">
                <span className={!item.availability.inStock ? 'line-through' : ''}>{item.name}</span>
                <span className={`badge ${item.availability.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {item.availability.inStock ? '✓' : '86'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
