'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Ticket, TimelineEvent, HandoffMethod } from '@/types';
import KDSHeader from '@/components/layout/KDSHeader';
import DemoBanner from '@/components/layout/DemoBanner';
import ToastContainer, { showToast } from '@/components/ui/Toast';
import { ChannelBadge, FulfillmentBadge, TimerBadge } from '@/components/ui/Badges';
import { getStoredTickets, setStoredTickets, initializeStorage, addHandoffLog } from '@/lib/storage';
import { formatTime, formatElapsedMinutes, getUrgencyLevel, generateId, demoUsers } from '@/lib/formatting';

export default function ExpoPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadData = useCallback(() => {
    const storedTickets = getStoredTickets();
    setTickets(storedTickets.filter(t => t.status === 'ready'));
    setLoading(false);
  }, []);
  
  useEffect(() => {
    initializeStorage();
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);
  
  const handleHandoff = (ticketId: string, method: HandoffMethod) => {
    const now = new Date().toISOString();
    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    // Update ticket
    const allTickets = getStoredTickets();
    const updated = allTickets.map(t => {
      if (t.id === ticketId) {
        const newTimeline: TimelineEvent = {
          id: generateId('e'),
          action: 'handoff',
          timestamp: now,
          performedBy: user,
          note: method,
        };
        return {
          ...t,
          status: 'completed' as const,
          completedAt: now,
          handoffBy: user,
          handoffMethod: method,
          timeline: [...t.timeline, newTimeline],
        };
      }
      return t;
    });
    
    setStoredTickets(updated);
    setTickets(updated.filter(t => t.status === 'ready'));
    
    // Add handoff log
    addHandoffLog({
      id: generateId('hl'),
      ticketId,
      orderNumber: ticket.orderNumber,
      byUser: user,
      timestamp: now,
      method,
      tableNumber: ticket.tableNumber,
    });
    
    showToast({ 
      type: 'success', 
      title: 'Handed Off', 
      message: `${ticket.orderNumber} - ${method} by ${user}` 
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <KDSHeader title="Expo / Handoff" showBackLink />
      
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-4xl mb-4">✨</p>
              <p className="text-xl text-neutral-400">No orders ready for handoff</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="bg-neutral-800 rounded-xl p-6 border-2 border-green-500">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-white block mb-2">
                      {ticket.orderNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <ChannelBadge channel={ticket.channel} />
                      <FulfillmentBadge type={ticket.fulfillmentType} tableNumber={ticket.tableNumber} />
                    </div>
                  </div>
                  <TimerBadge 
                    elapsedMinutes={ticket.readyAt ? formatElapsedMinutes(ticket.readyAt) : 0} 
                    urgency={ticket.readyAt ? getUrgencyLevel(ticket.promisedAt, ticket.readyAt) : 'ok'}
                    prefix="Ready "
                  />
                </div>
                
                {/* Items Summary */}
                <div className="mb-4 p-3 rounded-lg bg-neutral-700">
                  <p className="text-sm text-neutral-300">
                    {ticket.items.length} item(s) • {ticket.items.reduce((sum, i) => sum + i.quantity, 0)} total
                  </p>
                  <ul className="text-sm text-neutral-400 mt-1">
                    {ticket.items.slice(0, 3).map(item => (
                      <li key={item.id}>• {item.quantity}× {item.name}</li>
                    ))}
                    {ticket.items.length > 3 && (
                      <li className="text-neutral-500">...and {ticket.items.length - 3} more</li>
                    )}
                  </ul>
                </div>
                
                {/* Ready Time */}
                <p className="text-xs text-neutral-500 mb-4">
                  Ready at {ticket.readyAt ? formatTime(ticket.readyAt) : '-'}
                </p>
                
                {/* Handoff Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {ticket.fulfillmentType === 'dine-in' && (
                    <button
                      onClick={() => handleHandoff(ticket.id, 'served')}
                      className="btn-kds btn-success"
                    >
                      🍽️ SERVED
                    </button>
                  )}
                  {ticket.fulfillmentType === 'collection' && (
                    <button
                      onClick={() => handleHandoff(ticket.id, 'pickup')}
                      className="btn-kds btn-success"
                    >
                      🛍️ PICKED UP
                    </button>
                  )}
                  {ticket.fulfillmentType === 'delivery' && (
                    <button
                      onClick={() => handleHandoff(ticket.id, 'delivery')}
                      className="btn-kds btn-success"
                    >
                      🚗 OUT FOR DELIVERY
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const method = ticket.fulfillmentType === 'dine-in' ? 'served' : 'pickup';
                      handleHandoff(ticket.id, method);
                    }}
                    className="btn-kds btn-ghost"
                  >
                    ✅ Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}
