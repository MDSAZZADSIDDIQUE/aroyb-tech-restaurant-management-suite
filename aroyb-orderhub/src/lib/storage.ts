// localStorage utilities for demo state persistence
import type { Order, Settings, KitchenState, MenuItem } from '@/types';

// Storage keys
const KEYS = {
  ORDERS: 'orderhub_orders',
  SETTINGS: 'orderhub_settings',
  KITCHEN: 'orderhub_kitchen',
  MENU_ITEMS: 'orderhub_menu_items',
} as const;

// Generic storage helpers
function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Orders
export function getStoredOrders(): Order[] | null {
  return getItem<Order[]>(KEYS.ORDERS);
}

export function setStoredOrders(orders: Order[]): void {
  setItem(KEYS.ORDERS, orders);
}

export function updateStoredOrder(orderId: string, updates: Partial<Order>): Order | null {
  const orders = getStoredOrders();
  if (!orders) return null;
  
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;
  
  orders[index] = { ...orders[index], ...updates };
  setStoredOrders(orders);
  return orders[index];
}

export function addStoredOrder(order: Order): void {
  const orders = getStoredOrders() || [];
  orders.unshift(order);
  setStoredOrders(orders);
}

// Settings
export function getStoredSettings(): Settings | null {
  return getItem<Settings>(KEYS.SETTINGS);
}

export function setStoredSettings(settings: Settings): void {
  setItem(KEYS.SETTINGS, settings);
}

// Kitchen state
export function getStoredKitchenState(): KitchenState | null {
  return getItem<KitchenState>(KEYS.KITCHEN);
}

export function setStoredKitchenState(state: KitchenState): void {
  setItem(KEYS.KITCHEN, state);
}

// Menu items
export function getStoredMenuItems(): MenuItem[] | null {
  return getItem<MenuItem[]>(KEYS.MENU_ITEMS);
}

export function setStoredMenuItems(items: MenuItem[]): void {
  setItem(KEYS.MENU_ITEMS, items);
}

// Initialize storage with default data
export async function initializeStorage(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Only initialize if not already set
  if (!getStoredOrders()) {
    const ordersData = await import('@/data/orders.json');
    setStoredOrders(ordersData.default as Order[]);
  }
  
  if (!getStoredSettings()) {
    const settingsData = await import('@/data/settings.json');
    setStoredSettings(settingsData.default as Settings);
  }
  
  if (!getStoredKitchenState()) {
    const kitchenData = await import('@/data/kitchen-state.json');
    setStoredKitchenState(kitchenData.default as KitchenState);
  }
  
  if (!getStoredMenuItems()) {
    const menuData = await import('@/data/menu-items.json');
    setStoredMenuItems(menuData.default as MenuItem[]);
  }
}

// Reset to default data
export async function resetStorage(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(KEYS.ORDERS);
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.removeItem(KEYS.KITCHEN);
  localStorage.removeItem(KEYS.MENU_ITEMS);
  
  await initializeStorage();
}
