'use client';

import { TableSession, Guest, CartItem, GuestCart } from '@/types';

const SESSION_KEY = 'dinescan-session';
const CART_KEY = 'dinescan-cart';

// Generate unique IDs
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

// ===== SESSION MANAGEMENT =====

export function getSession(): TableSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: TableSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CART_KEY);
}

export function createSession(locationId: string, tableId: string): TableSession {
  const session: TableSession = {
    sessionId: generateId('sess-'),
    locationId,
    tableId,
    guests: [],
    createdAt: new Date().toISOString(),
    status: 'active',
  };
  saveSession(session);
  return session;
}

export function resumeOrCreateSession(locationId: string, tableId: string): TableSession {
  const existing = getSession();
  
  // Check if session matches current table
  if (existing && existing.locationId === locationId && existing.tableId === tableId) {
    return existing;
  }
  
  // Create new session
  return createSession(locationId, tableId);
}

export function addGuestToSession(displayName: string, isHost: boolean = false): Guest {
  const session = getSession();
  if (!session) throw new Error('No active session');
  
  const guest: Guest = {
    guestId: generateId('guest-'),
    displayName,
    joinedAt: new Date().toISOString(),
    isHost,
  };
  
  session.guests.push(guest);
  saveSession(session);
  
  return guest;
}

export function getSessionGuests(): Guest[] {
  const session = getSession();
  return session?.guests || [];
}

export function updateSessionStatus(status: TableSession['status']): void {
  const session = getSession();
  if (session) {
    session.status = status;
    saveSession(session);
  }
}

// ===== CURRENT GUEST =====

const CURRENT_GUEST_KEY = 'dinescan-current-guest';

export function getCurrentGuest(): Guest | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem(CURRENT_GUEST_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function setCurrentGuest(guest: Guest): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_GUEST_KEY, JSON.stringify(guest));
}

export function clearCurrentGuest(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_GUEST_KEY);
}

// ===== CART MANAGEMENT =====

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
}

export function removeFromCart(itemId: string): void {
  const cart = getCart();
  const filtered = cart.filter(i => i.id !== itemId);
  saveCart(filtered);
}

export function updateCartItemQuantity(itemId: string, quantity: number): void {
  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
}

export function getGuestCart(guestId: string): CartItem[] {
  const cart = getCart();
  return cart.filter(item => item.guestId === guestId);
}

export function getAllGuestCarts(): GuestCart[] {
  const session = getSession();
  const cart = getCart();
  
  if (!session) return [];
  
  return session.guests.map(guest => ({
    guestId: guest.guestId,
    guestName: guest.displayName,
    items: cart.filter(item => item.guestId === guest.guestId),
  }));
}

export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((total, item) => {
    let itemTotal = item.basePrice * item.quantity;
    
    // Add modifier adjustments
    item.modifiers.forEach(mod => {
      mod.options.forEach(opt => {
        itemTotal += opt.priceAdjustment * item.quantity;
      });
    });
    
    // Add add-ons
    item.addOns.forEach(addon => {
      itemTotal += addon.price * addon.quantity * item.quantity;
    });
    
    return total + itemTotal;
  }, 0);
}

export function getCartItemCount(): number {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// ===== ORDERS =====

const ORDERS_KEY = 'dinescan-orders';

export function getOrders(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: any): void {
  const orders = getOrders();
  orders.push(order);
  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
}

export function getSessionOrders(sessionId: string): any[] {
  return getOrders().filter(o => o.sessionId === sessionId);
}

// ===== SERVICE REQUESTS =====

const SERVICE_REQUESTS_KEY = 'dinescan-service-requests';

export function getServiceRequests(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(SERVICE_REQUESTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveServiceRequest(request: any): void {
  const requests = getServiceRequests();
  requests.push(request);
  if (typeof window !== 'undefined') {
    localStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));
  }
}
