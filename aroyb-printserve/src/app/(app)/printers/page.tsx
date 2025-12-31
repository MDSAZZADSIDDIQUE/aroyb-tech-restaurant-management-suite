'use client';

import { useEffect, useState } from 'react';
import { getPrintersByBranch, getActiveBranchId, updatePrinter } from '@/lib/storage';
import { printerStatusConfig, printerTypeConfig, formatDateTime } from '@/lib/formatting';
import type { Printer, PrinterStatus } from '@/types';

export default function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPrinters();
  }, []);
  
  const loadPrinters = () => {
    const branchId = getActiveBranchId();
    setPrinters(getPrintersByBranch(branchId));
    setLoading(false);
  };
  
  const handleStatusChange = (printerId: string, status: PrinterStatus) => {
    updatePrinter(printerId, { status, lastSeen: new Date().toISOString() });
    loadPrinters();
  };
  
  const handleTestPrint = (printer: Printer) => {
    alert(`Test print sent to ${printer.name}\n\nThis is a demo - no actual print will occur.`);
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Printers</h1>
        <div className="text-sm text-neutral-400">
          {printers.filter(p => p.status === 'online').length} of {printers.length} online
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {printers.map(printer => (
          <div key={printer.id} className="card card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{printerTypeConfig[printer.type].icon}</span>
                <div>
                  <h3 className="font-bold">{printer.name}</h3>
                  <p className="text-sm text-neutral-400">{printer.model}</p>
                </div>
              </div>
              <span className={`badge ${printerStatusConfig[printer.status].bgColor} ${printerStatusConfig[printer.status].color}`}>
                {printerStatusConfig[printer.status].icon} {printerStatusConfig[printer.status].label}
              </span>
            </div>
            
            <div className="text-sm text-neutral-400 space-y-1 mb-4">
              <p>Type: {printerTypeConfig[printer.type].label}</p>
              <p>IP: {printer.ipAddress || 'Not set'}</p>
              <p>Last Seen: {formatDateTime(printer.lastSeen)}</p>
            </div>
            
            {/* Status Toggles (Demo) */}
            <div className="border-t border-neutral-700 pt-4 mb-4">
              <p className="text-xs text-neutral-500 mb-2">Simulate Status:</p>
              <div className="flex gap-1 flex-wrap">
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
            </div>
            
            <button 
              onClick={() => handleTestPrint(printer)}
              disabled={printer.status !== 'online'}
              className="btn btn-primary w-full"
            >
              🖨️ Test Print
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
