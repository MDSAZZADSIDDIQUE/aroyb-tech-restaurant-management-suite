'use client';

import { useState } from 'react';
import { compareFormats, formatModifier } from '@/lib/ai/label-formatter';

const sampleModifiers = [
  'Extra cheese on top',
  'No onions please',
  'Gluten free base required',
  'Make it very spicy',
  'Well done steak',
  'Extra sauce on the side',
  'No pickles or tomatoes',
  'Add extra bacon strips',
  'Dressing on the side please',
  'Peppercorn sauce extra',
  'Allergy - no nuts whatsoever',
  'Medium rare with butter',
];

export default function FormattingPage() {
  const [customText, setCustomText] = useState('');
  const [comparisons, setComparisons] = useState(() => compareFormats(sampleModifiers));
  
  const handleAddCustom = () => {
    if (!customText.trim()) return;
    const newComparisons = compareFormats([customText, ...sampleModifiers.slice(0, -1)]);
    setComparisons(newComparisons);
    setCustomText('');
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Label Formatting</h1>
      <p className="text-neutral-400 mb-6">🤖 AI auto-formats modifiers for thermal label widths</p>
      
      {/* How it works */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-3">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-neutral-800">
            <span className="text-2xl mb-2 block">✂️</span>
            <h3 className="font-semibold">Abbreviation</h3>
            <p className="text-neutral-400">Long words shortened (Extra → X, Cheese → CHS)</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-800">
            <span className="text-2xl mb-2 block">⚠️</span>
            <h3 className="font-semibold">Highlighting</h3>
            <p className="text-neutral-400">Critical modifiers prefixed (NO → HOLD:, Extra → X+)</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-800">
            <span className="text-2xl mb-2 block">📏</span>
            <h3 className="font-semibold">Width Control</h3>
            <p className="text-neutral-400">Text fits thermal label widths (28 chars default)</p>
          </div>
        </div>
      </div>
      
      {/* Custom Input */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-3">Try Your Own</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type a modifier text..."
            className="input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          />
          <button onClick={handleAddCustom} className="btn btn-primary">
            Format
          </button>
        </div>
      </div>
      
      {/* Before/After Table */}
      <div className="card">
        <h2 className="font-semibold mb-4">Before vs After</h2>
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="text-left p-4 font-semibold">Original</th>
                <th className="text-left p-4 font-semibold">Formatted</th>
                <th className="text-left p-4 font-semibold">Changes</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comp, idx) => (
                <tr key={idx} className="border-t border-neutral-800">
                  <td className="p-4">
                    <span className="font-mono text-neutral-400">{comp.original}</span>
                    <span className="text-xs text-neutral-500 ml-2">({comp.original.length} chars)</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-white">{comp.formatted}</span>
                    <span className="text-xs text-neutral-500 ml-2">({comp.formatted.length} chars)</span>
                  </td>
                  <td className="p-4">
                    {comp.changes.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {comp.changes.map((change, i) => (
                          <span key={i} className={`badge ${
                            change === 'Abbreviated' ? 'bg-blue-500/20 text-blue-400' :
                            change === 'Highlighted' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-neutral-600 text-neutral-300'
                          }`}>
                            {change}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-500">Uppercased only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 p-4 rounded-lg bg-neutral-800 text-sm">
        <h3 className="font-semibold mb-2">Formatting Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><span className="text-orange-400 font-bold">HOLD:</span> = "No X" / "Without"</div>
          <div><span className="text-orange-400 font-bold">X+</span> = "Extra"</div>
          <div><span className="text-orange-400 font-bold">GF:</span> = "Gluten Free"</div>
          <div><span className="text-orange-400 font-bold">⚠️</span> = Allergy noted</div>
        </div>
      </div>
    </div>
  );
}
