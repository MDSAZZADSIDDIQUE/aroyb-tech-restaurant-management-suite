'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPromos, deletePromo, updatePromo } from '@/lib/storage';
import { formatCurrency, promoTypeConfig, promoStatusConfig, channelConfig } from '@/lib/formatting';
import type { Promo, PromoType, PromoStatus, Channel } from '@/types';

export default function PromosListPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<PromoType | ''>('');
  const [filterStatus, setFilterStatus] = useState<PromoStatus | ''>('');
  const [filterChannel, setFilterChannel] = useState<Channel | ''>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setPromos(getPromos());
    setLoading(false);
  }, []);
  
  const handleDelete = (id: string) => {
    if (confirm('Delete this promo?')) {
      deletePromo(id);
      setPromos(getPromos());
    }
  };
  
  const handleToggleStatus = (promo: Promo) => {
    const newStatus = promo.status === 'active' ? 'paused' : 'active';
    updatePromo(promo.id, { status: newStatus });
    setPromos(getPromos());
  };
  
  const filtered = promos.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.code?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && p.type !== filterType) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterChannel && !p.channels.includes(filterChannel)) return false;
    return true;
  });
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Promotions</h1>
          <p className="text-neutral-400 text-sm">{promos.length} promos configured</p>
        </div>
        <Link href="/promos/new" className="btn btn-primary">+ Create Promo</Link>
      </div>
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <input type="text" placeholder="Search promos..." value={search} onChange={e => setSearch(e.target.value)} className="input w-64" />
          
          <select value={filterType} onChange={e => setFilterType(e.target.value as PromoType | '')} className="select w-40">
            <option value="">All Types</option>
            {Object.entries(promoTypeConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
          
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as PromoStatus | '')} className="select w-40">
            <option value="">All Status</option>
            {Object.entries(promoStatusConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          
          <select value={filterChannel} onChange={e => setFilterChannel(e.target.value as Channel | '')} className="select w-40">
            <option value="">All Channels</option>
            {Object.entries(channelConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Promos Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Promo</th>
              <th>Type</th>
              <th>Status</th>
              <th>Channels</th>
              <th>Redemptions</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(promo => (
              <tr key={promo.id}>
                <td>
                  <Link href={`/promos/${promo.id}`} className="hover:text-[#ed7424]">
                    <div className="font-medium">{promo.name}</div>
                    {promo.code && <div className="text-xs text-neutral-400">Code: {promo.code}</div>}
                  </Link>
                </td>
                <td>
                  <span className={`badge ${promoTypeConfig[promo.type].color}`}>
                    {promoTypeConfig[promo.type].icon} {promoTypeConfig[promo.type].label}
                  </span>
                </td>
                <td>
                  <span className={`badge ${promoStatusConfig[promo.status].color}`}>
                    {promoStatusConfig[promo.status].label}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    {promo.channels.map(ch => (
                      <span key={ch} title={channelConfig[ch].label}>{channelConfig[ch].icon}</span>
                    ))}
                  </div>
                </td>
                <td>{promo.stats.redemptions.toLocaleString()}</td>
                <td className="font-medium text-green-400">{formatCurrency(promo.stats.revenue)}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleStatus(promo)} className={`btn btn-sm ${promo.status === 'active' ? 'btn-ghost' : 'btn-success'}`}>
                      {promo.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <Link href={`/promos/${promo.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                    <button onClick={() => handleDelete(promo.id)} className="btn btn-ghost btn-sm text-red-400">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🏷️</span>
            <p>No promos found</p>
          </div>
        )}
      </div>
    </div>
  );
}
