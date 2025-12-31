'use client';

import { use, useState, useEffect, useCallback } from 'react';
import type { Ticket, StationId, TimelineEvent, RemakeReason } from '@/types';
import KDSHeader from '@/components/layout/KDSHeader';
import DemoBanner from '@/components/layout/DemoBanner';
import TicketCard from '@/components/kds/TicketCard';
import ToastContainer, { showToast } from '@/components/ui/Toast';
import { getStoredTickets, setStoredTickets, initializeStorage, addRemakeLog } from '@/lib/storage';
import { sortTicketsByPriority } from '@/lib/ai/prioritizer';
import { getStationName, getStationIcon, generateId, demoUsers } from '@/lib/formatting';

interface PageProps {
  params: Promise<{ station: string }>;
}

export default function StationPage({ params }: PageProps) {
  const { station } = use(params);
  const stationId = station as StationId;
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadData = useCallback(() => {
    const storedTickets = getStoredTickets();
    const filtered = storedTickets.filter(t => 
      t.stationAssignments.includes(stationId) && 
      ['new', 'in_progress', 'recalled'].includes(t.status)
    );
    const sorted = sortTicketsByPriority(filtered, 50);
    setTickets(sorted);
    setLoading(false);
  }, [stationId]);
  
  useEffect(() => {
    initializeStorage();
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);
  
  const handleStartTicket = (ticketId: string) => {
    const now = new Date().toISOString();
    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    
    const allTickets = getStoredTickets();
    const updated = allTickets.map(t => {
      if (t.id === ticketId) {
        const newTimeline: TimelineEvent = {
          id: generateId('e'),
          action: 'started',
          timestamp: now,
          performedBy: user,
          station: stationId,
        };
        return { ...t, status: 'in_progress' as const, startedAt: now, timeline: [...t.timeline, newTimeline] };
      }
      return t;
    });
    
    setStoredTickets(updated);
    loadData();
    showToast({ type: 'success', title: 'Started', message: `By ${user}` });
  };
  
  const handleBumpTicket = (ticketId: string) => {
    const now = new Date().toISOString();
    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    
    const allTickets = getStoredTickets();
    const updated = allTickets.map(t => {
      if (t.id === ticketId) {
        const newTimeline: TimelineEvent = {
          id: generateId('e'),
          action: 'bumped',
          timestamp: now,
          performedBy: user,
          station: stationId,
        };
        return { ...t, status: 'ready' as const, readyAt: now, timeline: [...t.timeline, newTimeline] };
      }
      return t;
    });
    
    setStoredTickets(updated);
    loadData();
    showToast({ type: 'success', title: 'Bumped' });
  };
  
  const handleMarkRemake = (ticketId: string, itemId: string, reason: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    const item = ticket?.items.find(i => i.id === itemId);
    if (!ticket || !item) return;
    
    addRemakeLog({
      id: generateId('rl'),
      ticketId,
      itemId,
      itemName: item.name,
      reason: reason as RemakeReason,
      station: stationId,
      timestamp: new Date().toISOString(),
    });
    
    const allTickets = getStoredTickets();
    const updated = allTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          items: t.items.map(i => {
            if (i.id === itemId) {
              return { ...i, isRemake: true, remakeReason: reason as RemakeReason };
            }
            return i;
          }),
        };
      }
      return t;
    });
    
    setStoredTickets(updated);
    loadData();
    showToast({ type: 'warning', title: 'Marked Remake' });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const newTickets = tickets.filter(t => t.status === 'new');
  const cookingTickets = tickets.filter(t => ['in_progress', 'recalled'].includes(t.status));
  
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <KDSHeader 
        title={`${getStationIcon(stationId)} ${getStationName(stationId)} Station`} 
        showBackLink 
      />
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* New */}
        <div className="kds-column">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <h2 className="font-bold text-lg">New</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
              {newTickets.length}
            </span>
          </div>
          <div className="space-y-3">
            {newTickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onStart={handleStartTicket}
                filterStation={stationId}
              />
            ))}
          </div>
        </div>
        
        {/* Cooking */}
        <div className="kds-column">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <h2 className="font-bold text-lg">Cooking</h2>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
              {cookingTickets.length}
            </span>
          </div>
          <div className="space-y-3">
            {cookingTickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onBump={handleBumpTicket}
                onMarkRemake={handleMarkRemake}
                filterStation={stationId}
              />
            ))}
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}
