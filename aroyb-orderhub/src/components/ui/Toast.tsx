'use client';

import { useEffect, useState } from 'react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 5000);
    
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);
  
  return (
    <div className={`animate-slide-in flex items-start gap-3 p-4 rounded-lg border shadow-lg ${colors[toast.type]}`}>
      <span className="text-lg">{icons[toast.type]}</span>
      <div className="flex-1">
        <p className="font-medium">{toast.title}</p>
        {toast.message && <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  );
}

// Toast container and hook
let toastListeners: ((toast: ToastData) => void)[] = [];

export function showToast(toast: Omit<ToastData, 'id'>) {
  const id = Date.now().toString();
  toastListeners.forEach(listener => listener({ ...toast, id }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  
  useEffect(() => {
    const listener = (toast: ToastData) => {
      setToasts(prev => [...prev, toast]);
    };
    
    toastListeners.push(listener);
    
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);
  
  const handleDismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

export default Toast;
