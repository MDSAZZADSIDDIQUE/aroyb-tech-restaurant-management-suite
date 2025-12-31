'use client';

import { useEffect, useState } from 'react';
import { getPrinters, updatePrinter, getPrintJobs, updatePrintJob } from '@/lib/storage';
import { printerStatusConfig, printerTypeConfig, printJobTypeConfig, formatTime, formatDateTime } from '@/lib/formatting';
import type { Printer, PrintJob, PrinterStatus } from '@/types';

export default function BridgePage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoProcess, setAutoProcess] = useState(false);
  
  useEffect(() => {
    loadData();
    
    // Poll for new jobs
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);
  
  // Auto-process pending jobs
  useEffect(() => {
    if (!autoProcess) return;
    
    const interval = setInterval(() => {
      const pendingJobs = jobs.filter(j => j.status === 'pending');
      if (pendingJobs.length > 0) {
        const job = pendingJobs[0];
        const printer = printers.find(p => p.id === job.printerId);
        
        if (printer?.status === 'online') {
          handleProcessJob(job.id, 'completed');
        } else if (printer?.status === 'offline' || printer?.status === 'error') {
          handleProcessJob(job.id, 'failed', `Printer ${printer.name} is ${printer.status}`);
        }
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [autoProcess, jobs, printers]);
  
  const loadData = () => {
    setPrinters(getPrinters());
    setJobs(getPrintJobs().filter(j => j.status === 'pending' || j.status === 'printing').reverse());
    setLoading(false);
  };
  
  const handleStatusChange = (printerId: string, status: PrinterStatus) => {
    updatePrinter(printerId, { status, lastSeen: new Date().toISOString() });
    loadData();
  };
  
  const handleProcessJob = (jobId: string, status: 'completed' | 'failed', error?: string) => {
    updatePrintJob(jobId, {
      status,
      error,
      attemptedAt: new Date().toISOString(),
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    });
    loadData();
  };
  
  const handleTestPrint = (printer: Printer) => {
    alert(`Test print sent to ${printer.name}\n\n--- TEST PRINT ---\nPrinter: ${printer.model}\nStatus: ${printer.status}\nTime: ${new Date().toLocaleString()}\n-----------------`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0a09]">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const onlinePrinters = printers.filter(p => p.status === 'online').length;
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;
  
  return (
    <div className="min-h-screen bg-[#0c0a09] text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-lg shadow-lg">
              🌉
            </div>
            <div>
              <h1 className="font-bold text-lg">Aroyb Print Bridge</h1>
              <p className="text-xs text-neutral-500">Local Printer Gateway Simulator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm">{onlinePrinters} of {printers.length} printers online</p>
              <p className="text-xs text-neutral-500">{pendingJobs} jobs pending</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${onlinePrinters > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </header>
      
      {/* Demo Banner */}
      <div className="demo-banner text-center py-2 text-sm font-semibold">
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold mr-2">SIMULATOR</span>
        This simulates a local Print Bridge application
      </div>
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Controls */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Auto-Process Jobs</h2>
              <p className="text-sm text-neutral-400">Automatically process pending jobs based on printer status</p>
            </div>
            <button
              onClick={() => setAutoProcess(!autoProcess)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                autoProcess ? 'bg-green-600 text-white' : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {autoProcess ? '✓ Auto-Processing' : 'Manual Mode'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Printers */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Connected Printers</h2>
            <div className="space-y-3">
              {printers.map(printer => (
                <div key={printer.id} className="p-4 rounded-lg bg-neutral-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{printerTypeConfig[printer.type].icon}</span>
                      <div>
                        <p className="font-semibold">{printer.name}</p>
                        <p className="text-xs text-neutral-500">{printer.model}</p>
                      </div>
                    </div>
                    <span className={`badge ${printerStatusConfig[printer.status].bgColor} ${printerStatusConfig[printer.status].color}`}>
                      {printerStatusConfig[printer.status].icon} {printerStatusConfig[printer.status].label}
                    </span>
                  </div>
                  
                  <div className="flex gap-1 mb-3">
                    {(['online', 'offline', 'paper_low', 'error'] as PrinterStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(printer.id, status)}
                        className={`px-2 py-1 rounded text-xs ${
                          printer.status === status
                            ? 'bg-[#ed7424] text-white'
                            : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleTestPrint(printer)}
                    disabled={printer.status !== 'online'}
                    className="btn btn-ghost text-xs w-full"
                  >
                    🖨️ Test Print
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Job Queue */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Print Queue</h2>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-400">No pending jobs</p>
                <p className="text-sm text-neutral-500 mt-1">Print from the admin app to see jobs here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => {
                  const printer = printers.find(p => p.id === job.printerId);
                  return (
                    <div key={job.id} className="p-4 rounded-lg bg-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{printJobTypeConfig[job.type].icon}</span>
                          <span className="font-semibold">{printJobTypeConfig[job.type].label}</span>
                        </div>
                        <span className="badge bg-amber-500/20 text-amber-400">
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-neutral-400 mb-3">
                        <p>Order: {job.orderId}</p>
                        <p>Printer: {printer?.name || 'Unknown'}</p>
                        <p>Received: {formatTime(job.createdAt)}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProcessJob(job.id, 'completed')}
                          className="btn btn-success text-xs flex-1"
                        >
                          ✓ Complete
                        </button>
                        <button
                          onClick={() => handleProcessJob(job.id, 'failed', 'Manual failure')}
                          className="btn btn-danger text-xs flex-1"
                        >
                          ✗ Fail
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-neutral-800 text-sm text-neutral-400">
          <p>
            <strong className="text-white">About Print Bridge:</strong> In production, this would be a local application 
            running on the restaurant&apos;s network, connected to physical printers via USB, network, or cloud protocols. 
            This demo simulates the bridge behavior for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
