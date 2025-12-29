'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import RiskBadge from '@/components/ai/RiskBadge';
import { showToast } from '@/components/ui/Toast';
import { formatCurrency, formatDateTime, formatRelativeTime, channelConfig, fulfillmentConfig, statusConfig, stationLabels } from '@/lib/formatting';
import { getStoredOrders, setStoredOrders, getStoredKitchenState, getStoredMenuItems } from '@/lib/storage';
import { predictPrepTime } from '@/lib/ai/prep-predictor';
import { suggestRouting, toStationRouting } from '@/lib/ai/routing-engine';
import { suggestRefundResolution, detectIssueType } from '@/lib/ai/refund-suggester';
import type { Order, RefundSuggestion } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'refund'>('details');
  const [loading, setLoading] = useState(true);
  
  // Refund state
  const [refundReason, setRefundReason] = useState('');
  const [refundSuggestion, setRefundSuggestion] = useState<RefundSuggestion | null>(null);

  useEffect(() => {
    const orders = getStoredOrders() || [];
    const found = orders.find(o => o.id === orderId);
    if (found) {
      setOrder(found);
      
      // Generate AI predictions if pending/accepted
      if (['pending', 'accepted'].includes(found.status)) {
        const kitchen = getStoredKitchenState();
        const menuItems = getStoredMenuItems();
        if (kitchen && menuItems) {
          const prediction = predictPrepTime(found, kitchen, menuItems);
          const routing = suggestRouting(found, kitchen);
          setOrder(prev => prev ? {
            ...prev,
            predictedPrepTime: prediction.predictedMinutes,
            prepTimeExplanation: prediction.explanation,
            stationRouting: toStationRouting(routing.tickets),
          } : prev);
        }
      }
    }
    setLoading(false);
  }, [orderId]);

  const updateOrderStatus = (newStatus: Order['status'], note?: string) => {
    if (!order) return;
    
    const orders = getStoredOrders() || [];
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          statusTimeline: [
            ...o.statusTimeline,
            { status: newStatus, timestamp: new Date().toISOString(), note, performedBy: 'Manager' }
          ],
        };
      }
      return o;
    });
    
    setStoredOrders(updatedOrders);
    setOrder(updatedOrders.find(o => o.id === orderId) || null);
    showToast({ type: 'success', title: `Order ${statusConfig[newStatus].label}` });
  };

  const updatePrepTime = (minutes: number) => {
    if (!order) return;
    
    const orders = getStoredOrders() || [];
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, prepTime: minutes };
      }
      return o;
    });
    
    setStoredOrders(updatedOrders);
    setOrder(prev => prev ? { ...prev, prepTime: minutes } : prev);
    showToast({ type: 'info', title: `Prep time updated to ${minutes} mins` });
  };

  const handleRefundReasonChange = (reason: string) => {
    setRefundReason(reason);
    if (order && reason.length > 10) {
      const issueContext = detectIssueType(reason);
      const suggestion = suggestRefundResolution(order, issueContext);
      setRefundSuggestion(suggestion);
    } else {
      setRefundSuggestion(null);
    }
  };

  const handleApproveRefund = () => {
    if (!order || !refundSuggestion) return;
    updateOrderStatus('refunded', `Refund: ${refundSuggestion.type}`);
    showToast({ type: 'success', title: 'Refund Processed', message: refundSuggestion.message });
    setActiveTab('timeline');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-2">❌</p>
          <p className="font-medium text-gray-900">Order not found</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-4 text-red-600 hover:text-red-700"
          >
            ← Back to orders
          </button>
        </div>
      </div>
    );
  }

  const channel = channelConfig[order.sourceChannel];
  const fulfillment = fulfillmentConfig[order.fulfillmentType];
  const status = statusConfig[order.status];

  return (
    <div className="min-h-screen">
      <Header 
        title={`Order #${order.orderNumber.split('-').pop()}`}
        subtitle={`${order.customerName} • ${formatRelativeTime(order.createdAt)}`}
        actions={
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            ← Back to Orders
          </button>
        }
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="subtle" className={`${channel.bgColor} ${channel.color}`} size="md">
                    {channel.label}
                  </Badge>
                  <Badge variant="subtle" className="bg-gray-100 text-gray-600" size="md">
                    {fulfillment.icon} {fulfillment.label}
                  </Badge>
                  <Badge variant="subtle" className={`${status.bgColor} ${status.color}`} size="md">
                    {status.label}
                  </Badge>
                  {order.riskLevel && order.riskLevel !== 'low' && (
                    <RiskBadge level={order.riskLevel} showLabel size="md" />
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {order.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateOrderStatus('accepted')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Accept Order
                  </button>
                  <button
                    onClick={() => updateOrderStatus('cancelled', 'Declined by restaurant')}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Decline
                  </button>
                </div>
              )}

              {order.status === 'accepted' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateOrderStatus('preparing')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                  >
                    Start Preparing
                  </button>
                  <button
                    onClick={() => showToast({ type: 'info', title: 'Demo: Would print kitchen ticket' })}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    🖨️ Print Ticket
                  </button>
                </div>
              )}

              {order.status === 'preparing' && (
                <button
                  onClick={() => updateOrderStatus('ready')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Mark Ready
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  {(['details', 'timeline', 'refund'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-medium capitalize ${
                        activeTab === tab
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    {/* Allergen Warning */}
                    {order.allergenNotes && (
                      <div className="allergen-banner p-3 rounded-lg flex items-center gap-2">
                        <span className="text-red-600 font-bold">⚠️ ALLERGEN:</span>
                        <span className="text-red-800 font-medium">{order.allergenNotes}</span>
                      </div>
                    )}

                    {/* Customer Notes */}
                    {order.notes && (
                      <div className="bg-blue-50 border-l-4 border-l-blue-400 p-3 rounded-lg">
                        <span className="text-blue-800">📝 {order.notes}</span>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h3 className="font-semibold mb-2">Items</h3>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{item.quantity}×</span>{' '}
                              <span>{item.name}</span>
                              {item.modifiers.length > 0 && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({item.modifiers.map(m => m.name).join(', ')})
                                </span>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                Station: {stationLabels[item.station]}
                              </div>
                            </div>
                            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal</span>
                          <span>{formatCurrency(order.totals.subtotal)}</span>
                        </div>
                        {order.totals.deliveryFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Delivery Fee</span>
                            <span>{formatCurrency(order.totals.deliveryFee)}</span>
                          </div>
                        )}
                        {order.totals.tip > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tip</span>
                            <span>{formatCurrency(order.totals.tip)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span>{formatCurrency(order.totals.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    {order.statusTimeline.slice().reverse().map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium">{statusConfig[entry.status]?.label || entry.status}</p>
                          <p className="text-sm text-gray-500">{formatDateTime(entry.timestamp)}</p>
                          {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
                          {entry.performedBy && <p className="text-xs text-gray-400">by {entry.performedBy}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'refund' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe the issue
                      </label>
                      <textarea
                        value={refundReason}
                        onChange={(e) => handleRefundReasonChange(e.target.value)}
                        placeholder="e.g., Customer reported missing item, late delivery..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        rows={3}
                      />
                    </div>

                    {refundSuggestion && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 flex items-center gap-2 mb-2">
                          🤖 AI Suggestion
                        </h4>
                        <p className="text-sm text-purple-800 mb-2">{refundSuggestion.reasoning}</p>
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <p className="font-medium">Recommended: {refundSuggestion.type.replace(/_/g, ' ')}</p>
                          {refundSuggestion.amount && (
                            <p className="text-sm text-gray-600">Amount: {formatCurrency(refundSuggestion.amount)}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-2">Customer message:</p>
                          <p className="text-sm italic">&ldquo;{refundSuggestion.message}&rdquo;</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleApproveRefund}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Approve Suggestion
                          </button>
                          <button
                            onClick={() => setRefundSuggestion(null)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">Customer</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {order.customerName}</p>
                {order.customerPhone && (
                  <p><span className="text-gray-500">Phone:</span> {order.customerPhone}</p>
                )}
                {order.deliveryAddress && (
                  <div>
                    <span className="text-gray-500">Address:</span>
                    <p className="mt-1">{order.deliveryAddress.line1}</p>
                    {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.postcode}</p>
                    {order.deliveryAddress.instructions && (
                      <p className="text-gray-500 italic mt-1">{order.deliveryAddress.instructions}</p>
                    )}
                  </div>
                )}
                {order.tableNumber && (
                  <p><span className="text-gray-500">Table:</span> {order.tableNumber}</p>
                )}
              </div>
            </div>

            {/* Prep Time */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">Prep Time</h3>
              {order.predictedPrepTime && (
                <div className="bg-purple-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-purple-800">
                    🤖 AI Predicted: <strong>{order.predictedPrepTime} mins</strong>
                  </p>
                  {order.prepTimeExplanation && (
                    <p className="text-xs text-purple-600 mt-1">{order.prepTimeExplanation}</p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {[10, 15, 20, 25, 30].map(mins => (
                  <button
                    key={mins}
                    onClick={() => updatePrepTime(mins)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      order.prepTime === mins
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Station Routing */}
            {order.stationRouting && order.stationRouting.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold mb-3">🤖 Station Routing</h3>
                <div className="space-y-2">
                  {order.stationRouting.map((ticket, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{ticket.station}</span>
                        <span className="text-sm text-gray-500">{ticket.estimatedTime} min</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {ticket.itemCount} item(s)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Info */}
            {order.riskLevel && order.riskLevel !== 'low' && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                <h3 className="font-semibold text-red-900 mb-3">⚠️ Risk Factors</h3>
                <ul className="space-y-1 text-sm text-red-800">
                  {order.riskReasons?.map((reason, idx) => (
                    <li key={idx}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
