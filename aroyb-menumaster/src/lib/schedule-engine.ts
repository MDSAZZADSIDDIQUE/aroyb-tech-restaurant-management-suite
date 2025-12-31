// Schedule engine for MenuMaster - active menu/schedule detection

import type { Schedule, HappyHourRule, DayOfWeek } from '@/types';

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
};

function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

function isTimeInRange(time: Date, startTime: string, endTime: string): boolean {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  const timeMinutes = time.getHours() * 60 + time.getMinutes();
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;
  
  // Handle overnight ranges
  if (endMinutes <= startMinutes) {
    return timeMinutes >= startMinutes || timeMinutes < endMinutes;
  }
  
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

export function getActiveSchedule(schedules: Schedule[], dateTime: Date = new Date()): Schedule | null {
  const day = DAY_MAP[dateTime.getDay()];
  
  for (const schedule of schedules) {
    if (schedule.daysOfWeek.includes(day) && isTimeInRange(dateTime, schedule.startTime, schedule.endTime)) {
      return schedule;
    }
  }
  
  return null;
}

export function getActiveHappyHours(rules: HappyHourRule[], dateTime: Date = new Date()): HappyHourRule[] {
  const day = DAY_MAP[dateTime.getDay()];
  
  return rules.filter(rule => 
    rule.active &&
    rule.daysOfWeek.includes(day) &&
    isTimeInRange(dateTime, rule.startTime, rule.endTime)
  );
}

export function isItemInSchedule(itemId: string, categoryId: string, schedule: Schedule): boolean {
  return schedule.includedItemIds.includes(itemId) || schedule.includedCategoryIds.includes(categoryId);
}

export function calculateDiscount(basePrice: number, rule: HappyHourRule): number {
  if (rule.discountType === 'percentage') {
    return basePrice * (1 - rule.discountAmount / 100);
  }
  return Math.max(0, basePrice - rule.discountAmount);
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

export function getDayLabel(day: DayOfWeek): string {
  const labels: Record<DayOfWeek, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', 
    thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  };
  return labels[day];
}
