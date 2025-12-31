'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-400">Loading MenuMaster...</p>
      </div>
    </div>
  );
}
