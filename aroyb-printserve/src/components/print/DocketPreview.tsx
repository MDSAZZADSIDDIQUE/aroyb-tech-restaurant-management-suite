'use client';

import type { Order, DocketTemplate } from '@/types';
import { formatTime } from '@/lib/formatting';

interface DocketPreviewProps {
  order: Order;
  template: DocketTemplate;
  copyNumber?: number;
}

export default function DocketPreview({ order, template, copyNumber = 1 }: DocketPreviewProps) {
  // Group items by station if enabled
  const getGroupedItems = () => {
    if (!template.groupByStation) {
      return [{ station: null, items: order.items }];
    }
    
    const groups = new Map<string, typeof order.items>();
    order.items.forEach(item => {
      const existing = groups.get(item.station) || [];
      existing.push(item);
      groups.set(item.station, existing);
    });
    
    return Array.from(groups.entries()).map(([station, items]) => ({ station, items }));
  };
  
  const groups = getGroupedItems();
  const fontSizeClass = template.fontSize === 'large' ? 'text-lg' : template.fontSize === 'small' ? 'text-xs' : 'text-sm';
  
  return (
    <div className={`thermal-paper ${fontSizeClass}`}>
      {/* Copy indicator */}
      {template.copyCount > 1 && (
        <div className="text-center text-xs mb-2 bg-black text-white px-2 py-1">
          COPY {copyNumber} of {template.copyCount}
        </div>
      )}
      
      {/* Header */}
      <div className="header text-lg">
        <div><strong>KITCHEN DOCKET</strong></div>
        <div className="text-2xl font-bold mt-1">{order.orderNumber}</div>
      </div>
      
      <div className="flex justify-between text-sm mt-2">
        <span>{order.fulfillmentType.toUpperCase()}</span>
        <span>{formatTime(order.createdAt)}</span>
      </div>
      
      {order.tableNumber && (
        <div className="text-center text-xl font-bold my-2">TABLE {order.tableNumber}</div>
      )}
      
      <div className="divider" />
      
      {/* Allergen Banner */}
      {template.showAllergenBanner && order.allergenNotes && (
        <div className="bg-black text-white p-2 text-center font-bold mb-2">
          ⚠️ {order.allergenNotes}
        </div>
      )}
      
      {/* Customer Notes (if showNotesTop) */}
      {template.showNotesTop && order.customerNotes && (
        <div className="bg-neutral-200 p-2 mb-2 text-sm">
          📝 {order.customerNotes}
        </div>
      )}
      
      {/* Items */}
      {groups.map(group => (
        <div key={group.station || 'all'} className="mb-4">
          {group.station && (
            <div className="bg-black text-white px-2 py-1 font-bold uppercase mb-1">
              {group.station}
            </div>
          )}
          
          {group.items.map(item => (
            <div key={item.id} className="mb-2">
              <div className="font-bold">
                {item.quantity}× {item.name}
              </div>
              
              {item.modifiers.map((mod, i) => (
                <div key={i} className="pl-4 text-sm">
                  → {mod.toUpperCase()}
                </div>
              ))}
              
              {item.notes && (
                <div className="pl-4 text-sm italic">
                  📝 {item.notes}
                </div>
              )}
              
              {item.allergens && item.allergens.length > 0 && (
                <div className="pl-4 text-sm font-bold">
                  ⚠️ {item.allergens.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      
      {/* Customer Notes (if !showNotesTop) */}
      {!template.showNotesTop && order.customerNotes && (
        <>
          <div className="divider" />
          <div className="bg-neutral-200 p-2 text-sm">
            📝 {order.customerNotes}
          </div>
        </>
      )}
      
      <div className="divider" />
      
      {/* Footer */}
      <div className="text-center text-xs text-neutral-500">
        Printed at {formatTime(new Date().toISOString())}
      </div>
    </div>
  );
}
