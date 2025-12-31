'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSchedules, getHappyHourRules, getCategories, getItems } from '@/lib/storage';
import { getActiveSchedule, getActiveHappyHours, calculateDiscount } from '@/lib/schedule-engine';
import { formatCurrency } from '@/lib/formatting';
import type { Schedule, HappyHourRule, Category, Item } from '@/types';

export default function ScheduleSimulatorPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [happyHours, setHappyHours] = useState<HappyHourRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [simDate, setSimDate] = useState('');
  const [simTime, setSimTime] = useState('');
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [activeHH, setActiveHH] = useState<HappyHourRule[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setSchedules(getSchedules());
    setHappyHours(getHappyHourRules());
    setCategories(getCategories());
    setItems(getItems());
    
    const now = new Date();
    setSimDate(now.toISOString().split('T')[0]);
    setSimTime(now.toTimeString().slice(0, 5));
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (!simDate || !simTime) return;
    const dateTime = new Date(`${simDate}T${simTime}`);
    setActiveSchedule(getActiveSchedule(schedules, dateTime));
    setActiveHH(getActiveHappyHours(happyHours, dateTime));
  }, [simDate, simTime, schedules, happyHours]);
  
  const getVisibleCategories = () => {
    if (!activeSchedule) return categories;
    return categories.filter(c => activeSchedule.includedCategoryIds.includes(c.id));
  };
  
  const getItemPrice = (item: Item) => {
    const rule = activeHH.find(h => h.appliesToCategoryIds.includes(item.categoryId) || h.appliesToItemIds.includes(item.id));
    if (rule) return calculateDiscount(item.basePrice, rule);
    return item.basePrice;
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const visibleCategories = getVisibleCategories();
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/schedules" className="btn btn-ghost">← Back</Link>
        <h1 className="text-2xl font-bold">Schedule Simulator</h1>
      </div>
      
      {/* Simulator Controls */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">Select Date & Time</h2>
        <div className="flex gap-4 flex-wrap">
          <input type="date" value={simDate} onChange={e => setSimDate(e.target.value)} className="input w-48" />
          <input type="time" value={simTime} onChange={e => setSimTime(e.target.value)} className="input w-32" />
          <button onClick={() => { const now = new Date(); setSimDate(now.toISOString().split('T')[0]); setSimTime(now.toTimeString().slice(0, 5)); }} className="btn btn-ghost">
            Use Now
          </button>
        </div>
      </div>
      
      {/* Active Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-bold mb-2">🕒 Active Schedule</h3>
          {activeSchedule ? (
            <div className="p-4 rounded-lg" style={{ background: activeSchedule.color + '20' }}>
              <div className="font-bold text-xl" style={{ color: activeSchedule.color }}>{activeSchedule.name}</div>
              <div className="text-sm text-neutral-400">{activeSchedule.startTime} – {activeSchedule.endTime}</div>
              <div className="text-sm text-neutral-400">{activeSchedule.includedCategoryIds.length} categories visible</div>
            </div>
          ) : (
            <p className="text-neutral-500">No schedule active at this time</p>
          )}
        </div>
        
        <div className="card">
          <h3 className="font-bold mb-2">🎉 Happy Hour</h3>
          {activeHH.length > 0 ? (
            <div className="space-y-2">
              {activeHH.map(hh => (
                <div key={hh.id} className="p-3 rounded-lg bg-amber-500/10">
                  <div className="font-bold text-amber-400">{hh.name}</div>
                  <div className="text-sm">{hh.discountType === 'percentage' ? `${hh.discountAmount}% off` : formatCurrency(hh.discountAmount) + ' off'}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No happy hour active</p>
          )}
        </div>
      </div>
      
      {/* Preview Menu */}
      <h2 className="text-lg font-bold mb-4">Menu Preview at This Time</h2>
      <div className="space-y-6">
        {visibleCategories.map(cat => {
          const catItems = items.filter(i => i.categoryId === cat.id);
          return (
            <div key={cat.id} className="card">
              <h3 className="font-bold text-lg mb-3">{cat.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {catItems.slice(0, 6).map(item => {
                  const originalPrice = item.basePrice;
                  const discountedPrice = getItemPrice(item);
                  const hasDiscount = discountedPrice < originalPrice;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800">
                      <span className={!item.availability.inStock ? 'line-through text-neutral-500' : ''}>{item.name}</span>
                      <div className="text-right">
                        {hasDiscount ? (
                          <>
                            <span className="text-neutral-500 line-through text-sm mr-2">{formatCurrency(originalPrice)}</span>
                            <span className="text-amber-400 font-bold">{formatCurrency(discountedPrice)}</span>
                          </>
                        ) : (
                          <span className="font-semibold">{formatCurrency(originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
