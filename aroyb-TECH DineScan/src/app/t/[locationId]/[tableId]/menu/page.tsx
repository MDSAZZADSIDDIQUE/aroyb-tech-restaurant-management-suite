'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import menuData from '@/data/menu.json';
import { Location, Table, MenuItem, MenuCategory, CartItem, Guest } from '@/types';
import {
  getSession,
  getCurrentGuest,
  getCart,
  addToCart,
  getCartItemCount,
  generateId,
} from '@/lib/session-manager';
import { getGroupSuggestions } from '@/lib/suggestion-engine';
import { getKitchenState } from '@/lib/pacing-engine';

interface Props {
  params: { locationId: string; tableId: string };
}

export default function MenuPage({ params }: Props) {
  const { locationId, tableId } = params;
  
  const [location, setLocation] = useState<Location | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartCount, setCartCount] = useState(0);
  
  const categories = menuData.categories as MenuCategory[];
  const items = menuData.items as MenuItem[];
  
  useEffect(() => {
    const loc = (locationsData.locations as Location[]).find(l => l.id === locationId);
    if (loc) {
      setLocation(loc);
      setTable(loc.tables.find(t => t.id === tableId) || null);
    }
    setCurrentGuest(getCurrentGuest());
    setCartCount(getCartItemCount());
  }, [locationId, tableId]);

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(i => i.categoryId === activeCategory);

  const handleAddToCart = (item: MenuItem, quantity: number = 1) => {
    if (!currentGuest) return;
    
    const cartItem: CartItem = {
      id: generateId('cart-'),
      itemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity,
      modifiers: [],
      addOns: [],
      courseType: item.courseType,
      guestId: currentGuest.guestId,
      image: item.images[0],
    };
    
    addToCart(cartItem);
    setCartCount(getCartItemCount());
    setSelectedItem(null);
  };

  const kitchenState = getKitchenState();
  const session = getSession();
  const suggestions = session ? getGroupSuggestions(session.guests, getCart()) : [];

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={`/t/${locationId}/${tableId}`} className="text-neutral-600">
              ← Back
            </Link>
            <div className="text-center">
              <p className="font-semibold text-neutral-900">{table?.name}</p>
              <p className="text-xs text-neutral-500">{location?.shortName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`status-chip ${
                kitchenState.status === 'busy' || kitchenState.status === 'slammed'
                  ? 'status-busy'
                  : 'status-active'
              }`}>
                {kitchenState.status === 'quiet' && '🟢 Quiet'}
                {kitchenState.status === 'normal' && '🟡 Normal'}
                {kitchenState.status === 'busy' && '🟠 Busy'}
                {kitchenState.status === 'slammed' && '🔴 Very Busy'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto scrollbar-hide border-t border-neutral-100">
          <div className="flex px-4 py-2 gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Suggestions Carousel */}
      {suggestions.length > 0 && (
        <div className="bg-secondary-50 border-b border-secondary-100 px-4 py-4">
          <p className="text-sm font-medium text-secondary-800 mb-3">
            ✨ Suggestions for your table
          </p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm w-48"
              >
                <p className="font-medium text-neutral-900 text-sm mb-1">{sug.title}</p>
                <p className="text-xs text-neutral-500 mb-2">{sug.reason}</p>
                <div className="flex gap-1">
                  {sug.items.slice(0, 2).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      + {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-4 py-4">
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="card-interactive flex gap-4 cursor-pointer"
            >
              {item.images[0] && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {item.popular && (
                    <span className="absolute top-1 left-1 badge-warning text-xs">
                      Popular
                    </span>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary-600">
                    £{item.price.toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    {item.spiceLevel > 0 && (
                      <span className="text-sm">
                        {'🌶️'.repeat(Math.min(item.spiceLevel, 3))}
                      </span>
                    )}
                    {item.dietaryTags.includes('vegetarian') && (
                      <span className="badge-success text-xs">V</span>
                    )}
                    {item.dietaryTags.includes('vegan') && (
                      <span className="badge-success text-xs">VG</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            {selectedItem.images[0] && (
              <div className="relative h-48 w-full">
                <Image
                  src={selectedItem.images[0]}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-neutral-900">
                    {selectedItem.name}
                  </h2>
                  {selectedItem.servesCount && (
                    <span className="badge-secondary text-xs mt-1">
                      {selectedItem.servesCount}
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold text-primary-600">
                  £{selectedItem.price.toFixed(2)}
                </span>
              </div>

              <p className="text-neutral-600 mb-4">{selectedItem.description}</p>

              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedItem.dietaryTags.map((tag) => (
                  <span key={tag} className="badge-success text-xs capitalize">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Allergens */}
              {selectedItem.allergens.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Allergens:</strong> {selectedItem.allergens.join(', ')}
                  </p>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={() => handleAddToCart(selectedItem)}
                className="btn-primary w-full"
              >
                Add to Order • £{selectedItem.price.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href={`/t/${locationId}/${tableId}/cart`}
            className="btn-primary flex-1 relative"
          >
            View Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary-500 text-white text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="btn-ghost text-sm">
            🛎️ Call Waiter
          </button>
        </div>
      </div>
    </div>
  );
}
