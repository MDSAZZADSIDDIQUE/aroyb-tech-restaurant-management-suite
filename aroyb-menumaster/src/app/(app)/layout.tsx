'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, logout } from '@/lib/auth';
import { initializeStorage, resetStorage } from '@/lib/storage';

const navItems = [
  { section: 'Menu', items: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/menu/categories', label: 'Categories', icon: '📁' },
    { href: '/menu/items', label: 'Items', icon: '🍔' },
  ]},
  { section: 'Configuration', items: [
    { href: '/modifiers', label: 'Modifiers', icon: '⚙️' },
    { href: '/combos', label: 'Combos & Deals', icon: '🎁' },
    { href: '/schedules', label: 'Schedules', icon: '🕒' },
  ]},
  { section: 'Operations', items: [
    { href: '/availability', label: '86 / Sold Out', icon: '🚫' },
    { href: '/tax-vat', label: 'Tax & VAT', icon: '💷' },
    { href: '/images', label: 'Image Library', icon: '🖼️' },
  ]},
  { section: 'AI Features', items: [
    { href: '/ai/insights', label: 'Insights', icon: '🔍' },
    { href: '/ai/pricing', label: 'Pricing', icon: '💰' },
    { href: '/ai/descriptions', label: 'Descriptions', icon: '✍️' },
  ]},
  { section: 'Preview', items: [
    { href: '/preview', label: 'Customer View', icon: '👁️' },
  ]},
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    initializeStorage();
    setLoading(false);
  }, [router]);
  
  const handleLogout = () => {
    logout();
    router.replace('/login');
  };
  
  const handleReset = () => {
    if (confirm('Reset all data to defaults?')) {
      resetStorage();
      window.location.reload();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex">
      <aside className="sidebar w-60 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-lg shadow-lg">
              📋
            </div>
            <div>
              <h1 className="font-bold text-white">MenuMaster</h1>
              <p className="text-xs text-neutral-500">Admin Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-3 overflow-auto">
          {navItems.map(group => (
            <div key={group.section}>
              <div className="sidebar-section">{group.section}</div>
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        
        <div className="p-3 border-t border-neutral-800 space-y-1">
          <button onClick={handleReset} className="sidebar-link w-full text-left text-amber-400">
            <span>🔄</span>
            <span>Reset Demo Data</span>
          </button>
          <button onClick={handleLogout} className="sidebar-link w-full text-left">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col">
        <div className="demo-banner text-white text-center py-2 text-sm font-semibold">
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold mr-2">DEMO</span>
          Aroyb MenuMaster — Menu Management System
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
