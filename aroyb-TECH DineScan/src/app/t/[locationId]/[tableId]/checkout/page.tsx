'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import { Location, Table, CartItem, CourseType, Order } from '@/types';
import {
  getSession,
  getCurrentGuest,
  getCart,
  getCartTotal,
  clearCart,
  saveOrder,
  generateId,
} from '@/lib/session-manager';
import { getPacingSuggestions, getKitchenState, getEstimatedWaitTime } from '@/lib/pacing-engine';

interface Props {
  params: { locationId: string; tableId: string };
}

export default function CheckoutPage({ params }: Props) {
  const router = useRouter();
  const { locationId, tableId } = params;
  
  const [location, setLocation] = useState<Location | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sendMode, setSendMode] = useState<'all' | 'starters-first'>('all');
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loc = (locationsData.locations as Location[]).find(l => l.id === locationId);
    if (loc) {
      setLocation(loc);
      setTable(loc.tables.find(t => t.id === tableId) || null);
    }
    setCart(getCart());
  }, [locationId, tableId]);

  const session = getSession();
  const currentGuest = getCurrentGuest();
  const kitchenState = getKitchenState();
  const pacingSuggestions = getPacingSuggestions(cart);
  
  const subtotal = getCartTotal();
  const serviceCharge = location?.serviceCharge.enabled
    ? location.serviceCharge.type === 'percentage'
      ? subtotal * (location.serviceCharge.value / 100)
      : location.serviceCharge.value
    : 0;
  const total = subtotal + serviceCharge;

  // Group items by course
  const courseGroups = cart.reduce((acc, item) => {
    if (!acc[item.courseType]) acc[item.courseType] = [];
    acc[item.courseType].push(item);
    return acc;
  }, {} as Record<CourseType, CartItem[]>);

  const hasMultipleCourses = Object.keys(courseGroups).length > 1;
  const hasStarters = !!courseGroups.starters?.length;
  const hasMains = !!courseGroups.mains?.length;

  const handleSendToKitchen = async () => {
    if (!session) return;
    
    setIsSubmitting(true);

    // Create order
    const order: Order = {
      orderId: generateId('ORD-'),
      sessionId: session.sessionId,
      locationId,
      tableId,
      items: cart,
      status: 'placed',
      coursesFired: sendMode === 'starters-first' && hasStarters ? ['starters', 'sharers', 'drinks'] : [],
      coursesWaiting: sendMode === 'starters-first' ? ['mains', 'desserts'] : [],
      subtotal,
      serviceCharge,
      total,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      timestamps: [{ status: 'placed', time: new Date().toISOString() }],
    };

    saveOrder(order);
    clearCart();

    // Redirect to tracking
    setTimeout(() => {
      router.push(`/t/${locationId}/${tableId}/track?orderId=${order.orderId}`);
    }, 1500);
  };

  const handlePayAtTable = () => {
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    // In demo, just proceed with kitchen send
    setShowPayment(false);
    handleSendToKitchen();
  };

  const starterWait = getEstimatedWaitTime('starters');
  const mainWait = getEstimatedWaitTime('mains');

  return (
    <div className="min-h-screen bg-neutral-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href={`/t/${locationId}/${tableId}/cart`} className="text-neutral-600">
            ← Cart
          </Link>
          <h1 className="font-semibold text-neutral-900">Send to Kitchen</h1>
          <div />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Kitchen Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-neutral-900">Kitchen Status</h2>
            <span className={`status-chip ${
              kitchenState.status === 'quiet' ? 'status-active' :
              kitchenState.status === 'normal' ? 'status-active' :
              kitchenState.status === 'busy' ? 'status-busy' : 'status-slammed'
            }`}>
              {kitchenState.status === 'quiet' && '🟢 Quiet'}
              {kitchenState.status === 'normal' && '🟡 Normal'}
              {kitchenState.status === 'busy' && '🟠 Busy'}
              {kitchenState.status === 'slammed' && '🔴 Very Busy'}
            </span>
          </div>
          
          {/* Load Meter */}
          <div className="load-meter">
            <div
              className={`load-meter-fill ${
                kitchenState.load <= 50 ? 'bg-success-500' :
                kitchenState.load <= 75 ? 'bg-warning-500' : 'bg-danger-500'
              }`}
              style={{ width: `${kitchenState.load}%` }}
            />
          </div>
          
          <p className="text-sm text-neutral-500 mt-2">
            Est. wait: Starters {starterWait.min}-{starterWait.max} mins • Mains {mainWait.min}-{mainWait.max} mins
          </p>
        </div>

        {/* Pacing Suggestions */}
        {pacingSuggestions.length > 0 && (
          <div className="space-y-2">
            {pacingSuggestions.map((sug, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl ${
                  sug.type === 'warning' ? 'bg-warning-50 border border-warning-200' :
                  sug.type === 'success' ? 'bg-success-50 border border-success-200' :
                  'bg-secondary-50 border border-secondary-200'
                }`}
              >
                <p className={`text-sm ${
                  sug.type === 'warning' ? 'text-warning-800' :
                  sug.type === 'success' ? 'text-success-800' :
                  'text-secondary-800'
                }`}>
                  💡 {sug.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Send Options */}
        {hasMultipleCourses && hasStarters && hasMains && location?.featureToggles.coursePacing && (
          <div className="card">
            <h2 className="font-semibold text-neutral-900 mb-4">How would you like to send?</h2>
            
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                sendMode === 'all' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
              }`}>
                <input
                  type="radio"
                  checked={sendMode === 'all'}
                  onChange={() => setSendMode('all')}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-neutral-900">Send all together</p>
                  <p className="text-sm text-neutral-500">Kitchen will pace courses for you</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                sendMode === 'starters-first' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
              }`}>
                <input
                  type="radio"
                  checked={sendMode === 'starters-first'}
                  onChange={() => setSendMode('starters-first')}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-neutral-900">Starters first, mains later</p>
                  <p className="text-sm text-neutral-500">We'll prompt you to send mains when ready</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="card">
          <h2 className="font-semibold text-neutral-900 mb-4">Order Summary</h2>
          
          <div className="space-y-2 text-sm">
            {Object.entries(courseGroups).map(([course, items]) => (
              <div key={course} className="flex justify-between">
                <span className="text-neutral-600 capitalize">
                  {items.length}× {course}
                </span>
                <span>£{items.reduce((sum, i) => sum + i.basePrice * i.quantity, 0).toFixed(2)}</span>
              </div>
            ))}
            
            <hr className="my-3" />
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            
            {location?.serviceCharge.enabled && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Service ({location.serviceCharge.value}%)</span>
                <span>£{serviceCharge.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary-600">£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-bottom-bar safe-area-pb">
        <div className="px-4 py-4 space-y-3">
          <button
            onClick={handleSendToKitchen}
            disabled={isSubmitting}
            className="btn-primary w-full text-lg py-4"
          >
            {isSubmitting ? 'Sending...' : '🍳 Send to Kitchen'}
          </button>
          
          {location?.featureToggles.payAtTable && (
            <button
              onClick={handlePayAtTable}
              className="btn-secondary w-full"
            >
              💳 Pay at Table (Demo)
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-display font-bold text-neutral-900 mb-4 text-center">
                Pay at Table (Demo)
              </h2>
              
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-primary-600 mb-2">
                  £{total.toFixed(2)}
                </p>
                <p className="text-neutral-500">Including service charge</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <button className="btn-primary w-full bg-black hover:bg-neutral-800 flex items-center justify-center gap-2">
                  <span>Apple Pay</span>
                </button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <span>Google Pay</span>
                </button>
                <button className="btn-secondary w-full">
                  💳 Card Payment
                </button>
              </div>
              
              <p className="text-xs text-neutral-400 text-center mb-4">
                Demo mode: No real payment will be processed
              </p>
              
              <button
                onClick={handlePaymentComplete}
                className="btn-success w-full"
              >
                Simulate Payment Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
