'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPrinters, getPrintJobs, getOrders, getActiveBranchId, getPrintersByBranch } from '@/lib/storage';
import { printerStatusConfig, printerTypeConfig, formatDateTime } from '@/lib/formatting';
import type { Printer, PrintJob, Order } from '@/types';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  jobsToday: number;
  failedJobs: number;
  printersOnline: number;
  printersOffline: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [recentJobs, setRecentJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const branchId = getActiveBranchId();
    const allPrinters = getPrintersByBranch(branchId);
    const allJobs = getPrintJobs();
    const allOrders = getOrders();
    
    const today = new Date().toDateString();
    const todayJobs = allJobs.filter(j => new Date(j.createdAt).toDateString() === today);
    
    setStats({
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      jobsToday: todayJobs.length,
      failedJobs: todayJobs.filter(j => j.status === 'failed').length,
      printersOnline: allPrinters.filter(p => p.status === 'online').length,
      printersOffline: allPrinters.filter(p => p.status === 'offline' || p.status === 'error').length,
    });
    
    setPrinters(allPrinters);
    setRecentJobs(allJobs.slice(-5).reverse());
    setLoading(false);
  }, []);
  
  if (loading || !stats) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-neutral-400 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <p className="text-sm text-amber-400 mt-1">{stats.pendingOrders} pending</p>
        </div>
        <div className="card">
          <p className="text-neutral-400 text-sm mb-1">Jobs Today</p>
          <p className="text-3xl font-bold text-green-400">{stats.jobsToday}</p>
          {stats.failedJobs > 0 && (
            <p className="text-sm text-red-400 mt-1">{stats.failedJobs} failed</p>
          )}
        </div>
        <div className="card">
          <p className="text-neutral-400 text-sm mb-1">Printers Online</p>
          <p className="text-3xl font-bold text-green-400">{stats.printersOnline}</p>
          {stats.printersOffline > 0 && (
            <p className="text-sm text-red-400 mt-1">{stats.printersOffline} offline/error</p>
          )}
        </div>
        <div className="card">
          <p className="text-neutral-400 text-sm mb-1">Quick Actions</p>
          <div className="flex gap-2 mt-2">
            <Link href="/orders" className="btn btn-primary text-sm flex-1">
              📋 Orders
            </Link>
            <Link href="/bridge" className="btn btn-ghost text-sm flex-1">
              🌉 Bridge
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Printers Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Printers</h2>
            <Link href="/printers" className="text-sm text-[#ed7424] hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {printers.map(printer => (
              <div key={printer.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{printerTypeConfig[printer.type].icon}</span>
                  <div>
                    <p className="font-medium">{printer.name}</p>
                    <p className="text-xs text-neutral-500">{printer.model}</p>
                  </div>
                </div>
                <span className={`badge ${printerStatusConfig[printer.status].bgColor} ${printerStatusConfig[printer.status].color}`}>
                  {printerStatusConfig[printer.status].icon} {printerStatusConfig[printer.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Print Jobs</h2>
            <Link href="/jobs" className="text-sm text-[#ed7424] hover:underline">View all →</Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No print jobs yet</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800">
                  <div>
                    <p className="font-medium">{job.type.toUpperCase()}</p>
                    <p className="text-xs text-neutral-500">{formatDateTime(job.createdAt)}</p>
                  </div>
                  <span className={`badge ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' : job.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
