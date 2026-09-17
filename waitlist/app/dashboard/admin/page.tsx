'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Save, Loader2, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react';

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
  const [waitlistLeads, setWaitlistLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '', password: '', ghlLocationId: '' });

  // Edit modal state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', ghlLocationId: '', role: '', password: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Delete confirm state
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchWaitlistLeads = async () => {
    try {
      const res = await fetch('/api/admin/waitlist');
      if (res.ok) {
        const data = await res.json();
        setWaitlistLeads(data.contacts.filter((c: any) => c.tags?.includes('src-website-waitlist')));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    Promise.all([fetchUsers(), fetchWaitlistLeads()]).finally(() => setLoading(false));
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'USER' }),
      });
      if (res.ok) {
        setFormData({ email: '', name: '', password: '', ghlLocationId: '' });
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
      }
    } catch { alert('An error occurred'); }
    finally { setIsCreating(false); }
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ name: user.name || '', email: user.email, ghlLocationId: user.ghlLocationId || '', role: user.role, password: '' });
    setEditSuccess(false);
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditSuccess(true);
        fetchUsers();
        setTimeout(() => { setEditUser(null); setEditSuccess(false); }, 1200);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update user');
      }
    } catch { alert('An error occurred'); }
    finally { setEditLoading(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) { setDeleteUserId(null); fetchUsers(); }
      else alert('Failed to delete user');
    } catch { alert('An error occurred'); }
    finally { setDeleteLoading(false); }
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
        <div className="lg:col-span-2 rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden h-fit">
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
                  <th className="px-6 py-3 font-medium">Actions</th>
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
                      {user.ghlLocationId
                        ? <span className="text-emerald-400">{user.ghlLocationId}</span>
                        : <span className="text-red-400">Not Linked</span>}
                    </td>
                    <td className="px-6 py-4 text-text-dimmed">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                          title="Edit user"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Waitlist Prioritization Table */}
      <div className="rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border bg-bg-elevated flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Waitlist Applicants (Prioritization View)</h2>
            <p className="text-sm text-text-dimmed">Review leads based on urgency and completeness.</p>
          </div>
          <button onClick={() => { setLoading(true); fetchWaitlistLeads().finally(() => setLoading(false)); }} className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg">
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-sm text-text-dimmed">
                <th className="px-6 py-3 font-medium">Applicant</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Urgency</th>
                <th className="px-6 py-3 font-medium">Revenue / Volume</th>
                <th className="px-6 py-3 font-medium">Frustration (Open Q)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-text-primary">
              {waitlistLeads.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-text-dimmed">No waitlist applications found.</td></tr>
              ) : (
                waitlistLeads.map((lead) => {
                  const isPartial = lead.tags?.includes('stratus-partial-lead');
                  const REVENUE_FIELD_ID = 'reutlLeT0xTUvh2Elfvf';
                  const VOLUME_FIELD_ID = 'jBdzZMRHGHOpMYTqCcKw';
                  const FRUSTRATION_FIELD_ID = 'CUZAgurvt5GYgk8uGqPB';
                  const revenueStr = lead.customFields?.find((f: any) => f.id === REVENUE_FIELD_ID)?.value || lead.customFields?.find((f: any) => { const val = String(f?.value || '').toLowerCase(); return val.length < 20 && (val.includes('$') || val.includes('000') || val.match(/<|>|\d+k/)); })?.value || 'N/A';
                  const volumeStr = lead.customFields?.find((f: any) => f.id === VOLUME_FIELD_ID)?.value || lead.customFields?.find((f: any) => { const val = String(f?.value || '').toLowerCase(); return val.length < 20 && (val.includes('call') || val.includes('week') || val.match(/\d+-\d+/)); })?.value || 'N/A';
                  const frustrationStr = lead.customFields?.find((f: any) => f.id === FRUSTRATION_FIELD_ID)?.value || lead.customFields?.find((f: any) => { const val = String(f?.value || '').toLowerCase(); return val.length > 50 && !val.includes('http'); })?.value || 'N/A';
                  let urgency = 'Normal';
                  if (revenueStr === '500k+' || revenueStr.includes('500') || (volumeStr !== 'N/A' && volumeStr.toLowerCase().includes('high'))) urgency = 'High 🚨';
                  return (
                    <tr key={lead.id} className={`border-b border-border/50 hover:bg-bg-elevated/50 transition-colors ${urgency.includes('High') ? 'bg-red-500/5' : ''}`}>
                      <td className="px-6 py-4"><div className="font-medium">{lead.firstName} {lead.lastName}</div><div className="text-text-dimmed text-xs">{lead.email}</div><div className="text-text-dimmed text-xs">{lead.phone}</div></td>
                      <td className="px-6 py-4">{isPartial ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Partial (Page 1)</span> : <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Full Lead</span>}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${urgency.includes('High') ? 'text-red-500 bg-red-500/10' : 'text-text-dimmed'}`}>{urgency}</span></td>
                      <td className="px-6 py-4 max-w-[200px] truncate"><div className="text-xs font-medium">{revenueStr !== 'N/A' ? revenueStr : '-'}</div><div className="text-xs text-text-dimmed mt-1">{volumeStr !== 'N/A' ? volumeStr : '-'}</div></td>
                      <td className="px-6 py-4 max-w-[300px]"><p className="text-xs truncate text-text-dimmed" title={frustrationStr}>{frustrationStr !== 'N/A' ? frustrationStr : '-'}</p></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-text-dimmed hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">GHL Location ID</label>
                <input type="text" value={editForm.ghlLocationId} onChange={(e) => setEditForm({...editForm, ghlLocationId: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none" placeholder="e.g. jfoD7cKt3XJ0FObiU5i3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">New Password <span className="text-text-dimmed font-normal">(leave blank to keep current)</span></label>
                <input type="text" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none" placeholder="••••••••" />
              </div>

              {editSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" /> Saved successfully!
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setEditUser(null)} className="flex-1 border border-border text-text-primary py-2 rounded-lg text-sm hover:bg-bg-elevated transition-colors">Cancel</button>
              <button onClick={handleEditSave} disabled={editLoading} className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-2 rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50">
                {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Delete this user?</h3>
            <p className="text-sm text-text-dimmed">This action cannot be undone. The user will lose all portal access immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUserId(null)} className="flex-1 border border-border text-text-primary py-2 rounded-lg text-sm hover:bg-bg-elevated transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteUserId)} disabled={deleteLoading} className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
