'use client';

import { useState, useEffect } from 'react';
import menuData from '@/data/menu.json';
import { MenuItem, Offer } from '@/types';
import { generateBundleSuggestions, bundleSuggestionToOffer, getApprovedBundles, approveBundle, removeApprovedBundle } from '@/lib/bundle-generator';

export default function AdminBundlesPage() {
  const [suggestions, setSuggestions] = useState<ReturnType<typeof generateBundleSuggestions>>([]);
  const [approvedBundles, setApprovedBundles] = useState<Offer[]>([]);
  const [showSuccess, setShowSuccess] = useState('');

  const allItems = menuData.items as MenuItem[];

  useEffect(() => {
    setSuggestions(generateBundleSuggestions(allItems));
    setApprovedBundles(getApprovedBundles());
  }, []);

  const handleApprove = (suggestion: typeof suggestions[0]) => {
    const offer = bundleSuggestionToOffer(suggestion);
    approveBundle(offer);
    setApprovedBundles(getApprovedBundles());
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setShowSuccess(`"${suggestion.title}" approved and published!`);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleRemove = (offerId: string) => {
    removeApprovedBundle(offerId);
    setApprovedBundles(getApprovedBundles());
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900">AI Bundle Suggestions</h1>
        <p className="text-neutral-600 mt-2">
          Review and approve AI-generated menu bundles for your Offers page
        </p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ {showSuccess}
        </div>
      )}

      {/* Approved Bundles */}
      {approvedBundles.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Published Bundles
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {approvedBundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-xl p-6 shadow-soft border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{bundle.title}</h3>
                    <p className="text-sm text-neutral-600">{bundle.description}</p>
                  </div>
                  <span className="badge-success">Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary-600">£{bundle.price.toFixed(2)}</span>
                    <span className="text-sm text-neutral-400 line-through ml-2">
                      £{bundle.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(bundle.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Suggestions */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <span>✨</span>
          Suggested Bundles
        </h2>

        {suggestions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-soft">
            <span className="text-4xl block mb-4">🎉</span>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">All caught up!</h3>
            <p className="text-neutral-600">
              No new bundle suggestions. Check back later for more AI recommendations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-neutral-900">{suggestion.title}</h3>
                      <span className="badge bg-secondary-100 text-secondary-800">
                        {suggestion.discountPercent}% off
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-4">{suggestion.description}</p>

                    {/* Items in Bundle */}
                    <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-neutral-700 mb-2">Contains:</p>
                      <ul className="space-y-1">
                        {suggestion.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-neutral-600 flex items-center gap-2">
                            <span>•</span>
                            <span>{item.quantity}× {item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Rationale */}
                    <div className="flex items-start gap-2 text-sm text-neutral-500">
                      <span>🤖</span>
                      <span>{suggestion.rationale}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 md:min-w-48">
                    <div className="text-right">
                      <span className="block text-2xl font-bold text-primary-600">
                        £{suggestion.suggestedPrice.toFixed(2)}
                      </span>
                      <span className="text-neutral-400 line-through">
                        £{suggestion.originalPrice.toFixed(2)}
                      </span>
                      <span className="block text-sm text-green-600 font-medium mt-1">
                        {suggestion.discount}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(suggestion)}
                        className="btn-primary"
                      >
                        ✓ Approve & Publish
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
                  {suggestion.tags.map((tag) => (
                    <span key={tag} className="badge-neutral text-xs capitalize">
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900">How AI Bundles Work</h4>
            <p className="text-sm text-blue-800 mt-1">
              Our AI analyzes your menu to create value bundles that increase average order value. 
              Suggestions are based on popular pairings, complementary items, and occasion-based themes.
              Approved bundles appear on your Offers page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
