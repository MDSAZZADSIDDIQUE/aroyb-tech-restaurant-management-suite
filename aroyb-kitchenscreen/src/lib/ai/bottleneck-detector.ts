// AI Bottleneck Detector - Detects station bottlenecks and suggests actions

import type { Ticket, StationId, BottleneckAlert, StationStats } from '@/types';
import { generateId, getStationName } from '@/lib/formatting';

interface BottleneckThresholds {
  backlogWarning: number;
  backlogCritical: number;
  avgTimeWarning: number;  // minutes
  avgTimeCritical: number; // minutes
  lateRateWarning: number; // 0-1
  lateRateCritical: number; // 0-1
}

const defaultThresholds: BottleneckThresholds = {
  backlogWarning: 4,
  backlogCritical: 7,
  avgTimeWarning: 12,
  avgTimeCritical: 18,
  lateRateWarning: 0.2,
  lateRateCritical: 0.4,
};

export function calculateStationStats(tickets: Ticket[]): StationStats[] {
  const stationMap = new Map<StationId, { tickets: Ticket[]; totalTime: number; lateCount: number }>();
  
  // Initialize stations
  const stations: StationId[] = ['grill', 'fry', 'pizza', 'bar', 'prep'];
  stations.forEach(s => stationMap.set(s, { tickets: [], totalTime: 0, lateCount: 0 }));
  
  // Categorize tickets
  tickets.forEach(ticket => {
    ticket.stationAssignments.forEach(station => {
      const data = stationMap.get(station);
      if (!data) return;
      
      if (['new', 'in_progress', 'recalled'].includes(ticket.status)) {
        data.tickets.push(ticket);
      }
      
      // Calculate time for completed tickets
      if (ticket.completedAt && ticket.startedAt) {
        const duration = (new Date(ticket.completedAt).getTime() - new Date(ticket.startedAt).getTime()) / 60000;
        data.totalTime += duration;
      }
      
      // Check if late
      if (ticket.promisedAt) {
        const now = new Date();
        const promised = new Date(ticket.promisedAt);
        if (now > promised && ['new', 'in_progress'].includes(ticket.status)) {
          data.lateCount++;
        }
      }
    });
  });
  
  return stations.map(station => {
    const data = stationMap.get(station)!;
    const backlog = data.tickets.length;
    const completedCount = tickets.filter(t => 
      t.status === 'completed' && t.stationAssignments.includes(station)
    ).length;
    
    return {
      station,
      ticketCount: completedCount + backlog,
      avgTimeMinutes: completedCount > 0 ? Math.round(data.totalTime / completedCount) : 0,
      lateCount: data.lateCount,
      backlog,
    };
  });
}

export function detectBottlenecks(
  tickets: Ticket[], 
  kitchenLoad: number = 50,
  thresholds: BottleneckThresholds = defaultThresholds
): BottleneckAlert[] {
  const stats = calculateStationStats(tickets);
  const alerts: BottleneckAlert[] = [];
  
  // Adjust thresholds based on kitchen load
  const loadFactor = kitchenLoad / 100;
  const adjustedThresholds = {
    backlogWarning: Math.max(2, Math.round(thresholds.backlogWarning * (1 - loadFactor * 0.3))),
    backlogCritical: Math.max(3, Math.round(thresholds.backlogCritical * (1 - loadFactor * 0.3))),
    avgTimeWarning: thresholds.avgTimeWarning * (1 + loadFactor * 0.2),
    avgTimeCritical: thresholds.avgTimeCritical * (1 + loadFactor * 0.2),
    lateRateWarning: thresholds.lateRateWarning,
    lateRateCritical: thresholds.lateRateCritical,
  };
  
  stats.forEach(stat => {
    const lateRate = stat.ticketCount > 0 ? stat.lateCount / stat.ticketCount : 0;
    
    // Check for critical bottleneck
    if (
      stat.backlog >= adjustedThresholds.backlogCritical ||
      stat.avgTimeMinutes >= adjustedThresholds.avgTimeCritical ||
      lateRate >= adjustedThresholds.lateRateCritical
    ) {
      alerts.push({
        id: generateId('bn'),
        station: stat.station,
        severity: 'critical',
        message: `Critical bottleneck at ${getStationName(stat.station)}`,
        suggestion: getSuggestion(stat.station, stat, 'critical'),
        detectedAt: new Date().toISOString(),
        metrics: {
          backlog: stat.backlog,
          avgTime: stat.avgTimeMinutes,
          lateRate: Math.round(lateRate * 100),
        },
      });
    }
    // Check for warning bottleneck
    else if (
      stat.backlog >= adjustedThresholds.backlogWarning ||
      stat.avgTimeMinutes >= adjustedThresholds.avgTimeWarning ||
      lateRate >= adjustedThresholds.lateRateWarning
    ) {
      alerts.push({
        id: generateId('bn'),
        station: stat.station,
        severity: 'warning',
        message: `${getStationName(stat.station)} station slowing down`,
        suggestion: getSuggestion(stat.station, stat, 'warning'),
        detectedAt: new Date().toISOString(),
        metrics: {
          backlog: stat.backlog,
          avgTime: stat.avgTimeMinutes,
          lateRate: Math.round(lateRate * 100),
        },
      });
    }
  });
  
  return alerts;
}

function getSuggestion(station: StationId, stats: StationStats, severity: 'warning' | 'critical'): string {
  const stationName = getStationName(station);
  
  if (severity === 'critical') {
    if (station === 'fry') {
      return `Pause fried sides for 10 minutes. Consider reassigning staff to ${stationName}.`;
    }
    if (station === 'grill') {
      return `Pause new steak orders for 15 minutes. Add support staff to grill station.`;
    }
    if (station === 'pizza') {
      return `Pause specialty pizzas. Focus on standard items first.`;
    }
    if (station === 'bar') {
      return `Skip cocktails temporarily, prioritize simple drinks.`;
    }
    return `Add additional staff to ${stationName}. Consider pausing complex items.`;
  }
  
  // Warning suggestions
  if (stats.backlog >= 4) {
    return `${stationName} has ${stats.backlog} tickets queued. Consider prioritizing or adding help.`;
  }
  if (stats.lateCount >= 2) {
    return `${stats.lateCount} late tickets at ${stationName}. Focus on oldest tickets first.`;
  }
  return `Monitor ${stationName} closely. Average time is ${stats.avgTimeMinutes}min.`;
}

// Apply bottleneck action (demo)
export function applyBottleneckAction(alertId: string, action: 'pause' | 'dismiss'): string {
  if (action === 'pause') {
    return 'Items paused for 10 minutes (demo)';
  }
  return 'Alert dismissed';
}
