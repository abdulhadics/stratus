'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: username, // The UI says "username", but NextAuth expects "email" based on our setup
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-bg-surface border border-border shadow-xl">
        <div className="flex justify-center mb-8">
          <Image
            src="/logolight-transparent.png"
            alt="STRATUS Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Welcome Back</h1>
          <p className="text-sm text-text-dimmed">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
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
            className="w-full py-2 px-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
