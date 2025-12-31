// Storage utilities for PromoStudio - localStorage persistence

import type { Promo, GiftCardProduct, GiftCardIssued, AntiAbuseRule, AttemptLog, AllowlistEntry, GeneratorSuggestion, OptimisationSuggestion, SendTimeSuggestion, MenuItem, Category, SalesSnapshot, EngagementSnapshot } from '@/types';
import promosData from '@/data/promos.json';
import giftCardProductsData from '@/data/gift-card-products.json';
import giftCardsIssuedData from '@/data/gift-cards-issued.json';
import antiAbuseRulesData from '@/data/anti-abuse-rules.json';
import abuseLogsData from '@/data/abuse-logs.json';
import menuItemsData from '@/data/menu-items.json';
import categoriesData from '@/data/categories.json';
import salesData from '@/data/sales-data.json';
import engagementData from '@/data/engagement-data.json';

const KEYS = {
  promos: 'ps_promos',
  giftCardProducts: 'ps_gc_products',
  giftCardsIssued: 'ps_gc_issued',
  antiAbuseRules: 'ps_abuse_rules',
  abuseLogs: 'ps_abuse_logs',
  allowlist: 'ps_allowlist',
  generatorSuggestions: 'ps_ai_generator',
  optimisationSuggestions: 'ps_ai_optimiser',
  sendTimeSuggestions: 'ps_ai_sendtime',
  initialized: 'ps_initialized',
};

// ============== INITIALIZATION ==============

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.initialized)) return;
  
  localStorage.setItem(KEYS.promos, JSON.stringify(promosData));
  localStorage.setItem(KEYS.giftCardProducts, JSON.stringify(giftCardProductsData));
  localStorage.setItem(KEYS.giftCardsIssued, JSON.stringify(giftCardsIssuedData));
  localStorage.setItem(KEYS.antiAbuseRules, JSON.stringify(antiAbuseRulesData));
  localStorage.setItem(KEYS.abuseLogs, JSON.stringify(abuseLogsData));
  localStorage.setItem(KEYS.allowlist, JSON.stringify([]));
  localStorage.setItem(KEYS.generatorSuggestions, JSON.stringify([]));
  localStorage.setItem(KEYS.optimisationSuggestions, JSON.stringify([]));
  localStorage.setItem(KEYS.sendTimeSuggestions, JSON.stringify([]));
  localStorage.setItem(KEYS.initialized, 'true');
}

export function resetStorage(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  initializeStorage();
}

// ============== PROMOS ==============

export function getPromos(): Promo[] {
  if (typeof window === 'undefined') return promosData as unknown as Promo[];
  const stored = localStorage.getItem(KEYS.promos);
  return stored ? JSON.parse(stored) : promosData as unknown as Promo[];
}

export function getPromoById(id: string): Promo | undefined {
  return getPromos().find(p => p.id === id);
}

export function savePromos(promos: Promo[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.promos, JSON.stringify(promos));
  }
}

export function updatePromo(id: string, updates: Partial<Promo>): void {
  const promos = getPromos();
  const index = promos.findIndex(p => p.id === id);
  if (index !== -1) {
    promos[index] = { ...promos[index], ...updates };
    savePromos(promos);
  }
}

export function addPromo(promo: Promo): void {
  const promos = getPromos();
  promos.push(promo);
  savePromos(promos);
}

export function deletePromo(id: string): void {
  savePromos(getPromos().filter(p => p.id !== id));
}

// ============== GIFT CARD PRODUCTS ==============

export function getGiftCardProducts(): GiftCardProduct[] {
  if (typeof window === 'undefined') return giftCardProductsData as unknown as GiftCardProduct[];
  const stored = localStorage.getItem(KEYS.giftCardProducts);
  return stored ? JSON.parse(stored) : giftCardProductsData as unknown as GiftCardProduct[];
}

export function saveGiftCardProducts(products: GiftCardProduct[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.giftCardProducts, JSON.stringify(products));
  }
}

// ============== GIFT CARDS ISSUED ==============

