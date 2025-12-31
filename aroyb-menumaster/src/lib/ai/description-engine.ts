// AI Description Generator - Template-based descriptions with brand voice

import type { Item, BrandVoiceSettings, DescriptionSuggestion, BrandTone } from '@/types';
import { generateId } from '@/lib/formatting';

// Sensory words by tone
const sensoryWords: Record<BrandTone, string[]> = {
  friendly: ['delicious', 'hearty', 'comforting', 'satisfying', 'tasty', 'yummy'],
  premium: ['exquisite', 'refined', 'artisanal', 'curated', 'succulent', 'divine'],
  playful: ['awesome', 'amazing', 'lip-smacking', 'irresistible', 'legendary', 'epic'],
  traditional: ['classic', 'authentic', 'time-honoured', 'wholesome', 'honest', 'proper'],
};

// Cooking style templates
const cookingTemplates: Record<string, string[]> = {
  grill: ['flame-grilled', 'charred to perfection', 'seared', 'grilled over open flames'],
  fry: ['golden-fried', 'crispy', 'perfectly fried', 'golden and crunchy'],
  pizza: ['stone-baked', 'hand-stretched', 'wood-fired style', 'freshly baked'],
  curry: ['slow-cooked', 'simmered with spices', 'fragrant', 'aromatic'],
  dessert: ['homemade', 'freshly prepared', 'indulgent', 'rich and creamy'],
  prep: ['freshly prepared', 'handcrafted', 'made to order', 'garden-fresh'],
  bar: ['refreshing', 'chilled', 'perfectly served', 'ice-cold'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildDescription(item: Item, settings: BrandVoiceSettings): string {
  const parts: string[] = [];
  const sensory = pickRandom(sensoryWords[settings.tone]);
  
  if (settings.taglineStyle) {
    // Short tagline style
    parts.push(sensory.charAt(0).toUpperCase() + sensory.slice(1));
    
    if (settings.includeCookingStyle && cookingTemplates[item.station]) {
      parts[0] += `, ${pickRandom(cookingTemplates[item.station])}`;
    }
    
    // Add dietary highlight if applicable
    if (item.dietaryTags.includes('Vegetarian')) {
      parts.push('Perfect for vegetarians');
    } else if (item.dietaryTags.includes('Vegan')) {
      parts.push('100% plant-based');
    } else if (item.dietaryTags.includes('Popular')) {
      parts.push('A customer favourite');
    }
    
    return parts.join('. ') + '.';
  } else {
    // Longer description style
    let desc = '';
    
    if (settings.includeCookingStyle && cookingTemplates[item.station]) {
      desc += `Our ${pickRandom(cookingTemplates[item.station])} ${item.name.toLowerCase()}`;
    } else {
      desc += `Our ${sensory} ${item.name.toLowerCase()}`;
    }
    
    if (settings.includeIngredients && item.allergens.length > 0) {
      // Use allergens as ingredient hints
      desc += ` features ${item.allergens.slice(0, 2).join(' and ').toLowerCase()}`;
    }
    
    desc += `. ${pickRandom(['Served fresh', 'Made with care', 'Prepared to order', 'Crafted with passion'])}`;
    
    if (item.dietaryTags.length > 0) {
      const tag = item.dietaryTags[0];
      if (tag === 'Popular') {
        desc += ` and loved by our regulars`;
      } else if (tag === 'Spicy') {
        desc += ` with a kick of heat`;
      } else {
        desc += ` (${tag.toLowerCase()})`;
      }
    }
    
    return desc + '.';
  }
}

export function generateDescription(item: Item, settings: BrandVoiceSettings): string {
  return buildDescription(item, settings);
}

export function generateDescriptionSuggestions(items: Item[], settings: BrandVoiceSettings): DescriptionSuggestion[] {
  const suggestions: DescriptionSuggestion[] = [];
  
  // Only generate for items with short or missing descriptions
  const needsDescription = items.filter(i => !i.description || i.description.length < 20);
  
  for (const item of needsDescription.slice(0, 15)) {
    suggestions.push({
      id: generateId('desc-'),
      itemId: item.id,
      originalDescription: item.description || '',
      suggestedDescription: generateDescription(item, settings),
      tone: settings.tone,
      approved: false,
      rejected: false,
    });
  }
  
  return suggestions;
}

// Preview what a tone sounds like
export function getTonePreview(tone: BrandTone): string {
  const examples: Record<BrandTone, string> = {
    friendly: "Delicious, comforting, and made just for you. A crowd favourite!",
    premium: "Exquisite, artisanal craftsmanship. A refined culinary experience.",
    playful: "Epic, legendary, and absolutely irresistible. You won't regret it!",
    traditional: "Classic, authentic, and time-honoured. Just like grandma made.",
  };
  return examples[tone];
}
