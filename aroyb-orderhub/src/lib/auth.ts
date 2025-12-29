// Authentication utilities for demo mode
import type { AuthSession } from '@/types';

const AUTH_STORAGE_KEY = 'orderhub_auth_session';
const SESSION_DURATION_HOURS = 24;

// Demo password - in production this would be env-only
const DEMO_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'aroyb2024';

export function validatePassword(password: string): boolean {
  return password === DEMO_PASSWORD;
}

export function createSession(): AuthSession {
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
  
  const session: AuthSession = {
    authenticated: true,
    loginAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
  
  return session;
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    return null;
  }
  
  try {
    const session: AuthSession = JSON.parse(stored);
    
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  const session = getSession();
  return session?.authenticated === true;
}
