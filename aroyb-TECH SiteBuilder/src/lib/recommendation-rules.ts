import { MenuItem, AddOn } from '@/types';
import menuData from '@/data/menu.json';

interface RecommendationRule {
  trigger: {
    categoryId?: string;
    itemNameContains?: string[];
    anyOf?: string[];
  };
  recommendedItemIds: string[];
  recommendedAddOnNames: string[];
  reason: string;
}

// Rule-based recommendations
const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    trigger: { categoryId: 'curries' },
    recommendedItemIds: ['pilau-rice', 'garlic-naan', 'plain-naan'],
    recommendedAddOnNames: ['Pilau Rice', 'Garlic Naan', 'Plain Naan'],
    reason: 'Curries are best enjoyed with rice and naan bread',
  },
  {
    trigger: { categoryId: 'biryanis' },
    recommendedItemIds: ['raita'],
    recommendedAddOnNames: ['Raita', 'Extra Raita'],
    reason: 'Raita helps cool down the spices in biryani',
  },
  {
    trigger: { categoryId: 'grills' },
    recommendedItemIds: ['pilau-rice', 'plain-naan', 'raita'],
    recommendedAddOnNames: ['Pilau Rice', 'Mint Chutney'],
    reason: 'Tandoori items pair perfectly with rice and cooling raita',
  },
  {
    trigger: { categoryId: 'starters' },
    recommendedItemIds: ['mango-lassi', 'masala-chai'],
    recommendedAddOnNames: ['Tamarind Chutney', 'Mint Chutney'],
    reason: 'Start your meal with a refreshing drink',
  },
  {
    trigger: { itemNameContains: ['tikka', 'chicken'] },
    recommendedItemIds: ['butter-chicken', 'chicken-tikka-masala'],
    recommendedAddOnNames: ['Garlic Naan'],
    reason: 'If you love chicken, try these popular dishes',
  },
  {
    trigger: { itemNameContains: ['lamb'] },
    recommendedItemIds: ['keema-naan', 'lamb-biryani'],
    recommendedAddOnNames: ['Keema Naan'],
    reason: 'Lamb lovers also enjoy these dishes',
  },
  {
    trigger: { itemNameContains: ['spicy', 'hot', 'vindaloo', 'jalfrezi'] },
    recommendedItemIds: ['mango-lassi', 'raita'],
    recommendedAddOnNames: ['Raita'],
    reason: 'Dairy helps cool down spicy dishes',
  },
  {
    trigger: { categoryId: 'desserts' },
    recommendedItemIds: ['masala-chai'],
    recommendedAddOnNames: [],
    reason: 'End your meal with traditional masala chai',
  },
];

/**
 * Get recommended add-ons for a menu item
 */
export function getRecommendedAddOns(
  item: MenuItem,
  allItems: MenuItem[]
): Array<{ item: MenuItem | AddOn; reason: string; type: 'item' | 'addon' }> {
  const recommendations: Array<{ item: MenuItem | AddOn; reason: string; type: 'item' | 'addon' }> = [];
  const addedIds = new Set<string>();

  for (const rule of RECOMMENDATION_RULES) {
    let matches = false;

    // Check category match
    if (rule.trigger.categoryId && item.categoryId === rule.trigger.categoryId) {
      matches = true;
    }

    // Check item name contains
    if (rule.trigger.itemNameContains) {
      const lowerName = item.name.toLowerCase();
      if (rule.trigger.itemNameContains.some(kw => lowerName.includes(kw.toLowerCase()))) {
        matches = true;
      }
    }

    if (matches) {
      // Add recommended menu items
      for (const itemId of rule.recommendedItemIds) {
        if (!addedIds.has(itemId) && itemId !== item.id) {
          const recItem = allItems.find(i => i.id === itemId);
          if (recItem && recItem.available) {
            recommendations.push({ item: recItem, reason: rule.reason, type: 'item' });
            addedIds.add(itemId);
          }
        }
      }

      // Add matching add-ons from the item's own add-ons
      for (const addOnName of rule.recommendedAddOnNames) {
        const matchingAddOn = item.addOns.find(
          ao => ao.name.toLowerCase().includes(addOnName.toLowerCase())
        );
        if (matchingAddOn && !addedIds.has(matchingAddOn.id)) {
          recommendations.push({ item: matchingAddOn, reason: rule.reason, type: 'addon' });
          addedIds.add(matchingAddOn.id);
        }
      }
    }
  }

  // Limit to top 4 recommendations
  return recommendations.slice(0, 4);
}

