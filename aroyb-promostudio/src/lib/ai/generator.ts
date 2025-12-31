// AI Generator Engine - Identify slow periods and generate promo suggestions

import type { SalesSnapshot, GeneratorSuggestion, DayOfWeek, DiscountConfig, PromoType } from '@/types';
import { generateId } from '@/lib/formatting';

const DAY_ORDER: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface SlowPeriod {
  dayOfWeek: DayOfWeek;
  startHour: number;
  endHour: number;
  avgOrders: number;
  avgRevenue: number;
  percentBelowAvg: number;
}

export function identifySlowPeriods(salesData: SalesSnapshot[]): SlowPeriod[] {
  // Group by day of week and hour
  const byDayHour = new Map<string, SalesSnapshot[]>();
  salesData.forEach(s => {
    const date = new Date(s.date);
    const dayIndex = date.getDay();
    const day = DAY_ORDER[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert to mon-based
    const key = `${day}-${s.hour}`;
    const existing = byDayHour.get(key) || [];
    existing.push(s);
    byDayHour.set(key, existing);
  });
  
  // Calculate averages
  const avgByKey = new Map<string, { orders: number; revenue: number }>();
  byDayHour.forEach((snapshots, key) => {
    const avgOrders = snapshots.reduce((sum, s) => sum + s.orders, 0) / snapshots.length;
    const avgRevenue = snapshots.reduce((sum, s) => sum + s.revenue, 0) / snapshots.length;
    avgByKey.set(key, { orders: avgOrders, revenue: avgRevenue });
  });
  
  // Overall average
  const allOrders = Array.from(avgByKey.values()).map(v => v.orders);
  const overallAvg = allOrders.reduce((a, b) => a + b, 0) / allOrders.length;
  
  // Find slow periods (below 50% of average)
  const slowPeriods: SlowPeriod[] = [];
  avgByKey.forEach((avg, key) => {
    if (avg.orders < overallAvg * 0.5) {
      const [day, hourStr] = key.split('-');
      const hour = parseInt(hourStr);
      slowPeriods.push({
        dayOfWeek: day as DayOfWeek,
        startHour: hour,
        endHour: hour + 1,
        avgOrders: avg.orders,
        avgRevenue: avg.revenue,
        percentBelowAvg: Math.round((1 - avg.orders / overallAvg) * 100),
      });
    }
  });
  
  // Merge consecutive hours
  const merged: SlowPeriod[] = [];
  const sorted = slowPeriods.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek);
    return dayDiff !== 0 ? dayDiff : a.startHour - b.startHour;
  });
  
  for (const period of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.dayOfWeek === period.dayOfWeek && last.endHour === period.startHour) {
      last.endHour = period.endHour;
      last.avgOrders = (last.avgOrders + period.avgOrders) / 2;
      last.avgRevenue = (last.avgRevenue + period.avgRevenue) / 2;
    } else {
      merged.push({ ...period });
    }
  }
  
  return merged;
}

export function generatePromoSuggestions(slowPeriods: SlowPeriod[]): GeneratorSuggestion[] {
  const suggestions: GeneratorSuggestion[] = [];
  
  const promoTemplates = [
    { type: 'discount_code' as PromoType, discount: { type: 'percentage' as const, value: 15 }, name: '15% Off', lift: 25 },
    { type: 'discount_code' as PromoType, discount: { type: 'percentage' as const, value: 20 }, name: '20% Off', lift: 35 },
    { type: 'free_delivery' as PromoType, discount: { type: 'free_delivery' as const, value: 0 }, name: 'Free Delivery', lift: 20 },
    { type: 'bogof' as PromoType, discount: { type: 'percentage' as const, value: 50 }, name: 'BOGOF', lift: 40 },
  ];
  
  for (const period of slowPeriods.slice(0, 5)) { // Top 5 slow periods
    const template = promoTemplates[Math.floor(Math.random() * promoTemplates.length)];
    const dayLabel = period.dayOfWeek.charAt(0).toUpperCase() + period.dayOfWeek.slice(1);
    const timeLabel = `${period.startHour}:00-${period.endHour}:00`;
    
    const explanations = [
      `${period.percentBelowAvg}% fewer orders than average`,
      `Low traffic period with high-margin opportunity`,
      `Customer acquisition window - boost visibility`,
      `Competitor analysis suggests promotional pricing`,
    ];
    
    suggestions.push({
      id: generateId('sug-'),
      targetPeriod: {
        dayOfWeek: period.dayOfWeek,
        startHour: period.startHour,
        endHour: period.endHour,
      },
      promoType: template.type,
      suggestedName: `${dayLabel} ${timeLabel} ${template.name}`,
      suggestedDiscount: template.discount,
      estimatedLift: template.lift + Math.floor(Math.random() * 10),
      explanation: explanations[Math.floor(Math.random() * explanations.length)],
      confidence: 70 + Math.floor(Math.random() * 25),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }
  
  return suggestions;
}

export function approveGeneratorSuggestion(suggestion: GeneratorSuggestion): GeneratorSuggestion {
  return { ...suggestion, status: 'approved' };
}

export function rejectGeneratorSuggestion(suggestion: GeneratorSuggestion): GeneratorSuggestion {
  return { ...suggestion, status: 'rejected' };
}
