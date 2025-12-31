// AI Ticket Prioritizer - Computes priority score based on time, complexity, and coordination

import type { Ticket, PriorityScore, PriorityLevel } from '@/types';
import menuItemsData from '@/data/menu-items.json';
import { getMinutesUntil } from '@/lib/formatting';

interface MenuItem {
  id: string;
  baseCookMinutes: number;
  complexityBase: number;
}

const menuItems = menuItemsData as MenuItem[];

function getMenuItemComplexity(menuItemId: string): number {
  const item = menuItems.find(i => i.id === menuItemId);
  return item?.complexityBase || 2;
}

export function calculatePriority(ticket: Ticket, kitchenLoad: number = 50): PriorityScore {
  // Factor 1: Time to Promise (40% weight)
  const minsToPromise = getMinutesUntil(ticket.promisedAt);
  let timeScore = 0;
  if (minsToPromise < 0) timeScore = 100; // Already late
  else if (minsToPromise <= 5) timeScore = 90;
  else if (minsToPromise <= 10) timeScore = 70;
  else if (minsToPromise <= 15) timeScore = 50;
  else if (minsToPromise <= 20) timeScore = 30;
  else timeScore = 10;

  // Factor 2: Complexity (30% weight)
  const totalItems = ticket.items.reduce((sum, item) => sum + item.quantity, 0);
  const avgComplexity = ticket.items.reduce((sum, item) => 
    sum + getMenuItemComplexity(item.menuItemId) * item.quantity, 0
  ) / Math.max(totalItems, 1);
  
  const totalModifiers = ticket.items.reduce((sum, item) => 
    sum + item.modifiers.length + item.addOns.length, 0
  );
  
  const complexityScore = Math.min(
    ((avgComplexity / 5) * 40) + 
    (Math.min(totalItems, 8) / 8 * 30) + 
    (Math.min(totalModifiers, 10) / 10 * 30),
    100
  );

  // Factor 3: Coordination (30% weight)
  const stationCount = ticket.stationAssignments.length;
  const coordinationScore = Math.min(stationCount * 25, 100);

  // Kitchen load influence
  const loadMultiplier = 1 + (kitchenLoad / 200); // 1.0 - 1.5x

  // Final score
  const rawScore = (timeScore * 0.4 + complexityScore * 0.3 + coordinationScore * 0.3) * loadMultiplier;
  const score = Math.min(Math.round(rawScore), 100);

  // Determine level
  let level: PriorityLevel;
  if (score >= 70) level = 'high';
  else if (score >= 40) level = 'medium';
  else level = 'low';

  // Generate explanation
  const explanationParts: string[] = [];
  
  if (minsToPromise < 0) {
    explanationParts.push(`${Math.abs(minsToPromise)}min late`);
  } else if (minsToPromise <= 10) {
    explanationParts.push(`promised in ${minsToPromise}min`);
  }
  
  if (avgComplexity >= 3 || totalItems >= 4) {
    explanationParts.push(`${totalItems} complex items`);
  }
  
  if (stationCount >= 3) {
    explanationParts.push(`${stationCount} stations coordinating`);
  }
  
  if (totalModifiers >= 4) {
    explanationParts.push(`${totalModifiers} modifiers`);
  }

  const explanation = explanationParts.length > 0 
    ? `${level.toUpperCase()}: ${explanationParts.join(', ')}`
    : `${level.toUpperCase()} priority`;

  return {
    level,
    score,
    explanation,
    factors: {
      timeToPromise: Math.round(timeScore),
      complexity: Math.round(complexityScore),
      coordination: Math.round(coordinationScore),
    },
  };
}

export function sortTicketsByPriority(tickets: Ticket[], kitchenLoad: number = 50): Ticket[] {
  return tickets
    .map(ticket => ({
      ticket,
      priority: calculatePriority(ticket, kitchenLoad),
    }))
    .sort((a, b) => b.priority.score - a.priority.score)
    .map(({ ticket, priority }) => ({
      ...ticket,
      priority,
    }));
}
