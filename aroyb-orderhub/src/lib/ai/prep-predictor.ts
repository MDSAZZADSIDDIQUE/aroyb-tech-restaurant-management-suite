// AI Prep Time Prediction Engine
import type { Order, KitchenState, PrepTimePrediction, MenuItem } from '@/types';

interface PredictionFactors {
  timeBucket: 'breakfast' | 'lunch' | 'dinner' | 'late_night';
  kitchenLoad: number;
  itemComplexity: number;
  itemCount: number;
}

// Get time bucket based on hour
function getTimeBucket(hour: number): PredictionFactors['timeBucket'] {
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 21) return 'dinner';
  return 'late_night';
}

// Calculate item complexity score
function calculateComplexity(items: Order['items'], menuItems: MenuItem[]): number {
  let totalComplexity = 0;
  
  for (const item of items) {
    const menuItem = menuItems.find(m => m.id === item.menuItemId);
    const baseComplexity = menuItem?.complexityScore || 3;
    const modifierComplexity = item.modifiers.length * 0.5;
    const quantity = item.quantity;
    
    totalComplexity += (baseComplexity + modifierComplexity) * quantity;
  }
  
  return totalComplexity;
}

// Get confidence level based on factors
function getConfidence(factors: PredictionFactors): 'low' | 'medium' | 'high' {
  // Lower confidence during peak times with high load
  if (factors.kitchenLoad > 80 && factors.timeBucket === 'dinner') return 'low';
  if (factors.kitchenLoad > 70) return 'medium';
  if (factors.itemComplexity > 15) return 'medium';
  return 'high';
}

// Generate explanation
function generateExplanation(factors: PredictionFactors, predictedMinutes: number): string {
  const parts: string[] = [];
  
  // Time bucket
  const timeBucketLabels = {
    breakfast: 'Morning service',
    lunch: 'Lunch rush',
    dinner: 'Dinner service',
    late_night: 'Late night'
  };
  parts.push(timeBucketLabels[factors.timeBucket]);
  
  // Kitchen load
  if (factors.kitchenLoad > 75) {
    parts.push('high kitchen load');
  } else if (factors.kitchenLoad > 50) {
    parts.push('moderate kitchen load');
  } else {
    parts.push('low kitchen load');
  }
  
  // Item complexity
  if (factors.itemComplexity > 15) {
    parts.push('complex order');
  } else if (factors.itemComplexity > 8) {
    parts.push('standard order');
  } else {
    parts.push('simple order');
  }
  
  return `${parts.join(' + ')} → ${predictedMinutes} mins predicted`;
}

// Main prediction function
export function predictPrepTime(
  order: Order,
  kitchenState: KitchenState,
  menuItems: MenuItem[]
): PrepTimePrediction {
  const now = new Date();
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  
  // Calculate factors
  const factors: PredictionFactors = {
    timeBucket: getTimeBucket(hour),
    kitchenLoad: kitchenState.loadPercent,
    itemComplexity: calculateComplexity(order.items, menuItems),
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
  };
  
  // Base time from menu items
  let baseTime = 0;
  for (const item of order.items) {
    const menuItem = menuItems.find(m => m.id === item.menuItemId);
    baseTime = Math.max(baseTime, (menuItem?.prepTimeBase || 10) * item.quantity);
  }
  
  // Adjustments
  let adjustedTime = baseTime;
  
  // Kitchen load adjustment (0-30% increase)
  adjustedTime *= 1 + (factors.kitchenLoad / 100) * 0.3;
  
  // Peak time adjustment
  if (factors.timeBucket === 'dinner') {
    adjustedTime *= 1.15;
  } else if (factors.timeBucket === 'lunch') {
    adjustedTime *= 1.1;
  }
  
  // Weekend adjustment
  if (isWeekend) {
    adjustedTime *= 1.1;
  }
  
  // Complexity adjustment
  if (factors.itemComplexity > 15) {
    adjustedTime *= 1.2;
  }
  
  const predictedMinutes = Math.round(adjustedTime);
  
  return {
    predictedMinutes,
    confidence: getConfidence(factors),
    explanation: generateExplanation(factors, predictedMinutes),
    factors,
  };
}
