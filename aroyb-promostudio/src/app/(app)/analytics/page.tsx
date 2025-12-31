'use client';

import { useEffect, useState } from 'react';
import { getPromos } from '@/lib/storage';
import { formatCurrency, promoTypeConfig } from '@/lib/formatting';
import type { Promo } from '@/types';

export default function AnalyticsPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'redemptions' | 'revenue' | 'aov' | 'repeatRate'>('redemptions');
  
  useEffect(() => {
    setPromos(getPromos());
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const totalImpressions = promos.reduce((sum, p) => sum + p.stats.impressions, 0);
  const totalRedemptions = promos.reduce((sum, p) => sum + p.stats.redemptions, 0);
  const totalRevenue = promos.reduce((sum, p) => sum + p.stats.revenue, 0);
  const avgRepeatRate = promos.reduce((sum, p) => sum + p.stats.repeatRate, 0) / promos.length;
  
  const sorted = [...promos].sort((a, b) => {
    switch (sortBy) {
      case 'redemptions': return b.stats.redemptions - a.stats.redemptions;
      case 'revenue': return b.stats.revenue - a.stats.revenue;
      case 'aov': return b.stats.avgOrderValue - a.stats.avgOrderValue;
      case 'repeatRate': return b.stats.repeatRate - a.stats.repeatRate;
      default: return 0;
    }
  });
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-neutral-400 text-sm">Promo performance overview</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card"><div className="stat-value">{totalImpressions.toLocaleString()}</div><div className="stat-label">Total Impressions</div></div>
        <div className="stat-card"><div className="stat-value">{totalRedemptions.toLocaleString()}</div><div className="stat-label">Total Redemptions</div></div>
        <div className="stat-card"><div className="stat-value">{formatCurrency(totalRevenue)}</div><div className="stat-label">Total Revenue</div></div>
        <div className="stat-card"><div className="stat-value">{avgRepeatRate.toFixed(1)}%</div><div className="stat-label">Avg Repeat Rate</div></div>
      </div>
      
      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Promo Leaderboard</h2>
          <div className="flex gap-2">
            {(['redemptions', 'revenue', 'aov', 'repeatRate'] as const).map(key => (
              <button key={key} onClick={() => setSortBy(key)} className={`btn btn-sm ${sortBy === key ? 'btn-primary' : 'btn-secondary'}`}>
                {key === 'aov' ? 'AOV' : key === 'repeatRate' ? 'Repeat' : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Promo</th>
              <th>Type</th>
              <th>Impressions</th>
              <th>Redemptions</th>
              <th>Conv Rate</th>
              <th>Revenue</th>
              <th>AOV</th>
              <th>Repeat</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((promo, i) => {
              const convRate = promo.stats.impressions > 0 ? (promo.stats.redemptions / promo.stats.impressions * 100).toFixed(1) : '0.0';
              return (
                <tr key={promo.id}>
                  <td className="font-bold text-neutral-500">#{i + 1}</td>
                  <td className="font-medium">{promo.name}</td>
                  <td><span className={`badge ${promoTypeConfig[promo.type].color}`}>{promoTypeConfig[promo.type].icon}</span></td>
                  <td>{promo.stats.impressions.toLocaleString()}</td>
                  <td className="font-medium">{promo.stats.redemptions.toLocaleString()}</td>
                  <td>{convRate}%</td>
                  <td className="font-medium text-green-400">{formatCurrency(promo.stats.revenue)}</td>
                  <td>{formatCurrency(promo.stats.avgOrderValue)}</td>
                  <td>
                    <span className={promo.stats.repeatRate >= 50 ? 'text-green-400' : promo.stats.repeatRate >= 30 ? 'text-amber-400' : 'text-neutral-400'}>
                      {promo.stats.repeatRate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
