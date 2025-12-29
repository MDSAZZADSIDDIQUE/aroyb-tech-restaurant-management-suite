'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { showToast } from '@/components/ui/Toast';
import { formatRelativeTime, stationLabels } from '@/lib/formatting';
import { getStoredOrders, getStoredKitchenState, setStoredKitchenState } from '@/lib/storage';
import { getStationColor, getStationPriorityOrder } from '@/lib/ai/routing-engine';
import type { Order, KitchenState, KitchenStation } from '@/types';

export default function KitchenPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenState, setKitchenState] = useState<KitchenState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    const handleNewOrder = () => loadData();
    window.addEventListener('new-order', handleNewOrder);
    return () => window.removeEventListener('new-order', handleNewOrder);
  }, []);

  const loadData = () => {
    const storedOrders = getStoredOrders() || [];
    const activeOrders = storedOrders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));
    setOrders(activeOrders);
    setKitchenState(getStoredKitchenState());
    setLoading(false);
  };

  const handleAdjustStationLoad = (station: KitchenStation, delta: number) => {
    if (!kitchenState) return;
    const newLoad = Math.max(0, Math.min(100, (kitchenState.stationLoads[station] || 50) + delta));
    const updated = {
      ...kitchenState,
      stationLoads: { ...kitchenState.stationLoads, [station]: newLoad },
    };
    setKitchenState(updated);
    setStoredKitchenState(updated);
  };

  // Group orders by station
  const ordersByStation = new Map<KitchenStation, Order[]>();
  orders.forEach(order => {
    order.items.forEach(item => {
      const station = item.station;
      const existing = ordersByStation.get(station) || [];
      if (!existing.find(o => o.id === order.id)) {
        existing.push(order);
        ordersByStation.set(station, existing);
      }
    });
  });

  const stations = getStationPriorityOrder();

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
        title="Kitchen Display" 
        subtitle={`${orders.length} active orders across ${ordersByStation.size} stations`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast({ type: 'info', title: 'Demo: Would refresh kitchen display' })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              🔄 Refresh
            </button>
          </div>
        }
      />
      
      <div className="p-6">
        {/* Overall Kitchen Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Overall Kitchen Load</h2>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                (kitchenState?.loadPercent || 0) > 80 ? 'bg-red-500' :
                (kitchenState?.loadPercent || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <span className="font-bold">{kitchenState?.loadPercent || 0}%</span>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                (kitchenState?.loadPercent || 0) > 80 ? 'bg-red-500' :
                (kitchenState?.loadPercent || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${kitchenState?.loadPercent || 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Active: {kitchenState?.activeOrders || 0}</span>
            <span>Backlog: {kitchenState?.backlogCount || 0}</span>
            <span>Avg Ticket: {kitchenState?.avgTicketMinutes || 0} min</span>
          </div>
        </div>

        {/* Station Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stations.map(station => {
            const stationOrders = ordersByStation.get(station) || [];
            const colors = getStationColor(station);
            const load = kitchenState?.stationLoads[station] || 0;
            
            return (
              <div key={station} className={`rounded-xl border-2 ${colors.border} overflow-hidden`}>
                {/* Station Header */}
                <div className={`px-4 py-3 ${colors.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {stationLabels[station]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                      {stationOrders.length} orders
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAdjustStationLoad(station, -10)}
                      className="w-6 h-6 rounded bg-white/50 hover:bg-white text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-10 text-center">{load}%</span>
                    <button
                      onClick={() => handleAdjustStationLoad(station, 10)}
                      className="w-6 h-6 rounded bg-white/50 hover:bg-white text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Station Orders */}
                <div className="p-2 bg-white space-y-2 max-h-80 overflow-y-auto">
                  {stationOrders.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-sm">No tickets</p>
                  ) : (
                    stationOrders.map(order => {
                      const stationItems = order.items.filter(i => i.station === station);
                      return (
                        <div
                          key={order.id}
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                            order.status === 'preparing' ? 'bg-orange-50 border-orange-200' :
                            order.status === 'ready' ? 'bg-green-50 border-green-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">#{order.orderNumber.split('-').pop()}</span>
                            <span className="text-xs text-gray-500">{formatRelativeTime(order.createdAt)}</span>
                          </div>
                          
                          {/* Allergen Warning */}
                          {order.allergenNotes && (
                            <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mb-2 font-medium">
                              ⚠️ {order.allergenNotes}
                            </div>
                          )}
                          
                          {/* Items */}
                          <ul className="text-sm space-y-1">
                            {stationItems.map(item => (
                              <li key={item.id}>
                                <span className="font-medium">{item.quantity}×</span> {item.name}
                                {item.modifiers.length > 0 && (
                                  <span className="text-gray-500 text-xs ml-1">
                                    ({item.modifiers.map(m => m.name).join(', ')})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
