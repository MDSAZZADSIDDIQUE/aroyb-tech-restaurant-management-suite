'use client';

import type { Order, Branch, ReceiptTemplate } from '@/types';
import { formatCurrency, formatTime, formatDate } from '@/lib/formatting';

interface ReceiptPreviewProps {
  order: Order;
  branch: Branch;
  template: ReceiptTemplate;
}

export default function ReceiptPreview({ order, branch, template }: ReceiptPreviewProps) {
  return (
    <div className="thermal-paper" style={{ fontSize: `${12 * template.fontScale}px` }}>
      {/* Header */}
      <div className="header">
        {template.headerLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      
      <div className="divider" />
      
      {/* Order Info */}
      <div className="text-center text-sm mb-2">
        <div><strong>{order.orderNumber}</strong></div>
        <div>{formatDate(order.createdAt)} {formatTime(order.createdAt)}</div>
        <div>{order.fulfillmentType.toUpperCase()} {order.tableNumber ? `- Table ${order.tableNumber}` : ''}</div>
      </div>
      
      <div className="divider" />
      
      {/* Items */}
      <div className="space-y-2">
        {order.items.map(item => (
          <div key={item.id}>
            <div className="item-row">
              <span>{item.quantity}× {item.name}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
            {item.modifiers.map((mod, i) => (
              <div key={i} className="modifier">→ {mod}</div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="divider" />
      
      {/* Totals */}
      <div className="space-y-1">
        <div className="item-row">
          <span>Subtotal</span>
          <span>{formatCurrency(order.totals.subtotal)}</span>
        </div>
        {order.totals.fees > 0 && (
          <div className="item-row">
            <span>Fees</span>
            <span>{formatCurrency(order.totals.fees)}</span>
          </div>
        )}
        {order.totals.tip > 0 && (
          <div className="item-row">
            <span>Tip</span>
            <span>{formatCurrency(order.totals.tip)}</span>
          </div>
        )}
        <div className="item-row total">
          <span>TOTAL</span>
          <span>{formatCurrency(order.totals.total)}</span>
        </div>
      </div>
      
      <div className="divider" />
      
      {/* Payment */}
      <div className="text-center text-sm">
        <div>Paid: {order.paymentMethod}</div>
        {template.showVat && branch.vatNumber && (
          <div className="text-[10px] mt-1">VAT: {branch.vatNumber}</div>
        )}
      </div>
      
      <div className="divider" />
      
      {/* Footer */}
      <div className="text-center text-sm whitespace-pre-line">
        {template.footerText}
      </div>
      
      {/* QR Placeholder */}
      <div className="text-center mt-4">
        <div className="inline-block w-16 h-16 bg-neutral-200 border border-neutral-400 text-xs flex items-center justify-center text-neutral-500">
          [QR]
        </div>
      </div>
    </div>
  );
}
