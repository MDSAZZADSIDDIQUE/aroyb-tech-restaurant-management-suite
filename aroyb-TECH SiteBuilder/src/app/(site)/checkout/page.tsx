'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-store';
import { useLocation, useDeliveryZone } from '@/lib/location-store';
import { getCartUpsells } from '@/lib/recommendation-rules';
import { generateOrderId, getEstimatedTime, generateOrderConfirmationEmail, generateOrderConfirmationSMS } from '@/lib/order-utils';
import menuData from '@/data/menu.json';
import { MenuItem, FulfillmentType } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { state, removeItem, updateQuantity, setFulfillment, setDeliveryZone, setTip, clearCart, getItemTotal, getSubtotal, getTotalItems } = useCart();
  const { selectedLocation, locations, selectLocation, selectedZoneId, selectZone } = useLocation();
  
  const allItems = menuData.items as MenuItem[];
  const upsells = getCartUpsells(state.items.map(i => i.itemId), allItems);
  
  const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [showDemoNotification, setShowDemoNotification] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoSMS, setDemoSMS] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    deliveryInstructions: '',
    scheduledDate: '',
    scheduledTime: '',
  });

  const deliveryZone = selectedLocation?.deliveryZones.find(z => z.id === selectedZoneId);
  const isDelivery = state.fulfillmentType.includes('delivery');
  const isScheduled = state.fulfillmentType.includes('scheduled');

  const subtotal = getSubtotal();
  const deliveryFee = isDelivery && deliveryZone ? deliveryZone.fee : 0;
  const serviceFee = 0.50; // Fixed service fee for demo
  const total = subtotal + deliveryFee + serviceFee + state.tip;

  // Minimum order check
  const minOrder = isDelivery && deliveryZone ? deliveryZone.minOrder : selectedLocation?.minOrder || 0;
  const meetsMinOrder = subtotal >= minOrder;

  if (state.items.length === 0 && step === 'cart') {
    return (
      <div className="min-h-screen bg-neutral-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-neutral-600 mb-8">
            Looks like you haven&apos;t added any items yet. Start browsing our delicious menu!
          </p>
          <Link href="/menu" className="btn-primary">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    const orderId = generateOrderId();
    
    // Generate demo notifications
    const order = {
      id: orderId,
      locationId: selectedLocation?.id || '',
      status: 'placed' as const,
      timestamps: [],
      items: state.items,
      subtotal,
      deliveryFee,
      serviceFee,
      tip: state.tip,
      total,
      fulfillmentType: state.fulfillmentType,
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      },
      deliveryAddress: isDelivery ? {
        line1: formData.addressLine1,
        line2: formData.addressLine2,
        city: formData.city,
        postcode: formData.postcode,
        instructions: formData.deliveryInstructions,
      } : undefined,
      estimatedDelivery: selectedLocation ? getEstimatedTime(
        isDelivery ? 'delivery' : 'collection',
        selectedLocation.prepTimeRange,
        deliveryZone?.estimatedTime
      ) : undefined,
      createdAt: new Date().toISOString(),
    };

    setDemoEmail(generateOrderConfirmationEmail(order));
    setDemoSMS(generateOrderConfirmationSMS(order));
    setShowDemoNotification(true);

    // Store order in localStorage for tracking demo
    localStorage.setItem(`order-${orderId}`, JSON.stringify(order));

    // Wait a moment then redirect
    setTimeout(() => {
      clearCart();
      router.push(`/order/${orderId}`);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {['Cart', 'Details', 'Payment'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                ${(i === 0 && step === 'cart') || (i === 1 && step === 'details') || (i === 2 && step === 'payment')
                  ? 'bg-primary-600 text-white'
                  : i < ['cart', 'details', 'payment'].indexOf(step)
                  ? 'bg-green-500 text-white'
                  : 'bg-neutral-200 text-neutral-500'
                }`}>
                {i + 1}
              </div>
              <span className={`ml-2 font-medium ${
                step === s.toLowerCase() ? 'text-neutral-900' : 'text-neutral-500'
              }`}>{s}</span>
              {i < 2 && <div className="w-12 h-0.5 mx-4 bg-neutral-200" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Step */}
            {step === 'cart' && (
              <>
                {/* Order Type Selection */}
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Order Type</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFulfillment('delivery')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        state.fulfillmentType === 'delivery'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">🚚</span>
                      <span className="font-semibold text-neutral-900">Delivery</span>
                      <p className="text-sm text-neutral-500">To your door</p>
                    </button>
                    <button
                      onClick={() => setFulfillment('collection')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        state.fulfillmentType === 'collection'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">🏪</span>
                      <span className="font-semibold text-neutral-900">Collection</span>
                      <p className="text-sm text-neutral-500">Pick up in store</p>
                    </button>
                  </div>

                  {/* Location Selection */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {isDelivery ? 'Delivering from' : 'Collect from'}
                    </label>
                    <select
                      value={selectedLocation?.id || ''}
                      onChange={(e) => selectLocation(e.target.value)}
                      className="input-field"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.shortName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Zone Selection */}
                  {isDelivery && selectedLocation && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Delivery Area
                      </label>
                      <select
                        value={selectedZoneId || ''}
                        onChange={(e) => selectZone(e.target.value || null)}
                        className="input-field"
                      >
                        <option value="">Select your area...</option>
                        {selectedLocation.deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} - {zone.fee === 0 ? 'Free delivery' : `£${zone.fee.toFixed(2)} delivery`} (Min: £{zone.minOrder})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className="bg-white rounded-xl p-6 shadow-soft">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                    Your Order ({getTotalItems()} items)
                  </h2>
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0">
                        {item.image && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-900">{item.name}</h3>
                          {/* Modifiers */}
                          {item.modifiers.length > 0 && (
                            <p className="text-sm text-neutral-500">
                              {item.modifiers.flatMap(m => m.options.map(o => o.name)).join(', ')}
                            </p>
                          )}
                          {/* Add-ons */}
                          {item.addOns.length > 0 && (
                            <p className="text-sm text-neutral-500">
                              + {item.addOns.map(a => `${a.quantity}× ${a.name}`).join(', ')}
                            </p>
                          )}
                          {/* Special Instructions */}
                          {item.specialInstructions && (
                            <p className="text-sm text-amber-600 italic">
                              &quot;{item.specialInstructions}&quot;
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
                              >
                                -
                              </button>
                              <span className="font-medium w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-semibold text-neutral-900">
                              £{getItemTotal(item).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-red-500 self-start"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upsells */}
                {upsells.length > 0 && (
                  <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-6">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <span>✨</span>
                      <span>Recommended for you</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {upsells.map((upsell) => (
                        <div key={upsell.item.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            {upsell.item.images[0] && (
                              <Image src={upsell.item.images[0]} alt={upsell.item.name} fill className="object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 text-sm truncate">{upsell.item.name}</p>
                            <p className="text-sm text-primary-600 font-semibold">£{upsell.item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-3">💡 Based on what you&apos;ve ordered</p>
                  </div>
                )}
              </>
            )}

            {/* Details Step */}
            {step === 'details' && (
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Contact Details</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="07xxx xxxxxx"
                      required
                    />
                  </div>

                  {isDelivery && (
                    <>
                      <hr className="my-6" />
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Delivery Address</h3>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Address Line 1 *</label>
                        <input
                          type="text"
                          value={formData.addressLine1}
                          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Address Line 2</label>
                        <input
                          type="text"
                          value={formData.addressLine2}
                          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Postcode *</label>
                          <input
                            type="text"
                            value={formData.postcode}
                            onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Delivery Instructions</label>
                        <textarea
                          value={formData.deliveryInstructions}
                          onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                          className="input-field resize-none"
                          rows={2}
                          placeholder="e.g., Ring doorbell, leave at door, etc."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Payment (Demo)</h2>
                
                {/* Tip Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-3">Add a tip</label>
                  <div className="flex gap-3">
                    {[0, 1, 2, 3, 5].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTip(amount)}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          state.tip === amount
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {amount === 0 ? 'No tip' : `£${amount}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Demo Payment Form */}
                <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-neutral-500 mb-4">
                    💳 This is a demo - no real payment will be processed
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value="4242 4242 4242 4242"
                        disabled
                        className="input-field bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Expiry</label>
                        <input type="text" value="12/25" disabled className="input-field bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">CVC</label>
                        <input type="text" value="123" disabled className="input-field bg-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={handlePlaceOrder} className="btn-primary w-full text-lg py-4">
                  Place Order • £{total.toFixed(2)}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-soft sticky top-32">
              <h3 className="font-semibold text-neutral-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">£{subtotal.toFixed(2)}</span>
                </div>
                {isDelivery && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Delivery</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `£${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Service fee</span>
                  <span className="font-medium">£{serviceFee.toFixed(2)}</span>
                </div>
                {state.tip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tip</span>
                    <span className="font-medium">£{state.tip.toFixed(2)}</span>
                  </div>
                )}
                
                <hr className="my-3" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Min Order Warning */}
              {!meetsMinOrder && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Minimum order is £{minOrder}. Add £{(minOrder - subtotal).toFixed(2)} more to checkout.
                  </p>
                </div>
              )}

              {/* Step Navigation */}
              <div className="mt-6 space-y-3">
                {step === 'cart' && (
                  <button
                    onClick={() => setStep('details')}
                    disabled={!meetsMinOrder || (isDelivery && !deliveryZone)}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Details
                  </button>
                )}
                {step === 'details' && (
                  <>
                    <button
                      onClick={() => setStep('payment')}
                      disabled={!formData.firstName || !formData.email || !formData.phone}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Payment
                    </button>
                    <button onClick={() => setStep('cart')} className="btn-secondary w-full">
                      Back to Cart
                    </button>
                  </>
                )}
                {step === 'payment' && (
                  <button onClick={() => setStep('details')} className="btn-secondary w-full">
                    Back to Details
                  </button>
                )}
              </div>

              {/* Estimated Time */}
              {selectedLocation && (step === 'details' || step === 'payment') && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Est. {isDelivery ? 'delivery' : 'ready'}: </span>
                    {getEstimatedTime(
                      isDelivery ? 'delivery' : 'collection',
                      selectedLocation.prepTimeRange,
                      deliveryZone?.estimatedTime
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notification Panel */}
      {showDemoNotification && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="bg-green-500 text-white p-6 text-center">
              <div className="text-4xl mb-2">✓</div>
              <h2 className="text-2xl font-bold">Order Placed!</h2>
              <p className="text-green-100">Demo notification simulation</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="mb-6">
                <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <span>📧</span> Email Sent (Demo)
                </h3>
                <pre className="bg-neutral-50 p-3 rounded-lg text-xs text-neutral-700 whitespace-pre-wrap overflow-x-auto">
                  {demoEmail}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <span>📱</span> SMS Sent (Demo)
                </h3>
                <pre className="bg-neutral-50 p-3 rounded-lg text-xs text-neutral-700 whitespace-pre-wrap">
                  {demoSMS}
                </pre>
              </div>
            </div>
            <div className="p-4 bg-neutral-50 text-center">
              <p className="text-sm text-neutral-500">Redirecting to order confirmation...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
