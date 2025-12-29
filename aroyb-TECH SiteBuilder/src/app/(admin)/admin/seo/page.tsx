'use client';

import { useState, useEffect } from 'react';
import menuData from '@/data/menu.json';
import { MenuItem } from '@/types';
import { generateSEOForItem, SEOSuggestion, getApprovedSEO, approveSEOSuggestion } from '@/lib/seo-generator';

export default function AdminSEOPage() {
  const [suggestions, setSuggestions] = useState<SEOSuggestion[]>([]);
  const [approvedItems, setApprovedItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showSuccess, setShowSuccess] = useState('');

  const allItems = menuData.items as MenuItem[];

  useEffect(() => {
    // Generate SEO suggestions for all items
    const allSuggestions = allItems.map(item => generateSEOForItem(item));
    setSuggestions(allSuggestions);
    
    // Get approved items from localStorage
    const approved = getApprovedSEO();
    setApprovedItems(Object.keys(approved));
  }, []);

  const handleApprove = (suggestion: SEOSuggestion) => {
    approveSEOSuggestion(suggestion.itemId, suggestion);
    setApprovedItems(prev => [...prev, suggestion.itemId]);
    setShowSuccess(`SEO approved for "${suggestion.title}"!`);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const getSuggestionForItem = (itemId: string) => {
    return suggestions.find(s => s.itemId === itemId);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900">SEO Suggestions</h1>
        <p className="text-neutral-600 mt-2">
          AI-generated meta titles and descriptions for your menu items
        </p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ {showSuccess}
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white rounded-lg px-4 py-3 shadow-soft">
          <span className="text-2xl font-bold text-primary-600">{allItems.length}</span>
          <span className="text-neutral-600 ml-2">items</span>
        </div>
        <div className="bg-white rounded-lg px-4 py-3 shadow-soft">
          <span className="text-2xl font-bold text-green-600">{approvedItems.length}</span>
          <span className="text-neutral-600 ml-2">optimized</span>
        </div>
        <div className="bg-white rounded-lg px-4 py-3 shadow-soft">
          <span className="text-2xl font-bold text-amber-600">{allItems.length - approvedItems.length}</span>
          <span className="text-neutral-600 ml-2">pending</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Items List */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="bg-neutral-50 px-6 py-4 border-b">
            <h2 className="font-semibold text-neutral-900">Menu Items</h2>
          </div>
          <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
            {allItems.map((item) => {
              const isApproved = approvedItems.includes(item.id);
              const isSelected = selectedItem?.id === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                    isSelected ? 'bg-primary-50' : ''
                  }`}
                >
                  <div>
                    <span className="font-medium text-neutral-900">{item.name}</span>
                    <p className="text-sm text-neutral-500 line-clamp-1">{item.description}</p>
                  </div>
                  {isApproved ? (
                    <span className="badge-success text-xs">✓ Optimized</span>
                  ) : (
                    <span className="badge-warning text-xs">Pending</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEO Preview */}
        <div>
          {selectedItem ? (
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-8">
              <h2 className="font-semibold text-neutral-900 mb-4">
                SEO Preview: {selectedItem.name}
              </h2>

              {(() => {
                const suggestion = getSuggestionForItem(selectedItem.id);
                if (!suggestion) return <p>Loading...</p>;

                const isApproved = approvedItems.includes(selectedItem.id);

                return (
                  <>
                    {/* Google Preview */}
                    <div className="mb-6">
                      <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">Google Preview</p>
                      <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-blue-600 text-lg hover:underline cursor-pointer font-medium line-clamp-1">
                          {suggestion.title}
                        </p>
                        <p className="text-green-700 text-sm">
                          www.aroybgrill.co.uk/menu/{selectedItem.id}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>

                    {/* Meta Details */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1">
                          Meta Title ({suggestion.title.length}/60 chars)
                        </label>
                        <input
                          type="text"
                          value={suggestion.title}
                          readOnly
                          className="input-field bg-neutral-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1">
                          Meta Description ({suggestion.description.length}/160 chars)
                        </label>
                        <textarea
                          value={suggestion.description}
                          readOnly
                          rows={3}
                          className="input-field bg-neutral-50 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 block mb-1">
                          Keywords
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.keywords.map((keyword, idx) => (
                            <span key={idx} className="badge-neutral text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {isApproved ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <span className="text-green-800 font-medium">✓ SEO Applied</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApprove(suggestion)}
                        className="btn-primary w-full"
                      >
                        ✓ Approve SEO
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
              <span className="text-4xl block mb-4">🔍</span>
              <h3 className="font-semibold text-neutral-900 mb-2">Select an Item</h3>
              <p className="text-neutral-600">
                Click on a menu item to preview its SEO suggestions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900">How Auto-SEO Works</h4>
            <p className="text-sm text-blue-800 mt-1">
              Our AI generates optimized meta titles, descriptions, and keywords for each menu item 
              based on industry best practices. Approved SEO is automatically applied to your 
              menu pages, improving search visibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
