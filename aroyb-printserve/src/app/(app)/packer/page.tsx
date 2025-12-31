'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrders, getOrderById } from '@/lib/storage';
import { generatePackingChecklist, getChecklistSummary } from '@/lib/ai/packing-checklist';
import type { Order, PackingChecklist, PackingCheckItem } from '@/types';

export default function PackerPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [checklist, setChecklist] = useState<PackingChecklist | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const allOrders = getOrders().filter(o => o.status === 'preparing' || o.status === 'ready');
    setOrders(allOrders);
    
    if (orderId) {
      const order = getOrderById(orderId);
      if (order) {
        setSelectedOrder(order);
        setChecklist(generatePackingChecklist(order));
      }
    }
    
    setLoading(false);
  }, [orderId]);
  
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setChecklist(generatePackingChecklist(order));
    setCheckedItems(new Set());
  };
  
  const handleToggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  const handleCompleteAll = () => {
    if (!checklist) return;
    setCheckedItems(new Set(checklist.items.map(i => i.id)));
  };
  
  const handleReset = () => {
    setCheckedItems(new Set());
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const summary = checklist ? getChecklistSummary(checklist) : null;
  const progress = checklist ? (checkedItems.size / checklist.items.length) * 100 : 0;
  
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-4">Packer View</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Selector */}
        <div className="card lg:col-span-1">
          <h2 className="font-semibold mb-4">Select Order</h2>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {orders.length === 0 ? (
              <p className="text-neutral-500 text-sm">No orders ready for packing</p>
            ) : (
              orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedOrder?.id === order.id 
                      ? 'bg-[#ed7424] text-white' 
                      : 'bg-neutral-800 hover:bg-neutral-700'
                  }`}
                >
                  <div className="font-bold text-lg">{order.orderNumber}</div>
                  <div className="text-sm opacity-75">{order.customerName}</div>
                  <div className="text-sm opacity-75">{order.items.length} items</div>
                </button>
              ))
            )}
          </div>
        </div>
        
        {/* Checklist */}
        <div className="card lg:col-span-2">
          {!selectedOrder || !checklist ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 text-lg">Select an order to see packing checklist</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedOrder.orderNumber}</h2>
                  <p className="text-neutral-400">{selectedOrder.customerName}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleReset} className="btn btn-ghost text-sm">Reset</button>
                  <button onClick={handleCompleteAll} className="btn btn-primary text-sm">Mark All</button>
                </div>
              </div>
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{checkedItems.size} of {checklist.items.length} done</span>
                  <span className={progress === 100 ? 'text-green-400' : ''}>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-[#ed7424]'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {/* Summary */}
              {summary && (
                <div className="flex gap-4 mb-4 text-sm">
                  <span className="badge bg-neutral-700">{summary.categories['item'] || 0} items</span>
                  <span className="badge bg-neutral-700">{summary.categories['extra'] || 0} extras</span>
                  {summary.highRiskItems > 0 && (
                    <span className="badge bg-red-500/20 text-red-400">⚠️ {summary.highRiskItems} high-risk</span>
                  )}
                </div>
              )}
              
              {/* Checklist Items */}
              <div className="space-y-2">
                {checklist.items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={`packer-item ${checkedItems.has(item.id) ? 'checked' : ''} ${item.isHighRisk ? 'high-risk' : ''}`}
                  >
                    <div className="packer-checkbox">
                      {checkedItems.has(item.id) && <span className="text-white text-xl">✓</span>}
                    </div>
                    <span className="flex-1">{item.text}</span>
                    {item.isHighRisk && !checkedItems.has(item.id) && (
                      <span className="text-red-400">⚠️</span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Complete */}
              {progress === 100 && (
                <div className="mt-6 p-4 rounded-lg bg-green-500/20 text-green-400 text-center">
                  ✅ All items checked! Order ready for handoff.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
