// AI Throttle Suggestions Engine
import type { KitchenState, ThrottleSuggestion, Order } from '@/types';
import { generateId } from '@/lib/formatting';

// Check kitchen load threshold
function checkLoadThreshold(kitchenState: KitchenState): ThrottleSuggestion | null {
  if (kitchenState.loadPercent >= 85) {
    return {
      id: generateId(),
      type: 'pause_delivery',
      title: 'Pause Delivery Orders',
      description: 'Kitchen is at maximum capacity. Consider pausing delivery orders for 20-30 minutes.',
      reason: `Kitchen load is at ${kitchenState.loadPercent}%, which is above the 85% threshold.`,
      suggestedValue: 20,
      priority: 'high',
    };
  }
  
  if (kitchenState.loadPercent >= 75) {
    return {
      id: generateId(),
      type: 'extend_prep_times',
      title: 'Extend Prep Times',
      description: 'Kitchen is getting busy. Extend prep times to manage customer expectations.',
      reason: `Kitchen load is at ${kitchenState.loadPercent}%, approaching capacity.`,
      suggestedValue: 10,
      priority: 'medium',
    };
  }
  
  return null;
}

// Check backlog threshold
function checkBacklogThreshold(kitchenState: KitchenState): ThrottleSuggestion | null {
  if (kitchenState.backlogCount >= 10) {
    return {
      id: generateId(),
      type: 'disable_scheduled',
      title: 'Disable Scheduled Orders',
      description: 'Large order backlog detected. Temporarily disable new scheduled orders.',
      reason: `${kitchenState.backlogCount} orders in backlog, exceeding threshold of 10.`,
      priority: 'high',
    };
  }
  
  if (kitchenState.backlogCount >= 6) {
    return {
      id: generateId(),
      type: 'pause_channel',
      title: 'Pause Marketplace Channel',
      description: 'Consider pausing marketplace orders to prioritize direct customers.',
      reason: `${kitchenState.backlogCount} orders in backlog. Marketplace orders add complexity.`,
      suggestedValue: 'marketplace',
      priority: 'medium',
    };
  }
  
  return null;
}

// Check average ticket time
function checkTicketTime(kitchenState: KitchenState): ThrottleSuggestion | null {
  if (kitchenState.avgTicketMinutes >= 25) {
    return {
      id: generateId(),
      type: 'extend_prep_times',
      title: 'Update Customer ETAs',
      description: 'Average ticket time is rising. Update prep times to match reality.',
      reason: `Average ticket time is ${kitchenState.avgTicketMinutes} minutes, above target of 20 minutes.`,
      suggestedValue: Math.ceil(kitchenState.avgTicketMinutes * 1.1),
      priority: 'medium',
    };
  }
  
  return null;
}

// Check station overload
function checkStationOverload(kitchenState: KitchenState): ThrottleSuggestion | null {
  const overloadedStations = Object.entries(kitchenState.stationLoads)
    .filter(([, load]) => load >= 90)
    .map(([station]) => station);
  
  if (overloadedStations.length > 0) {
    return {
      id: generateId(),
      type: 'extend_prep_times',
      title: `${overloadedStations.join(', ')} Station Overloaded`,
      description: `Consider pausing items that require ${overloadedStations.join(' or ')} station.`,
      reason: `Station(s) at 90%+ capacity: ${overloadedStations.join(', ')}`,
      suggestedValue: 15,
      priority: 'high',
    };
  }
  
  return null;
}

// Main function to generate throttle suggestions
export function generateThrottleSuggestions(
  kitchenState: KitchenState,
  _pendingOrders: Order[] = []
): ThrottleSuggestion[] {
  const suggestions: ThrottleSuggestion[] = [];
  
  // Check all thresholds
  const loadSuggestion = checkLoadThreshold(kitchenState);
  if (loadSuggestion) suggestions.push(loadSuggestion);
  
  const backlogSuggestion = checkBacklogThreshold(kitchenState);
  if (backlogSuggestion) suggestions.push(backlogSuggestion);
  
  const ticketSuggestion = checkTicketTime(kitchenState);
  if (ticketSuggestion) suggestions.push(ticketSuggestion);
  
  const stationSuggestion = checkStationOverload(kitchenState);
  if (stationSuggestion) suggestions.push(stationSuggestion);
  
  // Deduplicate by type (keep highest priority)
  const uniqueSuggestions = new Map<string, ThrottleSuggestion>();
  for (const suggestion of suggestions) {
    const existing = uniqueSuggestions.get(suggestion.type);
    if (!existing || priorityWeight(suggestion.priority) > priorityWeight(existing.priority)) {
      uniqueSuggestions.set(suggestion.type, suggestion);
    }
  }
  
  return Array.from(uniqueSuggestions.values());
}

function priorityWeight(priority: string): number {
  switch (priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}
