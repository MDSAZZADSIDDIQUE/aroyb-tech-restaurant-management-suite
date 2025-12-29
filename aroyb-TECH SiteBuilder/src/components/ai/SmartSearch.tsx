'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { parseSearchQuery, filterMenuItems, getMatchedFilters } from '@/lib/search-parser';

interface SmartSearchProps {
  items: MenuItem[];
  onResults: (results: MenuItem[], filters: string[]) => void;
  onClear: () => void;
}

export default function SmartSearch({ items, onResults, onClear }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedFilters, setMatchedFilters] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    
    if (!value.trim()) {
      setMatchedFilters([]);
      setIsSearching(false);
      onClear();
      return;
    }

    setIsSearching(true);
    
    // Parse the query
    const intent = parseSearchQuery(value);
    const results = filterMenuItems(items, intent);
    const filters = getMatchedFilters(intent);
    
    setMatchedFilters(filters);
    onResults(results, filters);
  };

  const clearSearch = () => {
    setQuery('');
    setMatchedFilters([]);
    setIsSearching(false);
    onClear();
  };

  const suggestions = [
    'gluten free chicken',
    'vegan starters',
    'spicy lamb',
    'mild vegetarian',
    'halal biryani',
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder='Try "gluten free spicy chicken" or "vegan starters"'
          className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-neutral-200 
                   focus:border-primary-500 focus:ring-0 text-lg
                   transition-all duration-200 shadow-soft"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <svg className="w-5 h-5 text-neutral-400 hover:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* AI Feature Badge */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-xs text-neutral-500 flex items-center gap-1">
          <span className="text-primary-500">✨</span>
          Smart Search understands natural language
        </span>
      </div>

      {/* Quick Suggestions */}
      {!isSearching && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSearch(suggestion)}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-primary-100 
                       text-neutral-700 hover:text-primary-700 rounded-full 
                       text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Matched Filters */}
      {matchedFilters.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <span className="text-sm text-neutral-500">Filtering by:</span>
          {matchedFilters.map((filter) => (
            <span
              key={filter}
              className="badge bg-primary-100 text-primary-800"
            >
              ✓ {filter}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
