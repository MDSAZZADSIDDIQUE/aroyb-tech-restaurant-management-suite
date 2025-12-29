'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Location } from '@/types';
import locationsData from '@/data/locations.json';

interface LocationContextType {
  locations: Location[];
  selectedLocation: Location | null;
  selectLocation: (locationId: string) => void;
  selectedZoneId: string | null;
  selectZone: (zoneId: string | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locations] = useState<Location[]>(locationsData.locations as Location[]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('aroyb-location');
    const savedZone = localStorage.getItem('aroyb-zone');
    
    if (savedLocation) {
      setSelectedLocationId(savedLocation);
    } else if (locations.length > 0) {
      // Default to first location
      setSelectedLocationId(locations[0].id);
    }
    
    if (savedZone) {
      setSelectedZoneId(savedZone);
    }
  }, [locations]);

  // Save to localStorage on change
  useEffect(() => {
    if (selectedLocationId) {
      localStorage.setItem('aroyb-location', selectedLocationId);
    }
  }, [selectedLocationId]);

  useEffect(() => {
    if (selectedZoneId) {
      localStorage.setItem('aroyb-zone', selectedZoneId);
    } else {
      localStorage.removeItem('aroyb-zone');
    }
  }, [selectedZoneId]);

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId) || null;

  const selectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    setSelectedZoneId(null); // Reset zone when location changes
  };

  const selectZone = (zoneId: string | null) => {
    setSelectedZoneId(zoneId);
  };

  return (
    <LocationContext.Provider
      value={{
        locations,
        selectedLocation,
        selectLocation,
        selectedZoneId,
        selectZone,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

// Helper hook to get current delivery zone
export function useDeliveryZone() {
  const { selectedLocation, selectedZoneId } = useLocation();
  
  if (!selectedLocation || !selectedZoneId) return null;
  
  return selectedLocation.deliveryZones.find(zone => zone.id === selectedZoneId) || null;
}
