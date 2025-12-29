'use client';

import { useState, useEffect } from 'react';
import { KitchenState, Order } from '@/types';
import { getKitchenState, setKitchenState, getKitchenStatusFromLoad } from '@/lib/pacing-engine';
import { getOrders } from '@/lib/session-manager';

export default function AdminKitchenPage() {
  const [kitchen, setKitchen] = useState<KitchenState>(getKitchenState());
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders().filter(o => ['accepted', 'in-kitchen', 'ready'].includes(o.status)));
  }, []);

  const handleLoadChange = (newLoad: number) => {
    const newState: KitchenState = {
      ...kitchen,
      load: newLoad,
      status: getKitchenStatusFromLoad(newLoad),
    };
    setKitchen(newState);
    setKitchenState(newState);
  };

  const handleBacklogChange = (backlog: number) => {
    const newState: KitchenState = {
      ...kitchen,
      ticketBacklog: backlog,
    };
    setKitchen(newState);
    setKitchenState(newState);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-900">Kitchen Control</h1>
        <p className="text-neutral-500">Simulate kitchen load and manage orders</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Load Control */}
        <div className="card">
          <h2 className="font-semibold text-neutral-900 mb-4">Kitchen Load</h2>
          
          <div className="space-y-6">
            {/* Current Status */}
            <div className="text-center p-6 rounded-xl bg-neutral-50">
              <p className="text-5xl font-bold mb-2">{kitchen.load}%</p>
              <span className={`status-chip ${
                kitchen.status === 'quiet' ? 'status-active' :
                kitchen.status === 'normal' ? 'status-active' :
                kitchen.status === 'busy' ? 'status-busy' : 'status-slammed'
              }`}>
                {kitchen.status.toUpperCase()}
              </span>
            </div>

            {/* Load Slider */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Adjust Kitchen Load
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={kitchen.load}
                onChange={(e) => handleLoadChange(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    ${kitchen.load <= 50 ? '#22c55e' : kitchen.load <= 75 ? '#f59e0b' : '#ef4444'} 0%, 
                    ${kitchen.load <= 50 ? '#22c55e' : kitchen.load <= 75 ? '#f59e0b' : '#ef4444'} ${kitchen.load}%, 
                    #e5e5e5 ${kitchen.load}%, 
                    #e5e5e5 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Quiet</span>
                <span>Normal</span>
                <span>Busy</span>
                <span>Slammed</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              <button onClick={() => handleLoadChange(20)} className="btn-ghost flex-1 text-sm">
                🟢 Quiet
              </button>
              <button onClick={() => handleLoadChange(50)} className="btn-ghost flex-1 text-sm">
                🟡 Normal
              </button>
              <button onClick={() => handleLoadChange(75)} className="btn-ghost flex-1 text-sm">
                🟠 Busy
              </button>
              <button onClick={() => handleLoadChange(95)} className="btn-ghost flex-1 text-sm">
                🔴 Slammed
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Backlog */}
        <div className="card">
          <h2 className="font-semibold text-neutral-900 mb-4">Ticket Backlog</h2>
          
          <div className="space-y-6">
            <div className="text-center p-6 rounded-xl bg-neutral-50">
              <p className="text-5xl font-bold mb-2">{kitchen.ticketBacklog}</p>
              <p className="text-neutral-500">tickets waiting</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Simulate Backlog
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={kitchen.ticketBacklog}
                onChange={(e) => handleBacklogChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleBacklogChange(0)} className="btn-ghost flex-1 text-sm">
                Clear
              </button>
              <button onClick={() => handleBacklogChange(5)} className="btn-ghost flex-1 text-sm">
                Light
              </button>
              <button onClick={() => handleBacklogChange(10)} className="btn-ghost flex-1 text-sm">
                Medium
              </button>
              <button onClick={() => handleBacklogChange(15)} className="btn-ghost flex-1 text-sm">
                Heavy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Kitchen Orders */}
      <div className="card mt-8">
        <h2 className="font-semibold text-neutral-900 mb-4">Active Kitchen Orders</h2>
        
        {orders.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className={`p-4 rounded-xl border-2 ${
                  order.status === 'accepted' ? 'border-secondary-300 bg-secondary-50' :
                  order.status === 'in-kitchen' ? 'border-warning-300 bg-warning-50' :
                  'border-success-300 bg-success-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono font-semibold">
                    #{order.orderId.slice(-6)}
                  </span>
                  <span className={`badge ${
                    order.status === 'accepted' ? 'badge-secondary' :
                    order.status === 'in-kitchen' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <p className="text-sm text-neutral-600 mb-3">
                  {order.items.length} items
                </p>
                
                <div className="flex gap-2">
                  {order.status === 'accepted' && (
                    <button className="btn-ghost text-xs flex-1">
                      Start Cooking
                    </button>
                  )}
                  {order.status === 'in-kitchen' && (
                    <button className="btn-ghost text-xs flex-1">
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button className="btn-ghost text-xs flex-1">
                      Mark Served
                    </button>
                  )}
                </div>

                {/* Fire Course Button */}
                {order.coursesWaiting.length > 0 && (
                  <button className="btn-secondary w-full mt-2 text-xs">
                    🔥 Fire {order.coursesWaiting[0]}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 py-8 text-center">
            No active kitchen orders. Place a test order from the customer view.
          </p>
        )}
      </div>
    </div>
  );
}
