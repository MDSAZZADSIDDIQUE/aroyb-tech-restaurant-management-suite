'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPromos } from '@/lib/storage';
import { getPromosActiveAt, getWinningPromo } from '@/lib/schedule-engine';
import { promoTypeConfig, dayConfig, formatCurrency } from '@/lib/formatting';
import type { Promo, DayOfWeek } from '@/types';

export default function ScheduleSimulatorPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [simDate, setSimDate] = useState('');
  const [simTime, setSimTime] = useState('');
  const [activePromos, setActivePromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setPromos(getPromos());
    const now = new Date();
    setSimDate(now.toISOString().split('T')[0]);
    setSimTime(now.toTimeString().slice(0, 5));
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (!simDate || !simTime) return;
    const dateTime = new Date(`${simDate}T${simTime}`);
    setActivePromos(getPromosActiveAt(promos, dateTime));
  }, [simDate, simTime, promos]);
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const simDateTime = new Date(`${simDate}T${simTime}`);
  const dayName = dayConfig[(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as DayOfWeek[])[simDateTime.getDay()]].label;
  const winner = getWinningPromo(activePromos);
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/schedules" className="btn btn-ghost">← Back</Link>
        <h1 className="text-2xl font-bold">Schedule Simulator</h1>
      </div>
      
      {/* Time Picker */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">Select Date & Time</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <input type="date" value={simDate} onChange={e => setSimDate(e.target.value)} className="input w-48" />
          <input type="time" value={simTime} onChange={e => setSimTime(e.target.value)} className="input w-32" />
          <button onClick={() => { const now = new Date(); setSimDate(now.toISOString().split('T')[0]); setSimTime(now.toTimeString().slice(0, 5)); }} className="btn btn-ghost">
            Use Now
          </button>
          <div className="text-neutral-400">
            {dayName} at {simTime}
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold mb-4">🟢 Active Promos ({activePromos.length})</h2>
          {activePromos.length === 0 ? (
            <p className="text-neutral-500">No promos active at this time</p>
          ) : (
            <div className="space-y-3">
              {activePromos.map(p => (
                <Link key={p.id} href={`/promos/${p.id}`} className="block p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{promoTypeConfig[p.type].icon}</span>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-neutral-400">
                          Priority: {p.priority} {p.stackable && '• Stackable'}
                        </div>
                      </div>
                    </div>
                    {p.code && <code className="text-sm text-[#ed7424]">{p.code}</code>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="card">
          <h2 className="font-bold mb-4">🏆 Winning Promo</h2>
          {winner ? (
            <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
              <span className="text-4xl mb-3 block">{promoTypeConfig[winner.type].icon}</span>
              <div className="text-xl font-bold">{winner.name}</div>
              {winner.code && <div className="text-[#ed7424] mt-2">{winner.code}</div>}
              <div className="text-sm text-neutral-400 mt-2">
                Priority: {winner.priority}
                <br />
                {winner.discount && `${winner.discount.value}${winner.discount.type === 'percentage' ? '%' : '£'} off`}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-neutral-800 text-center">
              <span className="text-4xl mb-3 block">🤷</span>
              <p className="text-neutral-400">No promos competing</p>
            </div>
          )}
          
          {activePromos.filter(p => p.stackable).length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-sm mb-2">Stackable promos (also apply):</h3>
              <div className="flex flex-wrap gap-2">
                {activePromos.filter(p => p.stackable).map(p => (
                  <span key={p.id} className="badge bg-blue-500/20 text-blue-400">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Time Presets */}
      <div className="card mt-6">
        <h2 className="font-bold mb-4">Quick Presets</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Mon Lunch', day: 1, hour: 12 },
            { label: 'Tue 4pm', day: 2, hour: 16 },
            { label: 'Wed Evening', day: 3, hour: 19 },
            { label: 'Thu Happy Hr', day: 4, hour: 17 },
            { label: 'Fri Night', day: 5, hour: 20 },
            { label: 'Sat Noon', day: 6, hour: 12 },
            { label: 'Sun Dinner', day: 0, hour: 18 },
          ].map(preset => {
            const date = new Date();
            const diff = preset.day - date.getDay();
            date.setDate(date.getDate() + diff);
            date.setHours(preset.hour, 0, 0, 0);
            return (
              <button key={preset.label} onClick={() => { setSimDate(date.toISOString().split('T')[0]); setSimTime(`${preset.hour.toString().padStart(2, '0')}:00`); }} className="btn btn-secondary btn-sm">
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
