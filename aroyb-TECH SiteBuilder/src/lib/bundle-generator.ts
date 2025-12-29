import { MenuItem, Offer } from '@/types';

interface BundleSuggestion {
  id: string;
  title: string;
  description: string;
  items: Array<{ itemId: string; quantity: number; name: string }>;
  originalPrice: number;
  suggestedPrice: number;
  discount: string;
  discountPercent: number;
  rationale: string;
  tags: string[];
}

// Bundle templates for different occasions/themes
const BUNDLE_TEMPLATES = [
  {
    name: 'Family Feast',
    description: 'Perfect for family dinners of 4',
    structure: [
      { category: 'starters', count: 2 },
      { category: 'curries', count: 2 },
      { category: 'sides', count: 2, filter: (item: MenuItem) => item.id.includes('rice') },
      { category: 'sides', count: 2, filter: (item: MenuItem) => item.id.includes('naan') },
    ],
    discountPercent: 15,
    tags: ['family', 'popular', 'best-value'],
  },
  {
    name: 'Couples Night',
    description: 'Romantic dinner for two',
    structure: [
      { category: 'starters', count: 1 },
      { category: 'curries', count: 2 },
      { category: 'sides', count: 1, filter: (item: MenuItem) => item.id.includes('rice') },
      { category: 'sides', count: 1, filter: (item: MenuItem) => item.id.includes('naan') },
      { category: 'desserts', count: 1 },
    ],
    discountPercent: 12,
    tags: ['couples', 'romantic', 'date-night'],
  },
  {
    name: 'Veggie Delight',
    description: 'Vegetarian feast for the whole table',
    structure: [
      { category: 'starters', count: 2, filter: (item: MenuItem) => item.dietaryTags.includes('vegetarian') },
      { category: 'curries', count: 2, filter: (item: MenuItem) => item.dietaryTags.includes('vegetarian') },
      { category: 'sides', count: 2 },
    ],
    discountPercent: 10,
    tags: ['vegetarian', 'healthy'],
  },
  {
    name: 'Grill Master',
    description: 'For meat lovers who enjoy the tandoor',
    structure: [
      { category: 'grills', count: 2 },
      { category: 'sides', count: 2 },
      { category: 'drinks', count: 2 },
    ],
    discountPercent: 10,
    tags: ['grill', 'meat', 'tandoori'],
  },
  {
    name: 'Lunch Express',
    description: 'Quick and satisfying midday meal',
    structure: [
      { category: 'curries', count: 1 },
      { category: 'sides', count: 1, filter: (item: MenuItem) => item.id.includes('rice') },
      { category: 'drinks', count: 1 },
    ],
    discountPercent: 15,
    tags: ['lunch', 'quick', 'value'],
  },
  {
    name: 'Biryani Feast',
    description: 'The ultimate biryani experience',
    structure: [
      { category: 'starters', count: 1 },
      { category: 'biryanis', count: 2 },
      { category: 'sides', count: 1, filter: (item: MenuItem) => item.id === 'raita' },
    ],
    discountPercent: 12,
    tags: ['biryani', 'rice', 'feast'],
  },
];

/**
 * Generate bundle suggestions from menu items
 */
export function generateBundleSuggestions(menuItems: MenuItem[]): BundleSuggestion[] {
  const suggestions: BundleSuggestion[] = [];
  const popularItems = menuItems.filter(item => item.popular && item.available);

  for (const template of BUNDLE_TEMPLATES) {
    const bundleItems: Array<{ itemId: string; quantity: number; name: string }> = [];
    let totalPrice = 0;
    let isComplete = true;

    for (const requirement of template.structure) {
      let candidates = menuItems.filter(item => 
        item.categoryId === requirement.category && 
        item.available &&
        !bundleItems.some(bi => bi.itemId === item.id)
      );

      if (requirement.filter) {
        candidates = candidates.filter(requirement.filter);
      }

      // Prefer popular items
      candidates.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));

      if (candidates.length < requirement.count) {
        isComplete = false;
        break;
      }

      for (let i = 0; i < requirement.count; i++) {
        const item = candidates[i];
        bundleItems.push({ itemId: item.id, quantity: 1, name: item.name });
        totalPrice += item.price;
      }
    }

    if (isComplete && bundleItems.length > 0) {
      const discountedPrice = totalPrice * (1 - template.discountPercent / 100);
      const savings = totalPrice - discountedPrice;

      suggestions.push({
        id: `bundle-${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        title: template.name,
        description: template.description,
        items: bundleItems,
        originalPrice: Math.round(totalPrice * 100) / 100,
        suggestedPrice: Math.round(discountedPrice * 100) / 100,
        discount: `Save £${savings.toFixed(2)}`,
        discountPercent: template.discountPercent,
        rationale: `This bundle combines popular ${bundleItems.slice(0, 2).map(i => i.name).join(' and ')} with complementary sides for a ${template.discountPercent}% discount.`,
        tags: template.tags,
      });
    }
  }

  return suggestions;
}

/**
 * Convert a bundle suggestion to an offer
 */
export function bundleSuggestionToOffer(suggestion: BundleSuggestion): Offer {
  return {
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    items: suggestion.items.map(item => ({ itemId: item.itemId, quantity: item.quantity })),
    originalPrice: suggestion.originalPrice,
    price: suggestion.suggestedPrice,
    discount: suggestion.discount,
    enabled: true,
    tags: suggestion.tags,
    type: 'bundle',
  };
}

/**
 * Get approved bundles from localStorage
 */
export function getApprovedBundles(): Offer[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('aroyb-approved-bundles');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Save approved bundle to localStorage
 */
export function approveBundle(offer: Offer): void {
  if (typeof window === 'undefined') return;
  
  const existing = getApprovedBundles();
  const updated = [...existing.filter(o => o.id !== offer.id), offer];
  localStorage.setItem('aroyb-approved-bundles', JSON.stringify(updated));
}

/**
 * Remove a bundle from approved list
 */
export function removeApprovedBundle(offerId: string): void {
  if (typeof window === 'undefined') return;
  
  const existing = getApprovedBundles();
  const updated = existing.filter(o => o.id !== offerId);
  localStorage.setItem('aroyb-approved-bundles', JSON.stringify(updated));
}
