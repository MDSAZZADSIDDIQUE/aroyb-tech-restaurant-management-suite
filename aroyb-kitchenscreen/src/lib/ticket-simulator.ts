// Ticket Simulator - Generates realistic tickets for demo rush mode

import type { Ticket, TicketItem, Channel, FulfillmentType, StationId, Modifier } from '@/types';
import { generateId, generateOrderNumber, demoUsers } from '@/lib/formatting';
import menuItemsData from '@/data/menu-items.json';

interface MenuItem {
  id: string;
  name: string;
  station: StationId;
  baseCookMinutes: number;
}

const menuItems = menuItemsData as MenuItem[];

const channels: Channel[] = ['web', 'app', 'qr', 'pos'];
const fulfillmentTypes: FulfillmentType[] = ['dine-in', 'collection', 'delivery'];
const tableNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

const modifierOptions: Modifier[][] = [
  [{ id: 'm1', name: 'Medium Well', type: 'choice' }],
  [{ id: 'm2', name: 'Extra Spicy', type: 'choice' }],
  [{ id: 'm3', name: 'No Pickles', type: 'hold' }],
  [{ id: 'm4', name: 'No Onion', type: 'hold' }],
  [{ id: 'm5', name: 'Medium Rare', type: 'choice' }],
  [{ id: 'm6', name: 'Well Done', type: 'choice' }],
  [{ id: 'm7', name: 'Extra Cheese', type: 'addon' }],
  [],
  [],
  [],
];

const noteOptions = [
  '',
  '',
  '',
  'no sauce please',
  'extra crispy',
  'gluten free',
  'mild please',
  'extra napkins',
];

const allergenNotes = [
  '',
  '',
  '',
  '',
  '',
  'NUT ALLERGY - Customer allergic to tree nuts',
  'GLUTEN FREE - Celiac disease',
  'DAIRY FREE - Lactose intolerant',
];

const customerNotes = [
  '',
  '',
  '',
  'Please include cutlery',
  'Birthday celebration!',
  'Ring doorbell on arrival',
  'Extra napkins please',
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateTicket(): Ticket {
  const now = new Date();
  const channel = randomChoice(channels);
  const fulfillmentType = randomChoice(fulfillmentTypes);
  
  // Generate items (1-5)
  const itemCount = randomInt(1, 4);
  const items: TicketItem[] = [];
  const stationAssignments = new Set<StationId>();
  
  for (let i = 0; i < itemCount; i++) {
    const menuItem = randomChoice(menuItems);
    stationAssignments.add(menuItem.station);
    
    items.push({
      id: generateId('i'),
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: randomInt(1, 3),
      station: menuItem.station,
      modifiers: randomChoice(modifierOptions),
      addOns: [],
      notes: randomChoice(noteOptions),
    });
  }
  
  // Calculate promised time based on complexity
  const maxCookTime = Math.max(...items.map(item => {
    const menu = menuItems.find(m => m.id === item.menuItemId);
    return menu?.baseCookMinutes || 10;
  }));
  const promisedMinutes = maxCookTime + randomInt(5, 15);
  
  const ticket: Ticket = {
    id: generateId('t'),
    orderNumber: generateOrderNumber(),
    channel,
    fulfillmentType,
    tableNumber: fulfillmentType === 'dine-in' ? randomChoice(tableNumbers) : undefined,
    createdAt: now.toISOString(),
    promisedAt: new Date(now.getTime() + promisedMinutes * 60000).toISOString(),
    status: 'new',
    items,
    stationAssignments: Array.from(stationAssignments),
    timeline: [{
      id: generateId('e'),
      action: 'created',
      timestamp: now.toISOString(),
    }],
    customerNotes: randomChoice(customerNotes) || undefined,
    allergenNotes: randomChoice(allergenNotes) || undefined,
  };
  
  return ticket;
}

// Simulator state
let simulatorInterval: NodeJS.Timeout | null = null;
let simulatorCallback: ((ticket: Ticket) => void) | null = null;

export function startTicketSimulator(
  onNewTicket: (ticket: Ticket) => void,
  intervalMs: number = 20000
): void {
  if (simulatorInterval) {
    stopTicketSimulator();
  }
  
  simulatorCallback = onNewTicket;
  
  // Add some variability to interval (80% to 120% of base)
  const getNextInterval = () => intervalMs * (0.8 + Math.random() * 0.4);
  
  const scheduleNext = () => {
    simulatorInterval = setTimeout(() => {
      if (simulatorCallback) {
        const ticket = generateTicket();
        simulatorCallback(ticket);
      }
      scheduleNext();
    }, getNextInterval());
  };
  
  // Start immediately with first ticket after short delay
  setTimeout(() => {
    if (simulatorCallback) {
      const ticket = generateTicket();
      simulatorCallback(ticket);
    }
    scheduleNext();
  }, 2000);
}

export function stopTicketSimulator(): void {
  if (simulatorInterval) {
    clearTimeout(simulatorInterval);
    simulatorInterval = null;
  }
  simulatorCallback = null;
}

export function isSimulatorRunning(): boolean {
  return simulatorInterval !== null;
}