export function getGiftCardsIssued(): GiftCardIssued[] {
  if (typeof window === 'undefined') return giftCardsIssuedData as unknown as GiftCardIssued[];
  const stored = localStorage.getItem(KEYS.giftCardsIssued);
  return stored ? JSON.parse(stored) : giftCardsIssuedData as unknown as GiftCardIssued[];
}

export function saveGiftCardsIssued(cards: GiftCardIssued[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.giftCardsIssued, JSON.stringify(cards));
  }
}

export function addGiftCardIssued(card: GiftCardIssued): void {
  const cards = getGiftCardsIssued();
  cards.push(card);
  saveGiftCardsIssued(cards);
}

export function updateGiftCardIssued(code: string, updates: Partial<GiftCardIssued>): void {
  const cards = getGiftCardsIssued();
  const index = cards.findIndex(c => c.code === code);
  if (index !== -1) {
    cards[index] = { ...cards[index], ...updates };
    saveGiftCardsIssued(cards);
  }
}

export function getGiftCardByCode(code: string): GiftCardIssued | undefined {
  return getGiftCardsIssued().find(c => c.code === code);
}

// ============== ANTI-ABUSE ==============

export function getAntiAbuseRules(): AntiAbuseRule[] {
  if (typeof window === 'undefined') return antiAbuseRulesData as unknown as AntiAbuseRule[];
  const stored = localStorage.getItem(KEYS.antiAbuseRules);
  return stored ? JSON.parse(stored) : antiAbuseRulesData as unknown as AntiAbuseRule[];
}

export function saveAntiAbuseRules(rules: AntiAbuseRule[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.antiAbuseRules, JSON.stringify(rules));
  }
}

export function getAbuseLogs(): AttemptLog[] {
  if (typeof window === 'undefined') return abuseLogsData as unknown as AttemptLog[];
  const stored = localStorage.getItem(KEYS.abuseLogs);
  return stored ? JSON.parse(stored) : abuseLogsData as unknown as AttemptLog[];
}

export function saveAbuseLogs(logs: AttemptLog[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.abuseLogs, JSON.stringify(logs));
  }
}

export function addAbuseLog(log: AttemptLog): void {
  const logs = getAbuseLogs();
  logs.unshift(log);
  saveAbuseLogs(logs.slice(0, 200)); // Keep last 200
}

export function getAllowlist(): AllowlistEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(KEYS.allowlist);
  return stored ? JSON.parse(stored) : [];
}

export function saveAllowlist(entries: AllowlistEntry[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.allowlist, JSON.stringify(entries));
  }
}

// ============== AI SUGGESTIONS ==============

export function getGeneratorSuggestions(): GeneratorSuggestion[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(KEYS.generatorSuggestions);
  return stored ? JSON.parse(stored) : [];
}

export function saveGeneratorSuggestions(suggestions: GeneratorSuggestion[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.generatorSuggestions, JSON.stringify(suggestions));
  }
}

export function getOptimisationSuggestions(): OptimisationSuggestion[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(KEYS.optimisationSuggestions);
  return stored ? JSON.parse(stored) : [];
}

export function saveOptimisationSuggestions(suggestions: OptimisationSuggestion[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.optimisationSuggestions, JSON.stringify(suggestions));
  }
}

export function getSendTimeSuggestions(): SendTimeSuggestion[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(KEYS.sendTimeSuggestions);
  return stored ? JSON.parse(stored) : [];
}

export function saveSendTimeSuggestions(suggestions: SendTimeSuggestion[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.sendTimeSuggestions, JSON.stringify(suggestions));
  }
}

// ============== STATIC DATA ==============

export function getMenuItems(): MenuItem[] {
  return menuItemsData as unknown as MenuItem[];
}

export function getCategories(): Category[] {
  return categoriesData as unknown as Category[];
}

export function getSalesData(): SalesSnapshot[] {
  return salesData as unknown as SalesSnapshot[];
}

export function getEngagementData(): EngagementSnapshot[] {
  return engagementData as unknown as EngagementSnapshot[];
}
