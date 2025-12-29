import { MenuItem, TableSuggestion, Guest, CartItem } from '@/types';
import menuData from '@/data/menu.json';

const allItems = menuData.items as MenuItem[];

interface SuggestionContext {
  guestCount: number;
  cartTotal: number;
  cartItems: CartItem[];
  hasSharers: boolean;
  hasDrinks: boolean;
  hasStarters: boolean;
  hasMains: boolean;
  hasDesserts: boolean;
}

function buildContext(guests: Guest[], cartItems: CartItem[]): SuggestionContext {
  const categories = cartItems.map(item => item.courseType);
  
  return {
    guestCount: guests.length,
    cartTotal: cartItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0),
    cartItems,
    hasSharers: categories.includes('sharers'),
    hasDrinks: categories.includes('drinks'),
    hasStarters: categories.includes('starters'),
    hasMains: categories.includes('mains'),
    hasDesserts: categories.includes('desserts'),
  };
}

/**
 * Get group ordering suggestions based on context
 */
export function getGroupSuggestions(guests: Guest[], cartItems: CartItem[]): TableSuggestion[] {
  const context = buildContext(guests, cartItems);
  const suggestions: TableSuggestion[] = [];
  
  // Suggest sharers for groups of 3+
  if (context.guestCount >= 3 && !context.hasSharers) {
    const mixedPlatter = allItems.find(i => i.id === 'mixed-platter');
    const naanBasket = allItems.find(i => i.id === 'naan-basket');
    
    if (mixedPlatter) {
      suggestions.push({
        id: 'suggest-sharer',
        type: 'sharer',
        title: 'Share a Platter?',
        description: 'Perfect for your group',
        reason: `Great for ${context.guestCount} people — everyone can try a bit of everything`,
        items: [mixedPlatter, naanBasket].filter(Boolean) as MenuItem[],
        triggerCondition: 'group_size_3plus_no_sharer',
      });
    }
  }
  
  // Suggest poppadoms if no sharers and cart has items
  if (cartItems.length > 0 && !context.hasSharers) {
    const poppadoms = allItems.find(i => i.id === 'poppadoms');
    if (poppadoms) {
      suggestions.push({
        id: 'suggest-poppadoms',
        type: 'sharer',
        title: 'Start with Poppadoms?',
        description: 'While you wait for your food',
        reason: 'A classic way to start your meal',
        items: [poppadoms],
        triggerCondition: 'has_cart_no_sharer',
      });
    }
  }
  
  // Suggest drink round for 2+ guests without drinks
  if (context.guestCount >= 2 && !context.hasDrinks && context.hasMains) {
    const mangoLassi = allItems.find(i => i.id === 'mango-lassi');
    const kingfisher = allItems.find(i => i.id === 'kingfisher');
    
    suggestions.push({
      id: 'suggest-drinks',
      type: 'drink-round',
      title: 'Drinks for the Table?',
      description: 'Pair with your meal',
      reason: 'A round of drinks enhances the dining experience',
      items: [mangoLassi, kingfisher].filter(Boolean) as MenuItem[],
      triggerCondition: 'group_no_drinks_has_mains',
    });
  }
  
  // Suggest sides if ordering mains without rice/naan
  if (context.hasMains && !cartItems.some(i => ['pilau-rice', 'garlic-naan'].includes(i.itemId))) {
    const rice = allItems.find(i => i.id === 'pilau-rice');
    const naan = allItems.find(i => i.id === 'garlic-naan');
    
    suggestions.push({
      id: 'suggest-sides',
      type: 'side',
      title: "Don't Forget Sides",
      description: 'Rice and naan to complete your meal',
      reason: 'Most curries are best enjoyed with rice or naan',
      items: [rice, naan].filter(Boolean) as MenuItem[],
      triggerCondition: 'has_mains_no_sides',
    });
  }
  
  // Suggest desserts after mains ordered and cart > £30
  if (context.hasMains && context.cartTotal >= 30 && !context.hasDesserts) {
    const gulab = allItems.find(i => i.id === 'gulab-jamun');
    const kulfi = allItems.find(i => i.id === 'mango-kulfi');
    
    suggestions.push({
      id: 'suggest-dessert',
      type: 'dessert',
      title: 'Save Room for Dessert?',
      description: 'Sweet endings',
      reason: 'Our desserts are the perfect way to finish',
      items: [gulab, kulfi].filter(Boolean) as MenuItem[],
      triggerCondition: 'high_cart_value_no_dessert',
    });
  }
  
  return suggestions.slice(0, 3); // Max 3 suggestions
}

/**
 * Get item-specific upsell suggestions
 */
export function getItemUpsells(item: MenuItem): MenuItem[] {
  const upsells: MenuItem[] = [];
  
  // Main courses -> suggest rice/naan
  if (item.courseType === 'mains') {
    const rice = allItems.find(i => i.id === 'pilau-rice');
    const naan = allItems.find(i => i.id === 'garlic-naan');
    if (rice) upsells.push(rice);
    if (naan) upsells.push(naan);
  }
  
  // Spicy items -> suggest lassi
  if (item.spiceLevel >= 2) {
    const lassi = allItems.find(i => i.id === 'mango-lassi');
    if (lassi) upsells.push(lassi);
  }
  
  // Starters -> suggest matching main
  if (item.courseType === 'starters' && item.id === 'chicken-tikka-starter') {
    const ctm = allItems.find(i => i.id === 'chicken-tikka-masala');
    if (ctm) upsells.push(ctm);
  }
  
  return upsells.slice(0, 2);
}
