'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import locationsData from '@/data/locations.json';
import { Location, Table, Order, OrderStatus } from '@/types';
import { getSessionOrders } from '@/lib/session-manager';

interface Props {
  params: { locationId: string; tableId: string };
}

const statusConfig: Record<OrderStatus, { icon: string; label: string; color: string }> = {
  'placed': { icon: '📝', label: 'Order Placed', color: 'text-secondary-600' },
  'accepted': { icon: '✅', label: 'Accepted', color: 'text-success-600' },
  'in-kitchen': { icon: '🍳', label: 'In Kitchen', color: 'text-warning-600' },
  'ready': { icon: '🔔', label: 'Ready', color: 'text-primary-600' },
  'served': { icon: '🍽️', label: 'Served', color: 'text-success-600' },
  'cancelled': { icon: '❌', label: 'Cancelled', color: 'text-danger-600' },
};

export default function TrackPage({ params }: Props) {
  const { locationId, tableId } = params;
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [location, setLocation] = useState<Location | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loc = (locationsData.locations as Location[]).find(l => l.id === locationId);
    if (loc) {
      setLocation(loc);
      setTable(loc.tables.find(t => t.id === tableId) || null);
    }
    
    // Get orders from localStorage
    const allOrders = getSessionOrders(orderId || '').filter(o => o.tableId === tableId);
    setOrders(allOrders);
    
    if (orderId) {
      const order = allOrders.find(o => o.orderId === orderId);
      setCurrentOrder(order || null);
    } else if (allOrders.length > 0) {
      setCurrentOrder(allOrders[allOrders.length - 1]);
    }
    
    // Simulate status progression for demo
    const interval = setInterval(() => {
      setCurrentOrder(prev => {
        if (!prev) return null;
        const statusOrder: OrderStatus[] = ['placed', 'accepted', 'in-kitchen', 'ready', 'served'];
        const currentIdx = statusOrder.indexOf(prev.status);
        if (currentIdx < statusOrder.length - 1 && currentIdx >= 0) {
          return { ...prev, status: statusOrder[currentIdx + 1] };
        }
        return prev;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [locationId, tableId, orderId]);

  const statusSteps: OrderStatus[] = ['placed', 'accepted', 'in-kitchen', 'ready', 'served'];
  const currentIdx = currentOrder ? statusSteps.indexOf(currentOrder.status) : -1;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href={`/t/${locationId}/${tableId}/menu`} className="text-neutral-600">
            ← Menu
          </Link>
          <h1 className="font-semibold text-neutral-900">Order Status</h1>
          <div />
        </div>
      </header>

      <div className="px-4 py-6">
        {currentOrder ? (
          <>
            {/* Current Status */}
            <div className="card text-center mb-6">
              <div className="text-5xl mb-3">
                {statusConfig[currentOrder.status].icon}
              </div>
              <h2 className={`text-2xl font-display font-bold ${statusConfig[currentOrder.status].color}`}>
                {statusConfig[currentOrder.status].label}
              </h2>
              <p className="text-neutral-500 mt-1">
                Order #{currentOrder.orderId.slice(-6)}
              </p>
              
              {currentOrder.status === 'in-kitchen' && (
                <p className="text-sm text-neutral-600 mt-4">
                  Your food is being prepared. Estimated 10-15 mins.
                </p>
              )}
              
              {currentOrder.status === 'ready' && (
                <div className="mt-4 p-4 bg-primary-50 rounded-xl">
                  <p className="text-primary-800 font-medium">
                    🔔 Your order is ready! A server will bring it shortly.
                  </p>
                </div>
              )}
              
              {currentOrder.status === 'served' && (
                <div className="mt-4 p-4 bg-success-50 rounded-xl">
                  <p className="text-success-800 font-medium">
                    Enjoy your meal! 🍽️
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="card">
              <h3 className="font-semibold text-neutral-900 mb-4">Order Timeline</h3>
              <div className="space-y-0">
                {statusSteps.map((step, idx) => {
                  const isComplete = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const config = statusConfig[step];
                  
                  return (
                    <div key={step} className="relative flex items-start gap-4 pb-6 last:pb-0">
                      {/* Connector Line */}
                      {idx < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 w-0.5 h-full -ml-px ${
                            isComplete ? 'bg-primary-600' : 'bg-neutral-200'
                          }`}
                        />
                      )}
                      
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        isComplete ? 'bg-primary-600' : 'bg-neutral-200'
                      }`}>
                        <span className={isComplete ? 'text-white' : 'text-neutral-400'}>
                          {isComplete ? '✓' : idx + 1}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <p className={`font-medium ${
                          isCurrent ? 'text-primary-600' : isComplete ? 'text-neutral-900' : 'text-neutral-400'
                        }`}>
                          {config.icon} {config.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-neutral-500">Now</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Info */}
            {currentOrder.coursesWaiting.length > 0 && (
              <div className="card mt-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Courses</h3>
                <div className="space-y-2">
                  {currentOrder.coursesFired.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="badge-success">Sent</span>
                      <span className="text-sm capitalize">
                        {currentOrder.coursesFired.join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="badge-neutral">Waiting</span>
                    <span className="text-sm capitalize">
                      {currentOrder.coursesWaiting.join(', ')}
                    </span>
                  </div>
                  <button className="btn-secondary w-full mt-3">
                    Send Next Course
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              No Active Orders
            </h2>
            <p className="text-neutral-600 mb-6">
              Place an order to track it here
            </p>
            <Link href={`/t/${locationId}/${tableId}/menu`} className="btn-primary">
              View Menu
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="px-4 py-3 flex gap-3">
          <Link href={`/t/${locationId}/${tableId}/menu`} className="btn-secondary flex-1">
            Order More
          </Link>
          <button className="btn-ghost">
            🛎️ Call Waiter
          </button>
          <button className="btn-ghost">
            🧾 Request Bill
          </button>
        </div>
      </div>
    </div>
  );
}
