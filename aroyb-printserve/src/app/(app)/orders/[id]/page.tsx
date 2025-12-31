'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrderById, getTemplateByBranch, getActiveBranch, getPrintersByBranch, getActiveBranchId, addPrintJob } from '@/lib/storage';
import { generatePackingChecklist } from '@/lib/ai/packing-checklist';
import { channelConfig, fulfillmentConfig, formatDateTime, formatCurrency, generateId, getAllergenIcon } from '@/lib/formatting';
import ReceiptPreview from '@/components/print/ReceiptPreview';
import DocketPreview from '@/components/print/DocketPreview';
import LabelPreview, { AllergenLabel } from '@/components/print/LabelPreview';
import type { Order, Branch, Template, Printer, PrintJob } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [activeTab, setActiveTab] = useState<'receipt' | 'docket' | 'labels' | 'allergen'>('receipt');
  const [printStatus, setPrintStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const orderData = getOrderById(id);
    const branchData = getActiveBranch();
    const branchId = getActiveBranchId();
    const templateData = getTemplateByBranch(branchId);
    const printerData = getPrintersByBranch(branchId);
    
    setOrder(orderData || null);
    setBranch(branchData || null);
    setTemplate(templateData || null);
    setPrinters(printerData);
    setLoading(false);
  }, [id]);
  
  const handlePrint = (type: 'receipt' | 'docket' | 'label' | 'allergen') => {
    if (!order || !branch) return;
    
    const printer = printers.find(p => 
      (type === 'docket' && p.type === 'kitchen') ||
      (type === 'receipt' && p.type === 'front') ||
      ((type === 'label' || type === 'allergen') && p.type === 'label')
    );
    
    if (!printer) {
      setPrintStatus(`No ${type} printer available`);
      return;
    }
    
    const job: PrintJob = {
      id: generateId('job-'),
      type,
      branchId: branch.id,
      printerId: printer.id,
      orderId: order.id,
      payload: { order, template },
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    addPrintJob(job);
    setPrintStatus(`Print job sent to ${printer.name}`);
    
    // Clear status after 3s
    setTimeout(() => setPrintStatus(''), 3000);
  };
  
  const handlePrintBundle = () => {
    handlePrint('docket');
    handlePrint('label');
    handlePrint('receipt');
    
    if (order?.allergenNotes || order?.items.some(i => i.allergens?.length)) {
      handlePrint('allergen');
    }
  };
  
  const handleBrowserPrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!order || !branch || !template) {
    return (
      <div className="p-6">
        <p className="text-red-400">Order not found</p>
        <Link href="/orders" className="btn btn-ghost mt-4">← Back to Orders</Link>
      </div>
    );
  }
  
  const checklist = generatePackingChecklist(order);
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/orders" className="text-neutral-400 hover:text-white text-sm mb-2 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge ${channelConfig[order.channel].bgColor} ${channelConfig[order.channel].color}`}>
              {channelConfig[order.channel].icon} {channelConfig[order.channel].label}
            </span>
            <span>{fulfillmentConfig[order.fulfillmentType].icon} {fulfillmentConfig[order.fulfillmentType].label}</span>
            {order.tableNumber && <span className="font-bold">Table {order.tableNumber}</span>}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleBrowserPrint} className="btn btn-ghost">
            🖨️ Browser Print
          </button>
          <button onClick={handlePrintBundle} className="btn btn-primary">
            ✨ Print Full Bundle
          </button>
        </div>
      </div>
      
      {/* Print Status */}
      {printStatus && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/20 text-green-400">
          ✅ {printStatus}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Order Details</h2>
          
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Customer</span>
              <span>{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Created</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            {order.address && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Address</span>
                <span className="text-right max-w-[200px]">{order.address}</span>
              </div>
            )}
          </div>
          
          {/* Items */}
          <div className="border-t border-neutral-700 pt-4">
            <h3 className="font-semibold mb-2">Items</h3>
            {order.items.map(item => (
              <div key={item.id} className="py-2 border-b border-neutral-800 last:border-0">
                <div className="flex justify-between">
                  <span className="font-medium">{item.quantity}× {item.name}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
                {item.modifiers.length > 0 && (
                  <div className="text-sm text-neutral-400 mt-1">
                    {item.modifiers.join(', ')}
                  </div>
                )}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="text-sm text-red-400 mt-1">
                    {item.allergens.map(a => `${getAllergenIcon(a)} ${a}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Totals */}
          <div className="border-t border-neutral-700 pt-4 mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(order.totals.subtotal)}</span>
            </div>
            {order.totals.fees > 0 && (
              <div className="flex justify-between text-sm">
                <span>Fees</span>
                <span>{formatCurrency(order.totals.fees)}</span>
              </div>
            )}
            {order.totals.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tip</span>
                <span>{formatCurrency(order.totals.tip)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-700">
              <span>Total</span>
              <span>{formatCurrency(order.totals.total)}</span>
            </div>
          </div>
          
          {/* Notes */}
          {(order.customerNotes || order.allergenNotes) && (
            <div className="mt-4 space-y-2">
              {order.customerNotes && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <span className="text-xs text-blue-400 font-semibold">📝 Customer Note:</span>
                  <p className="text-sm mt-1">{order.customerNotes}</p>
                </div>
              )}
              {order.allergenNotes && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <span className="text-xs text-red-400 font-semibold">⚠️ Allergen Note:</span>
                  <p className="text-sm mt-1">{order.allergenNotes}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Packing Checklist */}
          <div className="mt-4 border-t border-neutral-700 pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              🤖 AI Packing Checklist
              <span className="badge bg-purple-500/20 text-purple-400">Generated</span>
            </h3>
            <div className="space-y-1 text-sm">
              {checklist.items.slice(0, 8).map(item => (
                <div key={item.id} className={`flex items-center gap-2 ${item.isHighRisk ? 'text-red-400' : ''}`}>
                  <span>□</span>
                  <span>{item.text}</span>
                </div>
              ))}
              {checklist.items.length > 8 && (
                <Link href={`/packer?orderId=${order.id}`} className="text-[#ed7424] hover:underline">
                  View full checklist ({checklist.items.length} items) →
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Print Previews */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Print Previews</h2>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(['receipt', 'docket', 'labels', 'allergen'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab ? 'bg-[#ed7424] text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Preview */}
          <div className="bg-neutral-900 p-4 rounded-lg flex justify-center overflow-auto max-h-[600px]">
            {activeTab === 'receipt' && (
              <ReceiptPreview order={order} branch={branch} template={template.receipt} />
            )}
            {activeTab === 'docket' && (
              <DocketPreview order={order} template={template.docket} />
            )}
            {activeTab === 'labels' && (
              <LabelPreview order={order} template={template.labels} />
            )}
            {activeTab === 'allergen' && (
              <AllergenLabel order={order} />
            )}
          </div>
          
          {/* Print This */}
          <button 
            onClick={() => handlePrint(activeTab === 'labels' ? 'label' : activeTab)}
            className="btn btn-success w-full mt-4"
          >
            🖨️ Print {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
}
