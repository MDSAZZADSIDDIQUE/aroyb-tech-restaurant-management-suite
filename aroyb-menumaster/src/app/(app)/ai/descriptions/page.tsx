'use client';

import { useEffect, useState } from 'react';
import { getItems, getBrandVoice, saveBrandVoice, updateItem } from '@/lib/storage';
import { generateDescriptionSuggestions, getTonePreview } from '@/lib/ai/description-engine';
import { brandToneConfig } from '@/lib/formatting';
import type { Item, BrandVoiceSettings, DescriptionSuggestion, BrandTone } from '@/types';

export default function AIDescriptionsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [brandVoice, setBrandVoice] = useState<BrandVoiceSettings | null>(null);
  const [suggestions, setSuggestions] = useState<DescriptionSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedItems = getItems();
    const loadedBrandVoice = getBrandVoice();
    setItems(loadedItems);
    setBrandVoice(loadedBrandVoice);
    
    // Generate suggestions
    const generated = generateDescriptionSuggestions(loadedItems, loadedBrandVoice);
    setSuggestions(generated);
    setLoading(false);
  }, []);
  
  const handleToneChange = (tone: BrandTone) => {
    const newSettings = { ...brandVoice!, tone };
    setBrandVoice(newSettings);
    saveBrandVoice(newSettings);
    
    // Regenerate suggestions
    const generated = generateDescriptionSuggestions(items, newSettings);
    setSuggestions(generated);
  };
  
  const handleApprove = (suggestion: DescriptionSuggestion) => {
    updateItem(suggestion.itemId, { description: suggestion.suggestedDescription });
    setItems(getItems());
    setSuggestions(suggestions.map(s => s.id === suggestion.id ? { ...s, approved: true } : s));
  };
  
  const handleReject = (id: string) => {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, rejected: true } : s));
  };
  
  const handleRegenerate = () => {
    if (!brandVoice) return;
    const generated = generateDescriptionSuggestions(items, brandVoice);
    setSuggestions(generated);
  };
  
  const activeSuggestions = suggestions.filter(s => !s.approved && !s.rejected);
  
  if (loading || !brandVoice) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">✍️ AI Description Generator</h1>
      <p className="text-neutral-400 mb-6">Generate compelling descriptions for your menu items</p>
      
      {/* Brand Voice Settings */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">Brand Voice</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(brandToneConfig) as [BrandTone, { label: string; description: string }][]).map(([tone, cfg]) => (
            <button
              key={tone}
              onClick={() => handleToneChange(tone)}
              className={`p-4 rounded-lg text-left transition-all ${brandVoice.tone === tone ? 'bg-[#ed7424] text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}
            >
              <div className="font-bold">{cfg.label}</div>
              <div className="text-xs opacity-70">{cfg.description}</div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-4 rounded-lg bg-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">Preview:</div>
          <p className="italic text-neutral-300">"{getTonePreview(brandVoice.tone)}"</p>
        </div>
        
        <div className="flex items-center gap-6 mt-4">
          <label className="flex items-center gap-2">
            <button onClick={() => setBrandVoice({ ...brandVoice, taglineStyle: !brandVoice.taglineStyle })} className={`toggle ${brandVoice.taglineStyle ? 'active' : ''}`}></button>
            <span className="text-sm">Tagline style (shorter)</span>
          </label>
          <label className="flex items-center gap-2">
            <button onClick={() => setBrandVoice({ ...brandVoice, includeIngredients: !brandVoice.includeIngredients })} className={`toggle ${brandVoice.includeIngredients ? 'active' : ''}`}></button>
            <span className="text-sm">Include ingredients</span>
          </label>
        </div>
      </div>
      
      {/* Generation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-neutral-400">{activeSuggestions.length} items need descriptions</span>
        </div>
        <button onClick={handleRegenerate} className="btn btn-primary">🔄 Regenerate</button>
      </div>
      
      {activeSuggestions.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl mb-4 block">✅</span>
          <h2 className="text-xl font-bold">All Items Have Descriptions</h2>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSuggestions.map(s => {
            const item = items.find(i => i.id === s.itemId);
            return (
              <div key={s.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item?.name}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="p-3 rounded-lg bg-neutral-800">
                        <div className="text-xs text-neutral-400 mb-1">Current description:</div>
                        <p className="text-sm">{s.originalDescription || <span className="text-neutral-500 italic">No description</span>}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="text-xs text-green-400 mb-1">AI suggested:</div>
                        <p className="text-sm">{s.suggestedDescription}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleApprove(s)} className="btn btn-success btn-sm">Use This</button>
                    <button onClick={() => handleReject(s.id)} className="btn btn-ghost btn-sm">Skip</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
