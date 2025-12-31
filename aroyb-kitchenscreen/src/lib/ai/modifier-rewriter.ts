// AI Modifier Rewriter - Transforms notes to kitchen-friendly format

import type { Modifier, AddOn, TicketItem } from '@/types';

interface RewriteRule {
  patterns: RegExp[];
  format: string;
  category: 'hold' | 'spice' | 'allergy' | 'addon' | 'cook' | 'special';
}

const rewriteRules: RewriteRule[] = [
  // HOLD patterns
  { patterns: [/no\s+(\w+)/i, /without\s+(\w+)/i, /hold\s+(\w+)/i, /remove\s+(\w+)/i], format: 'HOLD: {1}', category: 'hold' },
  
  // SPICE patterns
  { patterns: [/extra\s+spicy/i, /very\s+spicy/i], format: 'SPICE: EXTRA HOT 🌶️🌶️🌶️', category: 'spice' },
  { patterns: [/spicy/i, /hot/i, /chilli/i, /chili/i], format: 'SPICE: HOT 🌶️🌶️', category: 'spice' },
  { patterns: [/mild/i, /not\s+spicy/i, /no\s+spice/i], format: 'SPICE: MILD', category: 'spice' },
  { patterns: [/medium\s+spice/i], format: 'SPICE: MEDIUM 🌶️', category: 'spice' },
  
  // ALLERGY patterns
  { patterns: [/gluten\s*free/i, /gf\b/i, /coeliac/i, /celiac/i], format: 'GF: USE GLUTEN-FREE BASE ⚠️', category: 'allergy' },
  { patterns: [/nut\s*free/i, /no\s+nuts/i, /nut\s+allergy/i], format: 'NUT-FREE ⚠️ CHECK ALL INGREDIENTS', category: 'allergy' },
  { patterns: [/dairy\s*free/i, /no\s+dairy/i, /lactose/i, /vegan/i], format: 'DAIRY-FREE: USE VEGAN OPTIONS ⚠️', category: 'allergy' },
  { patterns: [/vegetarian/i, /veggie/i], format: 'VEGETARIAN 🥬', category: 'allergy' },
  
  // COOK patterns
  { patterns: [/well\s+done/i, /well-done/i], format: 'COOK: WELL DONE', category: 'cook' },
  { patterns: [/medium\s+well/i], format: 'COOK: MEDIUM-WELL', category: 'cook' },
  { patterns: [/medium\s+rare/i], format: 'COOK: MEDIUM-RARE', category: 'cook' },
  { patterns: [/\brare\b/i], format: 'COOK: RARE', category: 'cook' },
  { patterns: [/\bmedium\b/i], format: 'COOK: MEDIUM', category: 'cook' },
  { patterns: [/extra\s+crispy/i, /crispy/i], format: 'COOK: EXTRA CRISPY', category: 'cook' },
  
  // ADDON patterns
  { patterns: [/extra\s+(\w+)/i, /add\s+(\w+)/i, /more\s+(\w+)/i], format: 'ADD: EXTRA {1}', category: 'addon' },
  { patterns: [/side\s+of\s+(\w+)/i, /on\s+the\s+side/i, /side/i], format: 'SIDE: ON THE SIDE', category: 'special' },
  { patterns: [/dressing\s+on\s+side/i], format: 'DRESSING: ON SIDE', category: 'special' },
];

export function rewriteNote(note: string): string {
  if (!note || note.trim().length === 0) return '';
  
  let result = note.toUpperCase();
  let matched = false;
  
  for (const rule of rewriteRules) {
    for (const pattern of rule.patterns) {
      const match = note.match(pattern);
      if (match) {
        let formatted = rule.format;
        // Replace capture groups
        match.slice(1).forEach((group, i) => {
          formatted = formatted.replace(`{${i + 1}}`, group.toUpperCase());
        });
        result = formatted;
        matched = true;
        break;
      }
    }
    if (matched) break;
  }
  
  return matched ? result : `NOTE: ${note.toUpperCase()}`;
}

export function rewriteModifier(modifier: Modifier): Modifier {
  return {
    ...modifier,
    kitchenFormat: rewriteNote(modifier.name),
  };
}

export function rewriteAddOn(addon: AddOn): AddOn {
  return {
    ...addon,
    kitchenFormat: `ADD: ${addon.name.toUpperCase()}`,
  };
}

export function rewriteItem(item: TicketItem): TicketItem {
  return {
    ...item,
    modifiers: item.modifiers.map(rewriteModifier),
    addOns: item.addOns.map(rewriteAddOn),
    kitchenNotes: item.notes ? rewriteNote(item.notes) : undefined,
  };
}

export function formatItemForKitchen(item: TicketItem): string[] {
  const lines: string[] = [];
  
  // Modifiers
  item.modifiers.forEach(mod => {
    lines.push(mod.kitchenFormat || rewriteNote(mod.name));
  });
  
  // Add-ons
  item.addOns.forEach(addon => {
    lines.push(addon.kitchenFormat || `ADD: ${addon.name.toUpperCase()}`);
  });
  
  // Notes
  if (item.notes) {
    lines.push(item.kitchenNotes || rewriteNote(item.notes));
  }
  
  return lines;
}

// Detect if this is an allergy-related note
export function isAllergyNote(text: string): boolean {
  const allergyPatterns = [
    /allergy/i, /allergic/i, /gluten/i, /nut/i, /dairy/i, /lactose/i, 
    /celiac/i, /coeliac/i, /vegan/i, /intolerant/i, /anaphyl/i
  ];
  return allergyPatterns.some(p => p.test(text));
}
