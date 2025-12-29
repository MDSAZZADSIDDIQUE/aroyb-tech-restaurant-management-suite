// Order Simulator - generates new orders for demo "live" feel
import type { Order, SourceChannel, FulfillmentType } from '@/types';
import { generateId, generateOrderNumber } from '@/lib/formatting';

const CUSTOMER_NAMES = [
  'Oliver Thompson', 'Charlotte Davies', 'Harry Wilson', 'Amelia Brown',
  'George Taylor', 'Isabella Evans', 'Jack Thomas', 'Sophia Roberts',
  'William Johnson', 'Mia Anderson', 'James White', 'Emily Martin',
  'Leo Garcia', 'Ava Harris', 'Henry Clark', 'Grace Lewis', 'Oscar Walker',
  'Lily Hall', 'Charlie Young', 'Ella King', 'Alfie Wright', 'Poppy Scott',
];

const ADDRESSES = [
  { line1: '15 Camden Road', city: 'London', postcode: 'NW1 9LT', zone: 'Zone A', distance: 0.5 },
  { line1: '42 Primrose Hill', city: 'London', postcode: 'NW3 2HP', zone: 'Zone A', distance: 1.2 },
  { line1: '88 Kentish Town Road', city: 'London', postcode: 'NW5 2TH', zone: 'Zone A', distance: 1.8 },
  { line1: '23 Hampstead High Street', city: 'London', postcode: 'NW3 1PQ', zone: 'Zone B', distance: 2.5 },
  { line1: '67 Highgate Road', city: 'London', postcode: 'N19 5NR', zone: 'Zone B', distance: 3.2 },
  { line1: '101 Holloway Road', city: 'London', postcode: 'N7 8LT', zone: 'Zone B', distance: 3.8 },
];

const SAMPLE_ITEMS = [
  { id: 'menu-curry-01', name: 'Chicken Tikka Masala', price: 12.95, station: 'curry' as const },
  { id: 'menu-curry-02', name: 'Lamb Rogan Josh', price: 14.95, station: 'curry' as const },
  { id: 'menu-curry-04', name: 'Butter Chicken', price: 13.95, station: 'curry' as const },
  { id: 'menu-grill-01', name: 'Lamb Seekh Kebab', price: 8.95, station: 'grill' as const },
  { id: 'menu-starter-01', name: 'Onion Bhaji', price: 4.95, station: 'fry' as const },
  { id: 'menu-starter-03', name: 'Chicken Pakora', price: 5.95, station: 'fry' as const },
  { id: 'menu-side-01', name: 'Garlic Naan', price: 2.95, station: 'grill' as const },
  { id: 'menu-side-02', name: 'Pilau Rice', price: 3.50, station: 'prep' as const },
  { id: 'menu-drink-01', name: 'Mango Lassi', price: 4.50, station: 'bar' as const },
];

const ALLERGEN_NOTES = [
  null, null, null, null, null, // Most orders have no allergen notes
  'NUT ALLERGY - No nuts or nut oils',
  'DAIRY FREE - No cream, butter, or cheese',
  'GLUTEN FREE required',
  'Shellfish allergy - please take care',
];

const CUSTOMER_NOTES = [
  null, null, null, // Most orders have no notes
  'Extra napkins please',
  'Leave at door if no answer',
  'Please ring doorbell',
  'Call when arriving',
  'Extra spicy please!',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  return `+44 7${randomInt(700, 999)} ${randomInt(100, 999)}${randomInt(100, 999)}`;
}

export function generateRandomOrder(): Order {
  const channels: SourceChannel[] = ['web', 'app', 'qr', 'marketplace'];
  const channelWeights = [30, 40, 20, 10]; // Weighted probability
  const totalWeight = channelWeights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  let channelIndex = 0;
  for (let i = 0; i < channelWeights.length; i++) {
    random -= channelWeights[i];
    if (random <= 0) {
      channelIndex = i;
      break;
    }
  }
  const sourceChannel = channels[channelIndex];
  
  // Fulfillment based on channel
  let fulfillmentType: FulfillmentType;
  if (sourceChannel === 'qr') {
    fulfillmentType = 'dine-in';
  } else {
    fulfillmentType = Math.random() > 0.4 ? 'delivery' : 'collection';
  }
  
  // Generate 1-4 items
  const itemCount = randomInt(1, 4);
  const selectedItems = [];
  const usedIndexes = new Set<number>();
  
  for (let i = 0; i < itemCount; i++) {
    let idx;
    do {
      idx = randomInt(0, SAMPLE_ITEMS.length - 1);
    } while (usedIndexes.has(idx) && usedIndexes.size < SAMPLE_ITEMS.length);
    usedIndexes.add(idx);
    
    const item = SAMPLE_ITEMS[idx];
    selectedItems.push({
      id: generateId(),
      menuItemId: item.id,
      name: item.name,
      quantity: randomInt(1, 3),
      price: item.price,
      modifiers: [],
      addOns: [],
      station: item.station,
    });
  }
  
  const subtotal = selectedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const deliveryFee = fulfillmentType === 'delivery' ? (subtotal > 25 ? 0 : 2.99) : 0;
  const tip = Math.random() > 0.5 ? randomInt(1, 5) : 0;
  
  const order: Order = {
    id: generateId(),
    orderNumber: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    sourceChannel,
    fulfillmentType,
    customerName: fulfillmentType === 'dine-in' 
      ? `Table ${randomInt(1, 20)}` 
      : randomItem(CUSTOMER_NAMES),
    customerPhone: fulfillmentType !== 'dine-in' ? generatePhone() : undefined,
    deliveryAddress: fulfillmentType === 'delivery' ? randomItem(ADDRESSES) : undefined,
    tableNumber: fulfillmentType === 'dine-in' ? String(randomInt(1, 20)) : undefined,
    notes: randomItem(CUSTOMER_NOTES) || undefined,
    allergenNotes: randomItem(ALLERGEN_NOTES) || undefined,
    items: selectedItems,
    totals: {
      subtotal,
      deliveryFee,
      serviceFee: 0.50,
      tip,
      discount: 0,
      total: subtotal + deliveryFee + 0.50 + tip,
    },
    status: 'pending',
    paymentStatus: 'paid',
    paymentAttempts: 1,
    statusTimeline: [
      { status: 'pending', timestamp: new Date().toISOString() }
    ],
  };
  
  return order;
}

// Simulator state
let simulatorInterval: NodeJS.Timeout | null = null;
let onNewOrder: ((order: Order) => void) | null = null;

export function startOrderSimulator(callback: (order: Order) => void, intervalMs: number = 30000): void {
  onNewOrder = callback;
  
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
  }
  
  // Random interval between 20-40 seconds
  const scheduleNext = () => {
    const delay = intervalMs + (Math.random() - 0.5) * intervalMs * 0.5;
    simulatorInterval = setTimeout(() => {
      if (onNewOrder) {
        const order = generateRandomOrder();
        onNewOrder(order);
      }
      scheduleNext();
    }, delay);
  };
  
  scheduleNext();
}

export function stopOrderSimulator(): void {
  if (simulatorInterval) {
    clearTimeout(simulatorInterval);
    simulatorInterval = null;
  }
  onNewOrder = null;
}

export function isSimulatorRunning(): boolean {
  return simulatorInterval !== null;
}
