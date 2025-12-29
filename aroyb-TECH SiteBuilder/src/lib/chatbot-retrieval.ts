import { FAQEntry } from '@/types';
import faqData from '@/data/faq-kb.json';

interface ChatResponse {
  answer: string;
  sources: FAQEntry[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Tokenize a string into lowercase words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

/**
 * Calculate similarity score between query and FAQ entry
 */
function calculateSimilarity(queryTokens: string[], entry: FAQEntry): number {
  let score = 0;
  const entryTokens = [
    ...entry.keywords,
    ...tokenize(entry.question),
  ];

  for (const queryToken of queryTokens) {
    // Direct keyword match (high score)
    if (entry.keywords.some(kw => kw.includes(queryToken) || queryToken.includes(kw))) {
      score += 3;
    }
    
    // Question contains word (medium score)
    if (entry.question.toLowerCase().includes(queryToken)) {
      score += 2;
    }
    
    // Answer contains word (low score)
    if (entry.answer.toLowerCase().includes(queryToken)) {
      score += 1;
    }
  }

  // Normalize by query length
  return score / Math.max(queryTokens.length, 1);
}

/**
 * Retrieve relevant FAQ entries for a query
 */
export function retrieveFAQs(query: string, topK: number = 3): FAQEntry[] {
  const entries = faqData.entries as FAQEntry[];
  const queryTokens = tokenize(query);
  
  if (queryTokens.length === 0) {
    return [];
  }

  // Score all entries
  const scored = entries.map(entry => ({
    entry,
    score: calculateSimilarity(queryTokens, entry),
  }));

  // Sort by score and take top K
  scored.sort((a, b) => b.score - a.score);
  
  // Only return entries with positive scores
  return scored
    .filter(s => s.score > 0)
    .slice(0, topK)
    .map(s => s.entry);
}

/**
 * Generate a response based on retrieved FAQs
 */
export function generateResponse(query: string): ChatResponse {
  const relevantFAQs = retrieveFAQs(query, 2);
  
  if (relevantFAQs.length === 0) {
    return {
      answer: "I'm not certain about that—please call the restaurant directly and our team will be happy to help. You can reach us at the number shown in the footer.",
      sources: [],
      confidence: 'low',
    };
  }

  // If we have a very good match, use that answer directly
  const queryTokens = tokenize(query);
  const topScore = calculateSimilarity(queryTokens, relevantFAQs[0]);
  
  if (topScore >= 3) {
    return {
      answer: relevantFAQs[0].answer,
      sources: relevantFAQs.slice(0, 1),
      confidence: 'high',
    };
  }

  // If we have partial matches, combine relevant info
  if (relevantFAQs.length >= 1) {
    // Use the top answer but indicate lower confidence
    return {
      answer: relevantFAQs[0].answer,
      sources: relevantFAQs,
      confidence: topScore >= 2 ? 'medium' : 'low',
    };
  }

  return {
    answer: "I'm not certain about that—please call the restaurant directly for more information.",
    sources: [],
    confidence: 'low',
  };
}

/**
 * Get custom FAQ entries from localStorage (admin additions)
 */
export function getCustomFAQs(): FAQEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('aroyb-custom-faqs');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Save custom FAQ entries to localStorage
 */
export function saveCustomFAQs(entries: FAQEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('aroyb-custom-faqs', JSON.stringify(entries));
}

/**
 * Add a custom FAQ entry
 */
export function addCustomFAQ(entry: FAQEntry): void {
  const current = getCustomFAQs();
  current.push(entry);
  saveCustomFAQs(current);
}

/**
 * Remove a custom FAQ entry by ID
 */
export function removeCustomFAQ(id: string): void {
  const current = getCustomFAQs();
  const filtered = current.filter(e => e.id !== id);
  saveCustomFAQs(filtered);
}

/**
 * Get all FAQ entries (built-in + custom)
 */
export function getAllFAQs(): FAQEntry[] {
  const builtIn = faqData.entries as FAQEntry[];
  const custom = getCustomFAQs();
  return [...builtIn, ...custom];
}

/**
 * Format chat history for display
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: FAQEntry[];
  confidence?: 'high' | 'medium' | 'low';
  timestamp: Date;
}

/**
 * Generate greeting message
 */
export function getGreetingMessage(): ChatMessage {
  return {
    id: 'greeting',
    role: 'assistant',
    content: "Hello! 👋 I'm here to help with any questions about Aroyb Grill & Curry. Ask me about delivery, menu items, allergens, opening hours, or anything else!",
    timestamp: new Date(),
  };
}

/**
 * Process user message and generate response
 */
export function processUserMessage(message: string): ChatMessage {
  const response = generateResponse(message);
  
  let answer = response.answer;
  
  // Add confidence indicator for low confidence
  if (response.confidence === 'low' && response.sources.length > 0) {
    answer = `Based on what I know: ${answer}\n\nIf this doesn't fully answer your question, please call us directly.`;
  }
  
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: answer,
    sources: response.sources,
    confidence: response.confidence,
    timestamp: new Date(),
  };
}
