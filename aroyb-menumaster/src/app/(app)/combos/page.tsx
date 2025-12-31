'use client';

import { useEffect, useState } from 'react';
import { getCombos, getItems, getSchedules, saveCombos } from '@/lib/storage';
import { formatCurrency, generateId } from '@/lib/formatting';
import type { Combo, Item, Schedule, ComboSlot } from '@/types';

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selected, setSelected] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setCombos(getCombos());
    setItems(getItems());
    setSchedules(getSchedules());
    setLoading(false);
  }, []);
  
  const handleSave = () => {
    if (!selected) return;
    const exists = combos.find(c => c.id === selected.id);
    let updated: Combo[];
    if (exists) {
      updated = combos.map(c => c.id === selected.id ? selected : c);
    } else {
      updated = [...combos, selected];
    }
    saveCombos(updated);
    setCombos(updated);
    setSelected(null);
  };
  
  const getItemName = (id: string) => items.find(i => i.id === id)?.name || id;
  
  const addSlot = () => {
    if (!selected) return;
    setSelected({
      ...selected,
      slots: [...selected.slots, { id: generateId('slot-'), name: '', allowedItemIds: [], defaultItemId: undefined }],
    });
  };
  
  const updateSlot = (index: number, field: keyof ComboSlot, value: string | string[]) => {
    if (!selected) return;
    const slots = [...selected.slots];
    slots[index] = { ...slots[index], [field]: value };
    setSelected({ ...selected, slots });
  };
  
  const toggleSchedule = (schedId: string) => {
    if (!selected) return;
    const current = selected.activeScheduleIds || [];
    if (current.includes(schedId)) {
      setSelected({ ...selected, activeScheduleIds: current.filter(s => s !== schedId) });
    } else {
      setSelected({ ...selected, activeScheduleIds: [...current, schedId] });
    }
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Combos & Meal Deals</h1>
        <button onClick={() => setSelected({ id: generateId('combo-'), name: '', description: '', price: 0, slots: [], activeScheduleIds: [] })} className="btn btn-primary">+ New Combo</button>
      </div>
      
      {!selected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.map(combo => (
            <button key={combo.id} onClick={() => setSelected(combo)} className="card card-hover text-left">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg">{combo.name}</h3>
                <span className="badge bg-green-500/20 text-green-400">{formatCurrency(combo.price)}</span>
              </div>
              <p className="text-sm text-neutral-400 mt-1">{combo.description}</p>
              <div className="mt-3 text-xs text-neutral-500">
                {combo.slots.length} slots • Saves {combo.savings ? formatCurrency(combo.savings) : '—'}
              </div>
              <div className="flex gap-1 mt-2">
                {combo.activeScheduleIds.map(sid => {
                  const s = schedules.find(sc => sc.id === sid);
                  return s ? <span key={sid} className="tag" style={{ background: s.color + '30', color: s.color }}>{s.name}</span> : null;
                })}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="max-w-3xl">
          <div className="card mb-6">
            <h2 className="font-bold mb-4">Combo Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" value={selected.name} onChange={e => setSelected({ ...selected, name: e.target.value })} className="input" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={selected.description} onChange={e => setSelected({ ...selected, description: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Combo Price</label>
                <input type="number" step="0.01" value={selected.price} onChange={e => setSelected({ ...selected, price: parseFloat(e.target.value) || 0 })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Savings</label>
                <input type="number" step="0.01" value={selected.savings || ''} onChange={e => setSelected({ ...selected, savings: parseFloat(e.target.value) || 0 })} className="input" />
              </div>
            </div>
          </div>
          
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Slots</h2>
              <button onClick={addSlot} className="btn btn-ghost btn-sm">+ Add Slot</button>
            </div>
            <div className="space-y-4">
              {selected.slots.map((slot, i) => (
                <div key={slot.id} className="p-4 rounded-lg bg-neutral-800">
                  <input type="text" placeholder="Slot name (e.g. Choose Burger)" value={slot.name} onChange={e => updateSlot(i, 'name', e.target.value)} className="input mb-3" />
                  <div className="text-sm text-neutral-400 mb-2">Allowed items (click to toggle):</div>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-auto">
                    {items.slice(0, 30).map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const allowed = slot.allowedItemIds || [];
                          updateSlot(i, 'allowedItemIds', allowed.includes(item.id) ? allowed.filter(x => x !== item.id) : [...allowed, item.id]);
                        }}
                        className={`px-2 py-1 rounded text-xs ${slot.allowedItemIds?.includes(item.id) ? 'bg-[#ed7424] text-white' : 'bg-neutral-700'}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card mb-6">
            <h2 className="font-bold mb-4">Active During</h2>
            <div className="flex gap-2">
              {schedules.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSchedule(s.id)}
                  className={`px-3 py-2 rounded-lg ${selected.activeScheduleIds?.includes(s.id) ? 'text-white' : 'bg-neutral-700'}`}
                  style={selected.activeScheduleIds?.includes(s.id) ? { background: s.color } : {}}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setSelected(null)} className="btn btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} className="btn btn-primary flex-1">Save Combo</button>
          </div>
        </div>
      )}
    </div>
  );
}
