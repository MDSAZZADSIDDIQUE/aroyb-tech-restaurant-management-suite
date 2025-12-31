// Storage utilities for KDS - localStorage persistence

import type { Ticket, RemakeLog, HandoffLog, KDSSettings, BottleneckAlert, MistakeInsight } from '@/types';
import ticketsData from '@/data/tickets.json';
import settingsData from '@/data/settings.json';

const STORAGE_KEYS = {
  tickets: 'kds_tickets',
  remakeLogs: 'kds_remake_logs',
  handoffLogs: 'kds_handoff_logs',
  settings: 'kds_settings',
  bottleneckAlerts: 'kds_bottleneck_alerts',
  initialized: 'kds_initialized',
};

// ============== INITIALIZATION ==============

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  
  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (isInitialized) return;
  
  // Initialize with seed data
  localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(ticketsData));
  localStorage.setItem(STORAGE_KEYS.remakeLogs, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.handoffLogs, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settingsData));
  localStorage.setItem(STORAGE_KEYS.bottleneckAlerts, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

export function resetStorage(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeStorage();
}

// ============== TICKETS ==============

export function getStoredTickets(): Ticket[] {
  if (typeof window === 'undefined') return ticketsData as unknown as Ticket[];
  
  const stored = localStorage.getItem(STORAGE_KEYS.tickets);
  return stored ? JSON.parse(stored) : ticketsData as unknown as Ticket[];
}

export function setStoredTickets(tickets: Ticket[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(tickets));
}

export function addStoredTicket(ticket: Ticket): void {
  const tickets = getStoredTickets();
  tickets.push(ticket);
  setStoredTickets(tickets);
}

export function updateStoredTicket(ticketId: string, updates: Partial<Ticket>): Ticket | null {
  const tickets = getStoredTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;
  
  tickets[index] = { ...tickets[index], ...updates };
  setStoredTickets(tickets);
  return tickets[index];
}

export function getTicketById(ticketId: string): Ticket | null {
  const tickets = getStoredTickets();
  return tickets.find(t => t.id === ticketId) || null;
}

// ============== REMAKE LOGS ==============

export function getRemakeLogs(): RemakeLog[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.remakeLogs);
  return stored ? JSON.parse(stored) : [];
}

export function addRemakeLog(log: RemakeLog): void {
  const logs = getRemakeLogs();
  logs.push(log);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.remakeLogs, JSON.stringify(logs));
  }
}

// ============== HANDOFF LOGS ==============

export function getHandoffLogs(): HandoffLog[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.handoffLogs);
  return stored ? JSON.parse(stored) : [];
}

export function addHandoffLog(log: HandoffLog): void {
  const logs = getHandoffLogs();
  logs.push(log);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.handoffLogs, JSON.stringify(logs));
  }
}

// ============== SETTINGS ==============

export function getStoredSettings(): KDSSettings {
  if (typeof window === 'undefined') return settingsData as unknown as KDSSettings;
  
  const stored = localStorage.getItem(STORAGE_KEYS.settings);
  return stored ? JSON.parse(stored) : settingsData as unknown as KDSSettings;
}

export function setStoredSettings(settings: KDSSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function updateStoredSettings(updates: Partial<KDSSettings>): KDSSettings {
  const settings = getStoredSettings();
  const updated = { ...settings, ...updates };
  setStoredSettings(updated);
  return updated;
}

// ============== BOTTLENECK ALERTS ==============

export function getBottleneckAlerts(): BottleneckAlert[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.bottleneckAlerts);
  return stored ? JSON.parse(stored) : [];
}

export function setBottleneckAlerts(alerts: BottleneckAlert[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.bottleneckAlerts, JSON.stringify(alerts));
  }
}
