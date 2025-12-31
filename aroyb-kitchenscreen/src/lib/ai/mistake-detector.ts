// AI Mistake Detector - Detects patterns in remakes and generates insights

import type { RemakeLog, MistakeInsight, StationId, RemakeReason } from '@/types';
import { generateId, getStationName, remakeReasonLabels } from '@/lib/formatting';

export function detectMistakePatterns(remakeLogs: RemakeLog[]): MistakeInsight[] {
  if (remakeLogs.length === 0) return [];
  
  // Group by item name
  const itemGroups = new Map<string, RemakeLog[]>();
  remakeLogs.forEach(log => {
    const existing = itemGroups.get(log.itemName) || [];
    existing.push(log);
    itemGroups.set(log.itemName, existing);
  });
  
  const insights: MistakeInsight[] = [];
  
  itemGroups.forEach((logs, itemName) => {
    // Only flag if remade 2+ times
    if (logs.length < 2) return;
    
    // Count reasons
    const reasonCounts = new Map<RemakeReason, number>();
    const stationCounts = new Map<StationId, number>();
    
    logs.forEach(log => {
      reasonCounts.set(log.reason, (reasonCounts.get(log.reason) || 0) + 1);
      stationCounts.set(log.station, (stationCounts.get(log.station) || 0) + 1);
    });
    
    // Get primary reason
    let primaryReason: RemakeReason = 'other';
    let maxCount = 0;
    reasonCounts.forEach((count, reason) => {
      if (count > maxCount) {
        maxCount = count;
        primaryReason = reason;
      }
    });
    
    // Get primary station
    let affectedStation: StationId = 'grill';
    maxCount = 0;
    stationCounts.forEach((count, station) => {
      if (count > maxCount) {
        maxCount = count;
        affectedStation = station;
      }
    });
    
    // Generate suggestion
    const suggestion = generateSuggestion(itemName, primaryReason, logs.length);
    
    // Reason breakdown
    const reasonBreakdown = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
    
    insights.push({
      id: generateId('mi'),
      itemName,
      remakeCount: logs.length,
      primaryReason,
      reasonBreakdown,
      suggestion,
      affectedStation,
    });
  });
  
  // Sort by remake count descending
  return insights.sort((a, b) => b.remakeCount - a.remakeCount);
}

function generateSuggestion(itemName: string, primaryReason: RemakeReason, count: number): string {
  const reasonLabel = remakeReasonLabels[primaryReason].toLowerCase();
  
  switch (primaryReason) {
    case 'wrong_modifier':
      return `${itemName} remade ${count}× for ${reasonLabel}. Suggest adding modifier confirmation prompt on ticket acceptance.`;
    
    case 'missing_item':
      return `${itemName} remade ${count}× for ${reasonLabel}. Suggest adding checklist for sides/extras before bumping.`;
    
    case 'allergy_missed':
      return `⚠️ URGENT: ${itemName} remade ${count}× for ${reasonLabel}. Implement mandatory allergy check before cooking.`;
    
    case 'overcooked':
      return `${itemName} remade ${count}× for overcooking. Suggest timer reminder or temperature check.`;
    
    case 'undercooked':
      return `${itemName} remade ${count}× for undercooking. Review cooking time standards.`;
    
    case 'wrong_item':
      return `${itemName} remade ${count}× for wrong item sent. Improve ticket-to-plate matching process.`;
    
    default:
      return `${itemName} remade ${count}× today. Review preparation process.`;
  }
}

// Get summary stats for dashboard
export function getMistakeSummary(insights: MistakeInsight[]): {
  totalRemakes: number;
  mostProblematic: string | null;
  worstStation: StationId | null;
  urgentAllergyIssues: boolean;
} {
  if (insights.length === 0) {
    return { totalRemakes: 0, mostProblematic: null, worstStation: null, urgentAllergyIssues: false };
  }
  
  const totalRemakes = insights.reduce((sum, i) => sum + i.remakeCount, 0);
  const mostProblematic = insights[0]?.itemName || null;
  
  // Find worst station
  const stationCounts = new Map<StationId, number>();
  insights.forEach(insight => {
    stationCounts.set(
      insight.affectedStation, 
      (stationCounts.get(insight.affectedStation) || 0) + insight.remakeCount
    );
  });
  
  let worstStation: StationId | null = null;
  let maxCount = 0;
  stationCounts.forEach((count, station) => {
    if (count > maxCount) {
      maxCount = count;
      worstStation = station;
    }
  });
  
  // Check for allergy issues
  const urgentAllergyIssues = insights.some(i => i.primaryReason === 'allergy_missed');
  
  return { totalRemakes, mostProblematic, worstStation, urgentAllergyIssues };
}

// Format for display
export function formatInsightForDisplay(insight: MistakeInsight): {
  headline: string;
  detail: string;
  severity: 'warning' | 'critical';
} {
  const isAllergy = insight.primaryReason === 'allergy_missed';
  
  return {
    headline: `${insight.itemName} - ${insight.remakeCount} remakes`,
    detail: `Primary issue: ${remakeReasonLabels[insight.primaryReason]} at ${getStationName(insight.affectedStation)}`,
    severity: isAllergy || insight.remakeCount >= 4 ? 'critical' : 'warning',
  };
}
