import { KitchenState, PacingSuggestion, CourseType, CartItem } from '@/types';

// Default kitchen state (can be modified via admin)
const KITCHEN_STATE_KEY = 'dinescan-kitchen-state';

export function getKitchenState(): KitchenState {
  if (typeof window === 'undefined') {
    return { load: 50, ticketBacklog: 5, averageTicketTime: 15, status: 'normal' };
  }
  
  try {
    const saved = localStorage.getItem(KITCHEN_STATE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  
  return { load: 50, ticketBacklog: 5, averageTicketTime: 15, status: 'normal' };
}

export function setKitchenState(state: KitchenState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KITCHEN_STATE_KEY, JSON.stringify(state));
}

export function getKitchenStatusFromLoad(load: number): KitchenState['status'] {
  if (load <= 25) return 'quiet';
  if (load <= 50) return 'normal';
  if (load <= 75) return 'busy';
  return 'slammed';
}

/**
 * Calculate estimated wait time based on kitchen load
 */
export function getEstimatedWaitTime(courseType: CourseType): { min: number; max: number } {
  const kitchen = getKitchenState();
  const baseTime = { starters: 10, mains: 20, desserts: 8, drinks: 3, sharers: 12 };
  
  const base = baseTime[courseType] || 15;
  const loadMultiplier = 1 + (kitchen.load / 100);
  
  const min = Math.round(base * loadMultiplier);
  const max = Math.round(min * 1.5);
  
  return { min, max };
}

/**
 * Get pacing suggestions based on kitchen load and cart contents
 */
export function getPacingSuggestions(cartItems: CartItem[]): PacingSuggestion[] {
  const kitchen = getKitchenState();
  const suggestions: PacingSuggestion[] = [];
  
  const hasCourses = {
    starters: cartItems.some(i => i.courseType === 'starters'),
    mains: cartItems.some(i => i.courseType === 'mains'),
    desserts: cartItems.some(i => i.courseType === 'desserts'),
    drinks: cartItems.some(i => i.courseType === 'drinks'),
    sharers: cartItems.some(i => i.courseType === 'sharers'),
  };
  
  // Kitchen is busy - suggest staggering
  if (kitchen.status === 'busy' || kitchen.status === 'slammed') {
    if (hasCourses.starters && hasCourses.mains) {
      suggestions.push({
        message: `Kitchen is ${kitchen.status}. We recommend sending starters now and mains in 15-20 mins.`,
        type: 'warning',
        action: { label: 'Send Starters First', courseType: 'starters' },
      });
    }
    
    if (hasCourses.drinks) {
      suggestions.push({
        message: 'Drinks can be served quickly while you wait for food.',
        type: 'info',
        action: { label: 'Send Drinks Now', courseType: 'drinks' },
      });
    }
  }
  
  // Kitchen is quiet - good time to order
  if (kitchen.status === 'quiet') {
    suggestions.push({
      message: 'Great timing! The kitchen is quiet, so your food will arrive quickly.',
      type: 'success',
    });
  }
  
  // Normal load with multi-course meal
  if (kitchen.status === 'normal' && hasCourses.starters && hasCourses.mains) {
    const starterTime = getEstimatedWaitTime('starters');
    suggestions.push({
      message: `Starters: ${starterTime.min}-${starterTime.max} mins. Send all together or stagger courses?`,
      type: 'info',
    });
  }
  
  return suggestions;
}

/**
 * Get recommended send strategy
 */
export function getRecommendedSendStrategy(cartItems: CartItem[]): 'all-now' | 'stagger' | 'drinks-first' {
  const kitchen = getKitchenState();
  
  const hasDrinks = cartItems.some(i => i.courseType === 'drinks');
  const hasMultipleCourses = new Set(cartItems.map(i => i.courseType)).size > 1;
  
  if (kitchen.status === 'slammed') {
    return hasDrinks ? 'drinks-first' : 'stagger';
  }
  
  if (kitchen.status === 'busy' && hasMultipleCourses) {
    return 'stagger';
  }
  
  return 'all-now';
}
