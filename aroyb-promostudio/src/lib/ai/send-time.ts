// AI Send-Time Engine - Recommend best send times by segment

import type { EngagementSnapshot, SendTimeSuggestion, DayOfWeek } from '@/types';
import { generateId, dayConfig } from '@/lib/formatting';

interface SegmentBestTime {
  segment: string;
  channel: 'email' | 'sms' | 'push';
  bestDay: DayOfWeek;
  bestHour: number;
  backupDay: DayOfWeek;
  backupHour: number;
  openRate: number;
  conversionRate: number;
}

export function findBestSendTimes(engagementData: EngagementSnapshot[]): SegmentBestTime[] {
  // Group by segment + channel
  const bySegmentChannel = new Map<string, EngagementSnapshot[]>();
  engagementData.forEach(e => {
    const key = `${e.segment}-${e.channel}`;
    const existing = bySegmentChannel.get(key) || [];
    existing.push(e);
    bySegmentChannel.set(key, existing);
  });
  
  const bestTimes: SegmentBestTime[] = [];
  
  bySegmentChannel.forEach((snapshots, key) => {
    const [segment, channel] = key.split('-');
    
    // Sort by conversion rate
    const sorted = [...snapshots].sort((a, b) => b.conversionRate - a.conversionRate);
    
    if (sorted.length >= 2) {
      bestTimes.push({
        segment,
        channel: channel as 'email' | 'sms' | 'push',
        bestDay: sorted[0].dayOfWeek,
        bestHour: sorted[0].hour,
        backupDay: sorted[1].dayOfWeek,
        backupHour: sorted[1].hour,
        openRate: sorted[0].openRate,
        conversionRate: sorted[0].conversionRate,
      });
    } else if (sorted.length === 1) {
      bestTimes.push({
        segment,
        channel: channel as 'email' | 'sms' | 'push',
        bestDay: sorted[0].dayOfWeek,
        bestHour: sorted[0].hour,
        backupDay: sorted[0].dayOfWeek,
        backupHour: sorted[0].hour + 6,
        openRate: sorted[0].openRate,
        conversionRate: sorted[0].conversionRate,
      });
    }
  });
  
  return bestTimes;
}

export function generateSendTimeSuggestion(
  segment: string,
  promoId: string,
  engagementData: EngagementSnapshot[]
): SendTimeSuggestion | null {
  const bestTimes = findBestSendTimes(engagementData);
  
  // Find best for this segment (prefer push > sms > email for conversion)
  const forSegment = bestTimes.filter(b => b.segment === segment);
  const sorted = forSegment.sort((a, b) => b.conversionRate - a.conversionRate);
  
  if (sorted.length === 0) return null;
  
  const best = sorted[0];
  
  const explanations = [
    `${best.openRate}% open rate and ${best.conversionRate}% conversion for ${segment} segment`,
    `Historical data shows peak engagement at this time`,
    `Optimal window based on ${segment} customer behavior patterns`,
    `${best.channel} performs best for this segment`,
  ];
  
  return {
    id: generateId('send-'),
    segment,
    promoId,
    recommendedDay: best.bestDay,
    recommendedHour: best.bestHour,
    backupDay: best.backupDay,
    backupHour: best.backupHour,
    channel: best.channel,
    explanation: explanations[Math.floor(Math.random() * explanations.length)],
    confidence: 70 + Math.floor(Math.random() * 25),
  };
}

export function formatSendTime(day: DayOfWeek, hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${dayConfig[day].label} at ${displayHour}:00 ${period}`;
}

export function getMessageGuidance(channel: 'email' | 'sms' | 'push'): { maxLength: number; tips: string[] } {
  switch (channel) {
    case 'sms':
      return {
        maxLength: 160,
        tips: [
          'Keep under 160 characters for single SMS',
          'Include clear call-to-action',
          'Add promo code prominently',
        ],
      };
    case 'push':
      return {
        maxLength: 65,
        tips: [
          'Title: max 50 chars, body: max 65 chars',
          'Use emoji for attention 🍕',
          'Create urgency with time-limited language',
        ],
      };
    case 'email':
      return {
        maxLength: 500,
        tips: [
          'Subject line: 40-60 characters',
          'Preview text: 85-100 characters',
          'Include clear CTA button',
          'Mobile-first design',
        ],
      };
  }
}

export const SEGMENTS = [
  { id: 'new', name: 'New Customers', description: 'First-time visitors' },
  { id: 'returning', name: 'Returning', description: 'Customers with 2+ orders' },
  { id: 'vip', name: 'VIP', description: 'High-value frequent customers' },
  { id: 'lapsed_14d', name: 'Lapsed (14d)', description: 'No order in 14 days' },
  { id: 'lunch_crowd', name: 'Lunch Crowd', description: 'Typically orders 11am-2pm' },
  { id: 'vegetarian', name: 'Vegetarian', description: 'Orders veggie items' },
];
