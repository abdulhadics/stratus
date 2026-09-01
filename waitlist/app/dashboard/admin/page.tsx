'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Save, Loader2 } from 'lucide-react';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  ghlLocationId: string | null;
  createdAt: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    ghlLocationId: '',
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'USER',
        }),
      });

      if (res.ok) {
        setFormData({ email: '', name: '', password: '', ghlLocationId: '' });
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-accent w-8 h-8" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Admin Dashboard</h1>
        <p className="text-text-dimmed">Manage STRATUS entrepreneurs and their GHL connections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create User Form */}
        <div className="lg:col-span-1 rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-border bg-bg-elevated flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">New Client</h2>
          </div>
          <form onSubmit={handleCreateUser} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Name / Company</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
              <input type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">GHL Location ID</label>
              <input type="text" value={formData.ghlLocationId} onChange={(e) => setFormData({...formData, ghlLocationId: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none" placeholder="e.g. jfoD7cKt3XJ0FObiU5i3" />
            </div>
            <button type="submit" disabled={isCreating} className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Create Account
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="lg:col-span-2 rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-bg-elevated">
            <h2 className="text-lg font-semibold text-text-primary">Registered Clients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-text-dimmed">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">GHL Location ID</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{user.name || 'N/A'}</div>
                      <div className="text-text-dimmed text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-dimmed">
                      {user.ghlLocationId || 'Not Linked'}
                    </td>
                    <td className="px-6 py-4 text-text-dimmed">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
