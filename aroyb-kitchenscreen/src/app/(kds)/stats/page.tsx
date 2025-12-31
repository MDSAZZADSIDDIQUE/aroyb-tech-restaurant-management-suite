'use client';

import { useState, useEffect } from 'react';
import type { PerformanceStats, MistakeInsight, StationId } from '@/types';
import KDSHeader from '@/components/layout/KDSHeader';
import DemoBanner from '@/components/layout/DemoBanner';
import { getStoredTickets, getRemakeLogs, initializeStorage } from '@/lib/storage';
import { calculateStationStats } from '@/lib/ai/bottleneck-detector';
import { detectMistakePatterns, formatInsightForDisplay } from '@/lib/ai/mistake-detector';
import { getStationName, getStationIcon, formatTime, remakeReasonLabels } from '@/lib/formatting';

export default function StatsPage() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [insights, setInsights] = useState<MistakeInsight[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    initializeStorage();
    
    const tickets = getStoredTickets();
    const remakeLogs = getRemakeLogs();
    
    // Calculate stats
    const completedTickets = tickets.filter(t => t.status === 'completed');
    const lateTickets = tickets.filter(t => {
      if (!t.completedAt || !t.promisedAt) return false;
      return new Date(t.completedAt) > new Date(t.promisedAt);
    });
    
    // Avg ticket time
    let totalTime = 0;
    completedTickets.forEach(t => {
      if (t.startedAt && t.completedAt) {
        totalTime += (new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime()) / 60000;
      }
    });
    const avgTime = completedTickets.length > 0 ? Math.round(totalTime / completedTickets.length) : 0;
    
    // Station stats
    const stationStats = calculateStationStats(tickets);
    
    // Top slow items
    const itemTimes = new Map<string, { total: number; count: number }>();
    completedTickets.forEach(t => {
      if (!t.startedAt || !t.completedAt) return;
      const ticketMins = (new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime()) / 60000;
      t.items.forEach(item => {
        const existing = itemTimes.get(item.name) || { total: 0, count: 0 };
        existing.total += ticketMins;
        existing.count += 1;
        itemTimes.set(item.name, existing);
      });
    });
    
    const topSlowItems = Array.from(itemTimes.entries())
      .map(([name, data]) => ({
        itemName: name,
        avgMinutes: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.avgMinutes - a.avgMinutes)
      .slice(0, 5);
    
    // Recent completed
    const recentCompleted = completedTickets
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        orderNumber: t.orderNumber,
        completedAt: t.completedAt!,
        durationMinutes: t.startedAt && t.completedAt 
          ? Math.round((new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime()) / 60000)
          : 0,
        itemCount: t.items.length,
      }));
    
    setStats({
      avgTicketTimeMinutes: avgTime,
      totalTicketsToday: completedTickets.length,
      lateTicketsToday: lateTickets.length,
      stationStats,
      topSlowItems,
      recentCompleted,
    });
    
    // Mistake insights
    const mistakeInsights = detectMistakePatterns(remakeLogs);
    setInsights(mistakeInsights);
    
    setLoading(false);
  }, []);
  
  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <KDSHeader title="Performance Stats" showBackLink />
      
      <div className="flex-1 p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-800 rounded-xl p-6">
            <p className="text-neutral-400 text-sm mb-1">Avg Ticket Time</p>
            <p className="text-4xl font-bold">{stats.avgTicketTimeMinutes}<span className="text-lg text-neutral-500">min</span></p>
          </div>
          <div className="bg-neutral-800 rounded-xl p-6">
            <p className="text-neutral-400 text-sm mb-1">Tickets Today</p>
            <p className="text-4xl font-bold text-green-400">{stats.totalTicketsToday}</p>
          </div>
          <div className="bg-neutral-800 rounded-xl p-6">
            <p className="text-neutral-400 text-sm mb-1">Late Tickets</p>
            <p className={`text-4xl font-bold ${stats.lateTicketsToday > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {stats.lateTicketsToday}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Station Performance */}
          <div className="bg-neutral-800 rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">📊 Station Performance</h2>
            <div className="space-y-3">
              {stats.stationStats.map(station => (
                <div key={station.station} className="flex items-center gap-4">
                  <span className="text-2xl w-8">{getStationIcon(station.station)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{getStationName(station.station)}</span>
                      <span className="text-sm text-neutral-400">{station.ticketCount} tickets</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>Avg: {station.avgTimeMinutes}min</span>
                      <span>Backlog: {station.backlog}</span>
                      {station.lateCount > 0 && (
                        <span className="text-red-400">Late: {station.lateCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Mistake Insights */}
          <div className="bg-neutral-800 rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              🤖 AI Mistake Insights
              <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">AI</span>
            </h2>
            {insights.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No remake patterns detected yet</p>
            ) : (
              <div className="space-y-3">
                {insights.map(insight => {
                  const display = formatInsightForDisplay(insight);
                  return (
                    <div 
                      key={insight.id} 
                      className={`p-3 rounded-lg border ${
                        display.severity === 'critical' 
                          ? 'bg-red-600/10 border-red-600/50' 
                          : 'bg-amber-600/10 border-amber-600/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{insight.itemName}</p>
                          <p className="text-sm text-neutral-400">{display.detail}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          display.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {insight.remakeCount}×
                        </span>
                      </div>
                      <p className="text-xs text-purple-400 mt-2">💡 {insight.suggestion}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Timeline */}
        <div className="mt-6 bg-neutral-800 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4">📜 Recent Completed</h2>
          {stats.recentCompleted.length === 0 ? (
            <p className="text-neutral-500 text-center py-4">No completed tickets yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentCompleted.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/50">
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{ticket.orderNumber}</span>
                    <span className="text-sm text-neutral-400">{ticket.itemCount} items</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={ticket.durationMinutes > 15 ? 'text-red-400' : 'text-green-400'}>
                      {ticket.durationMinutes}min
                    </span>
                    <span className="text-neutral-500">{formatTime(ticket.completedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
