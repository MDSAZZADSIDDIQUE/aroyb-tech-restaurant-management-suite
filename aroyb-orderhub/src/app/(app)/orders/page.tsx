'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import OrderCard from '@/components/orders/OrderCard';
import { showToast } from '@/components/ui/Toast';
import { channelConfig, statusConfig } from '@/lib/formatting';
import { getStoredOrders, setStoredOrders } from '@/lib/storage';
import type { Order, SourceChannel, OrderStatus } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<SourceChannel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
    
    const handleNewOrder = () => loadOrders();
    window.addEventListener('new-order', handleNewOrder);
    return () => window.removeEventListener('new-order', handleNewOrder);
  }, []);

  useEffect(() => {
    let filtered = [...orders];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    if (channelFilter !== 'all') {
      filtered = filtered.filter(o => o.sourceChannel === channelFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerPhone?.includes(query)
      );
    }
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, channelFilter, searchQuery]);

  const loadOrders = () => {
    const storedOrders = getStoredOrders() || [];
    // Sort by createdAt descending
    storedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(storedOrders);
    setLoading(false);
  };

  const handleAcceptOrder = (orderId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'accepted' as const,
          statusTimeline: [
            ...order.statusTimeline,
            { status: 'accepted' as const, timestamp: new Date().toISOString(), performedBy: 'Manager' }
          ],
          prepTime: 15,
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    setStoredOrders(updatedOrders);
    showToast({ type: 'success', title: 'Order Accepted' });
  };

  const handleDeclineOrder = (orderId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'cancelled' as const,
          statusTimeline: [
            ...order.statusTimeline,
            { status: 'cancelled' as const, timestamp: new Date().toISOString(), note: 'Declined' }
          ],
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    setStoredOrders(updatedOrders);
    showToast({ type: 'warning', title: 'Order Declined' });
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const statusOptions: (OrderStatus | 'all')[] = ['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
  const channelOptions: (SourceChannel | 'all')[] = ['all', 'web', 'app', 'qr', 'marketplace'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Orders" 
        subtitle={`${orders.length} total orders`}
        actions={
          <button
            onClick={() => router.push('/orders?status=pending')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            View Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
        }
      />
      
      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by order #, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : statusConfig[status].label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Channel Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Channel:</span>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as SourceChannel | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {channelOptions.map(channel => (
                  <option key={channel} value={channel}>
                    {channel === 'all' ? 'All Channels' : channelConfig[channel].label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Clear */}
            {(statusFilter !== 'all' || channelFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setChannelFilter('all');
                  setSearchQuery('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <p className="text-4xl mb-2">📋</p>
              <p className="font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAcceptOrder}
                onDecline={handleDeclineOrder}
                onView={handleViewOrder}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
