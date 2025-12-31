// Core TypeScript types for Aroyb MenuMaster

// ============== ENUMS ==============

export type Channel = 'web' | 'app' | 'qr';
export type StationId = 'grill' | 'fry' | 'pizza' | 'bar' | 'curry' | 'dessert' | 'prep';
export type VATCategory = 'food' | 'drink' | 'alcohol' | 'zero';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type DiscountType = 'percentage' | 'fixed';
export type BrandTone = 'friendly' | 'premium' | 'playful' | 'traditional';

// ============== CATEGORY ==============

export interface Category {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  channelsEnabled: Channel[];
  imageId?: string;
  scheduleIds?: string[];
}

// ============== ITEM ==============

export interface ItemSize {
  id: string;
  name: string;
  price: number;
}

export interface HalfOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface ItemAvailability {
  inStock: boolean;
  soldOutUntil?: string;
}

export interface ItemTranslation {
  name: string;
  description: string;
}

export interface Item {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  sizes: ItemSize[];
  halfHalfEnabled: boolean;
  halfOptions?: HalfOption[];
  modifierGroupIds: string[];
  addOnGroupIds: string[];
  allergens: string[];
  dietaryTags: string[];
  station: StationId;
  vatCategory: VATCategory;
  cost: number;
  popularity: number;
  imageId?: string;
  translations?: Record<string, ItemTranslation>;
  availability: ItemAvailability;
}

// ============== MODIFIER ==============

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

export interface ConditionalRule {
  showWhen: {
    field: string;
    value: string;
  };
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
  conditionalRules?: ConditionalRule[];
}

// ============== ADD-ON GROUP ==============

export interface AddOnGroup {
  id: string;
  name: string;
  maxSelect: number;
  options: ModifierOption[];
}

// ============== COMBO ==============

export interface ComboSlot {
  id: string;
  name: string;
  allowedItemIds: string[];
  defaultItemId?: string;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  slots: ComboSlot[];
  activeScheduleIds: string[];
  imageId?: string;
  savings?: number;
}

// ============== SCHEDULE ==============

export interface Schedule {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string;
  daysOfWeek: DayOfWeek[];
  includedCategoryIds: string[];
  includedItemIds: string[];
  color: string;
}

// ============== HAPPY HOUR ==============

export interface HappyHourRule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
  appliesToCategoryIds: string[];
  appliesToItemIds: string[];
  discountType: DiscountType;
  discountAmount: number;
  active: boolean;
}

// ============== VAT ==============

export interface VATRate {
  id: string;
  name: string;
  rate: number;
  category: VATCategory;
}

export interface VATSettings {
  rates: VATRate[];
  defaultCategory: VATCategory;
}

// ============== IMAGE ==============

export interface ImageAsset {
  id: string;
  name: string;
  dataUrl: string;
  uploadedAt: string;
}

// ============== AI TYPES ==============

export type InsightSeverity = 'high' | 'medium' | 'low';
export type InsightType = 'duplicate' | 'missing_allergen' | 'missing_description' | 'missing_image' | 'modifier_mismatch' | 'inconsistent_sizing';

export interface InsightIssue {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  affectedItemIds: string[];
  suggestedFix?: string;
  autoFixable: boolean;
  dismissed: boolean;
}

export interface PricingSuggestion {
  id: string;
  type: 'price_increase' | 'price_decrease' | 'create_bundle';
  title: string;
  description: string;
  itemIds: string[];
  currentValue?: number;
  suggestedValue?: number;
  expectedImpact: string;
  approved: boolean;
  rejected: boolean;
}

export interface DescriptionSuggestion {
  id: string;
  itemId: string;
  originalDescription: string;
  suggestedDescription: string;
  tone: BrandTone;
  approved: boolean;
  rejected: boolean;
}

export interface BrandVoiceSettings {
  tone: BrandTone;
  taglineStyle: boolean;
  includeIngredients: boolean;
  includeCookingStyle: boolean;
}

// ============== APP STATE ==============

export interface MenuMasterState {
  categories: Category[];
  items: Item[];
  modifierGroups: ModifierGroup[];
  addOnGroups: AddOnGroup[];
  combos: Combo[];
  schedules: Schedule[];
  happyHourRules: HappyHourRule[];
  vatSettings: VATSettings;
  images: ImageAsset[];
  brandVoice: BrandVoiceSettings;
  insights: InsightIssue[];
  pricingSuggestions: PricingSuggestion[];
  descriptionSuggestions: DescriptionSuggestion[];
}

// ============== ALLERGENS ==============

export const ALLERGENS = [
  'Celery', 'Cereals containing gluten', 'Crustaceans', 'Eggs', 
  'Fish', 'Lupin', 'Milk', 'Molluscs', 'Mustard', 'Nuts', 
  'Peanuts', 'Sesame seeds', 'Soybeans', 'Sulphur dioxide'
] as const;

export const DIETARY_TAGS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
  'Halal', 'Kosher', 'Low-Calorie', 'Spicy', 'Popular', 'New'
] as const;
