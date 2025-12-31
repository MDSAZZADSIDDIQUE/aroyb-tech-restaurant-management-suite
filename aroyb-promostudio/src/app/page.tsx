'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
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
      <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
