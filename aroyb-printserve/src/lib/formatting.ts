// Formatting utilities for PrintServe

import type { PrinterStatus, PrinterType, Channel, FulfillmentType, PrintJobType, PrintJobStatus } from '@/types';

// ============== ID GENERATION ==============

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

// ============== TIME ==============

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// ============== MONEY ==============

export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

// ============== PRINTER STATUS ==============

export const printerStatusConfig: Record<PrinterStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  online: { label: 'Online', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: '✅' },
  offline: { label: 'Offline', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '❌' },
  paper_low: { label: 'Paper Low', color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: '⚠️' },
  error: { label: 'Error', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '🚨' },
};

export const printerTypeConfig: Record<PrinterType, { label: string; icon: string }> = {
  kitchen: { label: 'Kitchen', icon: '🍳' },
  front: { label: 'Front Counter', icon: '🧾' },
  label: { label: 'Label Printer', icon: '🏷️' },
};

// ============== CHANNEL CONFIG ==============

export const channelConfig: Record<Channel, { label: string; color: string; bgColor: string; icon: string }> = {
  web: { label: 'Web', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: '🌐' },
  app: { label: 'App', color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: '📱' },
  qr: { label: 'QR', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: '📷' },
  pos: { label: 'POS', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: '💳' },
};

// ============== FULFILLMENT CONFIG ==============

export const fulfillmentConfig: Record<FulfillmentType, { label: string; icon: string; shortLabel: string }> = {
  'dine-in': { label: 'Dine-in', icon: '🍽️', shortLabel: 'TABLE' },
  'collection': { label: 'Collection', icon: '🛍️', shortLabel: 'COLLECT' },
  'delivery': { label: 'Delivery', icon: '🚗', shortLabel: 'DELIVER' },
};

// ============== PRINT JOB CONFIG ==============

export const printJobTypeConfig: Record<PrintJobType, { label: string; icon: string }> = {
  docket: { label: 'Kitchen Docket', icon: '📋' },
  receipt: { label: 'Receipt', icon: '🧾' },
  label: { label: 'Packing Label', icon: '🏷️' },
  allergen: { label: 'Allergen Label', icon: '⚠️' },
};

export const printJobStatusConfig: Record<PrintJobStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  printing: { label: 'Printing', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  completed: { label: 'Completed', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  failed: { label: 'Failed', color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

// ============== ALLERGENS ==============

export const allergenIcons: Record<string, string> = {
  Dairy: '🥛',
  Gluten: '🌾',
  Nuts: '🥜',
  Peanuts: '🥜',
  Fish: '🐟',
  Shellfish: '🦐',
  Eggs: '🥚',
  Soy: '🫘',
  Sesame: '🌱',
  Sulphites: '🍷',
  Celery: '🥬',
  Mustard: '🌭',
  Lupin: '🌸',
  Molluscs: '🐚',
};

export function getAllergenIcon(allergen: string): string {
  return allergenIcons[allergen] || '⚠️';
}

// ============== HANDLING ICONS ==============

export const handlingIcons: Record<string, { icon: string; color: string }> = {
  hot: { icon: '🔥', color: 'text-red-500' },
  cold: { icon: '❄️', color: 'text-blue-500' },
  fragile: { icon: '⚠️', color: 'text-amber-500' },
  upright: { icon: '⬆️', color: 'text-purple-500' },
  allergen: { icon: '🚨', color: 'text-red-600' },
};
