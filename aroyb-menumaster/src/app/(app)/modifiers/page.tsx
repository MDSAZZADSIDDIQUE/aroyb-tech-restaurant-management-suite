'use client';

import { useEffect, useState } from 'react';
import { getModifierGroups, saveModifierGroups } from '@/lib/storage';
import { generateId } from '@/lib/formatting';
import type { ModifierGroup, ModifierOption } from '@/types';

export default function ModifiersPage() {
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [selected, setSelected] = useState<ModifierGroup | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setGroups(getModifierGroups());
    setLoading(false);
  }, []);
  
  const handleSave = () => {
    if (!selected) return;
    const updated = groups.map(g => g.id === selected.id ? selected : g);
    saveModifierGroups(updated);
    setGroups(updated);
  };
  
  const addOption = () => {
    if (!selected) return;
    setSelected({
      ...selected,
      options: [...selected.options, { id: generateId('opt-'), name: '', price: 0, inStock: true }],
    });
  };
  
  const updateOption = (index: number, field: keyof ModifierOption, value: string | number | boolean) => {
    if (!selected) return;
    const options = [...selected.options];
    options[index] = { ...options[index], [field]: value };
    setSelected({ ...selected, options });
  };
  
  const removeOption = (index: number) => {
    if (!selected) return;
    setSelected({ ...selected, options: selected.options.filter((_, i) => i !== index) });
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Modifier Groups</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="space-y-2">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setSelected(g)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${selected?.id === g.id ? 'border-[#ed7424] bg-[#ed7424]/10' : 'border-neutral-700 hover:border-neutral-600'}`}
            >
              <div className="font-bold flex items-center gap-2">
                {g.name}
                {g.required && <span className="badge bg-red-500/20 text-red-400 text-xs">Required</span>}
              </div>
              <div className="text-xs text-neutral-400">{g.options.length} options • Min {g.minSelect} / Max {g.maxSelect}</div>
            </button>
          ))}
        </div>
        
        {/* Editor */}
        {selected ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="font-bold mb-4">Group Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Group Name</label>
                  <input type="text" value={selected.name} onChange={e => setSelected({ ...selected, name: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Selection</label>
                  <input type="number" min="0" value={selected.minSelect} onChange={e => setSelected({ ...selected, minSelect: parseInt(e.target.value) || 0 })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Selection</label>
                  <input type="number" min="1" value={selected.maxSelect} onChange={e => setSelected({ ...selected, maxSelect: parseInt(e.target.value) || 1 })} className="input" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected({ ...selected, required: !selected.required })} className={`toggle ${selected.required ? 'active' : ''}`}></button>
                  <span>Required</span>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Options</h2>
                <button onClick={addOption} className="btn btn-ghost btn-sm">+ Add Option</button>
              </div>
              <div className="space-y-2">
                {selected.options.map((opt, i) => (
                  <div key={opt.id} className="flex gap-2 items-center p-3 rounded-lg bg-neutral-800">
                    <input type="text" placeholder="Option name" value={opt.name} onChange={e => updateOption(i, 'name', e.target.value)} className="input flex-1" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-neutral-400">+£</span>
                      <input type="number" step="0.01" value={opt.price} onChange={e => updateOption(i, 'price', parseFloat(e.target.value) || 0)} className="input w-20" />
                    </div>
                    <button onClick={() => updateOption(i, 'inStock', !opt.inStock)} className={`badge cursor-pointer ${opt.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {opt.inStock ? 'In Stock' : '86'}
                    </button>
                    <button onClick={() => removeOption(i)} className="btn btn-ghost btn-sm text-red-400">×</button>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={handleSave} className="btn btn-primary w-full">Save Changes</button>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center text-neutral-500">
            Select a modifier group to edit
          </div>
        )}
      </div>
    </div>
  );
}
