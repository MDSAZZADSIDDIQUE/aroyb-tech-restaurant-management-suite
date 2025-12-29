'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import { Location, Table } from '@/types';
import { saveServiceRequest, generateId, getSession, getCurrentGuest } from '@/lib/session-manager';

interface Props {
  params: { locationId: string; tableId: string };
}

export default function HelpPage({ params }: Props) {
  const { locationId, tableId } = params;
  
  const [location, setLocation] = useState<Location | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loc = (locationsData.locations as Location[]).find(l => l.id === locationId);
    if (loc) {
      setLocation(loc);
      setTable(loc.tables.find(t => t.id === tableId) || null);
    }
  }, [locationId, tableId]);

  const handleCallWaiter = () => {
    const session = getSession();
    const guest = getCurrentGuest();
    
    saveServiceRequest({
      id: generateId('req-'),
      type: 'call_waiter',
      sessionId: session?.sessionId || '',
      tableId,
      tableName: table?.name || tableId,
      locationId,
      guestName: guest?.displayName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    setShowSuccess('waiter');
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleRequestBill = () => {
    const session = getSession();
    const guest = getCurrentGuest();
    
    saveServiceRequest({
      id: generateId('req-'),
      type: 'request_bill',
      sessionId: session?.sessionId || '',
      tableId,
      tableName: table?.name || tableId,
      locationId,
      guestName: guest?.displayName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    setShowSuccess('bill');
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const faqs = [
    {
      q: 'How do I add items to my order?',
      a: 'Browse the menu and tap any item to view details. Then tap "Add to Order" to add it to your cart.',
    },
    {
      q: 'Can I split the bill?',
      a: 'Yes! Each guest has their own cart. At checkout, you can pay separately or combine.',
    },
    {
      q: 'How do I know when my food is ready?',
      a: 'Track your order status in real-time on the Track page. You\'ll see when it\'s in the kitchen and when it\'s ready.',
    },
    {
      q: 'What if I have allergies?',
      a: 'Allergen information is displayed on each menu item. Tap the item to see full details.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href={`/t/${locationId}/${tableId}/menu`} className="text-neutral-600">
            ← Back
          </Link>
          <h1 className="font-semibold text-neutral-900">Help</h1>
          <div />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCallWaiter}
            disabled={!location?.featureToggles.callWaiter}
            className="card text-center py-6 hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <span className="text-4xl block mb-2">🛎️</span>
            <span className="font-semibold text-neutral-900">Call Waiter</span>
            <p className="text-xs text-neutral-500 mt-1">Get assistance</p>
          </button>
          
          <button
            onClick={handleRequestBill}
            disabled={!location?.featureToggles.requestBill}
            className="card text-center py-6 hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <span className="text-4xl block mb-2">🧾</span>
            <span className="font-semibold text-neutral-900">Request Bill</span>
            <p className="text-xs text-neutral-500 mt-1">Ready to pay</p>
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-success-50 border border-success-200 rounded-xl p-4 text-center animate-fade-in">
            <span className="text-2xl block mb-2">✅</span>
            <p className="font-medium text-success-800">
              {showSuccess === 'waiter' ? 'Waiter has been notified!' : 'Bill requested!'}
            </p>
            <p className="text-sm text-success-600">
              Someone will be with you shortly
            </p>
          </div>
        )}

        {/* Contact */}
        <div className="card">
          <h2 className="font-semibold text-neutral-900 mb-4">Contact</h2>
          <div className="space-y-3">
            <a
              href={`tel:${location?.phone}`}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100"
            >
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-neutral-900">{location?.phone}</p>
                <p className="text-sm text-neutral-500">Call restaurant</p>
              </div>
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div className="card">
          <h2 className="font-semibold text-neutral-900 mb-4">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group">
                <summary className="cursor-pointer font-medium text-neutral-900 flex items-center justify-between">
                  {faq.q}
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-neutral-600 text-sm mt-2 pl-0">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Location Info */}
        <div className="card">
          <h2 className="font-semibold text-neutral-900 mb-4">Location</h2>
          <p className="text-neutral-600">{location?.name}</p>
          <p className="text-neutral-500 text-sm">{location?.address}</p>
          <p className="text-neutral-500 text-sm">{location?.city} {location?.postcode}</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="px-4 py-3 flex gap-3">
          <Link href={`/t/${locationId}/${tableId}/menu`} className="btn-primary flex-1">
            View Menu
          </Link>
          <Link href={`/t/${locationId}/${tableId}/cart`} className="btn-secondary flex-1">
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
