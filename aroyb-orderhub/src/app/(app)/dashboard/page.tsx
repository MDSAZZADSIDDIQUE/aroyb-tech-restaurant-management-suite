'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import OrderCard from '@/components/orders/OrderCard';
import { showToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/formatting';
import { getStoredOrders, setStoredOrders, getStoredKitchenState, setStoredKitchenState } from '@/lib/storage';
import { generateThrottleSuggestions } from '@/lib/ai/throttle-engine';
import type { Order, KitchenState, ThrottleSuggestion } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenState, setKitchenState] = useState<KitchenState | null>(null);
  const [suggestions, setSuggestions] = useState<ThrottleSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Listen for new orders
    const handleNewOrder = () => loadData();
    window.addEventListener('new-order', handleNewOrder);
    return () => window.removeEventListener('new-order', handleNewOrder);
  }, []);

  const loadData = () => {
    const storedOrders = getStoredOrders() || [];
    const storedKitchen = getStoredKitchenState() || {
      loadPercent: 58,
      backlogCount: storedOrders.filter(o => o.status === 'pending').length,
      avgTicketMinutes: 14,
      stationLoads: { grill: 65, fry: 40, curry: 72, dessert: 25, bar: 30, prep: 45 },
      activeOrders: storedOrders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status)).length,
      completedToday: storedOrders.filter(o => o.status === 'completed').length,
    };
    
    setOrders(storedOrders);
    setKitchenState(storedKitchen);
    
    // Generate AI suggestions
    const pendingOrders = storedOrders.filter(o => o.status === 'pending');
    setSuggestions(generateThrottleSuggestions(storedKitchen, pendingOrders));
    
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
    showToast({ type: 'success', title: 'Order Accepted', message: 'Customer has been notified' });
  };

  const handleDeclineOrder = (orderId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'cancelled' as const,
          statusTimeline: [
            ...order.statusTimeline,
            { status: 'cancelled' as const, timestamp: new Date().toISOString(), note: 'Declined by restaurant' }
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

  const handleApplySuggestion = (suggestion: ThrottleSuggestion) => {
    // Apply the suggestion (demo)
    if (suggestion.type === 'extend_prep_times' && kitchenState) {
      setKitchenState({ ...kitchenState, avgTicketMinutes: kitchenState.avgTicketMinutes + 5 });
    }
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    showToast({ type: 'success', title: 'Suggestion Applied', message: suggestion.title });
  };

  const handleAdjustLoad = (delta: number) => {
    if (!kitchenState) return;
    const newLoad = Math.max(0, Math.min(100, kitchenState.loadPercent + delta));
    const updated = { ...kitchenState, loadPercent: newLoad };
    setKitchenState(updated);
    setStoredKitchenState(updated);
    setSuggestions(generateThrottleSuggestions(updated, orders.filter(o => o.status === 'pending')));
  };

  // Stats
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing'].includes(o.status));
  const todayRevenue = orders
    .filter(o => ['completed', 'ready', 'out_for_delivery'].includes(o.status))
    .reduce((sum, o) => sum + o.totals.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Real-time overview of your restaurant operations" />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending Orders"
            value={pendingOrders.length}
            icon="🔔"
            color="yellow"
            subtitle={pendingOrders.length > 0 ? 'Requires action' : 'All clear'}
          />
          <StatCard
            title="Active Orders"
            value={activeOrders.length}
            icon="🍳"
            color="blue"
            subtitle="In preparation"
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            icon="💷"
            color="green"
            subtitle={`${orders.filter(o => o.status === 'completed').length} completed`}
          />
          <StatCard
            title="Kitchen Load"
            value={`${kitchenState?.loadPercent || 0}%`}
            icon="📊"
            color={kitchenState?.loadPercent && kitchenState.loadPercent > 75 ? 'red' : 'gray'}
            subtitle={
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleAdjustLoad(-10)}
                  className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  -10%
                </button>
                <button
                  onClick={() => handleAdjustLoad(10)}
                  className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  +10%
                </button>
              </div>
            }
          />
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-3">
              <span>🤖</span> AI Suggestions
            </h3>
            <div className="space-y-2">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{suggestion.title}</p>
                    <p className="text-sm text-gray-500">{suggestion.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Orders Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Incoming Orders</h2>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm font-medium">
                  {pendingOrders.length} pending
                </span>
              </div>
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-4xl mb-2">✅</p>
                    <p>No pending orders</p>
                    <p className="text-sm">All orders have been processed</p>
                  </div>
                ) : (
                  pendingOrders.map(order => (
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

          {/* Kitchen Status */}
          <div className="space-y-4">
            {/* Station Loads */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Station Load</h3>
              <div className="space-y-3">
                {kitchenState && Object.entries(kitchenState.stationLoads).map(([station, load]) => (
                  <div key={station}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize">{station}</span>
                      <span className={load > 80 ? 'text-red-600 font-medium' : ''}>{load}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          load > 80 ? 'bg-red-500' : load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${load}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Active Orders</h3>
              <div className="space-y-2">
                {activeOrders.slice(0, 5).map(order => (
                  <OrderCard key={order.id} order={order} onView={handleViewOrder} showActions={false} compact />
                ))}
                {activeOrders.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No active orders</p>
                )}
                {activeOrders.length > 5 && (
                  <button
                    onClick={() => router.push('/orders?status=active')}
                    className="w-full text-center text-sm text-red-600 hover:text-red-700 py-2"
                  >
                    View all {activeOrders.length} orders →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'gray';
  subtitle?: React.ReactNode;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colors = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {typeof subtitle === 'string' ? (
            <p className="text-xs text-gray-500">{subtitle}</p>
          ) : (
            subtitle
          )}
        </div>
      </div>
    </div>
  );
}
