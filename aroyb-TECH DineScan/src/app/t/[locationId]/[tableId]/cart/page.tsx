'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import locationsData from '@/data/locations.json';
import { Location, Table, CartItem, Guest, GuestCart } from '@/types';
import {
  getSession,
  getCurrentGuest,
  getCart,
  getAllGuestCarts,
  updateCartItemQuantity,
  removeFromCart,
  getCartTotal,
  getCartItemCount,
} from '@/lib/session-manager';

interface Props {
  params: { locationId: string; tableId: string };
}

export default function CartPage({ params }: Props) {
  const { locationId, tableId } = params;
  
  const [location, setLocation] = useState<Location | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [guestCarts, setGuestCarts] = useState<GuestCart[]>([]);
  const [viewMode, setViewMode] = useState<'my-cart' | 'group-cart'>('my-cart');
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loc = (locationsData.locations as Location[]).find(l => l.id === locationId);
    if (loc) {
      setLocation(loc);
      setTable(loc.tables.find(t => t.id === tableId) || null);
    }
    refreshCart();
  }, [locationId, tableId]);

  const refreshCart = () => {
    setCurrentGuest(getCurrentGuest());
    setGuestCarts(getAllGuestCarts());
    setCartTotal(getCartTotal());
    setCartCount(getCartItemCount());
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = getCart().find(i => i.id === itemId);
    const newQuantity = (item?.quantity ?? 0) + delta;
    updateCartItemQuantity(itemId, newQuantity);
    refreshCart();
  };

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
    refreshCart();
  };

  const myCart = guestCarts.find(gc => gc.guestId === currentGuest?.guestId);
  const otherCarts = guestCarts.filter(gc => gc.guestId !== currentGuest?.guestId);

  const displayCarts = viewMode === 'my-cart' ? (myCart ? [myCart] : []) : guestCarts;
  
  // Service charge calculation
  const serviceCharge = location?.serviceCharge.enabled
    ? location.serviceCharge.type === 'percentage'
      ? cartTotal * (location.serviceCharge.value / 100)
      : location.serviceCharge.value
    : 0;
  
  const grandTotal = cartTotal + serviceCharge;

  return (
    <div className="min-h-screen bg-neutral-50 pb-40">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href={`/t/${locationId}/${tableId}/menu`} className="text-neutral-600">
            ← Menu
          </Link>
          <h1 className="font-semibold text-neutral-900">Your Order</h1>
          <span className="badge-neutral">{cartCount} items</span>
        </div>
      </header>

      {/* View Toggle */}
      {guestCarts.length > 1 && (
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex rounded-xl bg-neutral-100 p-1">
            <button
              onClick={() => setViewMode('my-cart')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'my-cart'
                  ? 'bg-white shadow text-neutral-900'
                  : 'text-neutral-500'
              }`}
            >
              My Order
            </button>
            <button
              onClick={() => setViewMode('group-cart')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'group-cart'
                  ? 'bg-white shadow text-neutral-900'
                  : 'text-neutral-500'
              }`}
            >
              Group Order
            </button>
          </div>
        </div>
      )}

      {/* Cart Content */}
      <div className="px-4 py-4">
        {displayCarts.length === 0 || displayCarts.every(gc => gc.items.length === 0) ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-neutral-600 mb-6">
              Add items from the menu to get started
            </p>
            <Link href={`/t/${locationId}/${tableId}/menu`} className="btn-primary">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayCarts.map((guestCart) => (
              <div key={guestCart.guestId} className="card">
                {/* Guest Name */}
                {viewMode === 'group-cart' && (
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm">
                      👤
                    </span>
                    <span className="font-medium text-neutral-900">
                      {guestCart.guestName}
                      {guestCart.guestId === currentGuest?.guestId && ' (You)'}
                    </span>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-4">
                  {guestCart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-neutral-900">{item.name}</h3>
                          <span className="font-semibold text-neutral-900">
                            £{(item.basePrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500 capitalize">
                          {item.courseType}
                        </p>
                        
                        {/* Quantity Controls (only for current guest's items) */}
                        {guestCart.guestId === currentGuest?.guestId && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="ml-auto text-neutral-400 hover:text-danger-500"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary & Actions */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-bottom-bar safe-area-pb">
          <div className="px-4 py-4">
            {/* Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">£{cartTotal.toFixed(2)}</span>
              </div>
              {location?.serviceCharge.enabled && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">
                    Service Charge ({location.serviceCharge.value}%)
                  </span>
                  <span className="font-medium">£{serviceCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href={`/t/${locationId}/${tableId}/menu`}
                className="btn-secondary flex-1"
              >
                + Add More
              </Link>
              <Link
                href={`/t/${locationId}/${tableId}/checkout`}
                className="btn-primary flex-1"
              >
                Send to Kitchen
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
