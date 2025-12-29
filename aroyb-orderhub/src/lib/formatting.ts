// Formatting utilities for UK restaurant operations
import type { SourceChannel, FulfillmentType, OrderStatus, RiskLevel } from '@/types';

// Currency
export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

// Time formatting
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Channel labels and colors
export const channelConfig: Record<SourceChannel, { label: string; color: string; bgColor: string }> = {
  web: { label: 'Web', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  app: { label: 'App', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  qr: { label: 'QR Scan', color: 'text-green-700', bgColor: 'bg-green-100' },
  marketplace: { label: 'Marketplace', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

// Fulfillment labels and icons
export const fulfillmentConfig: Record<FulfillmentType, { label: string; icon: string }> = {
  delivery: { label: 'Delivery', icon: '🚗' },
  collection: { label: 'Collection', icon: '🏃' },
  'dine-in': { label: 'Dine-in', icon: '🍽️' },
};

// Order status config
export const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  accepted: { label: 'Accepted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  preparing: { label: 'Preparing', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  ready: { label: 'Ready', color: 'text-green-700', bgColor: 'bg-green-100' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  completed: { label: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
  refunded: { label: 'Refunded', color: 'text-red-700', bgColor: 'bg-red-100' },
};

// Risk level config
export const riskConfig: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low Risk', color: 'text-green-700', bgColor: 'bg-green-100' },
  medium: { label: 'Medium Risk', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  high: { label: 'High Risk', color: 'text-red-700', bgColor: 'bg-red-100' },
};

// Station labels
export const stationLabels: Record<string, string> = {
  grill: 'Grill',
  fry: 'Fry',
  curry: 'Curry',
  dessert: 'Dessert',
  bar: 'Bar',
  prep: 'Prep',
};

// Generate order number
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${year}-${random}`;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
