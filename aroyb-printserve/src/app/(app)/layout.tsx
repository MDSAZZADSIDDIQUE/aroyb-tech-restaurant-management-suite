'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, logout } from '@/lib/auth';
import { initializeStorage, getBranches, getActiveBranchId, setActiveBranchId } from '@/lib/storage';
import type { Branch } from '@/types';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/orders', label: 'Orders', icon: '📋' },
  { href: '/printers', label: 'Printers', icon: '🖨️' },
  { href: '/jobs', label: 'Print Jobs', icon: '📑' },
  { href: '/templates', label: 'Templates', icon: '📝' },
  { href: '/packer', label: 'Packer View', icon: '📦' },
  { href: '/formatting', label: 'Label Formatting', icon: '🏷️' },
  { href: '/troubleshooter', label: 'Troubleshooter', icon: '🔧' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    
    initializeStorage();
    setBranches(getBranches());
    setActiveBranch(getActiveBranchId());
    setLoading(false);
  }, [router]);
  
  const handleBranchChange = (branchId: string) => {
    setActiveBranch(branchId);
    setActiveBranchId(branchId);
  };
  
  const handleLogout = () => {
    logout();
    router.replace('/login');
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
      {/* Sidebar */}
      <aside className="sidebar w-64 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-lg shadow-lg">
              🖨️
            </div>
            <div>
              <h1 className="font-bold text-white">PrintServe</h1>
              <p className="text-xs text-neutral-500">Admin Panel</p>
            </div>
          </div>
        </div>
        
        {/* Branch Selector */}
        <div className="p-4 border-b border-neutral-800">
          <label className="text-xs text-neutral-500 block mb-2">Active Branch</label>
          <select
            value={activeBranch}
            onChange={(e) => handleBranchChange(e.target.value)}
            className="input text-sm"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-neutral-800">
            <Link
              href="/bridge"
              className={`sidebar-link ${pathname === '/bridge' ? 'active' : ''}`}
            >
              <span className="text-lg">🌉</span>
              <span>Print Bridge</span>
            </Link>
          </div>
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-neutral-800">
          <button onClick={handleLogout} className="sidebar-link w-full text-left">
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Demo Banner */}
        <div className="demo-banner text-white text-center py-2 text-sm font-semibold no-print">
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold mr-2">DEMO</span>
          Aroyb PrintServe — All printing is simulated
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
