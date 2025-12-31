'use client';

import type { StationId } from '@/types';
import { stations, getStationIcon, getStationName } from '@/lib/formatting';

interface StationTabsProps {
  activeStation: StationId | 'all';
  onStationChange: (station: StationId | 'all') => void;
  ticketCounts?: Record<StationId | 'all', number>;
}

export default function StationTabs({ activeStation, onStationChange, ticketCounts }: StationTabsProps) {
  const allStations: (StationId | 'all')[] = ['all', ...stations.filter(s => s.active).map(s => s.id)];
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      {allStations.map(stationId => {
        const isActive = activeStation === stationId;
        const count = ticketCounts?.[stationId] || 0;
        const isAll = stationId === 'all';
        const station = stations.find(s => s.id === stationId);
        
        return (
          <button
            key={stationId}
            onClick={() => onStationChange(stationId)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm whitespace-nowrap
              transition-all touch-action-manipulation min-w-[100px]
              ${isActive 
                ? 'bg-[#ed7424] text-white shadow-lg shadow-orange-500/20' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }
            `}
          >
            <span className="text-lg">
              {isAll ? '📋' : getStationIcon(stationId as StationId)}
            </span>
            <span>{isAll ? 'All' : getStationName(stationId as StationId)}</span>
            {count > 0 && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${isActive ? 'bg-white/20 text-white' : 'bg-neutral-600 text-neutral-200'}
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
