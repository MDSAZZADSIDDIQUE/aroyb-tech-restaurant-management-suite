// Formatting utilities for KDS

import type { Station, Channel, FulfillmentType, TicketStatus, PriorityLevel, RemakeReason, StationId } from '@/types';
import stationsData from '@/data/stations.json';

// ============== STATIONS ==============

export const stations = stationsData as Station[];

export function getStation(id: StationId): Station | undefined {
  return stations.find(s => s.id === id);
}

export function getStationColor(id: StationId): string {
  return getStation(id)?.color || 'text-gray-500';
}

export function getStationBgColor(id: StationId): string {
  return getStation(id)?.bgColor || 'bg-gray-500/20';
}

export function getStationName(id: StationId): string {
  return getStation(id)?.name || id;
}

export function getStationIcon(id: StationId): string {
  return getStation(id)?.icon || '🍳';
}

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

// ============== STATUS CONFIG ==============

export const statusConfig: Record<TicketStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-white', bgColor: 'bg-blue-600' },
  in_progress: { label: 'In Progress', color: 'text-white', bgColor: 'bg-orange-600' },
  ready: { label: 'Ready', color: 'text-white', bgColor: 'bg-green-600' },
  completed: { label: 'Completed', color: 'text-white', bgColor: 'bg-gray-600' },
  recalled: { label: 'Recalled', color: 'text-white', bgColor: 'bg-red-600' },
};

// ============== PRIORITY CONFIG ==============

export const priorityConfig: Record<PriorityLevel, { label: string; color: string; bgColor: string }> = {
  high: { label: 'HIGH', color: 'text-red-300', bgColor: 'bg-red-600' },
  medium: { label: 'MED', color: 'text-amber-300', bgColor: 'bg-amber-600' },
  low: { label: 'LOW', color: 'text-green-300', bgColor: 'bg-green-700' },
};

// ============== REMAKE REASONS ==============

export const remakeReasonLabels: Record<RemakeReason, string> = {
  wrong_modifier: 'Wrong Modifier',
  missing_item: 'Missing Item',
  allergy_missed: 'Allergy Note Missed',
  overcooked: 'Overcooked',
  undercooked: 'Undercooked',
  wrong_item: 'Wrong Item',
  other: 'Other',
};

// ============== TIME FORMATTING ==============

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatElapsedMinutes(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / 60000);
}

export function formatElapsedTime(startDate: string): string {
  const mins = formatElapsedMinutes(startDate);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

export function getMinutesUntil(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  return Math.floor((target.getTime() - now.getTime()) / 60000);
}

export function formatTimeRemaining(targetDate: string): string {
  const mins = getMinutesUntil(targetDate);
  if (mins < 0) return `${Math.abs(mins)}m LATE`;
  if (mins === 0) return 'NOW';
  return `${mins}m`;
}

// ============== URGENCY ==============

export type UrgencyLevel = 'ok' | 'warning' | 'critical' | 'late';

export function getUrgencyLevel(promisedAt: string, createdAt: string, lateThreshold: number = 15): UrgencyLevel {
  const minsRemaining = getMinutesUntil(promisedAt);
  const elapsedMins = formatElapsedMinutes(createdAt);
  
  if (minsRemaining < 0) return 'late';
  if (minsRemaining <= 5) return 'critical';
  if (elapsedMins > lateThreshold) return 'warning';
  return 'ok';
}

export const urgencyColors: Record<UrgencyLevel, { text: string; bg: string; border: string; pulse?: boolean }> = {
  ok: { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50' },
  critical: { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', pulse: true },
  late: { text: 'text-red-500', bg: 'bg-red-600/30', border: 'border-red-600', pulse: true },
};

// ============== ID GENERATION ==============

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

export function generateOrderNumber(): string {
  const num = Math.floor(Math.random() * 900 + 100);
  return `ORD-${num}`;
}

// ============== DEMO USERS ==============

export const demoUsers = ['Sam', 'Lee', 'Aisha'];
