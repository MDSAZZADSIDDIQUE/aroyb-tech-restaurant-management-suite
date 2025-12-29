'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import { getStatusInfo, getOrderProgress } from '@/lib/order-utils';

interface Props {
  params: { orderId: string };
}

export default function OrderConfirmationPage({ params }: Props) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Load order from localStorage
    const saved = localStorage.getItem(`order-${params.orderId}`);
    if (saved) {
      setOrder(JSON.parse(saved));
    }
  }, [params.orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-neutral-600 mb-8">
            We couldn&apos;t find this order. It may have been a demo order that has expired.
          </p>
          <Link href="/menu" className="btn-primary">
            Start a New Order
          </Link>
        </div>
      </div>
    );
  }

  const isDelivery = order.fulfillmentType.includes('delivery');
  const statusInfo = getStatusInfo(order.status);
  const progress = getOrderProgress(order.status, isDelivery);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center text-4xl">
            ✓
          </div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-neutral-600">
            Thank you for your order
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Order Number */}
          <div className="bg-primary-600 text-white px-6 py-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-white/80">Order Number</p>
              <p className="text-xl font-bold font-mono">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">{isDelivery ? 'Delivering to' : 'Collect from'}</p>
              <p className="font-semibold">{order.deliveryAddress?.postcode || order.locationId}</p>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="px-6 py-6 bg-green-50 border-b border-green-100">
            <div className="text-center">
              <p className="text-sm text-green-700 mb-1">
                Estimated {isDelivery ? 'Delivery' : 'Ready for Collection'}
              </p>
              <p className="text-2xl font-bold text-green-800">
                {order.estimatedDelivery || '25-45 mins'}
              </p>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="px-6 py-6">
            <div className="relative">
              {/* Progress Bar */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-neutral-200 rounded">
                <div 
                  className="h-full bg-primary-600 rounded transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {(isDelivery 
                  ? ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered']
                  : ['placed', 'confirmed', 'preparing', 'ready', 'collected']
                ).map((step, index, arr) => {
                  const info = getStatusInfo(step as OrderStatus);
                  const isComplete = arr.indexOf(order.status) >= index;
                  const isCurrent = order.status === step;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 ${
                        isComplete 
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}>
                        {isComplete ? info.icon : index + 1}
                      </div>
                      <p className={`text-xs mt-2 text-center max-w-16 ${
                        isCurrent ? 'font-semibold text-primary-600' : 'text-neutral-500'
                      }`}>
                        {info.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="px-6 py-6 border-t border-neutral-100">
            <h3 className="font-semibold text-neutral-900 mb-4">Order Details</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="text-neutral-900">{item.quantity}× {item.name}</span>
                    {item.modifiers.length > 0 && (
                      <p className="text-sm text-neutral-500">
                        {item.modifiers.flatMap(m => m.options.map(o => o.name)).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-neutral-600">£{(item.basePrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span>£{order.subtotal.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Delivery</span>
                  <span>£{order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Service fee</span>
                <span>£{order.serviceFee.toFixed(2)}</span>
              </div>
              {order.tip > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tip</span>
                  <span>£{order.tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="px-6 py-6 bg-neutral-50 border-t border-neutral-100">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500 mb-1">Customer</p>
                <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                <p className="text-neutral-600">{order.customer.email}</p>
                <p className="text-neutral-600">{order.customer.phone}</p>
              </div>
              {order.deliveryAddress && (
                <div>
                  <p className="text-neutral-500 mb-1">Delivery Address</p>
                  <p className="font-medium">{order.deliveryAddress.line1}</p>
                  {order.deliveryAddress.line2 && <p className="text-neutral-600">{order.deliveryAddress.line2}</p>}
                  <p className="text-neutral-600">{order.deliveryAddress.city} {order.deliveryAddress.postcode}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/track/${order.id}`} className="btn-primary flex-1 text-center">
            Track Order
          </Link>
          <Link href="/menu" className="btn-secondary flex-1 text-center">
            Order Again
          </Link>
        </div>

        {/* Demo Note */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-sm text-amber-800">
            🎭 This is a demo order. In production, you would receive real email and SMS confirmations.
          </p>
        </div>
      </div>
    </div>
  );
}
