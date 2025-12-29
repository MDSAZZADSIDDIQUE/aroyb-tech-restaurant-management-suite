'use client';

import { Order } from '@/types';
import { formatRelativeTime, formatCurrency, channelConfig, fulfillmentConfig, statusConfig } from '@/lib/formatting';
import Badge from '@/components/ui/Badge';
import RiskBadge from '@/components/ai/RiskBadge';

interface OrderCardProps {
  order: Order;
  onAccept?: (orderId: string) => void;
  onDecline?: (orderId: string) => void;
  onView?: (orderId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function OrderCard({
  order,
  onAccept,
  onDecline,
  onView,
  showActions = true,
  compact = false,
}: OrderCardProps) {
  const channel = channelConfig[order.sourceChannel];
  const fulfillment = fulfillmentConfig[order.fulfillmentType];
  const status = statusConfig[order.status];
  
  const isPending = order.status === 'pending';
  const hasAllergens = !!order.allergenNotes;
  
  return (
    <div
      className={`bg-white rounded-xl border ${
        isPending ? 'border-l-4 border-l-yellow-500 animate-pulse-border' : 'border-gray-200'
      } ${hasAllergens ? 'ring-2 ring-red-200' : ''} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => onView?.(order.id)}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">#{order.orderNumber.split('-').pop()}</span>
            <Badge variant="subtle" className={`${channel.bgColor} ${channel.color}`}>
              {channel.label}
            </Badge>
            <Badge variant="subtle" className="bg-gray-100 text-gray-600">
              {fulfillment.icon} {fulfillment.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {order.riskLevel && order.riskLevel !== 'low' && (
              <RiskBadge level={order.riskLevel} />
            )}
            <Badge variant="subtle" className={`${status.bgColor} ${status.color}`}>
              {status.label}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span>{order.customerName}</span>
          <span>•</span>
          <span>{formatRelativeTime(order.createdAt)}</span>
          {order.scheduledFor && (
            <>
              <span>•</span>
              <span className="text-purple-600">⏰ Scheduled</span>
            </>
          )}
        </div>
      </div>
      
      {/* Allergen Warning */}
      {hasAllergens && (
        <div className="allergen-banner px-4 py-2 flex items-center gap-2">
          <span className="text-red-600 font-bold">⚠️ ALLERGEN:</span>
          <span className="text-red-800 text-sm font-medium">{order.allergenNotes}</span>
        </div>
      )}
      
      {/* Customer Notes */}
      {order.notes && !compact && (
        <div className="px-4 py-2 bg-blue-50 border-l-4 border-l-blue-400">
          <span className="text-blue-800 text-sm">📝 {order.notes}</span>
        </div>
      )}
      
      {/* Items */}
      {!compact && (
        <div className="px-4 py-3">
          <ul className="space-y-1">
            {order.items.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-medium">{item.quantity}×</span>{' '}
                  <span className="text-gray-700">{item.name}</span>
                  {item.modifiers.length > 0 && (
                    <span className="text-gray-500 text-xs ml-1">
                      ({item.modifiers.map(m => m.name).join(', ')})
                    </span>
                  )}
                </span>
                <span className="text-gray-500">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
            {order.items.length > 3 && (
              <li className="text-sm text-gray-500">
                +{order.items.length - 3} more items
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">{formatCurrency(order.totals.total)}</span>
          {order.prepTime && (
            <span className="text-sm text-gray-500">
              🕐 {order.prepTime} mins
            </span>
          )}
        </div>
        
        {showActions && isPending && (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onDecline?.(order.id)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => onAccept?.(order.id)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Accept
            </button>
          </div>
        )}
        
        {!isPending && !compact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.(order.id);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            View Details →
          </button>
        )}
      </div>
    </div>
  );
}
