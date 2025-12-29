'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import { Location, Order, ServiceRequest } from '@/types';
import { getOrders, getServiceRequests } from '@/lib/session-manager';
import { getKitchenState } from '@/lib/pacing-engine';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const locations = locationsData.locations as Location[];
  const kitchenState = getKitchenState();

  useEffect(() => {
    setOrders(getOrders());
    setServiceRequests(getServiceRequests());
    
    // Poll for updates
    const interval = setInterval(() => {
      setOrders(getOrders());
      setServiceRequests(getServiceRequests());
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter(o => !['served', 'cancelled'].includes(o.status));
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending');
  const totalTables = locations.reduce((sum, l) => sum + l.tables.length, 0);

  const stats = [
    { label: 'Active Orders', value: activeOrders.length, icon: '🍽️', color: 'bg-primary-50 text-primary-700' },
    { label: 'Service Requests', value: pendingRequests.length, icon: '🛎️', color: 'bg-warning-50 text-warning-700' },
    { label: 'Kitchen Load', value: `${kitchenState.load}%`, icon: '🍳', color: 'bg-secondary-50 text-secondary-700' },
    { label: 'Total Tables', value: totalTables, icon: '🪑', color: 'bg-success-50 text-success-700' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500">Live overview of your restaurant</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-2xl mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Link href="/admin/tables" className="card hover:shadow-lg transition-shadow">
          <h3 className="font-semibold text-neutral-900 mb-2">🪑 View Tables</h3>
          <p className="text-sm text-neutral-500">See table status and sessions</p>
        </Link>
        <Link href="/admin/kitchen" className="card hover:shadow-lg transition-shadow">
          <h3 className="font-semibold text-neutral-900 mb-2">🍳 Kitchen Controls</h3>
          <p className="text-sm text-neutral-500">Adjust load and fire courses</p>
        </Link>
        <Link href="/admin/settings" className="card hover:shadow-lg transition-shadow">
          <h3 className="font-semibold text-neutral-900 mb-2">⚙️ Settings</h3>
          <p className="text-sm text-neutral-500">Configure features & charges</p>
        </Link>
      </div>

      {/* Service Requests */}
      {pendingRequests.length > 0 && (
        <div className="card mb-8">
          <h2 className="font-semibold text-neutral-900 mb-4">🛎️ Pending Requests</h2>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-warning-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {req.type === 'call_waiter' ? '🙋 Call Waiter' : '🧾 Request Bill'}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {req.tableName} • {req.guestName || 'Guest'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">
                    {new Date(req.createdAt).toLocaleTimeString()}
                  </p>
                  <button className="text-primary-600 text-sm font-medium hover:underline">
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Orders */}
      <div className="card">
        <h2 className="font-semibold text-neutral-900 mb-4">📋 Active Orders</h2>
        {activeOrders.length > 0 ? (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    Order #{order.orderId.slice(-6)}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {order.items.length} items • £{order.total.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    order.status === 'placed' ? 'badge-secondary' :
                    order.status === 'accepted' ? 'badge-primary' :
                    order.status === 'in-kitchen' ? 'badge-warning' :
                    order.status === 'ready' ? 'badge-success' : 'badge-neutral'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 py-8 text-center">
            No active orders. Place a test order from the customer view.
          </p>
        )}
      </div>
    </div>
  );
}
