'use client';

import { useState } from 'react';
import type { Ticket, TicketItem, StationId } from '@/types';
import { ChannelBadge, FulfillmentBadge, PriorityBadge, StationBadge, AllergenWarning, AIBadge, TimerBadge, RemainingTimeBadge } from '@/components/ui/Badges';
import { formatTime, formatElapsedMinutes, getMinutesUntil, getUrgencyLevel, getStationName, getStationIcon } from '@/lib/formatting';
import { rewriteNote } from '@/lib/ai/modifier-rewriter';

interface TicketCardProps {
  ticket: Ticket;
  onStart?: (ticketId: string) => void;
  onBump?: (ticketId: string) => void;
  onRecall?: (ticketId: string, reason: string) => void;
  onMarkRemake?: (ticketId: string, itemId: string, reason: string) => void;
  showActions?: boolean;
  filterStation?: StationId;
  compact?: boolean;
}

export default function TicketCard({
  ticket,
  onStart,
  onBump,
  onRecall,
  onMarkRemake,
  showActions = true,
  filterStation,
  compact = false,
}: TicketCardProps) {
  const [showOriginalNotes, setShowOriginalNotes] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [recallReason, setRecallReason] = useState('');
  
  const isLate = getMinutesUntil(ticket.promisedAt) < 0;
  const urgency = getUrgencyLevel(ticket.promisedAt, ticket.createdAt);
  const elapsedMinutes = ticket.startedAt ? formatElapsedMinutes(ticket.startedAt) : formatElapsedMinutes(ticket.createdAt);
  const minutesRemaining = getMinutesUntil(ticket.promisedAt);
  
  // Filter items by station if specified
  const displayItems = filterStation 
    ? ticket.items.filter(item => item.station === filterStation)
    : ticket.items;
  
  const handleRecall = () => {
    if (onRecall && recallReason.trim()) {
      onRecall(ticket.id, recallReason);
      setShowRecallModal(false);
      setRecallReason('');
    }
  };
  
  return (
    <div className={`ticket-card status-${ticket.status} ${isLate ? 'is-late' : ''} ${compact ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xl font-bold text-white">{ticket.orderNumber}</span>
            <ChannelBadge channel={ticket.channel} />
            <FulfillmentBadge type={ticket.fulfillmentType} tableNumber={ticket.tableNumber} />
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Created {formatTime(ticket.createdAt)}</span>
            <span>•</span>
            <span>Due {formatTime(ticket.promisedAt)}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          {ticket.priority && (
            <PriorityBadge level={ticket.priority.level} explanation={ticket.priority.explanation} />
          )}
          <RemainingTimeBadge minutesRemaining={minutesRemaining} urgency={urgency} />
        </div>
      </div>
      
      {/* Timer for in-progress */}
      {ticket.status === 'in_progress' && ticket.startedAt && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-neutral-500">Cooking:</span>
          <TimerBadge elapsedMinutes={elapsedMinutes} urgency={urgency} />
        </div>
      )}
      
      {/* Allergen Warning */}
      {ticket.allergenNotes && (
        <div className="mb-3">
          <AllergenWarning notes={ticket.allergenNotes} />
        </div>
      )}
      
      {/* Customer Notes */}
      {ticket.customerNotes && (
        <div className="mb-3 p-2 rounded bg-blue-500/10 border border-blue-500/30">
          <span className="text-xs text-blue-400 font-semibold">📝 NOTE: </span>
          <span className="text-sm text-blue-200">{ticket.customerNotes}</span>
        </div>
      )}
      
      {/* Station Pills */}
      {!filterStation && ticket.stationAssignments.length > 1 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {ticket.stationAssignments.map(station => (
            <StationBadge key={station} station={station} small />
          ))}
        </div>
      )}
      
      {/* Items */}
      <div className="space-y-2 mb-3">
        {displayItems.map(item => (
          <ItemRow 
            key={item.id} 
            item={item} 
            showOriginalNotes={showOriginalNotes}
            onMarkRemake={onMarkRemake ? (reason) => onMarkRemake(ticket.id, item.id, reason) : undefined}
          />
        ))}
      </div>
      
      {/* AI Rewrite Toggle */}
      {displayItems.some(item => item.notes || item.modifiers.length > 0) && (
        <button
          onClick={() => setShowOriginalNotes(!showOriginalNotes)}
          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mb-3"
        >
          <AIBadge label="Rewritten" />
          <span>{showOriginalNotes ? 'Show Kitchen Format' : 'Show Original'}</span>
        </button>
      )}
      
      {/* Recall Reason */}
      {ticket.status === 'recalled' && ticket.recallReason && (
        <div className="mb-3 p-2 rounded bg-red-500/10 border border-red-500/30">
          <span className="text-xs text-red-400 font-semibold">🔄 RECALLED: </span>
          <span className="text-sm text-red-200">{ticket.recallReason}</span>
        </div>
      )}
      
      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-3 border-t border-neutral-700">
          {ticket.status === 'new' && onStart && (
            <button 
              onClick={() => onStart(ticket.id)}
              className="btn-kds btn-primary flex-1"
            >
              ▶️ START
            </button>
          )}
          
          {(ticket.status === 'in_progress' || ticket.status === 'recalled') && onBump && (
            <button 
              onClick={() => onBump(ticket.id)}
              className="btn-kds btn-success flex-1"
            >
              ✅ BUMP
            </button>
          )}
          
          {(ticket.status === 'ready' || ticket.status === 'completed') && onRecall && (
            <button 
              onClick={() => setShowRecallModal(true)}
              className="btn-kds btn-danger flex-1"
            >
              🔄 RECALL
            </button>
          )}
        </div>
      )}
      
      {/* Recall Modal */}
      {showRecallModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Recall Ticket #{ticket.orderNumber}</h3>
            <textarea
              value={recallReason}
              onChange={(e) => setRecallReason(e.target.value)}
              placeholder="Reason for recall..."
              className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowRecallModal(false)} className="btn-kds btn-ghost flex-1">
                Cancel
              </button>
              <button onClick={handleRecall} className="btn-kds btn-danger flex-1" disabled={!recallReason.trim()}>
                Confirm Recall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== ITEM ROW ==============

function ItemRow({ 
  item, 
  showOriginalNotes,
  onMarkRemake,
}: { 
  item: TicketItem; 
  showOriginalNotes: boolean;
  onMarkRemake?: (reason: string) => void;
}) {
  const [showRemakeOptions, setShowRemakeOptions] = useState(false);
  
  const remakeReasons = [
    { id: 'wrong_modifier', label: 'Wrong Modifier' },
    { id: 'missing_item', label: 'Missing Item' },
    { id: 'overcooked', label: 'Overcooked' },
    { id: 'undercooked', label: 'Undercooked' },
    { id: 'allergy_missed', label: 'Allergy Missed' },
    { id: 'other', label: 'Other' },
  ];
  
  return (
    <div className={`p-2 rounded-lg bg-neutral-800 ${item.isRemake ? 'border-2 border-amber-500' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{item.quantity}×</span>
            <span className="font-semibold text-white">{item.name}</span>
            <span className="text-xs">{getStationIcon(item.station)}</span>
            {item.isRemake && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded">
                REMAKE
              </span>
            )}
          </div>
          
          {/* Modifiers */}
          {item.modifiers.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {item.modifiers.map(mod => (
                <div key={mod.id} className="text-sm kitchen-format text-amber-400">
                  {showOriginalNotes ? mod.name : rewriteNote(mod.name)}
                </div>
              ))}
            </div>
          )}
          
          {/* Add-ons */}
          {item.addOns.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {item.addOns.map(addon => (
                <div key={addon.id} className="text-sm kitchen-format text-green-400">
                  + {addon.name.toUpperCase()}
                </div>
              ))}
            </div>
          )}
          
          {/* Notes */}
          {item.notes && (
            <div className="mt-1 text-sm kitchen-format text-purple-400">
              {showOriginalNotes ? item.notes : rewriteNote(item.notes)}
            </div>
          )}
          
          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-1 text-sm font-bold text-red-400">
              ⚠️ CONTAINS: {item.allergens.join(', ')}
            </div>
          )}
        </div>
        
        {/* Mark as Remake */}
        {onMarkRemake && !item.isRemake && (
          <div className="relative">
            <button 
              onClick={() => setShowRemakeOptions(!showRemakeOptions)}
              className="p-1 text-neutral-500 hover:text-red-400"
              title="Mark as remake"
            >
              🔄
            </button>
            
            {showRemakeOptions && (
              <div className="absolute right-0 top-8 bg-neutral-700 rounded-lg shadow-lg z-10 w-40">
                {remakeReasons.map(reason => (
                  <button
                    key={reason.id}
                    onClick={() => {
                      onMarkRemake(reason.id);
                      setShowRemakeOptions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
