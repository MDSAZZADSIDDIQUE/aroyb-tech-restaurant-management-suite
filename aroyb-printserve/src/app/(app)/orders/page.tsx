'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/storage';
import { channelConfig, fulfillmentConfig, formatDateTime, formatCurrency } from '@/lib/formatting';
import type { Order } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    setOrders(getOrders());
    setLoading(false);
  }, []);
  
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="text-left p-4 font-semibold">Order</th>
              <th className="text-left p-4 font-semibold">Customer</th>
              <th className="text-left p-4 font-semibold">Channel</th>
              <th className="text-left p-4 font-semibold">Type</th>
              <th className="text-left p-4 font-semibold">Total</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Created</th>
              <th className="text-left p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-t border-neutral-800 hover:bg-neutral-800/50">
                <td className="p-4 font-bold">{order.orderNumber}</td>
                <td className="p-4">{order.customerName}</td>
                <td className="p-4">
                  <span className={`badge ${channelConfig[order.channel].bgColor} ${channelConfig[order.channel].color}`}>
                    {channelConfig[order.channel].icon} {channelConfig[order.channel].label}
                  </span>
                </td>
                <td className="p-4">
                  <span>{fulfillmentConfig[order.fulfillmentType].icon} {fulfillmentConfig[order.fulfillmentType].label}</span>
                </td>
                <td className="p-4 font-semibold">{formatCurrency(order.totals.total)}</td>
                <td className="p-4">
                  <span className={`badge ${
                    order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'ready' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'preparing' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-neutral-500/20 text-neutral-400'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-neutral-400 text-sm">{formatDateTime(order.createdAt)}</td>
                <td className="p-4">
                  <Link href={`/orders/${order.id}`} className="btn btn-primary text-sm">
                    View & Print
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
