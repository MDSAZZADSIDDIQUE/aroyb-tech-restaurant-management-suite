'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { initializeStorage } from '@/lib/storage';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    initializeStorage();
    
    if (login(password)) {
      router.push('/dashboard');
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="demo-banner text-white text-center py-2 text-sm font-semibold rounded-t-xl">
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold mr-2">DEMO</span>
          Aroyb MenuMaster Demo
        </div>
        
        <div className="card rounded-t-none">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
              📋
            </div>
            <h1 className="text-2xl font-bold">MenuMaster Admin</h1>
            <p className="text-neutral-400 mt-1">Menu Management System</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Admin Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter demo password"
                className="input"
                autoComplete="current-password"
              />
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <button type="submit" disabled={loading || !password} className="btn btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
            <p className="text-sm text-neutral-400">
              <strong className="text-neutral-300">Demo Password:</strong> aroyb2024
            </p>
            <p className="text-xs text-neutral-500 mt-2">Full menu management with AI features.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
