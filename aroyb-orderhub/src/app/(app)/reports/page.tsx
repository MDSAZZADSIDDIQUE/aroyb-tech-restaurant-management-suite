'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { formatCurrency, channelConfig } from '@/lib/formatting';
import { getStoredOrders, getStoredKitchenState } from '@/lib/storage';
import type { Order, SourceChannel } from '@/types';

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedOrders = getStoredOrders() || [];
    setOrders(storedOrders);
    setLoading(false);
  }, []);

  // Calculate stats
  const completedOrders = orders.filter(o => ['completed', 'ready', 'out_for_delivery'].includes(o.status));
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totals.total, 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  
  const ordersByChannel: Record<SourceChannel, number> = {
    web: orders.filter(o => o.sourceChannel === 'web').length,
    app: orders.filter(o => o.sourceChannel === 'app').length,
    qr: orders.filter(o => o.sourceChannel === 'qr').length,
    marketplace: orders.filter(o => o.sourceChannel === 'marketplace').length,
  };
  
  const refundedOrders = orders.filter(o => o.status === 'refunded');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  
  // Popular items
  const itemCounts = new Map<string, number>();
  orders.forEach(order => {
    order.items.forEach(item => {
      itemCounts.set(item.name, (itemCounts.get(item.name) || 0) + item.quantity);
    });
  });
  const topItems = [...itemCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Reports & Analytics" subtitle="Overview of your restaurant performance" />
      
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon="💷"
            subtitle={`${completedOrders.length} completed orders`}
          />
          <MetricCard
            title="Average Order"
            value={formatCurrency(avgOrderValue)}
            icon="📊"
            subtitle="Per order value"
          />
          <MetricCard
            title="Total Orders"
            value={orders.length}
            icon="📋"
            subtitle={`${orders.filter(o => o.status === 'pending').length} pending`}
          />
          <MetricCard
            title="Refund Rate"
            value={`${orders.length > 0 ? ((refundedOrders.length / orders.length) * 100).toFixed(1) : 0}%`}
            icon="↩️"
            subtitle={`${refundedOrders.length} refunded`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Orders by Channel</h3>
            <div className="space-y-3">
              {(Object.entries(ordersByChannel) as [SourceChannel, number][]).map(([channel, count]) => {
                const config = channelConfig[channel];
                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                return (
                  <div key={channel}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                      <span>{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${config.bgColor.replace('100', '500')}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Top Selling Items</h3>
            <div className="space-y-2">
              {topItems.map(([name, count], idx) => (
                <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {idx + 1}
                    </span>
                    <span>{name}</span>
                  </div>
                  <span className="text-gray-500">{count} sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-4">
            🤖 AI Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              title="Peak Hours"
              description="Dinner service (6-9 PM) sees 65% of daily orders. Consider additional staff."
            />
            <InsightCard
              title="Popular Combos"
              description="Chicken Tikka Masala + Garlic Naan is ordered together 78% of the time."
            />
            <InsightCard
              title="Prep Accuracy"
              description="AI prep predictions are within 3 minutes of actual 85% of the time."
            />
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Order Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { status: 'pending', label: 'Pending', color: 'yellow' },
              { status: 'accepted', label: 'Accepted', color: 'blue' },
              { status: 'preparing', label: 'Preparing', color: 'orange' },
              { status: 'ready', label: 'Ready', color: 'green' },
              { status: 'completed', label: 'Completed', color: 'gray' },
              { status: 'cancelled', label: 'Cancelled', color: 'red' },
              { status: 'refunded', label: 'Refunded', color: 'red' },
            ].map(({ status, label, color }) => {
              const count = orders.filter(o => o.status === status).length;
              return (
                <div key={status} className={`p-3 rounded-lg bg-${color}-50`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-600">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, subtitle }: { title: string; value: string | number; icon: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-3">
      <h4 className="font-medium text-purple-900 mb-1">{title}</h4>
      <p className="text-sm text-purple-700">{description}</p>
    </div>
  );
}
