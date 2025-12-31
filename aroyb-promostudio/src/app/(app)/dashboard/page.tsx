'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPromos, getGiftCardsIssued, getAbuseLogs, getGeneratorSuggestions, getOptimisationSuggestions } from '@/lib/storage';
import { getActivePromos } from '@/lib/promo-engine';
import { formatCurrency, promoTypeConfig, promoStatusConfig } from '@/lib/formatting';
import type { Promo, GiftCardIssued, AttemptLog } from '@/types';

export default function DashboardPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCardIssued[]>([]);
  const [abuseLogs, setAbuseLogs] = useState<AttemptLog[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setPromos(getPromos());
    setGiftCards(getGiftCardsIssued());
    setAbuseLogs(getAbuseLogs());
    setAiSuggestions(getGeneratorSuggestions().filter(s => s.status === 'pending').length + getOptimisationSuggestions().filter(s => s.status === 'pending').length);
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const activePromos = getActivePromos(promos);
  const totalRedemptions = promos.reduce((sum, p) => sum + p.stats.redemptions, 0);
  const totalRevenue = promos.reduce((sum, p) => sum + p.stats.revenue, 0);
  const avgAOV = promos.reduce((sum, p) => sum + p.stats.avgOrderValue * p.stats.redemptions, 0) / (totalRedemptions || 1);
  const giftCardBalance = giftCards.reduce((sum, gc) => sum + gc.remainingBalance, 0);
  const blockedToday = abuseLogs.filter(l => l.actionTaken === 'blocked' && new Date(l.timestamp).toDateString() === new Date().toDateString()).length;
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-neutral-400 text-sm">Promotions overview and quick actions</p>
        </div>
        <Link href="/promos/new" className="btn btn-primary">+ Create Promo</Link>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-value">{activePromos.length}</div>
          <div className="stat-label">Active Promos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalRedemptions.toLocaleString()}</div>
          <div className="stat-label">Total Redemptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-label">Promo Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(avgAOV)}</div>
          <div className="stat-label">Avg Order Value</div>
        </div>
      </div>
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card card-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">🎁</div>
          <div>
            <div className="font-bold">{giftCards.length}</div>
            <div className="text-xs text-neutral-400">Gift Cards Issued</div>
          </div>
        </div>
        <div className="card card-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-xl">💰</div>
          <div>
            <div className="font-bold">{formatCurrency(giftCardBalance)}</div>
            <div className="text-xs text-neutral-400">Outstanding Balance</div>
          </div>
        </div>
        <div className="card card-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">🛡️</div>
          <div>
            <div className="font-bold">{blockedToday}</div>
            <div className="text-xs text-neutral-400">Blocked Today</div>
          </div>
        </div>
        <Link href="/ai/generator" className="card card-sm card-hover flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl">🤖</div>
          <div>
            <div className="font-bold">{aiSuggestions}</div>
            <div className="text-xs text-neutral-400">AI Suggestions</div>
          </div>
        </Link>
      </div>
      
      {/* Active Promos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Active Promos Now</h2>
            <Link href="/schedules/simulator" className="text-sm text-[#ed7424]">Simulator →</Link>
          </div>
          {activePromos.length === 0 ? (
            <p className="text-neutral-500">No promos active at this time</p>
          ) : (
            <div className="space-y-3">
              {activePromos.slice(0, 5).map(promo => (
                <Link key={promo.id} href={`/promos/${promo.id}`} className="block p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{promoTypeConfig[promo.type].icon}</span>
                      <div>
                        <div className="font-medium">{promo.name}</div>
                        <div className="text-xs text-neutral-400">{promo.code || promoTypeConfig[promo.type].label}</div>
                      </div>
                    </div>
                    <span className={`badge ${promoStatusConfig[promo.status].color}`}>
                      {promoStatusConfig[promo.status].label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Top Performers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Top Performers</h2>
            <Link href="/analytics" className="text-sm text-[#ed7424]">Full Report →</Link>
          </div>
          <div className="space-y-3">
            {promos.sort((a, b) => b.stats.redemptions - a.stats.redemptions).slice(0, 5).map((promo, i) => (
              <div key={promo.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-500">#{i + 1}</span>
                  <div>
                    <div className="font-medium">{promo.name}</div>
                    <div className="text-xs text-neutral-400">{promo.stats.redemptions} uses</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">{formatCurrency(promo.stats.revenue)}</div>
                  <div className="text-xs text-neutral-400">revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Link href="/promos/new" className="card card-hover text-center py-6">
          <span className="text-2xl mb-2 block">🏷️</span>
          <span className="font-medium">New Discount</span>
        </Link>
        <Link href="/gift-cards/issue" className="card card-hover text-center py-6">
          <span className="text-2xl mb-2 block">🎁</span>
          <span className="font-medium">Issue Gift Card</span>
        </Link>
        <Link href="/ai/generator" className="card card-hover text-center py-6">
          <span className="text-2xl mb-2 block">🤖</span>
          <span className="font-medium">Generate Ideas</span>
        </Link>
        <Link href="/anti-abuse" className="card card-hover text-center py-6">
          <span className="text-2xl mb-2 block">🛡️</span>
          <span className="font-medium">View Blocks</span>
        </Link>
      </div>
    </div>
  );
}
