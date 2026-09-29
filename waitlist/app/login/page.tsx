'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { StratusLogo, StratusWordmark } from '@/components/ui/StratusLogo';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: username,
        password: password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username }),
      });
      if (res.ok) {
        setResetSuccess(true);
      } else {
        setError('Failed to send recovery email.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-bg-surface border border-border shadow-xl">
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <StratusLogo size={64} />
          <StratusWordmark fontSize="text-[26px]" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            {isForgotPassword ? 'Recover Password' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-text-dimmed">
            {isForgotPassword ? 'Enter your email to receive your password' : 'Enter your credentials to access your dashboard'}
          </p>
        </div>

        {isForgotPassword ? (
          <form onSubmit={handleReset} className="space-y-4 animate-fade-in">
            {resetSuccess ? (
              <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-emerald-500 text-sm font-medium mb-4">If an account exists, a recovery email has been sent.</p>
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setResetSuccess(false); }}
                  className="w-full py-2 px-4 bg-bg-elevated border border-border text-text-primary rounded-lg font-medium hover:bg-bg-surface transition-colors"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    placeholder="e.g. boss@stratusystems.co"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Recovery Email'}
                </button>
                <div className="text-center mt-3">
                  <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm text-text-dimmed hover:text-accent transition-colors cursor-pointer">
                    Back to login
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="e.g. boss@stratusystems.co"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-text-primary">Password</label>
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[11px] text-accent hover:underline cursor-pointer">
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
