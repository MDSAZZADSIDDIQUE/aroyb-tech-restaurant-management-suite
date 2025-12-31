// Storage utilities for MenuMaster - localStorage persistence

import type { Category, Item, ModifierGroup, AddOnGroup, Combo, Schedule, HappyHourRule, VATSettings, ImageAsset, BrandVoiceSettings, InsightIssue, PricingSuggestion, DescriptionSuggestion } from '@/types';
import categoriesData from '@/data/categories.json';
import itemsData from '@/data/items.json';
import modifierGroupsData from '@/data/modifier-groups.json';
import addonGroupsData from '@/data/addon-groups.json';
import combosData from '@/data/combos.json';
import schedulesData from '@/data/schedules.json';
import happyHourData from '@/data/happy-hour.json';
import vatSettingsData from '@/data/vat-settings.json';

const STORAGE_KEYS = {
  categories: 'mm_categories',
  items: 'mm_items',
  modifierGroups: 'mm_modifier_groups',
  addonGroups: 'mm_addon_groups',
  combos: 'mm_combos',
  schedules: 'mm_schedules',
  happyHour: 'mm_happy_hour',
  vatSettings: 'mm_vat_settings',
  images: 'mm_images',
  brandVoice: 'mm_brand_voice',
  insights: 'mm_insights',
  pricingSuggestions: 'mm_pricing_suggestions',
  descriptionSuggestions: 'mm_description_suggestions',
  initialized: 'mm_initialized',
};

const defaultBrandVoice: BrandVoiceSettings = {
  tone: 'friendly',
  taglineStyle: true,
  includeIngredients: true,
  includeCookingStyle: true,
};

// ============== INITIALIZATION ==============

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  
  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (isInitialized) return;
  
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categoriesData));
  localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(itemsData));
  localStorage.setItem(STORAGE_KEYS.modifierGroups, JSON.stringify(modifierGroupsData));
  localStorage.setItem(STORAGE_KEYS.addonGroups, JSON.stringify(addonGroupsData));
  localStorage.setItem(STORAGE_KEYS.combos, JSON.stringify(combosData));
  localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedulesData));
  localStorage.setItem(STORAGE_KEYS.happyHour, JSON.stringify(happyHourData));
  localStorage.setItem(STORAGE_KEYS.vatSettings, JSON.stringify(vatSettingsData));
  localStorage.setItem(STORAGE_KEYS.images, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.brandVoice, JSON.stringify(defaultBrandVoice));
  localStorage.setItem(STORAGE_KEYS.insights, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.pricingSuggestions, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.descriptionSuggestions, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

export function resetStorage(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeStorage();
}

// ============== CATEGORIES ==============

export function getCategories(): Category[] {
  if (typeof window === 'undefined') return categoriesData as unknown as Category[];
  const stored = localStorage.getItem(STORAGE_KEYS.categories);
  return stored ? JSON.parse(stored) : categoriesData as unknown as Category[];
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find(c => c.id === id);
}

export function saveCategories(categories: Category[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
  }
}

export function updateCategory(id: string, updates: Partial<Category>): void {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    saveCategories(categories);
  }
}

export function addCategory(category: Category): void {
  const categories = getCategories();
  categories.push(category);
  saveCategories(categories);
}

export function deleteCategory(id: string): void {
  saveCategories(getCategories().filter(c => c.id !== id));
}

// ============== ITEMS ==============

export function getItems(): Item[] {
  if (typeof window === 'undefined') return itemsData as unknown as Item[];
  const stored = localStorage.getItem(STORAGE_KEYS.items);
  return stored ? JSON.parse(stored) : itemsData as unknown as Item[];
}

export function getItemById(id: string): Item | undefined {
  return getItems().find(i => i.id === id);
}

export function getItemsByCategory(categoryId: string): Item[] {
  return getItems().filter(i => i.categoryId === categoryId);
}

export function saveItems(items: Item[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
  }
}

export function updateItem(id: string, updates: Partial<Item>): void {
  const items = getItems();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveItems(items);
  }
}

export function addItem(item: Item): void {
  const items = getItems();
  items.push(item);
  saveItems(items);
}

export function deleteItem(id: string): void {
  saveItems(getItems().filter(i => i.id !== id));
}

// ============== MODIFIER GROUPS ==============

export function getModifierGroups(): ModifierGroup[] {
  if (typeof window === 'undefined') return modifierGroupsData as unknown as ModifierGroup[];
  const stored = localStorage.getItem(STORAGE_KEYS.modifierGroups);
  return stored ? JSON.parse(stored) : modifierGroupsData as unknown as ModifierGroup[];
}

