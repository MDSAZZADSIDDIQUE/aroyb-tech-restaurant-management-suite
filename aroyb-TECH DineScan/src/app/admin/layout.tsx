'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const auth = sessionStorage.getItem('dinescan-admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || 'demo123';
    
    if (password === correctPassword) {
      sessionStorage.setItem('dinescan-admin-auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dinescan-admin-auth');
    setIsAuthenticated(false);
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/tables', label: 'Tables', icon: '🪑' },
    { href: '/admin/kitchen', label: 'Kitchen', icon: '🍳' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-elevated p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl">
              🔐
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-900">Admin Access</h1>
            <p className="text-neutral-500 mt-1">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field mb-4"
              autoFocus
            />
            
            {error && (
              <p className="text-danger-500 text-sm mb-4 text-center">{error}</p>
            )}
            
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              Demo password: <code className="bg-neutral-100 px-2 py-0.5 rounded">demo123</code>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <Link href="/" className="text-primary-600 hover:underline text-sm">
              ← Back to Demo Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Demo Banner */}
      <div className="demo-banner">
        🍽️ Demo Mode — Admin Panel Preview
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-[calc(100vh-40px)] border-r border-neutral-200 flex-shrink-0">
          <div className="p-6">
            <h1 className="font-display font-bold text-lg text-neutral-900">
              DineScan Admin
            </h1>
            <p className="text-sm text-neutral-500">Aroyb Grill & Curry</p>
          </div>

          <nav className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 w-64 p-4 border-t bg-white">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-neutral-600 hover:text-danger-600 rounded-lg hover:bg-neutral-50"
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
