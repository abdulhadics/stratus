'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { KeyRound, LogOut, Globe, ShieldCheck, Loader2, CheckCircle2, AlertCircle, Sun } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ type: 'success', msg: 'Password changed successfully! Please log in again.' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => signOut({ callbackUrl: '/login' }), 2000);
      } else {
        setPwStatus({ type: 'error', msg: data.error || 'Failed to change password.' });
      }
    } catch {
      setPwStatus({ type: 'error', msg: 'An unexpected error occurred.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-sm text-text-dimmed">Manage your account preferences and display theme.</p>
      </div>

      {/* Appearance / Theme Preference Card */}
      <div className="rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-bg-elevated flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">Appearance</h2>
          </div>
          <span className="text-xs text-text-dimmed">Light & Dark Modes</span>
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Theme Mode</p>
            <p className="text-xs text-text-dimmed mt-0.5">Select your preferred color theme across the portal.</p>
          </div>
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {/* Account Info Card */}
      <div className="rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-bg-elevated flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-text-primary">Account Info</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-dimmed">Name</span>
            <span className="text-text-primary font-medium">{session?.user?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-dimmed">Email</span>
            <span className="text-text-primary font-medium">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-dimmed">Role</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              (session?.user as any)?.role === 'ADMIN'
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {(session?.user as any)?.role || 'USER'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-dimmed">GHL Location ID</span>
            <span className="text-text-primary font-mono text-xs">{(session?.user as any)?.ghlLocationId || 'Not linked'}</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-bg-elevated flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-text-primary">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          {pwStatus && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
              pwStatus.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {pwStatus.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {pwStatus.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 transition-opacity"
          >
            {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Update Password
          </button>
        </form>
      </div>

      {/* Actions Card */}
      <div className="rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-bg-elevated">
          <h2 className="text-base font-semibold text-text-primary">Actions</h2>
        </div>
        <div className="p-6 space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 border border-border text-text-primary py-2 rounded-lg font-medium hover:bg-bg-elevated transition-colors"
          >
            <Globe className="w-4 h-4" />
            Back to Website
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-2 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
