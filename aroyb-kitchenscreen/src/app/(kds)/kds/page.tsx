'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Ticket, StationId, BottleneckAlert, RemakeReason, TimelineEvent } from '@/types';
import KDSHeader from '@/components/layout/KDSHeader';
import DemoBanner from '@/components/layout/DemoBanner';
import BottleneckAlertBanner from '@/components/layout/BottleneckAlert';
import TicketCard from '@/components/kds/TicketCard';
import StationTabs from '@/components/kds/StationTabs';
import ToastContainer, { showToast } from '@/components/ui/Toast';
import { getStoredTickets, setStoredTickets, initializeStorage, resetStorage, getStoredSettings, updateStoredSettings, addRemakeLog } from '@/lib/storage';
import { sortTicketsByPriority } from '@/lib/ai/prioritizer';
import { detectBottlenecks } from '@/lib/ai/bottleneck-detector';
import { startTicketSimulator, stopTicketSimulator, isSimulatorRunning } from '@/lib/ticket-simulator';
import { generateId, demoUsers } from '@/lib/formatting';

export default function KDSPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeStation, setActiveStation] = useState<StationId | 'all'>('all');
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [kitchenLoad, setKitchenLoad] = useState(50);
  const [bottleneckAlerts, setBottleneckAlerts] = useState<BottleneckAlert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load data
  const loadData = useCallback(() => {
    const storedTickets = getStoredTickets();
    const settings = getStoredSettings();
    
    // Sort new tickets by priority
    const sorted = storedTickets.map(t => {
      if (t.status === 'new') {
        const prioritized = sortTicketsByPriority([t], settings.kitchenLoad);
        return prioritized[0];
      }
      return t;
    });
    
    setTickets(sorted);
    setKitchenLoad(settings.kitchenLoad);
    
    // Detect bottlenecks
    const alerts = detectBottlenecks(storedTickets, settings.kitchenLoad);
    setBottleneckAlerts(alerts);
    
    setLoading(false);
  }, []);
  
  useEffect(() => {
    initializeStorage();
    loadData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);
  
  // Handle new ticket from simulator
  const handleNewTicket = useCallback((ticket: Ticket) => {
    setTickets(prev => {
      const updated = [ticket, ...prev];
      setStoredTickets(updated);
      return updated;
    });
    showToast({ type: 'info', title: 'New Order', message: `${ticket.orderNumber} - ${ticket.fulfillmentType}` });
  }, []);
  
  // Toggle simulator
  const handleToggleSimulator = () => {
    if (simulatorActive) {
      stopTicketSimulator();
      setSimulatorActive(false);
      showToast({ type: 'info', title: 'Rush Mode Off' });
    } else {
      startTicketSimulator(handleNewTicket, 15000);
      setSimulatorActive(true);
      showToast({ type: 'success', title: 'Rush Mode Active', message: 'New tickets every 15-20 seconds' });
    }
  };
  
  // Kitchen load change
  const handleKitchenLoadChange = (load: number) => {
    setKitchenLoad(load);
    updateStoredSettings({ kitchenLoad: load });
  };
  
  // Reset demo
  const handleResetDemo = () => {
    stopTicketSimulator();
    setSimulatorActive(false);
    resetStorage();
    loadData();
    showToast({ type: 'success', title: 'Demo Reset', message: 'All data restored to default' });
  };
  
  // Start ticket
  const handleStartTicket = (ticketId: string) => {
    const now = new Date().toISOString();
    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    
    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id === ticketId) {
          const newTimeline: TimelineEvent = {
            id: generateId('e'),
            action: 'started',
            timestamp: now,
            performedBy: user,
          };
          return {
            ...t,
            status: 'in_progress' as const,
            startedAt: now,
            timeline: [...t.timeline, newTimeline],
          };
        }
        return t;
      });
      setStoredTickets(updated);
      return updated;
    });
    
    showToast({ type: 'success', title: 'Ticket Started', message: `Started by ${user}` });
  };
  
  // Bump ticket
  const handleBumpTicket = (ticketId: string) => {
    const now = new Date().toISOString();
    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    
    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id === ticketId) {
          const newTimeline: TimelineEvent = {
            id: generateId('e'),
            action: 'bumped',
            timestamp: now,
            performedBy: user,
          };
          return {
            ...t,
            status: 'ready' as const,
            readyAt: now,
            timeline: [...t.timeline, newTimeline],
          };
        }
        return t;
      });
      setStoredTickets(updated);
      return updated;
    });
    
    showToast({ type: 'success', title: 'Ticket Bumped', message: 'Moved to Ready' });
  };
  
  // Recall ticket
  const handleRecallTicket = (ticketId: string, reason: string) => {
    const now = new Date().toISOString();
    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    
    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id === ticketId) {
          const newTimeline: TimelineEvent = {
            id: generateId('e'),
            action: 'recalled',
            timestamp: now,
            performedBy: user,
            note: reason,
          };
          return {
            ...t,
            status: 'recalled' as const,
            recallReason: reason,
            recalledFrom: t.status,
            timeline: [...t.timeline, newTimeline],
          };
        }
        return t;
      });
      setStoredTickets(updated);
      return updated;
    });
    
    showToast({ type: 'warning', title: 'Ticket Recalled', message: reason });
  };
  
  // Mark item as remake
  const handleMarkRemake = (ticketId: string, itemId: string, reason: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    const item = ticket?.items.find(i => i.id === itemId);
    if (!ticket || !item) return;
    
    // Add remake log
    addRemakeLog({
      id: generateId('rl'),
      ticketId,
      itemId,
      itemName: item.name,
      reason: reason as RemakeReason,
      station: item.station,
      timestamp: new Date().toISOString(),
    });
    
    // Update ticket item
    setTickets(prev => {
      const updated = prev.map(t => {
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
      return updated;
    });
    
    showToast({ type: 'warning', title: 'Marked as Remake', message: item.name });
  };
  
  // Dismiss bottleneck alert
  const handleDismissAlert = (alertId: string) => {
    setBottleneckAlerts(prev => prev.filter(a => a.id !== alertId));
  };
  
  // Apply bottleneck action
  const handleApplyAlert = (alertId: string) => {
    const alert = bottleneckAlerts.find(a => a.id === alertId);
    if (!alert) return;
    
    showToast({ type: 'success', title: 'Action Applied', message: `Paused items at ${alert.station} (demo)` });
    setBottleneckAlerts(prev => prev.filter(a => a.id !== alertId));
  };
  
  // Filter tickets by station
  const filterTickets = (status: Ticket['status']) => {
    return tickets
      .filter(t => t.status === status)
      .filter(t => activeStation === 'all' || t.stationAssignments.includes(activeStation));
  };
  
  // Calculate ticket counts
  const getTicketCounts = (): Record<StationId | 'all', number> => {
    const counts: Record<StationId | 'all', number> = {
      all: tickets.filter(t => ['new', 'in_progress', 'recalled'].includes(t.status)).length,
      grill: 0, fry: 0, pizza: 0, bar: 0, prep: 0,
    };
    
    tickets
      .filter(t => ['new', 'in_progress', 'recalled'].includes(t.status))
      .forEach(t => {
        t.stationAssignments.forEach(s => {
          counts[s]++;
        });
      });
    
    return counts;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const newTickets = filterTickets('new');
  const inProgressTickets = filterTickets('in_progress');
  const recalledTickets = filterTickets('recalled');
  const readyTickets = filterTickets('ready');
  
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <KDSHeader
        title="Kitchen Display"
        simulatorActive={simulatorActive}
        onToggleSimulator={handleToggleSimulator}
        onResetDemo={handleResetDemo}
        kitchenLoad={kitchenLoad}
        onKitchenLoadChange={handleKitchenLoadChange}
      />
      
      {/* Bottleneck Alerts */}
      {bottleneckAlerts.length > 0 && (
        <div className="p-4 space-y-2">
          {bottleneckAlerts.slice(0, 2).map(alert => (
            <BottleneckAlertBanner 
              key={alert.id} 
              alert={alert} 
              onApply={handleApplyAlert}
              onDismiss={handleDismissAlert}
            />
          ))}
        </div>
      )}
      
      {/* Station Tabs */}
      <div className="px-4 py-3 bg-neutral-900/50">
        <StationTabs 
          activeStation={activeStation} 
          onStationChange={setActiveStation}
          ticketCounts={getTicketCounts()}
        />
      </div>
      
      {/* Ticket Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {/* NEW Column */}
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
                filterStation={activeStation !== 'all' ? activeStation : undefined}
              />
            ))}
          </div>
        </div>
        
        {/* IN PROGRESS Column */}
        <div className="kds-column">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <h2 className="font-bold text-lg">Cooking</h2>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
              {inProgressTickets.length + recalledTickets.length}
            </span>
          </div>
          <div className="space-y-3">
            {/* Recalled first */}
            {recalledTickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onBump={handleBumpTicket}
                onMarkRemake={handleMarkRemake}
                filterStation={activeStation !== 'all' ? activeStation : undefined}
              />
            ))}
            {inProgressTickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onBump={handleBumpTicket}
                onMarkRemake={handleMarkRemake}
                filterStation={activeStation !== 'all' ? activeStation : undefined}
              />
            ))}
          </div>
        </div>
        
        {/* READY Column */}
        <div className="kds-column">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <h2 className="font-bold text-lg">Ready</h2>
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
              {readyTickets.length}
            </span>
          </div>
          <div className="space-y-3">
            {readyTickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onRecall={handleRecallTicket}
                filterStation={activeStation !== 'all' ? activeStation : undefined}
              />
            ))}
          </div>
        </div>
        
        {/* COMPLETED Column */}
        <div className="kds-column opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
            <h2 className="font-bold text-lg">Completed</h2>
            <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-bold">
              {filterTickets('completed').length}
            </span>
          </div>
          <div className="space-y-3">
            {filterTickets('completed').slice(0, 5).map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onRecall={handleRecallTicket}
                showActions={true}
                compact
                filterStation={activeStation !== 'all' ? activeStation : undefined}
              />
            ))}
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}
