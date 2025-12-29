// AI Risk Scoring Engine
import type { Order, RiskAssessment, RiskLevel } from '@/types';

interface RiskFactors {
  highValue: boolean;
  farZone: boolean;
  noHistory: boolean;
  paymentAttempts: boolean;
  unusualQuantity: boolean;
}

// Calculate risk score (0-100)
function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;
  
  if (factors.highValue) score += 25;
  if (factors.farZone) score += 20;
  if (factors.noHistory) score += 15;
  if (factors.paymentAttempts) score += 30;
  if (factors.unusualQuantity) score += 10;
  
  return Math.min(score, 100);
}

// Get risk level from score
function getRiskLevel(score: number): RiskLevel {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// Generate risk reasons
function generateReasons(order: Order, factors: RiskFactors): string[] {
  const reasons: string[] = [];
  
  if (factors.highValue) {
    reasons.push(`Very high order value (£${order.totals.total.toFixed(2)})`);
  }
  
  if (factors.farZone && order.deliveryAddress?.distance) {
    reasons.push(`Far delivery zone (${order.deliveryAddress.distance} miles)`);
  }
  
  if (factors.noHistory) {
    reasons.push('No prior order history');
  }
  
  if (factors.paymentAttempts) {
    reasons.push(`Multiple payment attempts (${order.paymentAttempts})`);
  }
  
  if (factors.unusualQuantity) {
    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
    reasons.push(`Unusual quantity (${totalQty} items)`);
  }
  
  return reasons;
}

// Get recommended action
function getRecommendedAction(level: RiskLevel, reasons: string[]): string | undefined {
  if (level === 'high') {
    if (reasons.some(r => r.includes('payment attempts'))) {
      return 'Require prepayment or card verification';
    }
    return 'Confirm order by phone before preparation';
  }
  
  if (level === 'medium') {
    return 'Consider phone verification for first-time customer';
  }
  
  return undefined;
}

// Main risk assessment function
export function assessOrderRisk(order: Order): RiskAssessment {
  // Identify risk factors
  const factors: RiskFactors = {
    highValue: order.totals.total > 100,
    farZone: (order.deliveryAddress?.distance || 0) > 5,
    noHistory: true, // In demo, assume new customers for high-value/far orders
    paymentAttempts: order.paymentAttempts > 2,
    unusualQuantity: order.items.reduce((sum, i) => sum + i.quantity, 0) > 10,
  };
  
  // For demo: only flag as new if high value or far
  if (!factors.highValue && !factors.farZone) {
    factors.noHistory = false;
  }
  
  const score = calculateRiskScore(factors);
  const level = getRiskLevel(score);
  const reasons = generateReasons(order, factors);
  const recommendedAction = getRecommendedAction(level, reasons);
  
  return {
    score,
    level,
    reasons,
    recommendedAction,
  };
}
