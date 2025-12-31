'use client';

import type { Channel, FulfillmentType, PriorityLevel, TicketStatus, StationId } from '@/types';
import { channelConfig, fulfillmentConfig, priorityConfig, getStationColor, getStationBgColor, getStationName, type UrgencyLevel } from '@/lib/formatting';

// ============== CHANNEL BADGE ==============

export function ChannelBadge({ channel }: { channel: Channel }) {
  const config = channelConfig[channel];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${config.bgColor} ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

// ============== FULFILLMENT BADGE ==============

export function FulfillmentBadge({ type, tableNumber }: { type: FulfillmentType; tableNumber?: string }) {
  const config = fulfillmentConfig[type];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-neutral-700 text-white">
      <span>{config.icon}</span>
      <span>{type === 'dine-in' && tableNumber ? `TABLE ${tableNumber}` : config.shortLabel}</span>
    </span>
  );
}

// ============== PRIORITY BADGE ==============

export function PriorityBadge({ level, explanation }: { level: PriorityLevel; explanation?: string }) {
  const config = priorityConfig[level];
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${config.bgColor} ${config.color}`}
      title={explanation}
    >
      🤖 {config.label}
    </span>
  );
}

// ============== STATION BADGE ==============

export function StationBadge({ station, small = false }: { station: StationId; small?: boolean }) {
  const color = getStationColor(station);
  const bgColor = getStationBgColor(station);
  const name = getStationName(station);
  
  return (
    <span className={`station-pill ${bgColor} ${color} ${small ? 'text-[10px]' : ''}`}>
      {name}
    </span>
  );
}

// ============== STATUS BADGE ==============

export function StatusBadge({ status }: { status: TicketStatus }) {
  const statusColors: Record<TicketStatus, string> = {
    new: 'bg-blue-600',
    in_progress: 'bg-orange-600',
    ready: 'bg-green-600',
    completed: 'bg-gray-600',
    recalled: 'bg-red-600',
  };
  
  const statusLabels: Record<TicketStatus, string> = {
    new: 'NEW',
    in_progress: 'COOKING',
    ready: 'READY',
    completed: 'DONE',
    recalled: 'RECALLED',
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

// ============== TIMER BADGE ==============

export function TimerBadge({ 
  elapsedMinutes, 
  urgency,
  prefix = '' 
}: { 
  elapsedMinutes: number; 
  urgency: UrgencyLevel;
  prefix?: string;
}) {
  const timerClass = `timer-${urgency}`;
  
  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return `${hours}h ${remaining}m`;
  };
  
  return (
    <span className={`timer-badge ${timerClass}`}>
      {prefix}{formatTime(elapsedMinutes)}
    </span>
  );
}

// ============== REMAINING TIME BADGE ==============

export function RemainingTimeBadge({ 
  minutesRemaining, 
  urgency 
}: { 
  minutesRemaining: number; 
  urgency: UrgencyLevel;
}) {
  const timerClass = `timer-${urgency}`;
  
  if (minutesRemaining < 0) {
    return (
      <span className={`timer-badge ${timerClass}`}>
        {Math.abs(minutesRemaining)}m LATE
      </span>
    );
  }
  
  return (
    <span className={`timer-badge ${timerClass}`}>
      {minutesRemaining}m left
    </span>
  );
}

// ============== ALLERGEN WARNING ==============

export function AllergenWarning({ notes }: { notes: string }) {
  return (
    <div className="allergen-warning flex items-center gap-2">
      <span className="text-lg">⚠️</span>
      <span className="text-red-400 font-bold text-sm uppercase">{notes}</span>
    </div>
  );
}

// ============== AI BADGE ==============

export function AIBadge({ label = 'AI' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-400">
      🤖 {label}
    </span>
  );
}
