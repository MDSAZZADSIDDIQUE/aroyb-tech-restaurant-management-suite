import { MenuItem, MenuCategory } from '@/types';
import menuData from '@/data/menu.json';

export interface SEOSuggestion {
  itemId: string;
  itemName: string;
  title: string;
  description: string;
  keywords: string[];
  approved: boolean;
}

// Templates for generating SEO descriptions
const DESCRIPTION_TEMPLATES = {
  curries: [
    'Savour our {name}, a {origin} dish featuring {protein} in a {sauce_type} sauce with {spice_desc} spices. {dietary_note}',
    'Experience authentic {origin} flavours with our {name}. {protein} cooked to perfection in a {sauce_type} sauce. {dietary_note}',
    'Our signature {name} offers {protein} slow-cooked in aromatic {origin} spices. {allergen_note} {dietary_note}',
  ],
  starters: [
    'Begin your feast with our {name} – crispy, flavourful, and authentically prepared. {dietary_note}',
    'Kick off your meal with {name}, a beloved {origin} appetiser that\'s perfect for sharing. {dietary_note}',
  ],
  grills: [
    'Fresh from our charcoal tandoor: {name}. {protein} marinated for 24 hours in our signature spice blend. {dietary_note}',
    'Our {name} showcases the art of tandoori cooking. Succulent {protein} with smoky, charred perfection. {dietary_note}',
  ],
  biryanis: [
    'Our {name} layers fragrant basmati rice with {protein} and aromatic whole spices. Served with raita. {dietary_note}',
    'A royal feast: {name} featuring tender {protein} in saffron-infused rice. Each grain tells a story. {dietary_note}',
  ],
  sides: [
    'The perfect accompaniment: our {name}. Freshly made to complement any main dish.',
    'Complete your meal with {name} – made fresh daily using traditional recipes.',
  ],
  drinks: [
    'Refresh yourself with our {name} – the perfect partner for spicy cuisine.',
    'Cool down with {name}, crafted to complement your meal.',
  ],
  desserts: [
    'End on a sweet note with {name}, a traditional {origin} dessert that melts in your mouth.',
    'Indulge in our {name} – sweet, rich, and utterly satisfying. {dietary_note}',
  ],
};

const ORIGIN_WORDS = ['Indian', 'South Asian', 'Mughlai', 'Punjabi', 'Kashmiri', 'Bengali', 'Goan'];
const SAUCE_TYPES = ['creamy tomato', 'rich masala', 'tangy yoghurt', 'aromatic coconut', 'fiery chilli'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractProtein(item: MenuItem): string {
  const name = item.name.toLowerCase();
  if (name.includes('chicken')) return 'chicken';
  if (name.includes('lamb')) return 'lamb';
  if (name.includes('prawn') || name.includes('king prawn')) return 'king prawns';
  if (name.includes('paneer')) return 'paneer (cottage cheese)';
  if (name.includes('vegetable') || name.includes('veg')) return 'fresh vegetables';
  if (name.includes('fish')) return 'fresh fish';
  return 'select ingredients';
}

function getSpiceDescription(spiceLevel: number): string {
  const descriptions = [
    'mild, aromatic',
    'gently spiced',
    'medium-heat',
    'warming',
    'fiery hot',
    'intensely spiced',
  ];
  return descriptions[Math.min(spiceLevel, descriptions.length - 1)];
}

function getDietaryNote(item: MenuItem): string {
  const notes: string[] = [];
  
  if (item.dietaryTags.includes('vegan')) {
    notes.push('100% vegan.');
  } else if (item.dietaryTags.includes('vegetarian')) {
    notes.push('Suitable for vegetarians.');
  }
  
  if (item.dietaryTags.includes('halal')) {
    notes.push('Halal certified.');
  }
  
  if (item.dietaryTags.includes('gluten-free-option')) {
    notes.push('Gluten-free option available.');
  }
  
  return notes.join(' ');
}

function getAllergenNote(item: MenuItem): string {
  if (item.allergens.length === 0) return '';
  return `Contains: ${item.allergens.join(', ')}.`;
}

/**
 * Generate an SEO-optimized description for a menu item
 */
export function generateSEODescription(item: MenuItem, category: MenuCategory): string {
  const templates = DESCRIPTION_TEMPLATES[item.categoryId as keyof typeof DESCRIPTION_TEMPLATES] 
    || DESCRIPTION_TEMPLATES.curries;
  
  const template = getRandomItem(templates);
  
  return template
    .replace('{name}', item.name)
    .replace('{origin}', getRandomItem(ORIGIN_WORDS))
    .replace('{protein}', extractProtein(item))
    .replace('{sauce_type}', getRandomItem(SAUCE_TYPES))
    .replace('{spice_desc}', getSpiceDescription(item.spiceLevel))
    .replace('{dietary_note}', getDietaryNote(item))
    .replace('{allergen_note}', getAllergenNote(item))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate meta title for a menu item
 */
export function generateMetaTitle(item: MenuItem): string {
  const dietary = item.dietaryTags.includes('vegan') ? 'Vegan ' : 
                  item.dietaryTags.includes('vegetarian') ? 'Vegetarian ' : '';
  return `${dietary}${item.name} | Order Online | Aroyb Grill & Curry`;
}

/**
 * Generate meta description for a menu item
 */
export function generateMetaDescription(item: MenuItem): string {
  const price = `From £${item.price.toFixed(2)}.`;
  const dietary = getDietaryNote(item);
  const base = item.description.slice(0, 100);
  return `${base}${base.endsWith('.') ? '' : '.'} ${price} ${dietary} Order online for delivery or collection.`.trim();
}

/**
 * Extract SEO keywords from a menu item
 */
export function extractKeywords(item: MenuItem, category: MenuCategory): string[] {
  const keywords: string[] = [
    item.name.toLowerCase(),
    category.name.toLowerCase(),
    'indian food',
    'curry',
    'restaurant',
    'delivery',
    'takeaway',
  ];
  
  if (item.dietaryTags.includes('vegan')) keywords.push('vegan');
  if (item.dietaryTags.includes('vegetarian')) keywords.push('vegetarian');
  if (item.dietaryTags.includes('halal')) keywords.push('halal');
  if (item.dietaryTags.includes('gluten-free-option')) keywords.push('gluten free');
  
  // Add protein keywords
  const protein = extractProtein(item);
  if (protein !== 'select ingredients') {
    keywords.push(protein);
  }
  
  // Deduplicate using Array.from instead of spread (for TS target compatibility)
  return Array.from(new Set(keywords));
}

/**
 * Generate SEO suggestion for a single menu item
 */
export function generateSEOForItem(item: MenuItem): SEOSuggestion {
  const categories = menuData.categories as MenuCategory[];
  const category = categories.find(c => c.id === item.categoryId);
  
  return {
    itemId: item.id,
    itemName: item.name,
    title: generateMetaTitle(item),
    description: generateMetaDescription(item),
    keywords: category ? extractKeywords(item, category) : [item.name.toLowerCase()],
    approved: false,
  };
}

/**
 * Get approved SEO descriptions from localStorage
 */
export function getApprovedSEO(): Record<string, SEOSuggestion> {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem('aroyb-approved-seo');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Approve an SEO suggestion
 */
export function approveSEOSuggestion(itemId: string, suggestion: SEOSuggestion): void {
  if (typeof window === 'undefined') return;
  
  const existing = getApprovedSEO();
  existing[itemId] = { ...suggestion, approved: true };
  localStorage.setItem('aroyb-approved-seo', JSON.stringify(existing));
}

