// Types for PromoStudio

// ============== ENUMS ==============

export type PromoType = 'discount_code' | 'bogof' | 'bundle' | 'free_delivery';
export type PromoStatus = 'active' | 'scheduled' | 'paused' | 'expired' | 'draft';
export type Channel = 'web' | 'app' | 'qr';
export type DiscountType = 'percentage' | 'fixed' | 'free_item' | 'free_delivery';
export type CustomerEligibility = 'all' | 'new' | 'returning' | 'vip';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

// ============== PROMO ==============

export interface PromoSchedule {
  daysOfWeek: DayOfWeek[];
  startTime: string; // HH:mm
  endTime: string;
  startDate?: string; // ISO date
  endDate?: string;
}

export interface UsageLimits {
  total?: number;
  perCustomer?: number;
  perDay?: number;
  onePerOrder: boolean;
  newCustomersOnly: boolean;
}

export interface DiscountConfig {
  type: DiscountType;
  value: number; // percentage or fixed amount
  freeItemId?: string;
  maxDiscount?: number;
}

export interface BogofDefinition {
  buyQuantity: number;
  getQuantity: number;
  applicableItems: 'same' | 'category' | 'selected';
  selectedItemIds?: string[];
  categoryId?: string;
  lowestPricedFree: boolean;
}

export interface BundleSlot {
  id: string;
  name: string;
  allowedItemIds: string[];
  defaultItemId?: string;
  priceAdjustment?: number;
}

export interface BundleDefinition {
  fixedPrice: number;
  slots: BundleSlot[];
  allowSubstitutions: boolean;
}

export interface Promo {
  id: string;
  type: PromoType;
  name: string;
  description?: string;
  status: PromoStatus;
  channels: Channel[];
  code?: string; // for discount codes
  discount?: DiscountConfig;
  bogofDefinition?: BogofDefinition;
  bundleDefinition?: BundleDefinition;
  freeDeliveryThreshold?: number;
  minBasket?: number;
  eligibleCategoryIds?: string[];
  eligibleItemIds?: string[];
  customerEligibility: CustomerEligibility;
  stackable: boolean;
  schedule?: PromoSchedule;
  usageLimits: UsageLimits;
  priority: number;
  createdAt: string;
  stats: PromoStats;
}

export interface PromoStats {
  impressions: number;
  redemptions: number;
  revenue: number;
  avgOrderValue: number;
  repeatRate: number;
}

// ============== GIFT CARDS ==============

export interface GiftCardProduct {
  id: string;
  name: string;
  amounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  designTemplate: 'classic' | 'birthday' | 'holiday' | 'thank_you';
  expiryDays?: number;
  termsText: string;
  active: boolean;
}

export interface GiftCardIssued {
  id: string;
  code: string;
  productId: string;
  initialBalance: number;
  remainingBalance: number;
  issuedToEmail?: string;
  issuedToName?: string;
  purchasedBy?: string;
  createdAt: string;
  expiresAt?: string;
  redeemedAt?: string;
  redemptionCount: number;
}

// ============== ANTI-ABUSE ==============

export interface AntiAbuseRule {
  id: string;
  name: string;
  enabled: boolean;
  type: 'device_limit' | 'velocity' | 'basket_ratio' | 'customer_limit';
  threshold: number;
  action: 'block' | 'flag' | 'require_review';
  description: string;
}

export interface AttemptLog {
  id: string;
  timestamp: string;
  promoId?: string;
  promoCode?: string;
  customerId?: string;
  deviceIdHash?: string;
  ipHash?: string;
  reason: string;
  ruleId?: string;
  actionTaken: 'blocked' | 'flagged' | 'allowed';
  basketValue?: number;
  discountValue?: number;
}

export interface AllowlistEntry {
  id: string;
  type: 'customer' | 'device' | 'ip';
  value: string;
  addedAt: string;
  reason?: string;
}

// ============== ANALYTICS ==============

export interface SalesSnapshot {
  date: string;
  hour: number;
  orders: number;
  revenue: number;
  avgOrderValue: number;
  conversionRate: number;
}

export interface EngagementSnapshot {
  segment: string;
  channel: 'email' | 'sms' | 'push';
  dayOfWeek: DayOfWeek;
  hour: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

// ============== AI SUGGESTIONS ==============

export interface GeneratorSuggestion {
  id: string;
  targetPeriod: { dayOfWeek: DayOfWeek; startHour: number; endHour: number };
  promoType: PromoType;
  suggestedName: string;
  suggestedDiscount: DiscountConfig;
  estimatedLift: number;
  explanation: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  createdAt: string;
}

export interface OptimisationSuggestion {
  id: string;
  promoId: string;
  promoName: string;
  recommendation: 'increase_discount' | 'decrease_discount' | 'tighten_basket' | 'expand_items' | 'adjust_schedule';
  currentValue: string;
  suggestedValue: string;
  reason: string;
  expectedImpact: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SendTimeSuggestion {
  id: string;
  segment: string;
  promoId: string;
  recommendedDay: DayOfWeek;
  recommendedHour: number;
  backupDay: DayOfWeek;
  backupHour: number;
  channel: 'email' | 'sms' | 'push';
  explanation: string;
  confidence: number;
}

// ============== CART / ORDER ==============

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  appliedPromos: string[];
  appliedGiftCard?: { code: string; amount: number };
  total: number;
  isDelivery: boolean;
}

// ============== DEMO MENU ITEMS ==============

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
}

export interface Category {
  id: string;
  name: string;
}

// ============== CONSTANTS ==============

export const CHANNELS: Channel[] = ['web', 'app', 'qr'];
export const DAYS_OF_WEEK: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const CUSTOMER_ELIGIBILITY: CustomerEligibility[] = ['all', 'new', 'returning', 'vip'];
