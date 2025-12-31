'use client';

import { useEffect, useState } from 'react';
import { getSalesData, getGeneratorSuggestions, saveGeneratorSuggestions } from '@/lib/storage';
import { identifySlowPeriods, generatePromoSuggestions } from '@/lib/ai/generator';
import { promoTypeConfig, dayConfig } from '@/lib/formatting';
import type { GeneratorSuggestion } from '@/types';

export default function AIGeneratorPage() {
  const [suggestions, setSuggestions] = useState<GeneratorSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  useEffect(() => {
    setSuggestions(getGeneratorSuggestions());
    setLoading(false);
  }, []);
  
  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const salesData = getSalesData();
      const slowPeriods = identifySlowPeriods(salesData);
      const newSuggestions = generatePromoSuggestions(slowPeriods);
      setSuggestions(newSuggestions);
      saveGeneratorSuggestions(newSuggestions);
      setGenerating(false);
    }, 1500); // Simulate AI processing
  };
  
  const handleApprove = (id: string) => {
    const updated = suggestions.map(s => s.id === id ? { ...s, status: 'approved' as const } : s);
    setSuggestions(updated);
    saveGeneratorSuggestions(updated);
  };
  
  const handleReject = (id: string) => {
    const updated = suggestions.map(s => s.id === id ? { ...s, status: 'rejected' as const } : s);
    setSuggestions(updated);
    saveGeneratorSuggestions(updated);
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const pending = suggestions.filter(s => s.status === 'pending');
  const approved = suggestions.filter(s => s.status === 'approved');
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🤖 AI Promo Generator</h1>
          <p className="text-neutral-400 text-sm">Identify slow periods and generate targeted promos</p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn btn-primary">
          {generating ? '⏳ Analyzing...' : '✨ Generate Ideas'}
        </button>
      </div>
      
      {suggestions.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl mb-4 block">🔮</span>
          <h2 className="text-xl font-bold mb-2">No suggestions yet</h2>
          <p className="text-neutral-400 mb-6">Click &quot;Generate Ideas&quot; to analyze your sales data and create targeted promo suggestions</p>
          <button onClick={handleGenerate} disabled={generating} className="btn btn-primary">
            {generating ? '⏳ Analyzing...' : '✨ Generate Ideas'}
          </button>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="font-bold mb-4">Pending Review ({pending.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pending.map(suggestion => (
                  <div key={suggestion.id} className="card border-amber-500/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-lg mr-2">{promoTypeConfig[suggestion.promoType].icon}</span>
                        <span className="font-bold">{suggestion.suggestedName}</span>
                      </div>
                      <span className="badge bg-amber-500/20 text-amber-400">{suggestion.confidence}% confidence</span>
                    </div>
                    
                    <div className="text-sm space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Target:</span>
                        <span>{dayConfig[suggestion.targetPeriod.dayOfWeek].label} {suggestion.targetPeriod.startHour}:00 - {suggestion.targetPeriod.endHour}:00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">Expected Lift:</span>
                        <span className="text-green-400">+{suggestion.estimatedLift}%</span>
                      </div>
                      <div className="text-neutral-400 text-xs mt-2">{suggestion.explanation}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(suggestion.id)} className="btn btn-success btn-sm flex-1">✓ Approve</button>
                      <button onClick={() => handleReject(suggestion.id)} className="btn btn-ghost btn-sm flex-1">✗ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Approved */}
          {approved.length > 0 && (
            <div>
              <h2 className="font-bold mb-4">Approved ({approved.length})</h2>
              <div className="space-y-2">
                {approved.map(suggestion => (
                  <div key={suggestion.id} className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{promoTypeConfig[suggestion.promoType].icon}</span>
                      <span className="font-medium">{suggestion.suggestedName}</span>
                    </div>
                    <span className="badge bg-green-500/20 text-green-400">Approved</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
