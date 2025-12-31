// Promo Engine - Apply promos, calculate discounts, check eligibility

import type { Promo, Cart, CartItem, DiscountConfig, BogofDefinition, BundleDefinition, DayOfWeek } from '@/types';

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
};

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isPromoActive(promo: Promo, dateTime: Date = new Date()): boolean {
  if (promo.status !== 'active') return false;
  
  if (promo.schedule) {
    const day = DAY_MAP[dateTime.getDay()];
    if (promo.schedule.daysOfWeek && !promo.schedule.daysOfWeek.includes(day)) return false;
    
    if (promo.schedule.startTime && promo.schedule.endTime) {
      const now = dateTime.getHours() * 60 + dateTime.getMinutes();
      const start = parseTime(promo.schedule.startTime);
      const end = parseTime(promo.schedule.endTime);
      if (now < start || now > end) return false;
    }
    
    if (promo.schedule.startDate) {
      const startDate = new Date(promo.schedule.startDate);
      if (dateTime < startDate) return false;
    }
    
    if (promo.schedule.endDate) {
      const endDate = new Date(promo.schedule.endDate);
      if (dateTime > endDate) return false;
    }
  }
  
  return true;
}

function isBasketEligible(promo: Promo, cart: Cart): boolean {
  if (promo.minBasket && cart.subtotal < promo.minBasket) return false;
  
  if (promo.eligibleCategoryIds && promo.eligibleCategoryIds.length > 0) {
    const hasEligible = cart.items.some(item => promo.eligibleCategoryIds!.includes(item.categoryId));
    if (!hasEligible) return false;
  }
  
  if (promo.eligibleItemIds && promo.eligibleItemIds.length > 0) {
    const hasEligible = cart.items.some(item => promo.eligibleItemIds!.includes(item.id));
    if (!hasEligible) return false;
  }
  
  return true;
}

export function calculateDiscountAmount(discount: DiscountConfig, cart: Cart): number {
  switch (discount.type) {
    case 'percentage':
      const percentDiscount = cart.subtotal * (discount.value / 100);
      return discount.maxDiscount ? Math.min(percentDiscount, discount.maxDiscount) : percentDiscount;
    case 'fixed':
      return Math.min(discount.value, cart.subtotal);
    case 'free_delivery':
      return cart.deliveryFee;
    case 'free_item':
      const freeItem = cart.items.find(i => i.id === discount.freeItemId);
      return freeItem ? freeItem.price : 0;
    default:
      return 0;
  }
}

export function calculateBogofDiscount(bogof: BogofDefinition, cart: Cart): number {
  let eligibleItems: CartItem[] = [];
  
  if (bogof.applicableItems === 'category' && bogof.categoryId) {
    eligibleItems = cart.items.filter(i => i.categoryId === bogof.categoryId);
  } else if (bogof.applicableItems === 'selected' && bogof.selectedItemIds) {
    eligibleItems = cart.items.filter(i => bogof.selectedItemIds!.includes(i.id));
  } else if (bogof.applicableItems === 'same') {
    // Group by item ID and find items with quantity >= buyQuantity + getQuantity
    const groups = new Map<string, CartItem[]>();
    cart.items.forEach(item => {
      const existing = groups.get(item.id) || [];
      existing.push(item);
      groups.set(item.id, existing);
    });
    eligibleItems = Array.from(groups.values())
      .filter(group => group.reduce((sum, i) => sum + i.quantity, 0) >= bogof.buyQuantity + bogof.getQuantity)
      .flat();
  }
  
  const totalQty = eligibleItems.reduce((sum, i) => sum + i.quantity, 0);
  if (totalQty < bogof.buyQuantity + bogof.getQuantity) return 0;
  
  const freeCount = Math.floor(totalQty / (bogof.buyQuantity + bogof.getQuantity)) * bogof.getQuantity;
  
  if (bogof.lowestPricedFree) {
    const sortedByPrice = [...eligibleItems].sort((a, b) => a.price - b.price);
    let remaining = freeCount;
    let discount = 0;
    for (const item of sortedByPrice) {
      const take = Math.min(remaining, item.quantity);
      discount += take * item.price;
      remaining -= take;
      if (remaining <= 0) break;
    }
    return discount;
  }
  
  return freeCount * (eligibleItems[0]?.price || 0);
}

export function canApplyPromo(promo: Promo, cart: Cart, isDelivery: boolean = true): { valid: boolean; reason?: string } {
  if (!isPromoActive(promo)) {
    return { valid: false, reason: 'Promo not currently active' };
  }
  
  if (!isBasketEligible(promo, cart)) {
    if (promo.minBasket && cart.subtotal < promo.minBasket) {
      return { valid: false, reason: `Minimum basket £${promo.minBasket} required` };
    }
    return { valid: false, reason: 'Basket does not contain eligible items' };
  }
  
  if (promo.type === 'free_delivery' && !isDelivery) {
    return { valid: false, reason: 'Free delivery only applies to delivery orders' };
  }
  
  if (promo.freeDeliveryThreshold && cart.subtotal < promo.freeDeliveryThreshold) {
    return { valid: false, reason: `Spend £${promo.freeDeliveryThreshold}+ for free delivery` };
  }
  
  return { valid: true };
}

export function applyPromo(promo: Promo, cart: Cart): number {
  const { valid } = canApplyPromo(promo, cart, cart.isDelivery);
  if (!valid) return 0;
  
  switch (promo.type) {
    case 'discount_code':
      return promo.discount ? calculateDiscountAmount(promo.discount, cart) : 0;
    case 'bogof':
      return promo.bogofDefinition ? calculateBogofDiscount(promo.bogofDefinition, cart) : 0;
    case 'bundle':
      // Bundle discount is difference between items price and bundle price
      if (promo.bundleDefinition) {
        const itemsTotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        return Math.max(0, itemsTotal - promo.bundleDefinition.fixedPrice);
      }
      return 0;
    case 'free_delivery':
      return cart.isDelivery ? cart.deliveryFee : 0;
    default:
      return 0;
  }
}

export function getActivePromos(promos: Promo[], dateTime: Date = new Date()): Promo[] {
  return promos.filter(p => isPromoActive(p, dateTime)).sort((a, b) => b.priority - a.priority);
}

export function resolveConflicts(promos: Promo[], cart: Cart): Promo[] {
  // Return promos that can apply, sorted by priority
  // Non-stackable promos: only highest priority applies
  // Stackable promos can all apply together
  
  const applicable = promos.filter(p => canApplyPromo(p, cart, cart.isDelivery).valid);
  const stackable = applicable.filter(p => p.stackable);
  const nonStackable = applicable.filter(p => !p.stackable);
  
  const result: Promo[] = [...stackable];
  if (nonStackable.length > 0) {
    // Add highest priority non-stackable
    result.push(nonStackable.sort((a, b) => b.priority - a.priority)[0]);
  }
  
  return result;
}
