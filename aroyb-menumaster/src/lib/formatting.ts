// Formatting utilities for MenuMaster

import type { StationId, Channel, VATCategory, DayOfWeek, BrandTone } from '@/types';

// ============== ID GENERATION ==============

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

// ============== MONEY ==============

export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

// ============== STATION CONFIG ==============

export const stationConfig: Record<StationId, { label: string; icon: string; color: string }> = {
  grill: { label: 'Grill', icon: '🔥', color: 'bg-red-500/20 text-red-400' },
  fry: { label: 'Fry', icon: '🍳', color: 'bg-amber-500/20 text-amber-400' },
  pizza: { label: 'Pizza', icon: '🍕', color: 'bg-orange-500/20 text-orange-400' },
  bar: { label: 'Bar', icon: '🍹', color: 'bg-blue-500/20 text-blue-400' },
  curry: { label: 'Curry', icon: '🍛', color: 'bg-yellow-500/20 text-yellow-400' },
  dessert: { label: 'Dessert', icon: '🍰', color: 'bg-pink-500/20 text-pink-400' },
  prep: { label: 'Prep', icon: '🥗', color: 'bg-green-500/20 text-green-400' },
};

// ============== CHANNEL CONFIG ==============

export const channelConfig: Record<Channel, { label: string; icon: string }> = {
  web: { label: 'Website', icon: '🌐' },
  app: { label: 'Mobile App', icon: '📱' },
  qr: { label: 'QR Order', icon: '📷' },
};

// ============== VAT CONFIG ==============

export const vatCategoryConfig: Record<VATCategory, { label: string; rate: number }> = {
  food: { label: 'Food (20%)', rate: 20 },
  drink: { label: 'Drinks (20%)', rate: 20 },
  alcohol: { label: 'Alcohol (20%)', rate: 20 },
  zero: { label: 'Zero Rate (0%)', rate: 0 },
};

// ============== DAY CONFIG ==============

export const dayConfig: Record<DayOfWeek, { label: string; short: string }> = {
  mon: { label: 'Monday', short: 'Mon' },
  tue: { label: 'Tuesday', short: 'Tue' },
  wed: { label: 'Wednesday', short: 'Wed' },
  thu: { label: 'Thursday', short: 'Thu' },
  fri: { label: 'Friday', short: 'Fri' },
  sat: { label: 'Saturday', short: 'Sat' },
  sun: { label: 'Sunday', short: 'Sun' },
};

// ============== BRAND TONE CONFIG ==============

export const brandToneConfig: Record<BrandTone, { label: string; description: string }> = {
  friendly: { label: 'Friendly', description: 'Warm, welcoming, approachable' },
  premium: { label: 'Premium', description: 'Sophisticated, refined, elegant' },
  playful: { label: 'Playful', description: 'Fun, quirky, memorable' },
  traditional: { label: 'Traditional', description: 'Classic, authentic, trusted' },
};

// ============== ALLERGEN CONFIG ==============

export const allergenIcons: Record<string, string> = {
  'Celery': '🥬',
  'Cereals containing gluten': '🌾',
  'Crustaceans': '🦐',
  'Eggs': '🥚',
  'Fish': '🐟',
  'Lupin': '🌸',
  'Milk': '🥛',
  'Molluscs': '🐚',
  'Mustard': '🌭',
  'Nuts': '🥜',
  'Peanuts': '🥜',
  'Sesame seeds': '🌱',
  'Soybeans': '🫘',
  'Sulphur dioxide': '🍷',
};

// ============== DIETARY TAG CONFIG ==============

export const dietaryTagConfig: Record<string, { icon: string; color: string }> = {
  'Vegetarian': { icon: '🥬', color: 'bg-green-500/20 text-green-400' },
  'Vegan': { icon: '🌱', color: 'bg-emerald-500/20 text-emerald-400' },
  'Gluten-Free': { icon: '🌾', color: 'bg-amber-500/20 text-amber-400' },
  'Dairy-Free': { icon: '🥛', color: 'bg-blue-500/20 text-blue-400' },
  'Halal': { icon: '☪️', color: 'bg-green-500/20 text-green-400' },
  'Kosher': { icon: '✡️', color: 'bg-blue-500/20 text-blue-400' },
  'Low-Calorie': { icon: '🔥', color: 'bg-orange-500/20 text-orange-400' },
  'Spicy': { icon: '🌶️', color: 'bg-red-500/20 text-red-400' },
  'Popular': { icon: '⭐', color: 'bg-yellow-500/20 text-yellow-400' },
  'New': { icon: '✨', color: 'bg-purple-500/20 text-purple-400' },
};
