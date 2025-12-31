'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPromos } from '@/lib/storage';
import { getPromosActiveAt, getScheduleConflicts, formatSchedule, getWinningPromo } from '@/lib/schedule-engine';
import { promoTypeConfig, promoStatusConfig, dayConfig, formatTimeOnly } from '@/lib/formatting';
import type { Promo, DayOfWeek } from '@/types';

export default function SchedulesPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setPromos(getPromos());
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const scheduledPromos = promos.filter(p => p.schedule && (p.status === 'active' || p.status === 'scheduled'));
  const conflicts = getScheduleConflicts(scheduledPromos);
  
  const now = new Date();
  const activeNow = getPromosActiveAt(promos, now);
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Promo Schedules</h1>
          <p className="text-neutral-400 text-sm">{scheduledPromos.length} scheduled promos</p>
        </div>
        <Link href="/schedules/simulator" className="btn btn-primary">🕒 Open Simulator</Link>
      </div>
      
      {/* Active Now */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">🟢 Active Right Now</h2>
        {activeNow.length === 0 ? (
          <p className="text-neutral-500">No scheduled promos active at this time</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeNow.map(p => (
              <Link key={p.id} href={`/promos/${p.id}`} className="badge bg-green-500/20 text-green-400 hover:bg-green-500/30">
                {promoTypeConfig[p.type].icon} {p.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="card mb-6 border-amber-500/50">
          <h2 className="font-bold text-amber-400 mb-4">⚠️ Schedule Conflicts</h2>
          <div className="space-y-3">
            {conflicts.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-amber-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{c.promo1.name}</span>
                  <span className="text-neutral-500">vs</span>
                  <span className="font-medium">{c.promo2.name}</span>
                </div>
                <div className="text-sm text-neutral-400">
                  Overlap: {c.overlap}
                  <br />
                  Winner: <span className="text-green-400">{getWinningPromo([c.promo1, c.promo2])?.name}</span> (priority {Math.max(c.promo1.priority, c.promo2.priority)})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Schedule List */}
      <div className="card">
        <h2 className="font-bold mb-4">All Scheduled Promos</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Promo</th>
              <th>Type</th>
              <th>Schedule</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {scheduledPromos.sort((a, b) => b.priority - a.priority).map(promo => (
              <tr key={promo.id}>
                <td>
                  <Link href={`/promos/${promo.id}`} className="font-medium hover:text-[#ed7424]">{promo.name}</Link>
                </td>
                <td>
                  <span className={`badge ${promoTypeConfig[promo.type].color}`}>
                    {promoTypeConfig[promo.type].icon}
                  </span>
                </td>
                <td>
                  <div className="text-sm">
                    <div>{promo.schedule?.daysOfWeek?.map(d => dayConfig[d].short).join(', ')}</div>
                    <div className="text-neutral-400">
                      {promo.schedule?.startTime && formatTimeOnly(promo.schedule.startTime)} – {promo.schedule?.endTime && formatTimeOnly(promo.schedule.endTime)}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-mono">{promo.priority}</span>
                </td>
                <td>
                  <span className={`badge ${promoStatusConfig[promo.status].color}`}>
                    {promoStatusConfig[promo.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {scheduledPromos.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">📅</span>
            <p>No scheduled promos</p>
          </div>
        )}
      </div>
    </div>
  );
}
