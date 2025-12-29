'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import offersData from '@/data/offers.json';
import menuData from '@/data/menu.json';
import { Offer, MenuItem } from '@/types';
import { getApprovedBundles } from '@/lib/bundle-generator';

export default function OffersPage() {
  const staticOffers = offersData.offers as Offer[];
  const [approvedBundles, setApprovedBundles] = useState<Offer[]>([]);
  const allItems = menuData.items as MenuItem[];

  useEffect(() => {
    setApprovedBundles(getApprovedBundles());
  }, []);

  const allOffers = [...staticOffers, ...approvedBundles].filter(o => o.enabled);

  const getItemName = (itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    return item?.name || itemId;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-neutral-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-white/30 backdrop-blur rounded-full 
                        text-sm font-medium mb-6">
            🎉 Limited Time Offers
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Special Deals & Bundles
          </h1>
          <p className="text-xl text-neutral-800/80 max-w-2xl mx-auto">
            Save more on your favourite dishes with our exclusive offers and meal deals
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Free Delivery Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 mb-12 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                🚚
              </div>
              <div>
                <h2 className="text-2xl font-bold">Free Delivery on Orders Over £25</h2>
                <p className="text-white/80">No code needed - automatically applied at checkout</p>
              </div>
            </div>
            <Link href="/menu" className="btn-secondary bg-white text-green-700 hover:bg-green-50 whitespace-nowrap">
              Order Now
            </Link>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {allOffers.map((offer) => (
            <div key={offer.id} className="card overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <span className="text-5xl font-bold">{offer.discount}</span>
                  </div>
                </div>
                {offer.type === 'bundle' && (
                  <span className="absolute top-4 right-4 badge bg-secondary-500 text-neutral-900">
                    Bundle
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{offer.title}</h3>
                <p className="text-neutral-600 mb-4">{offer.description}</p>

                {/* Items in bundle */}
                {offer.items && offer.items.length > 0 && (
                  <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm font-medium text-neutral-700 mb-2">Includes:</p>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      {offer.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{item.quantity}× {getItemName(item.itemId)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pricing */}
                {offer.originalPrice > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      £{offer.price.toFixed(2)}
                    </span>
                    <span className="text-lg text-neutral-400 line-through">
                      £{offer.originalPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Terms */}
                {offer.terms && (
                  <p className="text-xs text-neutral-500 mb-4">* {offer.terms}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {offer.tags.map((tag) => (
                    <span key={tag} className="badge-neutral capitalize">
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                </div>

                <Link href="/menu" className="btn-primary w-full">
                  Order This Deal
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* New Customer Offer */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            New to Aroyb? Get 20% Off!
          </h2>
          <p className="text-xl text-white/80 mb-6">
            Use code <span className="font-mono font-bold bg-white/20 px-3 py-1 rounded">WELCOME20</span> at checkout
          </p>
          <p className="text-sm text-white/60">
            Minimum order £15. New customers only. Cannot be combined with other offers.
          </p>
        </div>
      </div>
    </div>
  );
}
