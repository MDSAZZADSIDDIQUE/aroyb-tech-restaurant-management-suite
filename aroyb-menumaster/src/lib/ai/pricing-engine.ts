// AI Pricing Engine - Suggest price optimizations and bundles

import type { Item, PricingSuggestion } from '@/types';
import { generateId, formatCurrency } from '@/lib/formatting';

interface ItemMetrics {
  item: Item;
  margin: number;
  marginPercent: number;
}

function calculateMetrics(items: Item[]): ItemMetrics[] {
  return items.map(item => {
    const margin = item.basePrice - item.cost;
    const marginPercent = item.cost > 0 ? (margin / item.basePrice) * 100 : 0;
    return { item, margin, marginPercent };
  });
}

export function suggestPriceIncreases(items: Item[]): PricingSuggestion[] {
  const suggestions: PricingSuggestion[] = [];
  const metrics = calculateMetrics(items);
  
  // High popularity + high margin = room to increase
  const candidates = metrics.filter(m => 
    m.item.popularity > 80 && 
    m.marginPercent > 50 &&
    m.item.basePrice < 20
  );
  
  for (const { item, margin, marginPercent } of candidates) {
    const suggestedIncrease = Math.round(item.basePrice * 0.05 * 100) / 100; // 5% increase
    const newPrice = item.basePrice + suggestedIncrease;
    
    suggestions.push({
      id: generateId('price-'),
      type: 'price_increase',
      title: `Increase price: ${item.name}`,
      description: `This item has high popularity (${item.popularity}%) and good margin (${Math.round(marginPercent)}%). A small price increase is unlikely to affect demand.`,
      itemIds: [item.id],
      currentValue: item.basePrice,
      suggestedValue: newPrice,
      expectedImpact: `+${formatCurrency(suggestedIncrease)} per sale, estimated +${formatCurrency(suggestedIncrease * item.popularity)} weekly`,
      approved: false,
      rejected: false,
    });
  }
  
  return suggestions.slice(0, 5); // Limit to top 5
}

export function suggestPriceDecreases(items: Item[]): PricingSuggestion[] {
  const suggestions: PricingSuggestion[] = [];
  const metrics = calculateMetrics(items);
  
  // Low popularity + high margin = room to decrease to boost sales
  const candidates = metrics.filter(m => 
    m.item.popularity < 50 && 
    m.marginPercent > 60
  );
  
  for (const { item, margin, marginPercent } of candidates) {
    const suggestedDecrease = Math.round(item.basePrice * 0.10 * 100) / 100; // 10% decrease
    const newPrice = item.basePrice - suggestedDecrease;
    
    suggestions.push({
      id: generateId('price-'),
      type: 'price_decrease',
      title: `Feature price: ${item.name}`,
      description: `This item has low sales (${item.popularity}%) but high margin (${Math.round(marginPercent)}%). A promotional price could boost orders.`,
      itemIds: [item.id],
      currentValue: item.basePrice,
      suggestedValue: newPrice,
      expectedImpact: `Could increase sales by 20-30% at reduced margin`,
      approved: false,
      rejected: false,
    });
  }
  
  return suggestions.slice(0, 3);
}

export function suggestBundles(items: Item[]): PricingSuggestion[] {
  const suggestions: PricingSuggestion[] = [];
  
  // Find good bundle candidates: main + side + drink patterns
  const mains = items.filter(i => ['cat-mains', 'cat-burgers', 'cat-pizza', 'cat-curry'].includes(i.categoryId));
  const sides = items.filter(i => i.categoryId === 'cat-sides');
  const drinks = items.filter(i => i.categoryId === 'cat-drinks');
  
  // Pick high-popularity items for bundles
  const topMains = mains.filter(m => m.popularity > 70).slice(0, 2);
  const topSide = sides.find(s => s.popularity > 70);
  const topDrink = drinks.find(d => d.popularity > 70);
  
  for (const main of topMains) {
    if (topSide && topDrink) {
      const individualTotal = main.basePrice + topSide.basePrice + topDrink.basePrice;
      const bundlePrice = Math.round(individualTotal * 0.85 * 100) / 100; // 15% discount
      
      suggestions.push({
        id: generateId('price-'),
        type: 'create_bundle',
        title: `Create bundle: ${main.name} Meal Deal`,
        description: `Bundle "${main.name}" with "${topSide.name}" and "${topDrink.name}" at a 15% discount. Popular items often sell better as deals.`,
        itemIds: [main.id, topSide.id, topDrink.id],
        currentValue: individualTotal,
        suggestedValue: bundlePrice,
        expectedImpact: `Save customers ${formatCurrency(individualTotal - bundlePrice)}, increase average order value`,
        approved: false,
        rejected: false,
      });
    }
  }
  
  return suggestions;
}

export function generatePricingSuggestions(items: Item[]): PricingSuggestion[] {
  return [
    ...suggestPriceIncreases(items),
    ...suggestPriceDecreases(items),
    ...suggestBundles(items),
  ];
}