export function getModifierGroupById(id: string): ModifierGroup | undefined {
  return getModifierGroups().find(m => m.id === id);
}

export function saveModifierGroups(groups: ModifierGroup[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.modifierGroups, JSON.stringify(groups));
  }
}

export function updateModifierGroup(id: string, updates: Partial<ModifierGroup>): void {
  const groups = getModifierGroups();
  const index = groups.findIndex(g => g.id === id);
  if (index !== -1) {
    groups[index] = { ...groups[index], ...updates };
    saveModifierGroups(groups);
  }
}

// ============== ADD-ON GROUPS ==============

export function getAddOnGroups(): AddOnGroup[] {
  if (typeof window === 'undefined') return addonGroupsData as unknown as AddOnGroup[];
  const stored = localStorage.getItem(STORAGE_KEYS.addonGroups);
  return stored ? JSON.parse(stored) : addonGroupsData as unknown as AddOnGroup[];
}

// ============== COMBOS ==============

export function getCombos(): Combo[] {
  if (typeof window === 'undefined') return combosData as unknown as Combo[];
  const stored = localStorage.getItem(STORAGE_KEYS.combos);
  return stored ? JSON.parse(stored) : combosData as unknown as Combo[];
}

export function saveCombos(combos: Combo[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.combos, JSON.stringify(combos));
  }
}

export function updateCombo(id: string, updates: Partial<Combo>): void {
  const combos = getCombos();
  const index = combos.findIndex(c => c.id === id);
  if (index !== -1) {
    combos[index] = { ...combos[index], ...updates };
    saveCombos(combos);
  }
}

// ============== SCHEDULES ==============

export function getSchedules(): Schedule[] {
  if (typeof window === 'undefined') return schedulesData as unknown as Schedule[];
  const stored = localStorage.getItem(STORAGE_KEYS.schedules);
  return stored ? JSON.parse(stored) : schedulesData as unknown as Schedule[];
}

export function saveSchedules(schedules: Schedule[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
  }
}

// ============== HAPPY HOUR ==============

export function getHappyHourRules(): HappyHourRule[] {
  if (typeof window === 'undefined') return happyHourData as unknown as HappyHourRule[];
  const stored = localStorage.getItem(STORAGE_KEYS.happyHour);
  return stored ? JSON.parse(stored) : happyHourData as unknown as HappyHourRule[];
}

export function saveHappyHourRules(rules: HappyHourRule[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.happyHour, JSON.stringify(rules));
  }
}

// ============== VAT SETTINGS ==============

export function getVATSettings(): VATSettings {
  if (typeof window === 'undefined') return vatSettingsData as unknown as VATSettings;
  const stored = localStorage.getItem(STORAGE_KEYS.vatSettings);
  return stored ? JSON.parse(stored) : vatSettingsData as unknown as VATSettings;
}

export function saveVATSettings(settings: VATSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.vatSettings, JSON.stringify(settings));
  }
}

// ============== IMAGES ==============

export function getImages(): ImageAsset[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.images);
  return stored ? JSON.parse(stored) : [];
}

export function saveImages(images: ImageAsset[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.images, JSON.stringify(images));
  }
}

export function addImage(image: ImageAsset): void {
  const images = getImages();
  images.push(image);
  saveImages(images);
}

// ============== BRAND VOICE ==============

export function getBrandVoice(): BrandVoiceSettings {
  if (typeof window === 'undefined') return defaultBrandVoice;
  const stored = localStorage.getItem(STORAGE_KEYS.brandVoice);
  return stored ? JSON.parse(stored) : defaultBrandVoice;
}

export function saveBrandVoice(settings: BrandVoiceSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.brandVoice, JSON.stringify(settings));
  }
}

// ============== AI SUGGESTIONS ==============

export function getInsights(): InsightIssue[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.insights);
  return stored ? JSON.parse(stored) : [];
}

export function saveInsights(insights: InsightIssue[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.insights, JSON.stringify(insights));
  }
}

export function getPricingSuggestions(): PricingSuggestion[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.pricingSuggestions);
  return stored ? JSON.parse(stored) : [];
}

export function savePricingSuggestions(suggestions: PricingSuggestion[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.pricingSuggestions, JSON.stringify(suggestions));
  }
}

export function getDescriptionSuggestions(): DescriptionSuggestion[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.descriptionSuggestions);
  return stored ? JSON.parse(stored) : [];
}

export function saveDescriptionSuggestions(suggestions: DescriptionSuggestion[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.descriptionSuggestions, JSON.stringify(suggestions));
  }
}
