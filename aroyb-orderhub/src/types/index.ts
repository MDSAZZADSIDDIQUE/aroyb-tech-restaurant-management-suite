// Core TypeScript types for Aroyb OrderHub

// ============== ENUMS ==============

export type SourceChannel = 'web' | 'app' | 'qr' | 'marketplace';
export type FulfillmentType = 'delivery' | 'collection' | 'dine-in';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type KitchenStation = 'grill' | 'fry' | 'curry' | 'dessert' | 'bar' | 'prep';
export type RefundType = 'full' | 'partial';
export type RefundReason = 'missing_item' | 'wrong_item' | 'late_delivery' | 'quality_issue' | 'customer_request' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type MenuScheduleType = 'breakfast' | 'lunch' | 'dinner' | 'late_night' | 'all_day';

// ============== ORDER TYPES ==============

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  modifiers: OrderModifier[];
  addOns: OrderAddOn[];
  notes?: string;
  station: KitchenStation;
}

export interface OrderModifier {
  id: string;
  name: string;
  price: number;
}

export interface OrderAddOn {
  id: string;
  name: string;
  price: number;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  discount: number;
  total: number;
}

export interface StatusTimelineEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  performedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  sourceChannel: SourceChannel;
  fulfillmentType: FulfillmentType;
  scheduledFor?: string;
  
  // Customer info
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: DeliveryAddress;
  tableNumber?: string;
  
  // Notes
  notes?: string;
  allergenNotes?: string;
  packingNotes?: string;
  
  // Items
  items: OrderItem[];
  totals: OrderTotals;
  
  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentAttempts: number;
  statusTimeline: StatusTimelineEntry[];
  
  // Prep times
  prepTime?: number;
  predictedPrepTime?: number;
  prepTimeExplanation?: string;
  promisedTime?: string;
  
  // Risk
  riskScore?: number;
  riskLevel?: RiskLevel;
  riskReasons?: string[];
  
  // Routing
  stationRouting?: StationRouting[];
  
  // Refunds
  refunds?: Refund[];
}

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  instructions?: string;
  zone?: string;
  distance?: number;
}

export interface StationRouting {
  station: KitchenStation;
  itemCount: number;
  estimatedTime: number;
}

// ============== REFUND TYPES ==============

export interface Refund {
  id: string;
  orderId: string;
  type: RefundType;
  amount: number;
  reasons: RefundReason[];
  affectedItems?: string[];
  internalNote?: string;
  customerMessage?: string;
  createdAt: string;
  approvedBy?: string;
  aiSuggested?: boolean;
}

// ============== MENU TYPES ==============

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  station: KitchenStation;
  complexityScore: number;
  prepTimeBase: number;
  allergens: string[];
  dietaryTags: string[];
  available: boolean;
  paused: boolean;
  pausedUntil?: string;
  schedules: MenuScheduleType[];
  modifierGroups: ModifierGroup[];
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuSchedule {
  id: string;
  type: MenuScheduleType;
  name: string;
  startTime: string;
  endTime: string;
  days: DayOfWeek[];
  active: boolean;
  priceMultiplier?: number;
}

// ============== SETTINGS TYPES ==============

export interface OpeningHours {
  day: DayOfWeek;
  open: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface HolidayOverride {
  id: string;
  date: string;
  name: string;
  closed: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  minDistance: number;
  maxDistance: number;
  fee: number;
  freeDeliveryThreshold?: number;
  minimumOrder: number;
  active: boolean;
}

export interface AutoAcceptRule {
  id: string;
  channel: SourceChannel;
  enabled: boolean;
  conditions: AutoAcceptCondition[];
}

export interface AutoAcceptCondition {
  type: 'kitchen_load' | 'order_value' | 'within_hours' | 'zone';
  operator: 'less_than' | 'greater_than' | 'equals' | 'not_equals';
  value: number | string | boolean;
}

export interface Settings {
  restaurantName: string;
  locationName: string;
  timezone: string;
  currency: string;
  
  openingHours: OpeningHours[];
  holidayOverrides: HolidayOverride[];
  deliveryZones: DeliveryZone[];
  autoAcceptRules: AutoAcceptRule[];
  menuSchedules: MenuSchedule[];
  
  busyMode: boolean;
  busyModeMultiplier: number;
  pausedChannels: SourceChannel[];
  pausedCategories: string[];
  
  defaultPrepTime: number;
  serviceFeePercent: number;
}

// ============== KITCHEN TYPES ==============

export interface KitchenState {
  loadPercent: number;
  backlogCount: number;
  avgTicketMinutes: number;
  stationLoads: Record<KitchenStation, number>;
  activeOrders: number;
  completedToday: number;
}

export interface StationTicket {
  orderId: string;
  orderNumber: string;
  station: KitchenStation;
  items: OrderItem[];
  startedAt?: string;
  estimatedMinutes: number;
  priority: 'normal' | 'rush' | 'scheduled';
}

// ============== AI TYPES ==============

export interface PrepTimePrediction {
  predictedMinutes: number;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  factors: {
    timeBucket: string;
    kitchenLoad: number;
    itemComplexity: number;
    itemCount: number;
  };
}

export interface ThrottleSuggestion {
  id: string;
  type: 'pause_delivery' | 'extend_prep_times' | 'disable_scheduled' | 'pause_channel';
  title: string;
  description: string;
  reason: string;
  suggestedValue?: number | string;
  priority: 'low' | 'medium' | 'high';
  appliedAt?: string;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  reasons: string[];
  recommendedAction?: string;
}

export interface RefundSuggestion {
  type: 'partial_refund' | 'full_refund' | 'voucher' | 'remake' | 'apology';
  amount?: number;
  voucherValue?: number;
  message: string;
  reasoning: string;
}

export interface RoutingSuggestion {
  tickets: StationTicket[];
  explanation: string;
  estimatedTotalTime: number;
}

// ============== DASHBOARD TYPES ==============

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  avgPrepTime: number;
  acceptanceRate: number;
  ordersByChannel: Record<SourceChannel, number>;
  ordersByHour: { hour: number; count: number }[];
  topItems: { name: string; count: number }[];
}

// ============== AUTH TYPES ==============

export interface AuthSession {
  authenticated: boolean;
  loginAt: string;
  expiresAt: string;
}
