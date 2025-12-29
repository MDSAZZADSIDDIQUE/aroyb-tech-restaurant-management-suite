'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import { getStatusInfo, getOrderProgress, simulateOrderProgression } from '@/lib/order-utils';

interface Props {
  params: { orderId: string };
}

export default function TrackOrderPage({ params }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      
      // First try localStorage
      const saved = localStorage.getItem(`order-${params.orderId}`);
      if (saved) {
        const savedOrder = JSON.parse(saved);
        // Simulate progression for demo
        const progressedOrder = await simulateOrderProgression(
          params.orderId, 
          savedOrder.fulfillmentType.includes('delivery')
        );
        setOrder({ ...savedOrder, ...progressedOrder });
      }
      
      setIsLoading(false);
    };

    loadOrder();
    
    // Auto-refresh every 10 seconds for demo
    const interval = setInterval(loadOrder, 10000);
    return () => clearInterval(interval);
  }, [params.orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-neutral-600 mb-8">
            We couldn&apos;t find this order. Please check your order number.
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
  const isComplete = order.status === 'delivered' || order.status === 'collected';

  const statusSteps = isDelivery 
    ? ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered']
    : ['placed', 'confirmed', 'preparing', 'ready', 'collected'];

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/order/${order.id}`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Order Details
          </Link>
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            Track Your Order
          </h1>
          <p className="text-neutral-600 mt-2">
            Order #{order.id}
          </p>
        </div>

        {/* Live Status Card */}
        <div className={`rounded-2xl p-8 text-center mb-8 ${
          isComplete ? 'bg-green-500 text-white' : 'bg-primary-600 text-white'
        }`}>
          <div className="text-6xl mb-4">{statusInfo.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{statusInfo.label}</h2>
          <p className="text-white/80">{statusInfo.description}</p>
          
          {!isComplete && order.estimatedDelivery && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-sm text-white/70">Estimated time</p>
              <p className="text-xl font-bold">{order.estimatedDelivery}</p>
            </div>
          )}
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="font-semibold text-neutral-900 mb-6">Order Progress</h3>
          
          <div className="space-y-0">
            {statusSteps.map((step, index) => {
              const info = getStatusInfo(step as OrderStatus);
              const currentIndex = statusSteps.indexOf(order.status);
              const isComplete = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              const timestamp = order.timestamps?.find(t => t.status === step);

              return (
                <div key={step} className="relative">
                  {/* Connector Line */}
                  {index > 0 && (
                    <div className={`absolute left-4 -top-4 w-0.5 h-4 ${
                      isComplete ? 'bg-primary-600' : 'bg-neutral-200'
                    }`} />
                  )}
                  
                  <div className={`flex items-start gap-4 p-3 rounded-lg ${
                    isCurrent ? 'bg-primary-50' : ''
                  }`}>
                    {/* Status Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isComplete 
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {info.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          isCurrent ? 'text-primary-700' : isComplete ? 'text-neutral-900' : 'text-neutral-400'
                        }`}>
                          {info.label}
                        </h4>
                        {timestamp && (
                          <span className="text-sm text-neutral-500">
                            {new Date(timestamp.time).toLocaleTimeString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isComplete ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        {info.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restaurant Info */}
        {!isComplete && (
          <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
            <h3 className="font-semibold text-neutral-900 mb-4">Need Help?</h3>
            <p className="text-neutral-600 mb-4">
              If you have any questions about your order, contact the restaurant directly.
            </p>
            <a 
              href="tel:+441615550123" 
              className="btn-secondary w-full justify-center"
            >
              📞 Call Restaurant
            </a>
          </div>
        )}

        {/* Completion CTA */}
        {isComplete && (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              Enjoy your meal! 🍽️
            </h3>
            <div className="flex gap-4">
              <Link href="/menu" className="btn-primary flex-1">
                Order Again
              </Link>
              <Link href="/" className="btn-secondary flex-1">
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Demo Note */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-sm text-amber-800">
            🎭 Demo mode: Status updates are simulated. Refresh to see random progression.
          </p>
        </div>
      </div>
    </div>
  );
}
