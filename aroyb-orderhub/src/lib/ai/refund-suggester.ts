// AI Refund Suggestion Engine
import type { Order, RefundSuggestion, RefundReason } from '@/types';

interface IssueContext {
  type: RefundReason;
  affectedItemIds?: string[];
  severity: 'minor' | 'moderate' | 'severe';
  description?: string;
}

// Calculate refund amount based on issue
function calculateRefundAmount(order: Order, context: IssueContext): number {
  if (context.severity === 'severe') {
    return order.totals.total;
  }
  
  if (context.affectedItemIds && context.affectedItemIds.length > 0) {
    const affectedTotal = order.items
      .filter(i => context.affectedItemIds!.includes(i.id))
      .reduce((sum, i) => sum + (i.price * i.quantity), 0);
    return affectedTotal;
  }
  
  // Moderate issues get partial refund
  if (context.severity === 'moderate') {
    return order.totals.total * 0.3;
  }
  
  // Minor issues get small goodwill
  return Math.min(5, order.totals.total * 0.1);
}

// Generate customer message
function generateCustomerMessage(context: IssueContext, suggestion: RefundSuggestion): string {
  const messages: Record<RefundReason, string> = {
    missing_item: `We apologise that your order was incomplete. We've processed a ${suggestion.type === 'full_refund' ? 'full' : 'partial'} refund of £${suggestion.amount?.toFixed(2)} for the missing item(s).`,
    wrong_item: `We're sorry you received the wrong item. A ${suggestion.type === 'full_refund' ? 'full' : 'partial'} refund of £${suggestion.amount?.toFixed(2)} has been processed.`,
    late_delivery: `We apologise for the late delivery. ${suggestion.type === 'voucher' ? `Here's a £${suggestion.voucherValue} voucher for your next order.` : `A refund of £${suggestion.amount?.toFixed(2)} has been issued.`}`,
    quality_issue: `We're sorry to hear about the quality of your order. ${suggestion.type === 'remake' ? 'We\'d like to remake this for you.' : `A refund of £${suggestion.amount?.toFixed(2)} has been processed.`}`,
    customer_request: `As requested, we've processed a ${suggestion.type === 'full_refund' ? 'full' : 'partial'} refund of £${suggestion.amount?.toFixed(2)}.`,
    other: `We apologise for any inconvenience. ${suggestion.type === 'voucher' ? `Here's a £${suggestion.voucherValue} voucher for your next order.` : `We've issued a goodwill refund of £${suggestion.amount?.toFixed(2)}.`}`,
  };
  
  return messages[context.type] || messages.other;
}

// Generate reasoning
function generateReasoning(order: Order, context: IssueContext): string {
  const parts: string[] = [];
  
  parts.push(`Issue type: ${context.type.replace(/_/g, ' ')}`);
  parts.push(`Severity: ${context.severity}`);
  parts.push(`Order value: £${order.totals.total.toFixed(2)}`);
  
  if (context.affectedItemIds && context.affectedItemIds.length > 0) {
    const affectedNames = order.items
      .filter(i => context.affectedItemIds!.includes(i.id))
      .map(i => i.name);
    parts.push(`Affected items: ${affectedNames.join(', ')}`);
  }
  
  return parts.join('. ');
}

// Main suggestion function
export function suggestRefundResolution(
  order: Order,
  context: IssueContext
): RefundSuggestion {
  let suggestion: RefundSuggestion;
  
  // Determine best resolution based on issue
  switch (context.type) {
    case 'missing_item':
      if (context.affectedItemIds && context.affectedItemIds.length > 0) {
        const amount = calculateRefundAmount(order, context);
        suggestion = {
          type: 'partial_refund',
          amount,
          message: '',
          reasoning: generateReasoning(order, context),
        };
      } else {
        suggestion = {
          type: 'voucher',
          voucherValue: 5,
          message: '',
          reasoning: generateReasoning(order, context),
        };
      }
      break;
      
    case 'wrong_item':
      suggestion = {
        type: 'remake',
        message: '',
        reasoning: generateReasoning(order, context),
      };
      break;
      
    case 'late_delivery':
      if (context.severity === 'severe') {
        suggestion = {
          type: 'full_refund',
          amount: order.totals.total,
          message: '',
          reasoning: generateReasoning(order, context),
        };
      } else {
        suggestion = {
          type: 'voucher',
          voucherValue: context.severity === 'moderate' ? 10 : 5,
          message: '',
          reasoning: generateReasoning(order, context),
        };
      }
      break;
      
    case 'quality_issue':
      if (context.severity === 'severe') {
        suggestion = {
          type: 'full_refund',
          amount: order.totals.total,
          message: '',
          reasoning: generateReasoning(order, context),
        };
      } else {
        suggestion = {
          type: 'partial_refund',
          amount: calculateRefundAmount(order, context),
          message: '',
          reasoning: generateReasoning(order, context),
        };
      }
      break;
      
    default:
      suggestion = {
        type: 'apology',
        message: '',
        reasoning: generateReasoning(order, context),
      };
  }
  
  // Generate customer message
  suggestion.message = generateCustomerMessage(context, suggestion);
  
  return suggestion;
}

// Quick issue detection from keywords
export function detectIssueType(description: string): IssueContext {
  const lower = description.toLowerCase();
  
  if (lower.includes('missing') || lower.includes('forgot') || lower.includes('not included')) {
    return { type: 'missing_item', severity: 'moderate' };
  }
  
  if (lower.includes('wrong') || lower.includes('incorrect') || lower.includes('different')) {
    return { type: 'wrong_item', severity: 'moderate' };
  }
  
  if (lower.includes('late') || lower.includes('hour') || lower.includes('waiting')) {
    return { type: 'late_delivery', severity: lower.includes('hour') ? 'severe' : 'moderate' };
  }
  
  if (lower.includes('cold') || lower.includes('stale') || lower.includes('quality') || lower.includes('taste')) {
    return { type: 'quality_issue', severity: 'moderate' };
  }
  
  return { type: 'other', severity: 'minor' };
}