/**
 * Get upsell items for the cart
 */
export function getCartUpsells(
  cartItemIds: string[],
  allItems: MenuItem[]
): Array<{ item: MenuItem; reason: string }> {
  const upsells: Array<{ item: MenuItem; reason: string }> = [];
  const addedIds = new Set(cartItemIds);

  // Check if cart has curries but no rice/naan
  const hasCurry = cartItemIds.some(id => {
    const item = allItems.find(i => i.id === id);
    return item?.categoryId === 'curries';
  });

  const hasRice = cartItemIds.includes('pilau-rice');
  const hasNaan = cartItemIds.some(id => id.includes('naan'));

  if (hasCurry && !hasRice) {
    const rice = allItems.find(i => i.id === 'pilau-rice');
    if (rice) {
      upsells.push({ item: rice, reason: 'Complete your curry with fragrant pilau rice' });
      addedIds.add('pilau-rice');
    }
  }

  if (hasCurry && !hasNaan) {
    const naan = allItems.find(i => i.id === 'garlic-naan');
    if (naan) {
      upsells.push({ item: naan, reason: 'Add our popular garlic naan to your order' });
      addedIds.add('garlic-naan');
    }
  }

  // Suggest drinks if none in cart
  const hasDrink = cartItemIds.some(id => {
    const item = allItems.find(i => i.id === id);
    return item?.categoryId === 'drinks';
  });

  if (!hasDrink && cartItemIds.length > 0) {
    const lassi = allItems.find(i => i.id === 'mango-lassi');
    if (lassi && !addedIds.has('mango-lassi')) {
      upsells.push({ item: lassi, reason: 'Cool down with a refreshing mango lassi' });
    }
  }

  // Suggest dessert if substantial order
  if (cartItemIds.length >= 2) {
    const hasDessert = cartItemIds.some(id => {
      const item = allItems.find(i => i.id === id);
      return item?.categoryId === 'desserts';
    });

    if (!hasDessert) {
      const gulab = allItems.find(i => i.id === 'gulab-jamun');
      if (gulab && !addedIds.has('gulab-jamun')) {
        upsells.push({ item: gulab, reason: 'End your meal with our signature gulab jamun' });
      }
    }
  }

  return upsells.slice(0, 3);
}

/**
 * Get items frequently ordered together
 */
export function getFrequentlyOrderedTogether(
  itemId: string,
  allItems: MenuItem[]
): MenuItem[] {
  // Simulated "frequently ordered together" based on logical pairings
  const pairings: Record<string, string[]> = {
    'chicken-tikka-masala': ['pilau-rice', 'garlic-naan', 'mango-lassi'],
    'lamb-rogan-josh': ['pilau-rice', 'peshwari-naan', 'raita'],
    'butter-chicken': ['pilau-rice', 'garlic-naan', 'onion-bhaji'],
    'chicken-biryani': ['raita', 'chicken-tikka-starter', 'mango-lassi'],
    'mixed-grill': ['pilau-rice', 'plain-naan', 'raita'],
    'vegetable-korma': ['pilau-rice', 'plain-naan', 'samosa-veg'],
  };

  const pairedIds = pairings[itemId] || [];
  return pairedIds
    .map(id => allItems.find(i => i.id === id))
    .filter((item): item is MenuItem => item !== undefined && item.available);
}
