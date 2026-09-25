'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, Save, Loader2, Pencil, Trash2, X, CheckCircle2, ShieldCheck, Mail, KeyRound, Link as LinkIcon, RefreshCw, Zap, Search } from 'lucide-react';

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
  const [editForm, setEditForm] = useState({ name: '', email: '', ghlLocationId: '', ghlApiToken: '', role: '', password: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [autoFetchLoading, setAutoFetchLoading] = useState(false);
  const [autoFetchResults, setAutoFetchResults] = useState<any[]>([]);

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
    setEditForm({ name: user.name || '', email: user.email, ghlLocationId: user.ghlLocationId || '', ghlApiToken: (user as any).ghlApiToken || '', role: user.role, password: '' });
    setEditSuccess(false);
    setAutoFetchResults([]);
  };

  // Auto-fetch GHL location using Agency token
  const [searchFilter, setSearchFilter] = useState('');

  const handleAutoFetch = async (customTerm?: string) => {
    if (!editUser) return;
    setAutoFetchLoading(true);
    setAutoFetchResults([]);
    try {
      const params = new URLSearchParams();
      const term = typeof customTerm === 'string' ? customTerm : searchFilter;
      if (term.trim()) {
        params.set('query', term.trim());
      } else {
        if (editForm.email) params.set('email', editForm.email);
        if (editForm.name) params.set('name', editForm.name);
      }
      
      const res = await fetch(`/api/admin/ghl-location?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.locations?.length > 0) {
        setAutoFetchResults(data.locations);
        // Auto-select if only 1 exact match
        if (data.locations.length === 1 && !data.isRecentFallback) {
          setEditForm(prev => ({ ...prev, ghlLocationId: data.locations[0].id }));
        }
      } else {
        setAutoFetchResults([{ id: '', name: 'No sub-accounts found in GHL Agency' }]);
      }
    } catch { setAutoFetchResults([{ id: '', name: 'Error fetching locations' }]); }
    finally { setAutoFetchLoading(false); }
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

  if (loading) return <div className="p-8 flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in relative z-10">
      {/* Header section with gradient text */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-blue-600 to-accent dark:from-white dark:via-blue-100 dark:to-accent mb-2">
            Command Center
          </h1>
          <p className="text-text-secondary text-lg">Manage STRATUS entrepreneurs, sub-accounts, and waitlist leads.</p>
        </div>
        <div className="flex items-center gap-3 bg-bg-surface px-4 py-2 rounded-xl border border-border shadow-xs">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-text-primary">Admin Privileges Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Create User Form - Card */}
        <div className="xl:col-span-1 rounded-2xl bg-bg-surface border border-border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden h-fit relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="px-6 py-5 border-b border-border bg-bg-elevated/40 flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-lg bg-accent/15 text-accent shadow-[0_0_10px_rgba(63,131,248,0.2)]">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Provision New Client</h2>
          </div>
          
          <form onSubmit={handleCreateUser} className="p-6 space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-text-dimmed" placeholder="client@company.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Users className="w-4 h-4" /> Full Name / Company
              </label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-text-dimmed" placeholder="Adam Koubi" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Assign Password
              </label>
              <input type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-text-dimmed" placeholder="SecurePassword123!" />
            </div>
            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-medium text-accent flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> GHL Location ID (Optional)
              </label>
              <input type="text" value={formData.ghlLocationId} onChange={(e) => setFormData({...formData, ghlLocationId: e.target.value})} className="w-full bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-accent/40 font-mono" placeholder="e.g. jfoD7cKt3XJ0FObiU5i3" />
            </div>
            
            <button type="submit" disabled={isCreating} className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-[#5B9AFF] text-white py-3.5 rounded-xl font-medium hover:shadow-[0_0_20px_rgba(63,131,248,0.4)] transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5 cursor-pointer">
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Provision Account
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="xl:col-span-2 rounded-2xl bg-bg-surface border border-border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden h-fit flex flex-col">
          <div className="px-6 py-5 border-b border-border bg-bg-elevated/40 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" /> Active Stratus Clients
            </h2>
            <span className="bg-bg-elevated border border-border text-text-secondary px-3 py-1 rounded-full text-xs font-mono">{users.length} Total</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-text-dimmed uppercase tracking-wider bg-bg-elevated/20">
                  <th className="px-6 py-4 font-semibold">Client Identity</th>
                  <th className="px-6 py-4 font-semibold">System Role</th>
                  <th className="px-6 py-4 font-semibold">GHL Connection</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-elevated/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary group-hover:text-accent transition-colors">{user.name || 'Unnamed Client'}</div>
                      <div className="text-text-dimmed text-xs mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {user.ghlLocationId
                        ? <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 w-fit">
                            <LinkIcon className="w-3 h-3" /> {user.ghlLocationId}
                          </div>
                        : <div className="flex items-center gap-2 text-[#DC2626] dark:text-[#E5534B] bg-red-500/10 px-2 py-1 rounded border border-red-500/20 w-fit">
                            <X className="w-3 h-3" /> Not Linked
                          </div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-lg bg-bg-elevated text-text-secondary hover:bg-accent hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(63,131,248,0.5)] border border-border hover:border-accent cursor-pointer"
                          title="Edit & Link Account"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          className="p-2 rounded-lg bg-bg-elevated text-text-secondary hover:bg-red-500 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(229,83,75,0.5)] border border-border hover:border-red-500 cursor-pointer"
                          title="Revoke Access"
                        >
                          <Trash2 className="w-4 h-4" />
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
      <div className="rounded-2xl bg-bg-surface border border-border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-border bg-bg-elevated/40 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Waitlist Triage
            </h2>
            <p className="text-sm text-text-secondary mt-1">Review incoming leads based on urgency, revenue, and completeness.</p>
          </div>
          <button onClick={() => { setLoading(true); fetchWaitlistLeads().finally(() => setLoading(false)); }} className="flex items-center gap-2 text-sm bg-bg-elevated hover:bg-bg-elevated/80 text-text-primary px-4 py-2 rounded-xl transition-colors border border-border cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Refresh Leads
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs text-text-dimmed uppercase tracking-wider bg-bg-elevated/20">
                <th className="px-6 py-4 font-semibold">Applicant Profile</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Urgency</th>
                <th className="px-6 py-4 font-semibold">Revenue / Volume</th>
                <th className="px-6 py-4 font-semibold">Pain Points</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border">
              {waitlistLeads.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-text-dimmed">No waitlist applications found.</td></tr>
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
                    <tr key={lead.id} className={`hover:bg-bg-elevated/40 transition-colors ${urgency.includes('High') ? 'bg-red-500/[0.04]' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary">{lead.firstName} {lead.lastName}</div>
                        <div className="text-text-secondary text-xs mt-1">{lead.email}</div>
                        <div className="text-text-dimmed text-xs font-mono mt-0.5">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isPartial 
                          ? <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Partial</span> 
                          : <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-accent/10 text-accent border border-accent/20 shadow-[0_0_10px_rgba(63,131,248,0.1)]">Full Lead</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${urgency.includes('High') ? 'text-red-600 dark:text-[#E5534B] bg-red-500/10 border border-red-500/20' : 'text-text-secondary bg-bg-elevated border border-border'}`}>
                          {urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="text-sm font-semibold text-text-primary truncate">{revenueStr !== 'N/A' ? revenueStr : '-'}</div>
                        <div className="text-xs text-text-secondary mt-1 truncate">{volumeStr !== 'N/A' ? volumeStr : '-'}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[300px]">
                        <p className="text-xs line-clamp-2 text-text-secondary leading-relaxed" title={frustrationStr}>
                          {frustrationStr !== 'N/A' ? frustrationStr : '-'}
                        </p>
                      </td>
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
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-[#5B9AFF]"></div>

            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-bg-elevated/40">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-accent" /> Link GHL Account
              </h3>
              <button onClick={() => setEditUser(null)} className="text-text-dimmed hover:text-text-primary transition-colors bg-bg-elevated p-1.5 rounded-lg border border-border cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-5">
              
              {/* GHL Connection Fields */}
              <div className="space-y-4 p-5 rounded-xl bg-accent/5 border border-accent/20 relative overflow-hidden shadow-[inset_0_0_20px_rgba(63,131,248,0.05)]">
                <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-accent/20 blur-[40px] rounded-full pointer-events-none"></div>
                <h4 className="text-sm font-bold text-accent flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> GHL Sub-Account Connection
                </h4>

                {/* AUTO-FETCH BUTTON & RESULTS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-accent/80 font-medium">Location ID</label>
                    <button
                      type="button"
                      onClick={() => handleAutoFetch()}
                      disabled={autoFetchLoading}
                      className="flex items-center gap-1.5 text-xs bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1.5 rounded-lg transition-all border border-accent/30 font-medium cursor-pointer"
                    >
                      {autoFetchLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                      Auto-Find from GHL
                    </button>
                  </div>

                  {/* Auto-fetch results dropdown */}
                  {autoFetchResults.length > 0 && (
                    <div className="space-y-2 p-3 bg-bg-input rounded-xl border border-accent/30 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                          Select GHL Sub-Account
                        </span>
                        <button
                          type="button"
                          onClick={() => setAutoFetchResults([])}
                          className="text-[10px] text-text-dimmed hover:text-text-primary"
                        >
                          Close
                        </button>
                      </div>

                      {/* Quick filter input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={searchFilter}
                          onChange={(e) => {
                            setSearchFilter(e.target.value);
                            handleAutoFetch(e.target.value);
                          }}
                          placeholder="Search GHL sub-accounts by name..."
                          className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none placeholder:text-text-dimmed"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                        {autoFetchResults.map((loc, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (loc.id) {
                                setEditForm(prev => ({ ...prev, ghlLocationId: loc.id }));
                                setAutoFetchResults([]);
                              }
                            }}
                            disabled={!loc.id}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs border ${
                              loc.id
                                ? 'hover:bg-accent/20 hover:border-accent/40 cursor-pointer text-text-primary bg-bg-elevated border-border'
                                : 'text-text-dimmed cursor-not-allowed border-transparent'
                            } ${editForm.ghlLocationId === loc.id ? 'bg-accent/20 border-accent font-semibold' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-text-primary">{loc.name}</span>
                              {loc.id && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono">
                                  {loc.id}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-text-dimmed mt-0.5">
                              {loc.email || 'No email set in GHL'} {loc.phone ? `• ${loc.phone}` : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={editForm.ghlLocationId}
                    onChange={(e) => setEditForm({...editForm, ghlLocationId: e.target.value})}
                    className="w-full bg-bg-input border border-accent/30 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-accent/40 font-mono"
                    placeholder="Auto-filled from above or paste manually"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-accent/80 font-medium">Sub-Account API Token (Private Integration → Select All)</label>
                  <input type="text" value={editForm.ghlApiToken} onChange={(e) => setEditForm({...editForm, ghlApiToken: e.target.value})} className="w-full bg-bg-input border border-accent/30 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-accent/40 font-mono" placeholder="e.g. pit-d4191966-xxxx-xxxx" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">Role</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-all appearance-none cursor-pointer">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-dimmed focus:outline-none cursor-not-allowed" readOnly />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider flex justify-between">
                  New Password <span className="text-text-dimmed normal-case tracking-normal font-normal">(leave blank to keep current)</span>
                </label>
                <input type="text" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-all placeholder:text-text-dimmed" placeholder="••••••••" />
              </div>

              {editSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg animate-fade-in shadow-xs">
                  <CheckCircle2 className="w-4 h-4" /> Link saved and synced successfully!
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-bg-elevated/40 border-t border-border flex gap-3">
              <button onClick={() => setEditUser(null)} className="flex-1 bg-transparent border border-border text-text-primary py-2.5 rounded-xl text-sm font-medium hover:bg-bg-elevated transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleEditSave} disabled={editLoading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-[#5B9AFF] text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-[0_0_20px_rgba(63,131,248,0.4)] disabled:opacity-50 transition-all transform hover:-translate-y-0.5 cursor-pointer">
                {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-bg-surface border border-red-500/20 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center space-y-5 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(229,83,75,0.2)]">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Revoke Access?</h3>
              <p className="text-sm text-text-secondary">This action cannot be undone. The user will be immediately disconnected from the Stratus Portal.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteUserId(null)} className="flex-1 border border-border text-text-primary py-3 rounded-xl text-sm font-medium hover:bg-bg-elevated transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteUserId)} disabled={deleteLoading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-xl text-sm font-medium hover:shadow-[0_0_20px_rgba(229,83,75,0.4)] disabled:opacity-50 transition-all transform hover:-translate-y-0.5 cursor-pointer">
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
