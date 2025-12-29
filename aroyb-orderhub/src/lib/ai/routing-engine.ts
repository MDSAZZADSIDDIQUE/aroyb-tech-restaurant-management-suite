// AI Kitchen Routing Engine
import type { Order, RoutingSuggestion, StationTicket, KitchenStation, KitchenState } from '@/types';

// Group items by station
function groupItemsByStation(order: Order): Map<KitchenStation, typeof order.items> {
  const grouped = new Map<KitchenStation, typeof order.items>();
  
  for (const item of order.items) {
    const station = item.station;
    const existing = grouped.get(station) || [];
    existing.push(item);
    grouped.set(station, existing);
  }
  
  return grouped;
}

// Estimate time for a station ticket
function estimateStationTime(items: Order['items'], kitchenState: KitchenState): number {
  // Base time is max of item prep times (parallel cooking)
  const baseTime = Math.max(...items.map(i => {
    // Estimate based on quantity and item complexity
    const itemBase = 5 + (i.modifiers.length * 1.5) + (i.addOns.length * 0.5);
    return itemBase * Math.ceil(i.quantity / 2); // Can cook 2 at a time
  }));
  
  // Adjust for station load
  const stationLoad = kitchenState.stationLoads[items[0]?.station] || 50;
  const loadMultiplier = 1 + (stationLoad / 100) * 0.3;
  
  return Math.round(baseTime * loadMultiplier);
}

// Generate routing explanation
function generateExplanation(
  tickets: StationTicket[],
  kitchenState: KitchenState
): string {
  if (tickets.length === 0) {
    return 'No items to route.';
  }
  
  if (tickets.length === 1) {
    const t = tickets[0];
    return `Single station order → ${t.station.toUpperCase()} (${t.items.length} items, ~${t.estimatedMinutes} mins)`;
  }
  
  const stationSummary = tickets
    .map(t => `${t.station.charAt(0).toUpperCase() + t.station.slice(1)} (${t.items.length})`)
    .join(' + ');
  
  const criticalStation = tickets.reduce((prev, curr) => 
    curr.estimatedMinutes > prev.estimatedMinutes ? curr : prev
  );
  
  const totalStationLoads = tickets.map(t => ({
    station: t.station,
    load: kitchenState.stationLoads[t.station]
  }));
  
  const highLoadStations = totalStationLoads.filter(s => s.load >= 70);
  
  let explanation = `Split to ${stationSummary}. Critical path: ${criticalStation.station} (~${criticalStation.estimatedMinutes} mins)`;
  
  if (highLoadStations.length > 0) {
    explanation += `. Note: ${highLoadStations.map(s => s.station).join(', ')} at high capacity`;
  }
  
  return explanation;
}

// Main routing function
export function suggestRouting(
  order: Order,
  kitchenState: KitchenState
): RoutingSuggestion {
  const groupedItems = groupItemsByStation(order);
  const tickets: StationTicket[] = [];
  
  // Create ticket for each station
  groupedItems.forEach((items, station) => {
    const ticket: StationTicket = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      station,
      items,
      estimatedMinutes: estimateStationTime(items, kitchenState),
      priority: order.scheduledFor ? 'scheduled' : 'normal',
    };
    tickets.push(ticket);
  });
  
  // Sort tickets by estimated time (longest first for visibility)
  tickets.sort((a, b) => b.estimatedMinutes - a.estimatedMinutes);
  
  // Calculate total time (critical path)
  const estimatedTotalTime = Math.max(...tickets.map(t => t.estimatedMinutes));
  
  return {
    tickets,
    explanation: generateExplanation(tickets, kitchenState),
    estimatedTotalTime,
  };
}

// Convert to simple routing for order storage
export function toStationRouting(tickets: StationTicket[]): { station: KitchenStation; itemCount: number; estimatedTime: number }[] {
  return tickets.map(t => ({
    station: t.station,
    itemCount: t.items.length,
    estimatedTime: t.estimatedMinutes,
  }));
}

// Get station priority order for display
export function getStationPriorityOrder(): KitchenStation[] {
  return ['grill', 'curry', 'fry', 'prep', 'dessert', 'bar'];
}

// Get station color for UI
export function getStationColor(station: KitchenStation): { bg: string; text: string; border: string } {
  const colors: Record<KitchenStation, { bg: string; text: string; border: string }> = {
    grill: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    fry: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    curry: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    dessert: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
    bar: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    prep: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  };
  return colors[station] || colors.prep;
}
