'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { validatePassword, createSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (validatePassword(password)) {
      createSession();
      router.push('/dashboard');
    } else {
      setError('Invalid password. Try: aroyb2024');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Demo Mode Banner - warm orange */}
      <div className="demo-banner text-white text-center py-2 text-sm">
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold mr-2">DEMO</span>
        Aroyb OrderHub Demo - Use password: <code className="bg-white/20 px-1 rounded">aroyb2024</code>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo - warm gradient matching SiteBuilder */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ed7424] to-[#e1ac13] text-white text-3xl font-bold shadow-glow mb-4">
              A
            </div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>OrderHub</h1>
            <p className="text-neutral-400 mt-2">Restaurant Order Management System</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-card p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Welcome Back</h2>
            <p className="text-neutral-500 mb-6">Sign in to access your restaurant dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter demo password"
                  className="input-field"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-[#cc3232] px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#ed7424] to-[#de5a1a] hover:from-[#de5a1a] hover:to-[#b84317] text-white font-medium rounded-lg transition-all shadow-soft hover:shadow-glow disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-center text-sm text-neutral-500">
                This is a demo. No real authentication required.
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="text-white/80">
              <div className="text-2xl mb-1">📋</div>
              <div className="text-xs">Order Management</div>
            </div>
            <div className="text-white/80">
              <div className="text-2xl mb-1">🤖</div>
              <div className="text-xs">AI Predictions</div>
            </div>
            <div className="text-white/80">
              <div className="text-2xl mb-1">👨‍🍳</div>
              <div className="text-xs">Kitchen Display</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-neutral-500 text-sm">
        © 2024 Aroyb Technology. All rights reserved.
      </div>
    </div>
  );
}
