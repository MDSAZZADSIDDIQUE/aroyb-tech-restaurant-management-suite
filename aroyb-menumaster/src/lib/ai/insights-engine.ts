// AI Insights Engine - Detect menu issues and inconsistencies

import type { Item, ModifierGroup, InsightIssue, InsightType, InsightSeverity } from '@/types';
import { generateId } from '@/lib/formatting';

// Simple token similarity
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  const intersection = [...tokensA].filter(t => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

export function detectDuplicates(items: Item[]): InsightIssue[] {
  const issues: InsightIssue[] = [];
  const checked = new Set<string>();
  
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const key = [items[i].id, items[j].id].sort().join('-');
      if (checked.has(key)) continue;
      checked.add(key);
      
      const similarity = tokenOverlap(items[i].name, items[j].name);
      if (similarity > 0.7) {
        issues.push({
          id: generateId('insight-'),
          type: 'duplicate',
          severity: similarity > 0.9 ? 'high' : 'medium',
          title: `Possible duplicate: ${items[i].name}`,
          description: `"${items[i].name}" and "${items[j].name}" have very similar names (${Math.round(similarity * 100)}% match). Consider merging or renaming.`,
          affectedItemIds: [items[i].id, items[j].id],
          suggestedFix: 'Merge items or differentiate names',
          autoFixable: false,
          dismissed: false,
        });
      }
    }
  }
  
  return issues;
}

export function detectMissingInfo(items: Item[]): InsightIssue[] {
  const issues: InsightIssue[] = [];
  
  for (const item of items) {
    // Missing description
    if (!item.description || item.description.length < 10) {
      issues.push({
        id: generateId('insight-'),
        type: 'missing_description',
        severity: 'low',
        title: `Missing description: ${item.name}`,
        description: `"${item.name}" has no description or a very short one. Descriptions help customers make decisions.`,
        affectedItemIds: [item.id],
        suggestedFix: 'Add a compelling description using AI generator',
        autoFixable: true,
        dismissed: false,
      });
    }
    
    // Missing allergens on high-risk categories
    if (item.allergens.length === 0 && ['curry', 'pizza', 'dessert'].includes(item.station)) {
      issues.push({
        id: generateId('insight-'),
        type: 'missing_allergen',
        severity: 'high',
        title: `Missing allergens: ${item.name}`,
        description: `"${item.name}" has no allergen information. This is legally required in the UK.`,
        affectedItemIds: [item.id],
        suggestedFix: 'Review ingredients and add allergen tags',
        autoFixable: false,
        dismissed: false,
      });
    }
    
    // Missing image
    if (!item.imageId) {
      issues.push({
        id: generateId('insight-'),
        type: 'missing_image',
        severity: 'low',
        title: `Missing image: ${item.name}`,
        description: `"${item.name}" has no image. Items with images sell 30% better.`,
        affectedItemIds: [item.id],
        suggestedFix: 'Upload an appetizing image',
        autoFixable: false,
        dismissed: false,
      });
    }
  }
  
  return issues;
}

export function detectModifierMismatches(items: Item[], modifierGroups: ModifierGroup[]): InsightIssue[] {
  const issues: InsightIssue[] = [];
  
  // Check curry items for spice level
  const curryItems = items.filter(i => i.station === 'curry');
  const itemsWithoutSpice = curryItems.filter(i => !i.modifierGroupIds.includes('mod-spice'));
  
  if (itemsWithoutSpice.length > 0 && itemsWithoutSpice.length < curryItems.length) {
    issues.push({
      id: generateId('insight-'),
      type: 'modifier_mismatch',
      severity: 'medium',
      title: 'Inconsistent spice level modifiers',
      description: `${itemsWithoutSpice.length} curry items are missing the "Spice Level" modifier that other curries have.`,
      affectedItemIds: itemsWithoutSpice.map(i => i.id),
      suggestedFix: 'Add "Spice Level" modifier to all curry items',
      autoFixable: true,
      dismissed: false,
    });
  }
  
  // Check pizza items for size
  const pizzaItems = items.filter(i => i.station === 'pizza' && i.categoryId === 'cat-pizza');
  const pizzasWithoutSize = pizzaItems.filter(i => !i.modifierGroupIds.includes('mod-pizza-size'));
  
  if (pizzasWithoutSize.length > 0 && pizzasWithoutSize.length < pizzaItems.length) {
    issues.push({
      id: generateId('insight-'),
      type: 'modifier_mismatch',
      severity: 'medium',
      title: 'Inconsistent pizza size modifiers',
      description: `${pizzasWithoutSize.length} pizzas are missing the "Pizza Size" modifier.`,
      affectedItemIds: pizzasWithoutSize.map(i => i.id),
      suggestedFix: 'Add "Pizza Size" modifier to all pizzas',
      autoFixable: true,
      dismissed: false,
    });
  }
  
  return issues;
}

export function detectSizingInconsistencies(items: Item[]): InsightIssue[] {
  const issues: InsightIssue[] = [];
  
  // Group by category and check size patterns
  const categoryItems = new Map<string, Item[]>();
  items.forEach(item => {
    const existing = categoryItems.get(item.categoryId) || [];
    existing.push(item);
    categoryItems.set(item.categoryId, existing);
  });
  
  categoryItems.forEach((catItems, categoryId) => {
    const withSizes = catItems.filter(i => i.sizes.length > 0);
    const withoutSizes = catItems.filter(i => i.sizes.length === 0);
    
    // If some items have sizes and others don't in same category
    if (withSizes.length > 0 && withoutSizes.length > 0 && withSizes.length > 2) {
      issues.push({
        id: generateId('insight-'),
        type: 'inconsistent_sizing',
        severity: 'low',
        title: 'Inconsistent size options',
        description: `In this category, ${withSizes.length} items have size options but ${withoutSizes.length} don't. Consider standardizing.`,
        affectedItemIds: withoutSizes.map(i => i.id),
        suggestedFix: 'Add size options to remaining items or remove from others',
        autoFixable: false,
        dismissed: false,
      });
    }
  });
  
  return issues;
}

export function runFullAnalysis(items: Item[], modifierGroups: ModifierGroup[]): InsightIssue[] {
  return [
    ...detectDuplicates(items),
    ...detectMissingInfo(items),
    ...detectModifierMismatches(items, modifierGroups),
    ...detectSizingInconsistencies(items),
  ];
}
