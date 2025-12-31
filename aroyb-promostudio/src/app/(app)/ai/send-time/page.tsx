'use client';

import { useEffect, useState } from 'react';
import { getPromos, getEngagementData, getSendTimeSuggestions, saveSendTimeSuggestions } from '@/lib/storage';
import { findBestSendTimes, generateSendTimeSuggestion, formatSendTime, getMessageGuidance, SEGMENTS } from '@/lib/ai/send-time';
import { dayConfig } from '@/lib/formatting';
import type { SendTimeSuggestion, Promo } from '@/types';

export default function AISendTimePage() {
  const [suggestions, setSuggestions] = useState<SendTimeSuggestion[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState('new');
  const [selectedPromo, setSelectedPromo] = useState('');
  const [generating, setGenerating] = useState(false);
  
  useEffect(() => {
    setSuggestions(getSendTimeSuggestions());
    setPromos(getPromos().filter(p => p.status === 'active'));
    setLoading(false);
  }, []);
  
  const handleGenerate = () => {
    if (!selectedPromo) return;
    setGenerating(true);
    setTimeout(() => {
      const engagementData = getEngagementData();
      const suggestion = generateSendTimeSuggestion(selectedSegment, selectedPromo, engagementData);
      if (suggestion) {
        const updated = [...suggestions.filter(s => !(s.segment === selectedSegment && s.promoId === selectedPromo)), suggestion];
        setSuggestions(updated);
        saveSendTimeSuggestions(updated);
      }
      setGenerating(false);
    }, 1000);
  };
  
  const latestSuggestion = suggestions.find(s => s.segment === selectedSegment && s.promoId === selectedPromo);
  const guidance = latestSuggestion ? getMessageGuidance(latestSuggestion.channel) : null;
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📬 AI Send-Time Planner</h1>
          <p className="text-neutral-400 text-sm">Optimal send times by customer segment</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="card">
          <h2 className="font-bold mb-4">Configure</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Segment</label>
              <div className="grid grid-cols-2 gap-2">
                {SEGMENTS.map(seg => (
                  <button key={seg.id} onClick={() => setSelectedSegment(seg.id)} className={`btn btn-sm ${selectedSegment === seg.id ? 'btn-primary' : 'btn-secondary'}`}>
                    {seg.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                {SEGMENTS.find(s => s.id === selectedSegment)?.description}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Promo to Promote</label>
              <select value={selectedPromo} onChange={e => setSelectedPromo(e.target.value)} className="select">
                <option value="">Select a promo...</option>
                {promos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <button onClick={handleGenerate} disabled={generating || !selectedPromo} className="btn btn-primary w-full">
              {generating ? '⏳ Analyzing...' : '✨ Get Recommendation'}
            </button>
          </div>
        </div>
        
        {/* Recommendation */}
        <div className="card lg:col-span-2">
          <h2 className="font-bold mb-4">Recommendation</h2>
          
          {!latestSuggestion ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">🎯</span>
              <p className="text-neutral-400">Select a segment and promo to get a recommendation</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#ed7424]/20 to-[#e1ac13]/20 border border-[#ed7424]/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {latestSuggestion.channel === 'email' ? '📧' : latestSuggestion.channel === 'sms' ? '💬' : '🔔'}
                    </span>
                    <div>
                      <div className="font-bold text-lg">{latestSuggestion.channel.toUpperCase()}</div>
                      <div className="text-sm text-neutral-400">{SEGMENTS.find(s => s.id === latestSuggestion.segment)?.name}</div>
                    </div>
                  </div>
                  <span className="badge bg-green-500/20 text-green-400">{latestSuggestion.confidence}% confidence</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-neutral-800">
                    <div className="text-xs text-neutral-400 mb-1">Best Time</div>
                    <div className="font-bold text-lg">{formatSendTime(latestSuggestion.recommendedDay, latestSuggestion.recommendedHour)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-800">
                    <div className="text-xs text-neutral-400 mb-1">Backup Time</div>
                    <div className="font-medium">{formatSendTime(latestSuggestion.backupDay, latestSuggestion.backupHour)}</div>
                  </div>
                </div>
                
                <div className="text-sm text-neutral-400 mt-4">{latestSuggestion.explanation}</div>
              </div>
              
              {guidance && (
                <div>
                  <h3 className="font-medium mb-3">Message Guidelines</h3>
                  <div className="p-4 rounded-lg bg-neutral-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-neutral-400">Max length:</span>
                      <span className="font-mono">{guidance.maxLength} chars</span>
                    </div>
                    <ul className="text-sm text-neutral-400 space-y-1">
                      {guidance.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Previous Recommendations */}
      {suggestions.length > 0 && (
        <div className="card mt-6">
          <h2 className="font-bold mb-4">Recent Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.slice(0, 6).map(s => (
              <div key={s.id} className="p-4 rounded-lg bg-neutral-800">
                <div className="flex items-center gap-2 mb-2">
                  <span>{s.channel === 'email' ? '📧' : s.channel === 'sms' ? '💬' : '🔔'}</span>
                  <span className="font-medium">{SEGMENTS.find(seg => seg.id === s.segment)?.name}</span>
                </div>
                <div className="text-sm">{formatSendTime(s.recommendedDay, s.recommendedHour)}</div>
                <div className="text-xs text-neutral-400 mt-1">{promos.find(p => p.id === s.promoId)?.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
