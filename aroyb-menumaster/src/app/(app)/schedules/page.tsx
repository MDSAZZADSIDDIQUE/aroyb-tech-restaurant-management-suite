'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSchedules, getHappyHourRules, saveSchedules, saveHappyHourRules, getCategories } from '@/lib/storage';
import { dayConfig, formatCurrency, generateId } from '@/lib/formatting';
import type { Schedule, HappyHourRule, DayOfWeek, Category } from '@/types';

const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [happyHours, setHappyHours] = useState<HappyHourRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingHH, setEditingHH] = useState<HappyHourRule | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setSchedules(getSchedules());
    setHappyHours(getHappyHourRules());
    setCategories(getCategories());
    setLoading(false);
  }, []);
  
  const handleSaveSchedule = () => {
    if (!editingSchedule) return;
    const updated = schedules.map(s => s.id === editingSchedule.id ? editingSchedule : s);
    saveSchedules(updated);
    setSchedules(updated);
    setEditingSchedule(null);
  };
  
  const handleSaveHH = () => {
    if (!editingHH) return;
    const exists = happyHours.find(h => h.id === editingHH.id);
    const updated = exists ? happyHours.map(h => h.id === editingHH.id ? editingHH : h) : [...happyHours, editingHH];
    saveHappyHourRules(updated);
    setHappyHours(updated);
    setEditingHH(null);
  };
  
  const toggleDay = (day: DayOfWeek, current: DayOfWeek[], set: (days: DayOfWeek[]) => void) => {
    if (current.includes(day)) set(current.filter(d => d !== day));
    else set([...current, day]);
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <Link href="/schedules/simulator" className="btn btn-ghost">⏱️ Simulator</Link>
      </div>
      
      {/* Schedules */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Menu Schedules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schedules.map(s => (
            <button key={s.id} onClick={() => setEditingSchedule(s)} className="card card-hover text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ background: s.color }}></div>
                <span className="font-bold text-lg">{s.name}</span>
              </div>
              <div className="text-neutral-400">{s.startTime} – {s.endTime}</div>
              <div className="flex gap-1 mt-2">
                {s.daysOfWeek.map(d => <span key={d} className="tag bg-neutral-700">{dayConfig[d].short}</span>)}
              </div>
              <div className="text-xs text-neutral-500 mt-2">{s.includedCategoryIds.length} categories</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Happy Hours */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Happy Hour Rules</h2>
          <button onClick={() => setEditingHH({ id: generateId('hh-'), name: '', startTime: '16:00', endTime: '19:00', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], appliesToCategoryIds: [], appliesToItemIds: [], discountType: 'percentage', discountAmount: 20, active: true })} className="btn btn-primary">+ Add Rule</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {happyHours.map(hh => (
            <button key={hh.id} onClick={() => setEditingHH(hh)} className={`card card-hover text-left ${!hh.active ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{hh.name}</span>
                <span className={`badge ${hh.active ? 'bg-green-500/20 text-green-400' : 'bg-neutral-600'}`}>{hh.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="text-neutral-400">{hh.startTime} – {hh.endTime}</div>
              <div className="text-amber-400 font-semibold mt-2">
                {hh.discountType === 'percentage' ? `${hh.discountAmount}% off` : `${formatCurrency(hh.discountAmount)} off`}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Schedule Editor Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Edit Schedule: {editingSchedule.name}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Start Time</label>
                  <input type="time" value={editingSchedule.startTime} onChange={e => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm mb-1">End Time</label>
                  <input type="time" value={editingSchedule.endTime} onChange={e => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Days</label>
                <div className="flex gap-1">
                  {ALL_DAYS.map(d => (
                    <button key={d} onClick={() => toggleDay(d, editingSchedule.daysOfWeek, days => setEditingSchedule({ ...editingSchedule, daysOfWeek: days }))} className={`px-2 py-1 rounded text-xs ${editingSchedule.daysOfWeek.includes(d) ? 'bg-[#ed7424] text-white' : 'bg-neutral-700'}`}>{dayConfig[d].short}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingSchedule(null)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={handleSaveSchedule} className="btn btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Happy Hour Editor Modal */}
      {editingHH && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">{happyHours.find(h => h.id === editingHH.id) ? 'Edit' : 'New'} Happy Hour</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input type="text" value={editingHH.name} onChange={e => setEditingHH({ ...editingHH, name: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Start</label>
                  <input type="time" value={editingHH.startTime} onChange={e => setEditingHH({ ...editingHH, startTime: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm mb-1">End</label>
                  <input type="time" value={editingHH.endTime} onChange={e => setEditingHH({ ...editingHH, endTime: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Discount Type</label>
                  <select value={editingHH.discountType} onChange={e => setEditingHH({ ...editingHH, discountType: e.target.value as 'percentage' | 'fixed' })} className="select w-full">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Amount</label>
                  <input type="number" value={editingHH.discountAmount} onChange={e => setEditingHH({ ...editingHH, discountAmount: parseFloat(e.target.value) || 0 })} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Applies to Categories</label>
                <div className="flex flex-wrap gap-1">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setEditingHH({ ...editingHH, appliesToCategoryIds: editingHH.appliesToCategoryIds.includes(c.id) ? editingHH.appliesToCategoryIds.filter(x => x !== c.id) : [...editingHH.appliesToCategoryIds, c.id] })}
                      className={`px-2 py-1 rounded text-xs ${editingHH.appliesToCategoryIds.includes(c.id) ? 'bg-[#ed7424] text-white' : 'bg-neutral-700'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditingHH({ ...editingHH, active: !editingHH.active })} className={`toggle ${editingHH.active ? 'active' : ''}`}></button>
                <span>Active</span>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingHH(null)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={handleSaveHH} className="btn btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
