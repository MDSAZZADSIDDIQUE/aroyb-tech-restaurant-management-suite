'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/kds');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-400">Loading KitchenScreen...</p>
      </div>
    </div>
  );
}
