'use client';

import { useState, useMemo } from 'react';
import { Metadata } from 'next';
import menuData from '@/data/menu.json';
import { MenuItem, MenuCategory } from '@/types';
import MenuItemCard from '@/components/menu/MenuItemCard';
import ItemModal from '@/components/menu/ItemModal';
import SmartSearch from '@/components/ai/SmartSearch';

const categories = menuData.categories as MenuCategory[];
const allItems = menuData.items as MenuItem[];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchResults, setSearchResults] = useState<MenuItem[] | null>(null);
  const [searchFilters, setSearchFilters] = useState<string[]>([]);

  const displayItems = useMemo(() => {
    if (searchResults !== null) {
      return searchResults;
    }
    return selectedCategory
      ? allItems.filter(item => item.categoryId === selectedCategory && item.available)
      : allItems.filter(item => item.available);
  }, [selectedCategory, searchResults]);

  const handleSearchResults = (results: MenuItem[], filters: string[]) => {
    setSearchResults(results);
    setSearchFilters(filters);
    setSelectedCategory(null);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchFilters([]);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Our Menu
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Discover our handcrafted dishes, made with authentic recipes and the freshest ingredients
            </p>
          </div>

          {/* Smart Search */}
          <SmartSearch 
            items={allItems} 
            onResults={handleSearchResults}
            onClear={handleClearSearch}
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Navigation */}
        {!searchResults && (
          <div className="mb-8 -mx-4 px-4 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 pb-2 min-w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {searchResults !== null && (
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Search Results
              </h2>
              <p className="text-neutral-600">
                Found {searchResults.length} item{searchResults.length !== 1 ? 's' : ''}
                {searchFilters.length > 0 && (
                  <span> matching your criteria</span>
                )}
              </p>
            </div>
            <button
              onClick={handleClearSearch}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear search ×
            </button>
          </div>
        )}

        {/* Menu Items Grid */}
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No items found
            </h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search or browse all categories
            </p>
            <button
              onClick={handleClearSearch}
              className="btn-primary"
            >
              View All Items
            </button>
          </div>
        )}

        {/* Category Sections (when no search/filter active) */}
        {!searchResults && selectedCategory === null && (
          <div className="space-y-16 mt-16">
            {categories.map((category) => {
              const categoryItems = allItems.filter(
                item => item.categoryId === category.id && item.available
              );
              if (categoryItems.length === 0) return null;

              return (
                <section key={category.id} id={category.id}>
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-neutral-900">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-neutral-600 mt-2">{category.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Allergen Notice */}
      <section className="bg-amber-50 border-t border-amber-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Allergen Information</h3>
              <p className="text-amber-700 text-sm">
                All dishes display allergen information. If you have severe allergies, 
                please call the restaurant before ordering. Our kitchen handles all 14 
                major allergens and cross-contamination is possible.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
