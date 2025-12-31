// AI Optimiser Engine - Recommend promo adjustments based on performance

import type { Promo, OptimisationSuggestion } from '@/types';
import { generateId, formatCurrency } from '@/lib/formatting';

export function generateOptimisationSuggestions(promos: Promo[]): OptimisationSuggestion[] {
  const suggestions: OptimisationSuggestion[] = [];
  
  for (const promo of promos.filter(p => p.status === 'active' && p.stats.redemptions > 10)) {
    const { stats } = promo;
    
    // High redemption + low AOV = decrease discount
    if (stats.redemptions > 100 && stats.avgOrderValue < 25) {
      if (promo.discount?.type === 'percentage') {
        suggestions.push({
          id: generateId('opt-'),
          promoId: promo.id,
          promoName: promo.name,
          recommendation: 'decrease_discount',
          currentValue: `${promo.discount.value}% off`,
          suggestedValue: `${Math.max(5, promo.discount.value - 5)}% off`,
          reason: `High redemption rate (${stats.redemptions}) but low AOV (${formatCurrency(stats.avgOrderValue)})`,
          expectedImpact: '+8% margin improvement',
          confidence: 75 + Math.floor(Math.random() * 15),
          status: 'pending',
        });
      }
    }
    
    // Low redemption = increase discount
    if (stats.redemptions < 50 && stats.impressions > 500) {
      if (promo.discount?.type === 'percentage') {
        suggestions.push({
          id: generateId('opt-'),
          promoId: promo.id,
          promoName: promo.name,
          recommendation: 'increase_discount',
          currentValue: `${promo.discount.value}% off`,
          suggestedValue: `${promo.discount.value + 5}% off`,
          reason: `Low conversion rate (${Math.round(stats.redemptions / stats.impressions * 100)}%) despite high impressions`,
          expectedImpact: '+15% expected redemptions',
          confidence: 65 + Math.floor(Math.random() * 20),
          status: 'pending',
        });
      }
    }
    
    // High repeat rate = expand audience
    if (stats.repeatRate > 60) {
      suggestions.push({
        id: generateId('opt-'),
        promoId: promo.id,
        promoName: promo.name,
        recommendation: 'expand_items',
        currentValue: 'Current eligible items',
        suggestedValue: 'Add related categories',
        reason: `High repeat rate (${stats.repeatRate}%) indicates strong appeal`,
        expectedImpact: '+12% new customer reach',
        confidence: 70 + Math.floor(Math.random() * 15),
        status: 'pending',
      });
    }
    
    // Low basket value = tighten minimum
    if (promo.minBasket && promo.minBasket < 15 && stats.avgOrderValue > 30) {
      suggestions.push({
        id: generateId('opt-'),
        promoId: promo.id,
        promoName: promo.name,
        recommendation: 'tighten_basket',
        currentValue: formatCurrency(promo.minBasket),
        suggestedValue: formatCurrency(Math.round(stats.avgOrderValue * 0.7)),
        reason: `Customers typically spend ${formatCurrency(stats.avgOrderValue)} but minimum is only ${formatCurrency(promo.minBasket)}`,
        expectedImpact: '+5% average discount efficiency',
        confidence: 80 + Math.floor(Math.random() * 10),
        status: 'pending',
      });
    }
  }
  
  return suggestions.slice(0, 8); // Top 8 suggestions
}

export function simulateWeek(promos: Promo[]): Promo[] {
  // Generate synthetic performance data
  return promos.map(promo => {
    if (promo.status !== 'active') return promo;
    
    const newImpressions = Math.floor(promo.stats.impressions * (0.8 + Math.random() * 0.4));
    const conversionRate = 0.03 + Math.random() * 0.08;
    const newRedemptions = Math.floor(newImpressions * conversionRate);
    const avgOrder = 20 + Math.random() * 20;
    
    return {
      ...promo,
      stats: {
        impressions: promo.stats.impressions + newImpressions,
        redemptions: promo.stats.redemptions + newRedemptions,
        revenue: promo.stats.revenue + newRedemptions * avgOrder,
        avgOrderValue: (promo.stats.avgOrderValue + avgOrder) / 2,
        repeatRate: Math.min(80, promo.stats.repeatRate + Math.random() * 5),
      },
    };
  });
}

export function approveOptimisation(suggestion: OptimisationSuggestion): OptimisationSuggestion {
  return { ...suggestion, status: 'approved' };
}

export function rejectOptimisation(suggestion: OptimisationSuggestion): OptimisationSuggestion {
  return { ...suggestion, status: 'rejected' };
}
