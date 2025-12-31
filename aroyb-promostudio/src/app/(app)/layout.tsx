'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, logout } from '@/lib/auth';
import { initializeStorage, resetStorage } from '@/lib/storage';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    title: 'Promotions',
    items: [
      { href: '/promos', label: 'All Promos', icon: '🏷️' },
      { href: '/promos/new', label: 'Create Promo', icon: '➕' },
      { href: '/schedules', label: 'Schedules', icon: '📅' },
    ],
  },
  {
    title: 'Gift Cards',
    items: [
      { href: '/gift-cards', label: 'Products', icon: '🎁' },
      { href: '/gift-cards/issue', label: 'Issue Card', icon: '✉️' },
      { href: '/gift-cards/redeem', label: 'Redeem', icon: '💳' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/anti-abuse', label: 'Anti-Abuse', icon: '🛡️' },
      { href: '/analytics', label: 'Analytics', icon: '📈' },
    ],
  },
  {
    title: 'AI Features',
    items: [
      { href: '/ai/generator', label: 'Promo Generator', icon: '🤖' },
      { href: '/ai/optimiser', label: 'Optimiser', icon: '⚡' },
      { href: '/ai/send-time', label: 'Send Planner', icon: '📬' },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    initializeStorage();
    setMounted(true);
  }, [router]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const handleReset = () => {
    if (confirm('Reset all data to defaults?')) {
      resetStorage();
      window.location.reload();
    }
  };
  
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <>
      {/* Demo Banner */}
      <div className="demo-banner">
        🎯 DEMO MODE — Aroyb PromoStudio
      </div>
      
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-white font-bold text-sm">
              PS
            </div>
            <div>
              <div className="font-bold text-sm">PromoStudio</div>
              <div className="text-xs text-neutral-500">Aroyb Tech</div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav>
          {NAV_GROUPS.map(group => (
            <div key={group.title} className="nav-group">
              <div className="nav-group-title">{group.title}</div>
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
          <div className="flex gap-2">
            <button onClick={handleReset} className="btn btn-ghost btn-sm flex-1">
              🔄 Reset
            </button>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm flex-1">
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </>
  );
}
