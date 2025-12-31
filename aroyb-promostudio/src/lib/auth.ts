// Authentication utilities for PromoStudio

const AUTH_KEY = 'ps_authenticated';
const DEFAULT_PASSWORD = 'aroyb2024';

export function getPassword(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD) {
    return process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD;
  }
  return DEFAULT_PASSWORD;
}

export function login(password: string): boolean {
  if (password === getPassword()) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, 'true');
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}
