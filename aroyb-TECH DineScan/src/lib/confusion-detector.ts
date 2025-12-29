import { ConfusionSignal, ConfusionHelper } from '@/types';

const SIGNALS_KEY = 'dinescan-confusion-signals';

/**
 * Track a confusion signal
 */
export function trackSignal(type: ConfusionSignal['type']): void {
  if (typeof window === 'undefined') return;
  
  const signals = getSignals();
  const existing = signals.find(s => s.type === type);
  
  if (existing) {
    existing.count++;
    existing.timestamp = Date.now();
  } else {
    signals.push({ type, count: 1, timestamp: Date.now() });
  }
  
  localStorage.setItem(SIGNALS_KEY, JSON.stringify(signals));
}

export function getSignals(): ConfusionSignal[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(SIGNALS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function clearSignals(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SIGNALS_KEY);
}

/**
 * Check if user needs help based on signals
 */
export function checkForConfusion(): ConfusionHelper | null {
  const signals = getSignals();
  const now = Date.now();
  const recentSignals = signals.filter(s => now - s.timestamp < 60000); // Last minute
  
  // Multiple cart edits
  const cartEdits = recentSignals.find(s => s.type === 'cart_edits');
  if (cartEdits && cartEdits.count >= 3) {
    return {
      id: 'cart-help',
      message: "Having trouble deciding? Let us help!",
      actions: [
        { label: 'Show Popular Items', action: 'show-popular' },
        { label: 'Split Between Guests', action: 'split-items' },
      ],
    };
  }
  
  // Long time on modal
  const modalAbandon = recentSignals.find(s => s.type === 'modal_abandon');
  if (modalAbandon && modalAbandon.count >= 2) {
    return {
      id: 'modal-help',
      message: "Need help with your selection?",
      actions: [
        { label: 'Explain Spice Levels', action: 'explain-spice' },
        { label: 'View Allergen Info', action: 'show-allergens' },
      ],
    };
  }
  
  // Back and forth
  const backForth = recentSignals.find(s => s.type === 'back_forth');
  if (backForth && backForth.count >= 4) {
    return {
      id: 'browse-help',
      message: "Looking for something specific?",
      actions: [
        { label: 'Filter by Diet', action: 'filter-diet' },
        { label: 'Ask Staff', action: 'call-waiter' },
      ],
    };
  }
  
  // Checkout abandon
  const checkoutAbandon = recentSignals.find(s => s.type === 'checkout_abandon');
  if (checkoutAbandon && checkoutAbandon.count >= 2) {
    return {
      id: 'checkout-help',
      message: "Ready to order? We're here if you need anything.",
      actions: [
        { label: 'Review Order', action: 'go-cart' },
        { label: 'Need More Time', action: 'dismiss' },
      ],
    };
  }
  
  return null;
}

/**
 * Get helpful tips based on context
 */
export function getContextualTip(context: 'item-modal' | 'cart' | 'checkout'): string | null {
  const tips: Record<string, string[]> = {
    'item-modal': [
      '💡 Tip: Most dishes come with rice or naan — order separately',
      '💡 Tip: Mild is flavorful, Medium has a kick, Hot is for spice lovers',
      '💡 Tip: Tap allergens to see full details',
    ],
    'cart': [
      '💡 Tip: You can tag items by course for staggered serving',
      '💡 Tip: Add special instructions for any dietary needs',
    ],
    'checkout': [
      '💡 Tip: Send starters first if the kitchen is busy',
      '💡 Tip: Split the bill by guest at payment',
    ],
  };
  
  const contextTips = tips[context] || [];
  if (contextTips.length === 0) return null;
  
  return contextTips[Math.floor(Math.random() * contextTips.length)];
}
