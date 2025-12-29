'use client';

import { useState, useEffect } from 'react';
import locationsData from '@/data/locations.json';
import { Location, Table } from '@/types';

export default function AdminTablesPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>(locationsData.locations[0].id);
  const locations = locationsData.locations as Location[];
  const currentLocation = locations.find(l => l.id === selectedLocation);

  // Mock session data (in real app, this would come from backend)
  const [tableSessions, setTableSessions] = useState<Record<string, { active: boolean; guestCount: number; startTime: string }>>({});

  useEffect(() => {
    // Simulate some active tables for demo
    setTableSessions({
      't1': { active: true, guestCount: 2, startTime: new Date(Date.now() - 30 * 60000).toISOString() },
      't3': { active: true, guestCount: 4, startTime: new Date(Date.now() - 15 * 60000).toISOString() },
    });
  }, [selectedLocation]);

  const getSessionAge = (startTime: string): string => {
    const mins = Math.round((Date.now() - new Date(startTime).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Tables</h1>
          <p className="text-neutral-500">View and manage table sessions</p>
        </div>
        
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="input-field w-auto"
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.shortName}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-success-500" />
          <span className="text-sm text-neutral-600">Active Session</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-neutral-200" />
          <span className="text-sm text-neutral-600">Available</span>
        </div>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-4 gap-6">
        {currentLocation?.tables.map((table) => {
          const session = tableSessions[table.id];
          const isActive = session?.active;
          
          return (
            <div
              key={table.id}
              className={`card relative ${
                isActive ? 'ring-2 ring-success-500' : ''
              }`}
            >
              {/* Status Indicator */}
              <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                isActive ? 'bg-success-500 animate-pulse' : 'bg-neutral-200'
              }`} />
              
              <div className="text-center">
                <div className="text-4xl mb-3">
                  {isActive ? '👥' : '🪑'}
                </div>
                
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {table.name}
                </h3>
                
                <p className="text-sm text-neutral-500 mb-3">
                  {table.seats} seats
                </p>
                
                {isActive ? (
                  <div className="space-y-1">
                    <span className="badge-success">
                      {session.guestCount} guests
                    </span>
                    <p className="text-xs text-neutral-500">
                      Started {getSessionAge(session.startTime)} ago
                    </p>
                  </div>
                ) : (
                  <span className="badge-neutral">Available</span>
                )}
              </div>
              
              {isActive && (
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <button className="btn-ghost text-xs flex-1">
                    View
                  </button>
                  <button className="btn-ghost text-xs flex-1 text-danger-600 hover:bg-danger-50">
                    Close
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 card bg-neutral-50">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">
            Total Tables: {currentLocation?.tables.length}
          </span>
          <span className="text-success-600">
            Active: {Object.values(tableSessions).filter(s => s.active).length}
          </span>
          <span className="text-neutral-600">
            Available: {(currentLocation?.tables.length || 0) - Object.values(tableSessions).filter(s => s.active).length}
          </span>
        </div>
      </div>
    </div>
  );
}
