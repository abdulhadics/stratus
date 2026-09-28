'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Loader2, User, Clock, Phone, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchConversations = async () => {
    try {
      setError('');
      const res = await fetch('/api/dashboard/conversations');
      const json = await res.json();
      
      if (json.success) {
        setConversations(json.conversations || []);
      } else {
        setError(json.error || 'Failed to load conversations');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-dimmed">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
        <p>Loading recent conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Conversations</h3>
        <p className="text-text-dimmed max-w-md mx-auto mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-dimmed hover:text-accent transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Overview</span>
        </Link>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 text-xs bg-bg-surface hover:bg-bg-elevated border border-border px-3 py-1.5 rounded-xl text-text-secondary hover:text-text-primary transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-accent' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Messages'}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">Conversations</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/25">
              {conversations.length} Active
            </span>
          </div>
          <p className="text-sm text-text-dimmed mt-1">Live SMS & Email communication threads with your customer leads.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {conversations.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-border rounded-xl text-text-dimmed bg-bg-surface">
            No recent conversations found.
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{conv.contactName || 'Unknown Contact'}</h3>
                    <div className="flex items-center gap-3 text-xs text-text-dimmed mt-0.5">
                      {conv.type === 'Email' ? (
                        <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> Email</span>
                      ) : (
                        <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> SMS</span>
                      )}
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(conv.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {conv.unreadCount} New
                  </span>
                )}
              </div>
              <div className="mt-3 bg-bg-elevated p-3 rounded-lg border border-border">
                <p className="text-sm text-text-primary truncate">{conv.lastMessageBody || 'No message snippet available.'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
