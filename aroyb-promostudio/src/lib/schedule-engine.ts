// Schedule Engine - Active promos by time, priority handling

import type { Promo, DayOfWeek } from '@/types';

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
};

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isPromoScheduledNow(promo: Promo, dateTime: Date = new Date()): boolean {
  if (promo.status !== 'active' && promo.status !== 'scheduled') return false;
  
  if (!promo.schedule) return promo.status === 'active';
  
  const day = DAY_MAP[dateTime.getDay()];
  
  // Check day of week
  if (promo.schedule.daysOfWeek && promo.schedule.daysOfWeek.length > 0) {
    if (!promo.schedule.daysOfWeek.includes(day)) return false;
  }
  
  // Check time window
  if (promo.schedule.startTime && promo.schedule.endTime) {
    const now = dateTime.getHours() * 60 + dateTime.getMinutes();
    const start = parseTime(promo.schedule.startTime);
    const end = parseTime(promo.schedule.endTime);
    if (now < start || now > end) return false;
  }
  
  // Check date range
  if (promo.schedule.startDate) {
    const startDate = new Date(promo.schedule.startDate);
    startDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateTime);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < startDate) return false;
  }
  
  if (promo.schedule.endDate) {
    const endDate = new Date(promo.schedule.endDate);
    endDate.setHours(23, 59, 59, 999);
    if (dateTime > endDate) return false;
  }
  
  return true;
}

export function getPromosActiveAt(promos: Promo[], dateTime: Date): Promo[] {
  return promos
    .filter(p => isPromoScheduledNow(p, dateTime))
    .sort((a, b) => b.priority - a.priority);
}

export function getScheduleConflicts(promos: Promo[]): { promo1: Promo; promo2: Promo; overlap: string }[] {
  const conflicts: { promo1: Promo; promo2: Promo; overlap: string }[] = [];
  
  for (let i = 0; i < promos.length; i++) {
    for (let j = i + 1; j < promos.length; j++) {
      const p1 = promos[i];
      const p2 = promos[j];
      
      // Skip if both are stackable
      if (p1.stackable && p2.stackable) continue;
      
      // Check for schedule overlap
      if (!p1.schedule || !p2.schedule) continue;
      
      const daysOverlap = p1.schedule.daysOfWeek?.some(d => p2.schedule?.daysOfWeek?.includes(d));
      if (!daysOverlap) continue;
      
      const timeOverlap = !(
        parseTime(p1.schedule.endTime!) <= parseTime(p2.schedule.startTime!) ||
        parseTime(p2.schedule.endTime!) <= parseTime(p1.schedule.startTime!)
      );
      
      if (timeOverlap) {
        const overlapDays = p1.schedule.daysOfWeek?.filter(d => p2.schedule?.daysOfWeek?.includes(d)) || [];
        conflicts.push({
          promo1: p1,
          promo2: p2,
          overlap: `${overlapDays.join(', ')} ${p1.schedule.startTime}-${p1.schedule.endTime}`,
        });
      }
    }
  }
  
  return conflicts;
}

export function getWinningPromo(promos: Promo[]): Promo | null {
  if (promos.length === 0) return null;
  
  // Filter to non-stackable only, return highest priority
  const nonStackable = promos.filter(p => !p.stackable);
  if (nonStackable.length === 0) return promos[0]; // All stackable, return first
  
  return nonStackable.sort((a, b) => b.priority - a.priority)[0];
}

export function formatSchedule(promo: Promo): string {
  if (!promo.schedule) return 'Always active';
  
  const parts: string[] = [];
  
  if (promo.schedule.daysOfWeek && promo.schedule.daysOfWeek.length < 7) {
    parts.push(promo.schedule.daysOfWeek.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', '));
  } else {
    parts.push('Every day');
  }
  
  if (promo.schedule.startTime && promo.schedule.endTime) {
    parts.push(`${promo.schedule.startTime} - ${promo.schedule.endTime}`);
  }
  
  return parts.join(' • ');
}

export function getNextScheduleWindow(promo: Promo, from: Date = new Date()): Date | null {
  if (!promo.schedule || !promo.schedule.daysOfWeek || promo.schedule.daysOfWeek.length === 0) {
    return null;
  }
  
  const dayIndices = promo.schedule.daysOfWeek.map(d => Object.values(DAY_MAP).indexOf(d));
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(from);
    checkDate.setDate(checkDate.getDate() + i);
    const dayIndex = checkDate.getDay();
    
    if (dayIndices.includes(dayIndex)) {
      if (promo.schedule.startTime) {
        const [hours, minutes] = promo.schedule.startTime.split(':').map(Number);
        checkDate.setHours(hours, minutes, 0, 0);
        
        if (checkDate > from) {
          return checkDate;
        }
      }
    }
  }
  
  return null;
}
