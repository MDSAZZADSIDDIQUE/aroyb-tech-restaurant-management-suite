// Formatting utilities for PromoStudio

import type { PromoType, PromoStatus, Channel, DiscountType, CustomerEligibility, DayOfWeek } from '@/types';

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateGiftCardCode(): string {
  return `GC-${generateCode(4)}${generateCode(4)}`;
}

export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

export const promoTypeConfig: Record<PromoType, { label: string; icon: string; color: string }> = {
  discount_code: { label: 'Discount Code', icon: '🏷️', color: 'bg-blue-500/20 text-blue-400' },
  bogof: { label: 'BOGOF', icon: '🎁', color: 'bg-purple-500/20 text-purple-400' },
  bundle: { label: 'Bundle', icon: '📦', color: 'bg-green-500/20 text-green-400' },
  free_delivery: { label: 'Free Delivery', icon: '🚚', color: 'bg-amber-500/20 text-amber-400' },
};

export const promoStatusConfig: Record<PromoStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500/20 text-green-400' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400' },
  paused: { label: 'Paused', color: 'bg-amber-500/20 text-amber-400' },
  expired: { label: 'Expired', color: 'bg-neutral-500/20 text-neutral-400' },
  draft: { label: 'Draft', color: 'bg-neutral-500/20 text-neutral-400' },
};

export const channelConfig: Record<Channel, { label: string; icon: string }> = {
  web: { label: 'Website', icon: '🌐' },
  app: { label: 'Mobile App', icon: '📱' },
  qr: { label: 'QR Order', icon: '📷' },
};

export const discountTypeConfig: Record<DiscountType, { label: string }> = {
  percentage: { label: 'Percentage Off' },
  fixed: { label: 'Fixed Amount Off' },
  free_item: { label: 'Free Item' },
  free_delivery: { label: 'Free Delivery' },
};

export const customerEligibilityConfig: Record<CustomerEligibility, { label: string; description: string }> = {
  all: { label: 'All Customers', description: 'Available to everyone' },
  new: { label: 'New Customers', description: 'First-time orders only' },
  returning: { label: 'Returning', description: 'Customers with previous orders' },
  vip: { label: 'VIP', description: 'VIP segment members' },
};

export const dayConfig: Record<DayOfWeek, { label: string; short: string }> = {
  mon: { label: 'Monday', short: 'Mon' },
  tue: { label: 'Tuesday', short: 'Tue' },
  wed: { label: 'Wednesday', short: 'Wed' },
  thu: { label: 'Thursday', short: 'Thu' },
  fri: { label: 'Friday', short: 'Fri' },
  sat: { label: 'Saturday', short: 'Sat' },
  sun: { label: 'Sunday', short: 'Sun' },
};

export const giftCardDesignConfig: Record<string, { label: string; gradient: string }> = {
  classic: { label: 'Classic', gradient: 'from-neutral-700 to-neutral-900' },
  birthday: { label: 'Birthday', gradient: 'from-pink-500 to-purple-600' },
  holiday: { label: 'Holiday', gradient: 'from-red-500 to-green-600' },
  thank_you: { label: 'Thank You', gradient: 'from-amber-500 to-orange-600' },
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatTimeOnly(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
}
