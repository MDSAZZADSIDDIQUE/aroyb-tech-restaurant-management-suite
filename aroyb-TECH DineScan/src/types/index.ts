// ===== LOCATION & TABLE =====

export interface Location {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  hours: OpeningHours[];
  serviceCharge: ServiceChargeConfig;
  featureToggles: FeatureToggles;
  tables: Table[];
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface ServiceChargeConfig {
  enabled: boolean;
  type: 'percentage' | 'fixed';
  value: number; // percentage (e.g., 12.5) or fixed amount (e.g., 2.50)
}

export interface FeatureToggles {
  payAtTable: boolean;
  callWaiter: boolean;
  requestBill: boolean;
  coursePacing: boolean;
}

export interface Table {
  id: string;
  number: number;
  name: string;
  seats: number;
}

// ===== MENU =====

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  courseType?: CourseType;
}

export type CourseType = 'starters' | 'mains' | 'desserts' | 'drinks' | 'sharers';

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  available: boolean;
  popular?: boolean;
  newItem?: boolean;
  spiceLevel: number;
  allergens: string[];
  dietaryTags: string[];
  courseType: CourseType;
  modifiers: ModifierGroup[];
  addOns: AddOn[];
  servesCount?: string; // e.g., "Serves 2-3"
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  maxSelect?: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
  default?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

// ===== SESSION & GUEST =====

export interface TableSession {
  sessionId: string;
  locationId: string;
  tableId: string;
  guests: Guest[];
  createdAt: string;
  status: 'active' | 'ordering' | 'served' | 'paying' | 'closed';
}

export interface Guest {
  guestId: string;
  displayName: string;
  joinedAt: string;
  isHost: boolean;
}

// ===== CART =====

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: SelectedModifier[];
  addOns: SelectedAddOn[];
  specialInstructions?: string;
  courseType: CourseType;
  guestId: string;
  image?: string;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  options: { id: string; name: string; priceAdjustment: number }[];
}

export interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface GuestCart {
  guestId: string;
  guestName: string;
  items: CartItem[];
}

// ===== ORDER =====

export type OrderStatus = 
  | 'placed' 
  | 'accepted' 
  | 'in-kitchen' 
  | 'ready' 
  | 'served'
  | 'cancelled';

export interface Order {
  orderId: string;
  sessionId: string;
  locationId: string;
  tableId: string;
  items: CartItem[];
  status: OrderStatus;
  coursesFired: CourseType[];
  coursesWaiting: CourseType[];
  subtotal: number;
  serviceCharge: number;
  total: number;
  paymentStatus: 'unpaid' | 'paid' | 'pay-later';
  paymentMethod?: 'card' | 'cash' | 'apple-pay' | 'google-pay';
  createdAt: string;
  timestamps: OrderTimestamp[];
  guestId?: string; // optional, for per-guest orders
}

export interface OrderTimestamp {
  status: OrderStatus;
  time: string;
}

// ===== SERVICE REQUEST =====

export type ServiceRequestType = 'call_waiter' | 'request_bill';
export type ServiceRequestStatus = 'pending' | 'acknowledged' | 'completed';

export interface ServiceRequest {
  id: string;
  type: ServiceRequestType;
  sessionId: string;
  tableId: string;
  tableName: string;
  locationId: string;
  guestName?: string;
  message?: string;
  status: ServiceRequestStatus;
  createdAt: string;
  acknowledgedAt?: string;
  completedAt?: string;
}

// ===== AI FEATURES =====

export interface TableSuggestion {
  id: string;
  type: 'sharer' | 'drink-round' | 'side' | 'dessert';
  title: string;
  description: string;
  reason: string;
  items: MenuItem[];
  triggerCondition: string;
}

export interface PacingSuggestion {
  message: string;
  type: 'info' | 'warning' | 'success';
  action?: {
    label: string;
    courseType: CourseType;
  };
}

export interface ConfusionSignal {
  type: 'cart_edits' | 'modal_abandon' | 'back_forth' | 'checkout_abandon';
  count: number;
  timestamp: number;
}

export interface ConfusionHelper {
  id: string;
  message: string;
  actions: { label: string; action: string }[];
}

// ===== KITCHEN =====

export interface KitchenState {
  load: number; // 0-100
  ticketBacklog: number;
  averageTicketTime: number; // minutes
  status: 'quiet' | 'normal' | 'busy' | 'slammed';
}
