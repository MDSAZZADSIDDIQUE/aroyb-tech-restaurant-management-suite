'use client';

import { useEffect, useState } from 'react';
import { getPromos, getOptimisationSuggestions, saveOptimisationSuggestions } from '@/lib/storage';
import { generateOptimisationSuggestions, simulateWeek } from '@/lib/ai/optimiser';
import type { OptimisationSuggestion, Promo } from '@/types';

const recommendationIcons: Record<string, string> = {
  increase_discount: '📈',
  decrease_discount: '📉',
  tighten_basket: '🛒',
  expand_items: '📦',
  adjust_schedule: '📅',
};

export default function AIOptimiserPage() {
  const [suggestions, setSuggestions] = useState<OptimisationSuggestion[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  
  useEffect(() => {
    setSuggestions(getOptimisationSuggestions());
    setPromos(getPromos());
    setLoading(false);
  }, []);
  
  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const newSuggestions = generateOptimisationSuggestions(promos);
      setSuggestions(newSuggestions);
      saveOptimisationSuggestions(newSuggestions);
      setAnalyzing(false);
    }, 1500);
  };
  
  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      // Just visual feedback for demo
      setSimulating(false);
    }, 2000);
  };
  
  const handleApprove = (id: string) => {
    const updated = suggestions.map(s => s.id === id ? { ...s, status: 'approved' as const } : s);
    setSuggestions(updated);
    saveOptimisationSuggestions(updated);
  };
  
  const handleReject = (id: string) => {
    const updated = suggestions.map(s => s.id === id ? { ...s, status: 'rejected' as const } : s);
    setSuggestions(updated);
    saveOptimisationSuggestions(updated);
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const pending = suggestions.filter(s => s.status === 'pending');
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">⚡ AI Optimiser</h1>
          <p className="text-neutral-400 text-sm">Performance recommendations for active promos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSimulate} disabled={simulating} className="btn btn-secondary">
            {simulating ? '⏳ Simulating...' : '🔮 Simulate Week'}
          </button>
          <button onClick={handleAnalyze} disabled={analyzing} className="btn btn-primary">
            {analyzing ? '⏳ Analyzing...' : '🔍 Analyze Promos'}
          </button>
        </div>
      </div>
      
      {suggestions.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl mb-4 block">⚡</span>
          <h2 className="text-xl font-bold mb-2">No recommendations yet</h2>
          <p className="text-neutral-400 mb-6">Click &quot;Analyze Promos&quot; to get AI-powered optimization suggestions</p>
          <button onClick={handleAnalyze} disabled={analyzing} className="btn btn-primary">
            {analyzing ? '⏳ Analyzing...' : '🔍 Analyze Promos'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className={`card ${suggestion.status === 'pending' ? 'border-blue-500/30' : suggestion.status === 'approved' ? 'border-green-500/30' : 'border-neutral-700'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{recommendationIcons[suggestion.recommendation] || '💡'}</span>
                  <div>
                    <div className="font-bold">{suggestion.promoName}</div>
                    <div className="text-sm text-neutral-400">{suggestion.recommendation.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                <span className={`badge ${suggestion.status === 'pending' ? 'bg-blue-500/20 text-blue-400' : suggestion.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-500/20 text-neutral-400'}`}>
                  {suggestion.confidence}% confidence
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-neutral-800 mb-4">
                <div>
                  <div className="text-xs text-neutral-400 mb-1">Current</div>
                  <div className="font-medium">{suggestion.currentValue}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-neutral-400 mb-1">→</div>
                  <div className="text-[#ed7424]">Suggested</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-400 mb-1">Proposed</div>
                  <div className="font-medium text-green-400">{suggestion.suggestedValue}</div>
                </div>
              </div>
              
              <div className="text-sm text-neutral-400 mb-4">
                <div>{suggestion.reason}</div>
                <div className="text-green-400 mt-1">Expected: {suggestion.expectedImpact}</div>
              </div>
              
              {suggestion.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(suggestion.id)} className="btn btn-success btn-sm">✓ Apply Change</button>
                  <button onClick={() => handleReject(suggestion.id)} className="btn btn-ghost btn-sm">✗ Dismiss</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
