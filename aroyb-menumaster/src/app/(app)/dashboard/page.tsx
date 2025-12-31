'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategories, getItems, getCombos, getSchedules, getHappyHourRules } from '@/lib/storage';
import { getActiveSchedule, getActiveHappyHours } from '@/lib/schedule-engine';
import { runFullAnalysis } from '@/lib/ai/insights-engine';
import { formatCurrency } from '@/lib/formatting';
import type { Category, Item, Schedule, HappyHourRule, InsightIssue } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    categories: 0, items: 0, combos: 0, soldOut: 0,
  });
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [activeHappyHours, setActiveHappyHours] = useState<HappyHourRule[]>([]);
  const [soldOutItems, setSoldOutItems] = useState<Item[]>([]);
  const [issues, setIssues] = useState<InsightIssue[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const categories = getCategories();
    const items = getItems();
    const combos = getCombos();
    const schedules = getSchedules();
    const happyHours = getHappyHourRules();
    
    const soldOut = items.filter(i => !i.availability.inStock);
    const issueList = runFullAnalysis(items, []);
    
    setStats({
      categories: categories.length,
      items: items.length,
      combos: combos.length,
      soldOut: soldOut.length,
    });
    
    setActiveSchedule(getActiveSchedule(schedules));
    setActiveHappyHours(getActiveHappyHours(happyHours));
    setSoldOutItems(soldOut);
    setIssues(issueList.filter(i => !i.dismissed).slice(0, 5));
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/menu/categories" className="card card-hover stat-card">
          <div className="stat-value text-[#ed7424]">{stats.categories}</div>
          <div className="stat-label">Categories</div>
        </Link>
        <Link href="/menu/items" className="card card-hover stat-card">
          <div className="stat-value text-green-400">{stats.items}</div>
          <div className="stat-label">Menu Items</div>
        </Link>
        <Link href="/combos" className="card card-hover stat-card">
          <div className="stat-value text-blue-400">{stats.combos}</div>
          <div className="stat-label">Combos & Deals</div>
        </Link>
        <Link href="/availability" className="card card-hover stat-card">
          <div className="stat-value text-red-400">{stats.soldOut}</div>
          <div className="stat-label">Sold Out</div>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Schedule */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">🕒 Active Now</h2>
          {activeSchedule ? (
            <div className="p-4 rounded-lg" style={{ background: activeSchedule.color + '20' }}>
              <div className="font-bold text-xl" style={{ color: activeSchedule.color }}>{activeSchedule.name}</div>
              <div className="text-sm text-neutral-400 mt-1">{activeSchedule.startTime} – {activeSchedule.endTime}</div>
            </div>
          ) : (
            <p className="text-neutral-500">No active schedule</p>
          )}
          
          {activeHappyHours.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-amber-400 mb-2">🎉 Happy Hour Active</div>
              {activeHappyHours.map(hh => (
                <div key={hh.id} className="p-3 rounded-lg bg-amber-500/10 mb-2">
                  <div className="font-medium">{hh.name}</div>
                  <div className="text-sm text-neutral-400">
                    {hh.discountType === 'percentage' ? `${hh.discountAmount}% off` : formatCurrency(hh.discountAmount) + ' off'}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Link href="/schedules/simulator" className="btn btn-ghost mt-4 w-full">
            ⏱️ Schedule Simulator
          </Link>
        </div>
        
        {/* AI Issues */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">🤖 AI Insights</h2>
            <Link href="/ai/insights" className="text-sm text-[#ed7424] hover:underline">View all →</Link>
          </div>
          {issues.length === 0 ? (
            <p className="text-green-400">✅ No issues detected</p>
          ) : (
            <div className="space-y-2">
              {issues.map(issue => (
                <div key={issue.id} className="p-3 rounded-lg bg-neutral-800 flex items-start gap-3">
                  <span className={`badge ${issue.severity === 'high' ? 'severity-high' : issue.severity === 'medium' ? 'severity-medium' : 'severity-low'}`}>
                    {issue.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{issue.title}</div>
                    <div className="text-xs text-neutral-500 truncate">{issue.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Sold Out */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">🚫 Currently 86&apos;d</h2>
            <Link href="/availability" className="text-sm text-[#ed7424] hover:underline">Manage →</Link>
          </div>
          {soldOutItems.length === 0 ? (
            <p className="text-green-400">✅ Everything in stock</p>
          ) : (
            <div className="space-y-2">
              {soldOutItems.slice(0, 5).map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex justify-between items-center">
                  <span>{item.name}</span>
                  {item.availability.soldOutUntil && (
                    <span className="text-xs text-neutral-400">Until {item.availability.soldOutUntil}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/menu/items" className="btn btn-ghost justify-start">📝 Edit Items</Link>
            <Link href="/modifiers" className="btn btn-ghost justify-start">⚙️ Modifiers</Link>
            <Link href="/ai/descriptions" className="btn btn-ghost justify-start">✍️ AI Descriptions</Link>
            <Link href="/ai/pricing" className="btn btn-ghost justify-start">💰 Pricing Tips</Link>
            <Link href="/preview" className="btn btn-primary justify-start col-span-2">👁️ Preview Customer Menu</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
