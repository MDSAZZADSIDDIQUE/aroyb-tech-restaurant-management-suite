// Location Types
export interface DeliveryZone {
  id: string;
  name: string;
  postcodes: string[];
  fee: number;
  minOrder: number;
  estimatedTime: string;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface Location {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  hours: OpeningHours[];
  deliveryZones: DeliveryZone[];
  minOrder: number;
  prepTimeRange: [number, number]; // minutes
  acceptsDelivery: boolean;
  acceptsCollection: boolean;
  coordinates: { lat: number; lng: number };
}

// Menu Types
export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelect: number;
  minSelect: number;
  options: ModifierOption[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export type AllergenType = 
  | 'gluten' 
  | 'dairy' 
  | 'eggs' 
  | 'fish' 
  | 'shellfish' 
  | 'nuts' 
  | 'peanuts' 
  | 'soya' 
  | 'celery' 
  | 'mustard' 
  | 'sesame' 
  | 'sulphites' 
  | 'lupin' 
  | 'molluscs';

export type DietaryTag = 
  | 'vegetarian' 
  | 'vegan' 
  | 'halal' 
  | 'gluten-free-option' 
  | 'dairy-free' 
  | 'nut-free'
  | 'spicy'
  | 'mild';

export type SpiceLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  allergens: AllergenType[];
  dietaryTags: DietaryTag[];
  spiceLevel: SpiceLevel;
  modifierGroups: ModifierGroup[];
  addOns: AddOn[];
  popular?: boolean;
  newItem?: boolean;
  available: boolean;
  prepTime?: number;
  calories?: number;
  seoDescription?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  itemCount?: number;
}

// Offer/Bundle Types
export interface Offer {
  id: string;
  title: string;
  description: string;
  image?: string;
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
  originalPrice: number;
  price: number;
  discount: string;
  validUntil?: string;
  terms?: string;
  enabled: boolean;
  tags: string[];
  type: 'bundle' | 'discount' | 'free-delivery';
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  date: string;
  time: string;
  endTime?: string;
  image?: string;
  location: string;
  capacity?: number;
  price?: number;
  bookingRequired: boolean;
  tags: string[];
}

// Order Types
export interface CartItemModifier {
  groupId: string;
  groupName: string;
  options: Array<{
    id: string;
    name: string;
    priceDelta: number;
  }>;
}

export interface CartItemAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: CartItemModifier[];
  addOns: CartItemAddOn[];
  specialInstructions?: string;
  image?: string;
}

export type FulfillmentType = 'delivery' | 'collection' | 'scheduled-delivery' | 'scheduled-collection';

export type OrderStatus = 
  | 'placed' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out-for-delivery' 
  | 'delivered' 
  | 'collected'
  | 'cancelled';

export interface OrderTimestamp {
  status: OrderStatus;
  time: string;
  note?: string;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  instructions?: string;
}

export interface Order {
  id: string;
  locationId: string;
  status: OrderStatus;
  timestamps: OrderTimestamp[];
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  total: number;
  fulfillmentType: FulfillmentType;
  scheduledTime?: string;
  customer: CustomerDetails;
  deliveryAddress?: DeliveryAddress;
  estimatedDelivery?: string;
  createdAt: string;
}

// FAQ/Chatbot Types
export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
}

// Search Types
export interface SearchIntent {
  keywords: string[];
  dietaryFilters: DietaryTag[];
  allergenExclusions: AllergenType[];
  spicePreference?: 'mild' | 'medium' | 'hot';
  proteinType?: string;
  category?: string;
}

// Context Store Types
export interface CartState {
  items: CartItem[];
  locationId: string | null;
  fulfillmentType: FulfillmentType;
  scheduledTime?: string;
  deliveryZoneId?: string;
  tip: number;
}

export interface LocationState {
  selectedLocationId: string;
  selectedZoneId?: string;
}
