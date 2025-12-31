// AI Packing Checklist Generator - Rule-based checklist for orders

import type { Order, PackingChecklist, PackingCheckItem } from '@/types';
import { generateId } from '@/lib/formatting';

interface ChecklistRule {
  condition: (order: Order) => boolean;
  items: Omit<PackingCheckItem, 'id'>[];
}

const rules: ChecklistRule[] = [
  // Delivery orders - bag sealing
  {
    condition: (order) => order.fulfillmentType === 'delivery',
    items: [
      { text: 'Seal delivery bag', category: 'handling' },
      { text: 'Include cutlery set', category: 'extra' },
      { text: 'Add napkins (x4)', category: 'extra' },
    ],
  },
  // Collection orders
  {
    condition: (order) => order.fulfillmentType === 'collection',
    items: [
      { text: 'Bag items securely', category: 'handling' },
      { text: 'Include cutlery if requested', category: 'extra' },
    ],
  },
  // Curry items - rice/naan check
  {
    condition: (order) => order.items.some(i => 
      i.name.toLowerCase().includes('curry') || 
      i.name.toLowerCase().includes('masala') ||
      i.name.toLowerCase().includes('korma')
    ),
    items: [
      { text: 'Rice/naan included?', category: 'verification', isHighRisk: true },
      { text: 'Raita/chutney included?', category: 'extra' },
    ],
  },
  // Pizza items
  {
    condition: (order) => order.items.some(i => i.name.toLowerCase().includes('pizza')),
    items: [
      { text: 'Pizza box sealed', category: 'handling' },
      { text: 'Chilli flakes sachet', category: 'extra' },
    ],
  },
  // Drinks
  {
    condition: (order) => order.items.some(i => 
      i.name.toLowerCase().includes('drink') || 
      i.name.toLowerCase().includes('cola') ||
      i.name.toLowerCase().includes('juice') ||
      i.name.toLowerCase().includes('lassi') ||
      i.name.toLowerCase().includes('tea')
    ),
    items: [
      { text: 'Straws included', category: 'extra' },
      { text: 'Lids secured', category: 'handling' },
    ],
  },
  // Hot items
  {
    condition: (order) => order.items.some(i => 
      i.station === 'grill' || i.station === 'fry' || i.station === 'pizza'
    ),
    items: [
      { text: 'Hot items separated', category: 'handling' },
    ],
  },
  // Cold items (salads, drinks)
  {
    condition: (order) => order.items.some(i => 
      i.name.toLowerCase().includes('salad') ||
      i.station === 'bar'
    ),
    items: [
      { text: 'Cold items separated', category: 'handling' },
    ],
  },
  // Allergen orders - high risk
  {
    condition: (order) => !!order.allergenNotes || order.items.some(i => i.allergens && i.allergens.length > 0),
    items: [
      { text: '⚠️ ALLERGEN CHECK - Verify all items', category: 'verification', isHighRisk: true },
      { text: 'Attach allergen label', category: 'handling', isHighRisk: true },
    ],
  },
  // Items with modifiers
  {
    condition: (order) => order.items.some(i => i.modifiers.length > 0),
    items: [
      { text: 'Double-check modifiers', category: 'verification', isHighRisk: true },
    ],
  },
  // Items with notes
  {
    condition: (order) => order.items.some(i => i.notes) || !!order.customerNotes,
    items: [
      { text: 'Review special notes', category: 'verification', isHighRisk: true },
    ],
  },
  // Sauces for burgers/fries
  {
    condition: (order) => order.items.some(i => 
      i.name.toLowerCase().includes('burger') ||
      i.name.toLowerCase().includes('fries') ||
      i.name.toLowerCase().includes('chips')
    ),
    items: [
      { text: 'Sauce sachets (ketchup/mayo)', category: 'extra' },
    ],
  },
];

export function generatePackingChecklist(order: Order): PackingChecklist {
  const checkItems: PackingCheckItem[] = [];
  
  // Add all items from the order
  order.items.forEach(item => {
    checkItems.push({
      id: generateId('pc'),
      text: `${item.quantity}× ${item.name}`,
      category: 'item',
      checked: false,
    });
    
    // Add modifiers as sub-checks if any
    if (item.modifiers.length > 0) {
      checkItems.push({
        id: generateId('pc'),
        text: `  → ${item.modifiers.join(', ')}`,
        category: 'item',
        isHighRisk: item.modifiers.some(m => 
          m.toLowerCase().includes('no ') || 
          m.toLowerCase().includes('extra') ||
          m.toLowerCase().includes('allergy')
        ),
        checked: false,
      });
    }
  });
  
  // Apply rules
  rules.forEach(rule => {
    if (rule.condition(order)) {
      rule.items.forEach(item => {
        // Avoid duplicates
        if (!checkItems.some(ci => ci.text === item.text)) {
          checkItems.push({
            id: generateId('pc'),
            ...item,
            checked: false,
          });
        }
      });
    }
  });
  
  return {
    orderId: order.id,
    items: checkItems,
    generatedAt: new Date().toISOString(),
  };
}

// Get summary stats for checklist
export function getChecklistSummary(checklist: PackingChecklist): {
  totalItems: number;
  highRiskItems: number;
  categories: Record<string, number>;
} {
  const categories: Record<string, number> = {};
  let highRiskItems = 0;
  
  checklist.items.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1;
    if (item.isHighRisk) highRiskItems++;
  });
  
  return {
    totalItems: checklist.items.length,
    highRiskItems,
    categories,
  };
}
