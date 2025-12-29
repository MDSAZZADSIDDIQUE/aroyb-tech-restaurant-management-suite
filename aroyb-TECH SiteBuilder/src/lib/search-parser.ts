import { SearchIntent, DietaryTag, AllergenType, MenuItem } from '@/types';

// Keywords for parsing natural language search queries
const DIETARY_KEYWORDS: Record<string, DietaryTag> = {
  'vegetarian': 'vegetarian',
  'veggie': 'vegetarian',
  'veg': 'vegetarian',
  'vegan': 'vegan',
  'plant-based': 'vegan',
  'plant based': 'vegan',
  'halal': 'halal',
  'gluten-free': 'gluten-free-option',
  'gluten free': 'gluten-free-option',
  'gf': 'gluten-free-option',
  'coeliac': 'gluten-free-option',
  'celiac': 'gluten-free-option',
  'dairy-free': 'dairy-free',
  'dairy free': 'dairy-free',
  'lactose-free': 'dairy-free',
  'lactose free': 'dairy-free',
  'nut-free': 'nut-free',
  'nut free': 'nut-free',
  'mild': 'mild',
  'not spicy': 'mild',
  'spicy': 'spicy',
  'hot': 'spicy',
};

const ALLERGEN_EXCLUSION_KEYWORDS: Record<string, AllergenType> = {
  'no gluten': 'gluten',
  'without gluten': 'gluten',
  'no dairy': 'dairy',
  'without dairy': 'dairy',
  'no milk': 'dairy',
  'no cheese': 'dairy',
  'no eggs': 'eggs',
  'without eggs': 'eggs',
  'no fish': 'fish',
  'without fish': 'fish',
  'no shellfish': 'shellfish',
  'without shellfish': 'shellfish',
  'no prawns': 'shellfish',
  'no nuts': 'nuts',
  'without nuts': 'nuts',
  'no peanuts': 'peanuts',
  'without peanuts': 'peanuts',
  'no soya': 'soya',
  'no soy': 'soya',
  'no sesame': 'sesame',
};

const SPICE_KEYWORDS: Record<string, 'mild' | 'medium' | 'hot'> = {
  'mild': 'mild',
  'not spicy': 'mild',
  'no spice': 'mild',
  'light': 'mild',
  'medium': 'medium',
  'moderate': 'medium',
  'spicy': 'hot',
  'hot': 'hot',
  'extra hot': 'hot',
  'very spicy': 'hot',
  'fiery': 'hot',
};

const PROTEIN_KEYWORDS = [
  'chicken', 'lamb', 'beef', 'prawn', 'prawns', 'fish', 'seafood',
  'paneer', 'vegetable', 'vegetables', 'mixed', 'tikka', 'tandoori',
];

const CATEGORY_KEYWORDS: Record<string, string> = {
  'starter': 'starters',
  'starters': 'starters',
  'appetizer': 'starters',
  'appetizers': 'starters',
  'curry': 'curries',
  'curries': 'curries',
  'main': 'curries',
  'mains': 'curries',
  'grill': 'grills',
  'grills': 'grills',
  'tandoori': 'grills',
  'kebab': 'grills',
  'biryani': 'biryanis',
  'biryanis': 'biryanis',
  'rice': 'biryanis',
  'side': 'sides',
  'sides': 'sides',
  'bread': 'sides',
  'naan': 'sides',
  'drink': 'drinks',
  'drinks': 'drinks',
  'beverage': 'drinks',
  'dessert': 'desserts',
  'desserts': 'desserts',
  'sweet': 'desserts',
  'pudding': 'desserts',
};

/**
 * Parse a natural language search query into structured intent
 */
