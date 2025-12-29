'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import locationsData from '@/data/locations.json';
import { Location, Table, Guest } from '@/types';
import {
  resumeOrCreateSession,
  addGuestToSession,
  getSession,
  getSessionGuests,
  getCurrentGuest,
  setCurrentGuest,
} from '@/lib/session-manager';

interface Props {
  params: { locationId: string; tableId: string };
}

export default function TableSessionPage({ params }: Props) {
  const router = useRouter();
  const { locationId, tableId } = params;
  
  const [location, setLocation] = useState<Location | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [currentGuest, setCurrentGuestState] = useState<Guest | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    // Find location and table
    const loc = (locationsData.locations as Location[]).find(l => l.id === locationId);
    if (!loc) return;
    
    const tbl = loc.tables.find(t => t.id === tableId);
    if (!tbl) return;
    
    setLocation(loc);
    setTable(tbl);
    
    // Resume or create session
    resumeOrCreateSession(locationId, tableId);
    setGuests(getSessionGuests());
    setCurrentGuestState(getCurrentGuest());
  }, [locationId, tableId]);

  const handleJoinSession = () => {
    if (!guestName.trim()) return;
    
    const isHost = guests.length === 0;
    const guest = addGuestToSession(guestName.trim(), isHost);
    setCurrentGuest(guest);
    setCurrentGuestState(guest);
    setGuests(getSessionGuests());
    setShowJoinForm(false);
    setGuestName('');
  };

  const handleContinue = () => {
    router.push(`/t/${locationId}/${tableId}/menu`);
  };

  if (!location || !table) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-700">
      {/* Demo Banner */}
      <div className="demo-banner">
        🍽️ Demo Mode — This is a preview of Aroyb DineScan
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-4">
            <span>📍</span>
            <span className="font-medium">{location.shortName}</span>
          </div>
          
          <h1 className="text-3xl font-display font-bold mb-2">
            {table.name}
          </h1>
          <p className="text-white/80">
            {table.seats} seats • Order from your phone
          </p>
        </div>

        {/* Session Card */}
        <div className="bg-white rounded-3xl shadow-elevated p-6 mb-6">
          {/* Current Guest */}
          {currentGuest ? (
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
                👋
              </div>
              <p className="text-neutral-600">Welcome back,</p>
              <p className="text-xl font-semibold text-neutral-900">
                {currentGuest.displayName}
              </p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">
                👤
              </div>
              <p className="text-neutral-600">Join the table to start ordering</p>
            </div>
          )}

          {/* Guests at Table */}
          {guests.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-neutral-500 mb-2">Guests at this table:</p>
              <div className="flex flex-wrap gap-2">
                {guests.map((guest) => (
                  <span
                    key={guest.guestId}
                    className={`badge ${
                      guest.guestId === currentGuest?.guestId
                        ? 'badge-primary'
                        : 'badge-neutral'
                    }`}
                  >
                    {guest.displayName}
                    {guest.isHost && ' 👑'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Join Form */}
          {showJoinForm ? (
            <div className="space-y-4">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoinForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinSession}
                  disabled={!guestName.trim()}
                  className="btn-primary flex-1"
                >
                  Join Table
                </button>
              </div>
            </div>
          ) : currentGuest ? (
            <div className="space-y-3">
              <button onClick={handleContinue} className="btn-primary w-full">
                View Menu
              </button>
              <button
                onClick={() => setShowJoinForm(true)}
                className="btn-ghost w-full text-sm"
              >
                + Add Another Guest
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowJoinForm(true)}
              className="btn-primary w-full"
            >
              Join Table
            </button>
          )}
        </div>

        {/* Quick Info */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-white text-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="font-medium mb-1">How it works</p>
              <ul className="text-white/80 space-y-1">
                <li>• Each guest can browse and add items</li>
                <li>• See everyone's orders at checkout</li>
                <li>• Send to kitchen when ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-white/60 hover:text-white text-sm">
            ← Back to Demo Home
          </Link>
        </div>
      </div>
    </div>
  );
}
