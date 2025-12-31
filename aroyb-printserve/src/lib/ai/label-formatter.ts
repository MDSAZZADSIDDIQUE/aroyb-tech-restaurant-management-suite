// AI Label Formatter - Optimizes text for thermal label widths

import type { OrderItem, FormattedLabel } from '@/types';

// Max characters per line for different label sizes
const MAX_LINE_LENGTHS = {
  small: 20,
  medium: 28,
  large: 36,
};

// Abbreviation rules
const abbreviations: Record<string, string> = {
  'Extra': 'X',
  'Without': 'NO',
  'With': 'W/',
  'Please': '',
  'Large': 'LG',
  'Medium': 'MED',
  'Small': 'SM',
  'Sauce': 'SCE',
  'Dressing': 'DRSG',
  'Cheese': 'CHS',
  'Chicken': 'CHKN',
  'Mushroom': 'MUSH',
  'Vegetables': 'VEG',
  'Vegetable': 'VEG',
  'Pepperoni': 'PEPP',
  'Peppercorn': 'PPRCN',
  'Spicy': 'HOT',
  'On the Side': 'OTS',
  'on side': 'OTS',
  'Well Done': 'WD',
  'Medium Rare': 'MR',
  'Medium Well': 'MW',
  'No Pickles': 'NO PKL',
  'No Onion': 'NO ONI',
  'No Onions': 'NO ONI',
  'Gluten Free': 'GF',
  'gluten free': 'GF',
  'Dairy Free': 'DF',
};

// Critical modifier patterns
const criticalPatterns = [
  { pattern: /\bno\s+/i, prefix: 'HOLD: ' },
  { pattern: /\bextra\s+/i, prefix: 'X+ ' },
  { pattern: /\ballerg/i, prefix: '⚠️ ' },
  { pattern: /\bgluten\s*free/i, prefix: 'GF: ' },
  { pattern: /\bdairy\s*free/i, prefix: 'DF: ' },
];

export function abbreviateText(text: string): string {
  let result = text;
  
  Object.entries(abbreviations).forEach(([full, abbr]) => {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    result = result.replace(regex, abbr);
  });
  
  return result.trim();
}

export function formatModifier(modifier: string, maxLength: number = 28): string {
  let result = modifier;
  
  // Apply critical pattern prefixes
  for (const { pattern, prefix } of criticalPatterns) {
    if (pattern.test(result)) {
      // Extract the key part and format
      result = result.replace(pattern, prefix);
      break;
    }
  }
  
  // Abbreviate if too long
  if (result.length > maxLength) {
    result = abbreviateText(result);
  }
  
  // Truncate if still too long
  if (result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + '...';
  }
  
  return result.toUpperCase();
}

export function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    if (currentLine.length + word.length + 1 <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

export function formatItemForLabel(
  item: OrderItem,
  sizePreset: 'small' | 'medium' | 'large' = 'medium'
): FormattedLabel {
  const maxLength = MAX_LINE_LENGTHS[sizePreset];
  
  // Format item name
  let itemName = `${item.quantity}× ${item.name}`;
  if (itemName.length > maxLength) {
    itemName = abbreviateText(itemName);
  }
  if (itemName.length > maxLength) {
    itemName = itemName.substring(0, maxLength - 2) + '..';
  }
  
  // Format modifiers
  const modifiers = item.modifiers.map(m => formatModifier(m, maxLength));
  
  // Generate checklist items
  const checklist: string[] = [];
  if (item.modifiers.some(m => /no\s+/i.test(m))) {
    checklist.push('✓ Check modifications');
  }
  if (item.allergens && item.allergens.length > 0) {
    checklist.push('✓ Allergen verified');
  }
  
  // Determine handling icons
  const handlingIcons: string[] = [];
  if (item.station === 'grill' || item.station === 'fry') {
    handlingIcons.push('🔥 HOT');
  }
  if (item.station === 'bar' || item.name.toLowerCase().includes('salad')) {
    handlingIcons.push('❄️ COLD');
  }
  
  // Allergen warning
  let allergenWarning: string | undefined;
  if (item.allergens && item.allergens.length > 0) {
    const allergenList = item.allergens.slice(0, 3).join(', ');
    allergenWarning = `⚠️ ${allergenList}`;
    if (item.allergens.length > 3) {
      allergenWarning += ` +${item.allergens.length - 3}`;
    }
  }
  
  return {
    orderInfo: '', // To be filled by caller
    itemName,
    modifiers,
    checklist,
    handlingIcons,
    allergenWarning,
  };
}

// Before/After comparison for demo
export interface FormatComparison {
  original: string;
  formatted: string;
  changes: string[];
}

export function compareFormats(modifiers: string[]): FormatComparison[] {
  return modifiers.map(mod => {
    const formatted = formatModifier(mod);
    const changes: string[] = [];
    
    if (formatted !== mod.toUpperCase()) {
      if (formatted.length < mod.length) changes.push('Abbreviated');
      if (criticalPatterns.some(p => p.pattern.test(mod))) changes.push('Highlighted');
    }
    
    return {
      original: mod,
      formatted,
      changes,
    };
  });
}
