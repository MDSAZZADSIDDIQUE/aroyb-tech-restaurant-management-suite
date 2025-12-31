'use client';

import { useEffect, useState } from 'react';
import { getItems, getPricingSuggestions, savePricingSuggestions, updateItem } from '@/lib/storage';
import { generatePricingSuggestions } from '@/lib/ai/pricing-engine';
import { formatCurrency } from '@/lib/formatting';
import type { Item, PricingSuggestion } from '@/types';

export default function AIPricingPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedItems = getItems();
    setItems(loadedItems);
    
    // Generate suggestions
    const generated = generatePricingSuggestions(loadedItems);
    setSuggestions(generated);
    setLoading(false);
  }, []);
  
  const handleApprove = (suggestion: PricingSuggestion) => {
    if (suggestion.type === 'price_increase' || suggestion.type === 'price_decrease') {
      suggestion.itemIds.forEach(itemId => {
        if (suggestion.suggestedValue) {
          updateItem(itemId, { basePrice: suggestion.suggestedValue });
        }
      });
      setItems(getItems());
    }
    setSuggestions(suggestions.map(s => s.id === suggestion.id ? { ...s, approved: true } : s));
  };
  
  const handleReject = (id: string) => {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, rejected: true } : s));
  };
  
  const activeSuggestions = suggestions.filter(s => !s.approved && !s.rejected);
  const approvedSuggestions = suggestions.filter(s => s.approved);
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">💰 AI Pricing Suggestions</h1>
      <p className="text-neutral-400 mb-6">Optimize your menu pricing based on margins and popularity</p>
      
      {activeSuggestions.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl mb-4 block">✅</span>
          <h2 className="text-xl font-bold">All Caught Up</h2>
          <p className="text-neutral-400 mt-2">No new pricing suggestions</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {activeSuggestions.map(s => (
            <div key={s.id} className={`card border-l-4 ${s.type === 'price_increase' ? 'border-l-green-500' : s.type === 'price_decrease' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${s.type === 'price_increase' ? 'bg-green-500/20 text-green-400' : s.type === 'price_decrease' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {s.type === 'price_increase' ? '📈 Increase' : s.type === 'price_decrease' ? '📉 Decrease' : '🎁 Bundle'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{s.title}</h3>
                  <p className="text-neutral-400 text-sm mt-1">{s.description}</p>
                  
                  {s.currentValue && s.suggestedValue && (
                    <div className="mt-3 flex items-center gap-4">
                      <div className="p-2 rounded bg-neutral-800">
                        <span className="text-xs text-neutral-400">Current: </span>
                        <span className="font-semibold">{formatCurrency(s.currentValue)}</span>
                      </div>
                      <span>→</span>
                      <div className="p-2 rounded bg-green-500/20">
                        <span className="text-xs text-neutral-400">Suggested: </span>
                        <span className="font-bold text-green-400">{formatCurrency(s.suggestedValue)}</span>
                      </div>
                    </div>
                  )}
                  
                  <p className="mt-3 text-sm text-neutral-500">💡 {s.expectedImpact}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleApprove(s)} className="btn btn-success btn-sm">Approve</button>
                  <button onClick={() => handleReject(s.id)} className="btn btn-ghost btn-sm">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {approvedSuggestions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">✅ Applied Suggestions</h2>
          <div className="space-y-2">
            {approvedSuggestions.map(s => (
              <div key={s.id} className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                <span>{s.title}</span>
                <span className="badge bg-green-500/20 text-green-400">Applied</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
