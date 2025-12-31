'use client';

import type { Order, OrderItem, LabelTemplate } from '@/types';
import { formatTime, handlingIcons } from '@/lib/formatting';
import { formatItemForLabel } from '@/lib/ai/label-formatter';

interface LabelPreviewProps {
  order: Order;
  template: LabelTemplate;
}

export default function LabelPreview({ order, template }: LabelPreviewProps) {
  const sizeClass = template.sizePreset === 'large' ? 'large' : template.sizePreset === 'small' ? 'small' : 'medium';
  
  return (
    <div className={`label-grid ${sizeClass}`}>
      {order.items.map(item => (
        <LabelItem 
          key={item.id} 
          item={item} 
          order={order} 
          template={template}
        />
      ))}
    </div>
  );
}

function LabelItem({ 
  item, 
  order, 
  template 
}: { 
  item: OrderItem; 
  order: Order; 
  template: LabelTemplate;
}) {
  const formatted = formatItemForLabel(item, template.sizePreset);
  const hasAllergens = item.allergens && item.allergens.length > 0;
  
  return (
    <div className={`label-item ${hasAllergens ? 'allergen' : ''}`}>
      {/* Order Info */}
      <div className="flex justify-between items-center border-b border-neutral-300 pb-1 mb-1">
        <span className="font-bold">{order.orderNumber}</span>
        <span className="text-[9px]">{formatTime(order.createdAt)}</span>
      </div>
      
      {/* Customer Name */}
      <div className="text-[9px] text-neutral-600 mb-1">{order.customerName}</div>
      
      {/* Item Name */}
      <div className="font-bold text-sm mb-1">{formatted.itemName}</div>
      
      {/* Modifiers */}
      {formatted.modifiers.length > 0 && (
        <div className="text-[9px] space-y-0.5 mb-1">
          {formatted.modifiers.map((mod, i) => (
            <div key={i} className="text-neutral-700">{mod}</div>
          ))}
        </div>
      )}
      
      {/* Allergen Warning */}
      {hasAllergens && template.showAllergenWarning && (
        <div className="text-[9px] font-bold text-red-600 border-t border-red-300 pt-1 mt-1">
          {formatted.allergenWarning}
        </div>
      )}
      
      {/* Handling Icons */}
      {template.showIcons && formatted.handlingIcons.length > 0 && (
        <div className="flex gap-1 mt-1 text-[10px]">
          {formatted.handlingIcons.map((icon, i) => (
            <span key={i}>{icon}</span>
          ))}
        </div>
      )}
      
      {/* Checklist */}
      {template.showChecklist && formatted.checklist.length > 0 && (
        <div className="border-t border-neutral-300 pt-1 mt-1 text-[8px] text-neutral-500">
          {formatted.checklist.map((check, i) => (
            <div key={i}>□ {check}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Allergen-specific label
export function AllergenLabel({ order }: { order: Order }) {
  const allAllergens = new Set<string>();
  order.items.forEach(item => {
    item.allergens?.forEach(a => allAllergens.add(a));
  });
  
  if (allAllergens.size === 0 && !order.allergenNotes) {
    return null;
  }
  
  return (
    <div className="label-item allergen p-3">
      <div className="text-center font-bold text-lg mb-2">⚠️ ALLERGEN ALERT</div>
      
      <div className="font-bold text-center mb-2">{order.orderNumber}</div>
      
      {allAllergens.size > 0 && (
        <div className="bg-red-100 p-2 rounded mb-2">
          <div className="text-xs font-bold mb-1">CONTAINS:</div>
          <div className="font-bold text-red-700">
            {Array.from(allAllergens).join(', ')}
          </div>
        </div>
      )}
      
      {order.allergenNotes && (
        <div className="bg-red-100 p-2 rounded text-sm">
          <div className="text-xs font-bold mb-1">SPECIAL INSTRUCTIONS:</div>
          <div className="text-red-700">{order.allergenNotes}</div>
        </div>
      )}
      
      <div className="mt-2 text-[8px] text-center text-neutral-500">
        Please verify all items have been prepared allergen-safe
      </div>
    </div>
  );
}
