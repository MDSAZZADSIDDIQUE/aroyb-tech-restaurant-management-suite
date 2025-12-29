'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import DemoBanner from '@/components/layout/DemoBanner';
import { ToastContainer, showToast } from '@/components/ui/Toast';
import { isAuthenticated } from '@/lib/auth';
import { initializeStorage, addStoredOrder, getStoredOrders, setStoredOrders } from '@/lib/storage';
import { startOrderSimulator, stopOrderSimulator, isSimulatorRunning } from '@/lib/order-simulator';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check auth
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    
    // Initialize storage with default data
    initializeStorage();
    
    // Check if simulator was running
    setSimulatorActive(isSimulatorRunning());
  }, [router]);

  const handleToggleSimulator = () => {
    if (simulatorActive) {
      stopOrderSimulator();
      setSimulatorActive(false);
      showToast({ type: 'info', title: 'Live orders disabled' });
    } else {
      startOrderSimulator((newOrder) => {
        // Add to storage
        addStoredOrder(newOrder);
        
        // Show notification
        showToast({
          type: 'info',
          title: 'New Order!',
          message: `#${newOrder.orderNumber} from ${newOrder.customerName}`,
        });
        
        // Trigger a refresh event
        window.dispatchEvent(new CustomEvent('new-order', { detail: newOrder }));
      }, 25000);
      setSimulatorActive(true);
      showToast({ type: 'success', title: 'Live orders enabled', message: 'New orders will arrive every 20-40 seconds' });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading OrderHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <DemoBanner 
          onToggleSimulator={handleToggleSimulator}
          simulatorActive={simulatorActive}
        />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      <ToastContainer />
    </div>
  );
}