export function parseSearchQuery(query: string): SearchIntent {
  const lowerQuery = query.toLowerCase().trim();
  const intent: SearchIntent = {
    keywords: [],
    dietaryFilters: [],
    allergenExclusions: [],
  };

  // Extract dietary filters
  for (const [keyword, tag] of Object.entries(DIETARY_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      if (!intent.dietaryFilters.includes(tag)) {
        intent.dietaryFilters.push(tag);
      }
    }
  }

  // Extract allergen exclusions
  for (const [phrase, allergen] of Object.entries(ALLERGEN_EXCLUSION_KEYWORDS)) {
    if (lowerQuery.includes(phrase)) {
      if (!intent.allergenExclusions.includes(allergen)) {
        intent.allergenExclusions.push(allergen);
      }
    }
  }

  // Extract spice preference
  for (const [keyword, level] of Object.entries(SPICE_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      intent.spicePreference = level;
      break;
    }
  }

  // Extract protein type
  for (const protein of PROTEIN_KEYWORDS) {
    if (lowerQuery.includes(protein)) {
      intent.proteinType = protein;
      break;
    }
  }

  // Extract category
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      intent.category = category;
      break;
    }
  }

  // Extract remaining keywords (words not matched to specific filters)
  const words = lowerQuery.split(/\s+/);
  const filterWords = [
    ...Object.keys(DIETARY_KEYWORDS),
    ...Object.keys(ALLERGEN_EXCLUSION_KEYWORDS).flatMap(p => p.split(' ')),
    ...Object.keys(SPICE_KEYWORDS),
    ...PROTEIN_KEYWORDS,
    ...Object.keys(CATEGORY_KEYWORDS),
    'no', 'without', 'free', 'option', 'and', 'or', 'with', 'the', 'a', 'an',
  ];

  intent.keywords = words.filter(word => 
    word.length > 2 && !filterWords.includes(word)
  );

  return intent;
}

/**
 * Filter menu items based on search intent
 */
export function filterMenuItems(items: MenuItem[], intent: SearchIntent): MenuItem[] {
  return items.filter(item => {
    // Check dietary filters
    for (const dietaryTag of intent.dietaryFilters) {
      if (!item.dietaryTags.includes(dietaryTag)) {
        return false;
      }
    }

    // Check allergen exclusions
    for (const allergen of intent.allergenExclusions) {
      if (item.allergens.includes(allergen)) {
        return false;
      }
    }

    // Check spice preference
    if (intent.spicePreference) {
      if (intent.spicePreference === 'mild' && item.spiceLevel > 1) {
        return false;
      }
      if (intent.spicePreference === 'medium' && (item.spiceLevel < 2 || item.spiceLevel > 3)) {
        return false;
      }
      if (intent.spicePreference === 'hot' && item.spiceLevel < 3) {
        return false;
      }
    }

    // Check protein type
    if (intent.proteinType) {
      const itemName = item.name.toLowerCase();
      const itemDesc = item.description.toLowerCase();
      if (!itemName.includes(intent.proteinType) && !itemDesc.includes(intent.proteinType)) {
        return false;
      }
    }

    // Check category
    if (intent.category && item.categoryId !== intent.category) {
      return false;
    }

    // Check remaining keywords (fuzzy match on name and description)
    for (const keyword of intent.keywords) {
      const itemName = item.name.toLowerCase();
      const itemDesc = item.description.toLowerCase();
      if (!itemName.includes(keyword) && !itemDesc.includes(keyword)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get highlighted matches for display
 */
export function getMatchedFilters(intent: SearchIntent): string[] {
  const matches: string[] = [];

  if (intent.dietaryFilters.length > 0) {
    matches.push(...intent.dietaryFilters.map(f => f.replace(/-/g, ' ')));
  }

  if (intent.allergenExclusions.length > 0) {
    matches.push(...intent.allergenExclusions.map(a => `no ${a}`));
  }

  if (intent.spicePreference) {
    matches.push(intent.spicePreference);
  }

  if (intent.proteinType) {
    matches.push(intent.proteinType);
  }

  if (intent.category) {
    matches.push(intent.category);
  }

  return matches;
}
