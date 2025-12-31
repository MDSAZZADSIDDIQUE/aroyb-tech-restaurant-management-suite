'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getItemById, getCategories, getModifierGroups, getAddOnGroups, updateItem, addItem } from '@/lib/storage';
import { formatCurrency, stationConfig, vatCategoryConfig, allergenIcons, dietaryTagConfig, generateId } from '@/lib/formatting';
import { ALLERGENS, DIETARY_TAGS } from '@/types';
import type { Item, Category, ModifierGroup, AddOnGroup, StationId, VATCategory, ItemSize } from '@/types';

const defaultItem: Partial<Item> = {
  name: '', description: '', basePrice: 0, sizes: [], halfHalfEnabled: false,
  modifierGroupIds: [], addOnGroupIds: [], allergens: [], dietaryTags: [],
  station: 'grill', vatCategory: 'food', cost: 0, popularity: 50,
  availability: { inStock: true },
};

export default function ItemEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  
  const [item, setItem] = useState<Partial<Item>>(defaultItem);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [addOnGroups, setAddOnGroups] = useState<AddOnGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    setCategories(getCategories());
    setModifierGroups(getModifierGroups());
    setAddOnGroups(getAddOnGroups());
    
    if (!isNew) {
      const found = getItemById(params.id as string);
      if (found) setItem(found);
    } else {
      const cats = getCategories();
      if (cats.length > 0) setItem({ ...defaultItem, categoryId: cats[0].id });
    }
    setLoading(false);
  }, [isNew, params.id]);
  
  const handleSave = () => {
    if (!item.name || !item.categoryId) return;
    setSaving(true);
    
    if (isNew) {
      addItem({ ...defaultItem, ...item, id: generateId('i') } as Item);
    } else {
      updateItem(params.id as string, item);
    }
    
    router.push('/menu/items');
  };
  
  const toggleArrayItem = <T,>(arr: T[], value: T, setter: (arr: T[]) => void) => {
    if (arr.includes(value)) setter(arr.filter(v => v !== value));
    else setter([...arr, value]);
  };
  
  const addSize = () => {
    const sizes = item.sizes || [];
    setItem({ ...item, sizes: [...sizes, { id: generateId('sz-'), name: '', price: 0 }] });
  };
  
  const updateSize = (index: number, field: keyof ItemSize, value: string | number) => {
    const sizes = [...(item.sizes || [])];
    sizes[index] = { ...sizes[index], [field]: value };
    setItem({ ...item, sizes });
  };
  
  const removeSize = (index: number) => {
    setItem({ ...item, sizes: (item.sizes || []).filter((_, i) => i !== index) });
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/menu/items" className="btn btn-ghost">← Back</Link>
        <h1 className="text-2xl font-bold">{isNew ? 'New Item' : 'Edit Item'}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-bold mb-4">Basic Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" value={item.name || ''} onChange={e => setItem({ ...item, name: e.target.value })} className="input" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={item.description || ''} onChange={e => setItem({ ...item, description: e.target.value })} className="input" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Price *</label>
                <input type="number" step="0.01" min="0" value={item.basePrice || ''} onChange={e => setItem({ ...item, basePrice: parseFloat(e.target.value) || 0 })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select value={item.categoryId || ''} onChange={e => setItem({ ...item, categoryId: e.target.value })} className="select w-full">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Station</label>
                <select value={item.station} onChange={e => setItem({ ...item, station: e.target.value as StationId })} className="select w-full">
                  {Object.entries(stationConfig).map(([id, cfg]) => <option key={id} value={id}>{cfg.icon} {cfg.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">VAT Category</label>
                <select value={item.vatCategory} onChange={e => setItem({ ...item, vatCategory: e.target.value as VATCategory })} className="select w-full">
                  {Object.entries(vatCategoryConfig).map(([id, cfg]) => <option key={id} value={id}>{cfg.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          {/* Sizes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Sizes / Variants</h2>
              <button onClick={addSize} className="btn btn-ghost btn-sm">+ Add Size</button>
            </div>
            {(item.sizes || []).length === 0 ? (
              <p className="text-neutral-500">No sizes – single price only</p>
            ) : (
              <div className="space-y-2">
                {(item.sizes || []).map((size, i) => (
                  <div key={size.id} className="flex gap-2 items-center">
                    <input type="text" placeholder="Size name" value={size.name} onChange={e => updateSize(i, 'name', e.target.value)} className="input flex-1" />
                    <input type="number" step="0.01" placeholder="Price" value={size.price} onChange={e => updateSize(i, 'price', parseFloat(e.target.value) || 0)} className="input w-24" />
                    <button onClick={() => removeSize(i)} className="btn btn-ghost btn-sm text-red-400">×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => setItem({ ...item, halfHalfEnabled: !item.halfHalfEnabled })} className={`toggle ${item.halfHalfEnabled ? 'active' : ''}`}></button>
              <span className="text-sm">Enable Half & Half</span>
            </div>
          </div>
          
          {/* Modifiers */}
          <div className="card">
            <h2 className="font-bold mb-4">Modifier Groups</h2>
            <div className="flex flex-wrap gap-2">
              {modifierGroups.map(mg => (
                <button
                  key={mg.id}
                  onClick={() => toggleArrayItem(item.modifierGroupIds || [], mg.id, arr => setItem({ ...item, modifierGroupIds: arr }))}
                  className={`px-3 py-2 rounded-lg text-sm ${item.modifierGroupIds?.includes(mg.id) ? 'bg-[#ed7424] text-white' : 'bg-neutral-700'}`}
                >
                  {mg.name} {mg.required && <span className="text-xs opacity-70">*</span>}
                </button>
              ))}
            </div>
          </div>
          
          {/* Add-ons */}
          <div className="card">
            <h2 className="font-bold mb-4">Add-on Groups</h2>
            <div className="flex flex-wrap gap-2">
              {addOnGroups.map(ag => (
                <button
                  key={ag.id}
                  onClick={() => toggleArrayItem(item.addOnGroupIds || [], ag.id, arr => setItem({ ...item, addOnGroupIds: arr }))}
                  className={`px-3 py-2 rounded-lg text-sm ${item.addOnGroupIds?.includes(ag.id) ? 'bg-[#ed7424] text-white' : 'bg-neutral-700'}`}
                >
                  {ag.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Allergens */}
          <div className="card">
            <h2 className="font-bold mb-4">Allergens</h2>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map(a => (
                <button
                  key={a}
                  onClick={() => toggleArrayItem(item.allergens || [], a, arr => setItem({ ...item, allergens: arr }))}
                  className={`px-3 py-1 rounded-lg text-sm ${item.allergens?.includes(a) ? 'bg-red-500 text-white' : 'bg-neutral-700'}`}
                >
                  {allergenIcons[a]} {a}
                </button>
              ))}
            </div>
          </div>
          
          {/* Dietary Tags */}
          <div className="card">
            <h2 className="font-bold mb-4">Dietary Tags</h2>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleArrayItem(item.dietaryTags || [], t, arr => setItem({ ...item, dietaryTags: arr }))}
                  className={`px-3 py-1 rounded-lg text-sm ${item.dietaryTags?.includes(t) ? 'bg-green-500 text-white' : 'bg-neutral-700'}`}
                >
                  {dietaryTagConfig[t]?.icon} {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-bold mb-4">Cost & Metrics</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Cost (for margin calc)</label>
                <input type="number" step="0.01" min="0" value={item.cost || ''} onChange={e => setItem({ ...item, cost: parseFloat(e.target.value) || 0 })} className="input" />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Popularity (0-100)</label>
                <input type="number" min="0" max="100" value={item.popularity || ''} onChange={e => setItem({ ...item, popularity: parseInt(e.target.value) || 0 })} className="input" />
              </div>
              {item.cost && item.basePrice ? (
                <div className="p-3 rounded-lg bg-neutral-800">
                  <div className="text-sm text-neutral-400">Margin</div>
                  <div className="font-bold text-lg">{formatCurrency(item.basePrice - item.cost)} ({Math.round((1 - item.cost / item.basePrice) * 100)}%)</div>
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="card">
            <h2 className="font-bold mb-4">Availability</h2>
            <button onClick={() => setItem({ ...item, availability: { ...item.availability!, inStock: !item.availability?.inStock } })} className={`toggle ${item.availability?.inStock ? 'active' : ''}`}></button>
            <span className="ml-3">{item.availability?.inStock ? 'In Stock' : 'Sold Out'}</span>
          </div>
          
          <button onClick={handleSave} disabled={saving || !item.name} className="btn btn-primary w-full">
            {saving ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
