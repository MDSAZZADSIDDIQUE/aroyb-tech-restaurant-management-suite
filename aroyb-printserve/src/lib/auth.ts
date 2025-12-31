// Authentication utilities for PrintServe

const SESSION_KEY = 'ps_auth_session';
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || 'aroyb2024';

export function login(password: string): boolean {
  if (password === DEMO_PASSWORD) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        authenticated: true,
        loginAt: new Date().toISOString(),
      }));
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return false;
  try {
    const parsed = JSON.parse(session);
    return parsed.authenticated === true;
  } catch {
    return false;
  }
}

export function getSession(): { authenticated: boolean; loginAt: string } | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}
