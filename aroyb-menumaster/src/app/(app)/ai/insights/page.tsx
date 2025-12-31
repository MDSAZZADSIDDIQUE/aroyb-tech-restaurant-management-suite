'use client';

import { useEffect, useState } from 'react';
import { getItems, getModifierGroups, getInsights, saveInsights, updateItem } from '@/lib/storage';
import { runFullAnalysis } from '@/lib/ai/insights-engine';
import type { Item, ModifierGroup, InsightIssue } from '@/types';

export default function AIInsightsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [insights, setInsights] = useState<InsightIssue[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedItems = getItems();
    const loadedModifiers = getModifierGroups();
    setItems(loadedItems);
    setModifierGroups(loadedModifiers);
    
    // Run analysis
    const analysis = runFullAnalysis(loadedItems, loadedModifiers);
    setInsights(analysis);
    setLoading(false);
  }, []);
  
  const handleDismiss = (id: string) => {
    setInsights(insights.map(i => i.id === id ? { ...i, dismissed: true } : i));
  };
  
  const handleAutoFix = (issue: InsightIssue) => {
    if (issue.type === 'modifier_mismatch' && issue.suggestedFix?.includes('Spice Level')) {
      issue.affectedItemIds.forEach(itemId => {
        const item = items.find(i => i.id === itemId);
        if (item && !item.modifierGroupIds.includes('mod-spice')) {
          updateItem(itemId, { modifierGroupIds: [...item.modifierGroupIds, 'mod-spice'] });
        }
      });
      setInsights(insights.filter(i => i.id !== issue.id));
      setItems(getItems());
    }
  };
  
  const activeInsights = insights.filter(i => !i.dismissed);
  const highCount = activeInsights.filter(i => i.severity === 'high').length;
  const medCount = activeInsights.filter(i => i.severity === 'medium').length;
  const lowCount = activeInsights.filter(i => i.severity === 'low').length;
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">🤖 AI Insights</h1>
      <p className="text-neutral-400 mb-6">Automated analysis of your menu for issues and inconsistencies</p>
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-400">{highCount}</div>
          <div className="text-sm text-neutral-400">High Priority</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-400">{medCount}</div>
          <div className="text-sm text-neutral-400">Medium Priority</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-400">{lowCount}</div>
          <div className="text-sm text-neutral-400">Low Priority</div>
        </div>
      </div>
      
      {activeInsights.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl mb-4 block">✅</span>
          <h2 className="text-xl font-bold text-green-400">No Issues Found</h2>
          <p className="text-neutral-400 mt-2">Your menu looks great!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeInsights.map(issue => (
            <div key={issue.id} className={`card border-l-4 ${issue.severity === 'high' ? 'border-l-red-500' : issue.severity === 'medium' ? 'border-l-amber-500' : 'border-l-green-500'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${issue.severity === 'high' ? 'severity-high' : issue.severity === 'medium' ? 'severity-medium' : 'severity-low'}`}>
                      {issue.severity}
                    </span>
                    <span className="tag bg-neutral-700">{issue.type.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="font-bold text-lg">{issue.title}</h3>
                  <p className="text-neutral-400 text-sm mt-1">{issue.description}</p>
                  
                  {issue.affectedItemIds.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-neutral-500">Affected items: </span>
                      <span className="text-xs">
                        {issue.affectedItemIds.slice(0, 3).map(id => items.find(i => i.id === id)?.name).filter(Boolean).join(', ')}
                        {issue.affectedItemIds.length > 3 && ` +${issue.affectedItemIds.length - 3} more`}
                      </span>
                    </div>
                  )}
                  
                  {issue.suggestedFix && (
                    <div className="mt-3 p-3 rounded-lg bg-neutral-800">
                      <span className="text-xs text-neutral-400">Suggested fix: </span>
                      <span className="text-sm">{issue.suggestedFix}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {issue.autoFixable && (
                    <button onClick={() => handleAutoFix(issue)} className="btn btn-success btn-sm">Auto-Fix</button>
                  )}
                  <button onClick={() => handleDismiss(issue.id)} className="btn btn-ghost btn-sm">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
