'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (login(password)) {
      router.push('/dashboard');
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-white text-2xl font-bold mb-4">
            PS
          </div>
          <h1 className="text-2xl font-bold">Aroyb PromoStudio</h1>
          <p className="text-neutral-400 text-sm mt-1">Promotions • Vouchers • Gift Cards</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Demo Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="Enter password"
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {/* Hint */}
        <div className="mt-6 p-3 rounded-lg bg-neutral-800 text-center">
          <span className="text-xs text-neutral-400">Demo password: </span>
          <code className="text-xs text-[#ed7424]">aroyb2024</code>
        </div>
      </div>
    </div>
  );
}
