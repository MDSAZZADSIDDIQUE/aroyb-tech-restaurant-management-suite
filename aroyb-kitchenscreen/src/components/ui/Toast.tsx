'use client';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

let toastContainer: HTMLDivElement | null = null;

export function showToast({ type, title, message }: ToastProps) {
  if (typeof window === 'undefined') return;
  
  // Create container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  
  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-amber-600',
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };
  
  toast.className = `
    ${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg
    animate-slide-in max-w-sm flex items-start gap-3
  `;
  
  toast.innerHTML = `
    <span class="text-lg">${icons[type]}</span>
    <div class="flex-1">
      <p class="font-semibold">${title}</p>
      ${message ? `<p class="text-sm opacity-90">${message}</p>` : ''}
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

export default function ToastContainer() {
  return <div id="toast-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2" />;
}
