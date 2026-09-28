'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Loader2, DollarSign, User, Calendar, Phone, ArrowLeft, RefreshCw } from 'lucide-react';

export default function OpportunitiesPage() {
  const [data, setData] = useState<{ pipelineName: string, stages: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOpportunities = async () => {
    try {
      setError('');
      const res = await fetch('/api/dashboard/opportunities');
      const json = await res.json();
      
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load opportunities');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOpportunities();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-dimmed">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
        <p>Syncing pipeline with GoHighLevel...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <Briefcase className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Pipeline</h3>
        <p className="text-text-dimmed max-w-md mx-auto mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90">
          Try Again
        </button>
      </div>
    );
  }

  const totalOpportunities = data.stages.reduce((acc, s) => acc + (s.opportunities?.length || 0), 0);
  const totalValue = data.stages.reduce((acc, s) => {
    return acc + (s.opportunities || []).reduce((subAcc: number, opp: any) => subAcc + (opp.value || 0), 0);
  }, 0);

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col animate-fade-in">
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
          <span>{refreshing ? 'Syncing...' : 'Sync Pipeline'}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">Opportunities</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/25">
              {totalOpportunities} Active Leads
            </span>
          </div>
          <p className="text-sm text-text-dimmed mt-1">Pipeline: <span className="font-semibold text-text-primary">{data.pipelineName || 'Main Pipeline'}</span></p>
        </div>

        {totalValue > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-sm w-fit">
            <DollarSign className="w-4 h-4" />
            <span>Total Value: ${totalValue.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex h-full gap-4 min-w-max">
          {data.stages.map((stage) => (
            <div key={stage.id} className="w-80 flex flex-col bg-bg-surface border border-border rounded-xl shadow-sm flex-shrink-0">
              {/* Stage Header */}
              <div className="px-4 py-3 border-b border-border bg-bg-elevated flex items-center justify-between rounded-t-xl">
                <h3 className="font-semibold text-sm text-text-primary truncate pr-2">{stage.name}</h3>
                <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full">
                  {stage.opportunities.length}
                </span>
              </div>

              {/* Opportunity Cards */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                {stage.opportunities.length === 0 ? (
                  <div className="text-center p-4 border border-dashed border-border rounded-lg text-xs text-text-dimmed">
                    No leads here yet
                  </div>
                ) : (
                  stage.opportunities.map((opp: any) => (
                    <div key={opp.id} className="bg-bg-elevated border border-border rounded-lg p-4 hover:border-accent/50 transition-colors cursor-default shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-medium text-text-primary text-sm truncate pr-2">{opp.name}</div>
                        {opp.value > 0 && (
                          <div className="flex items-center text-emerald-500 font-semibold text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            {opp.value}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {opp.email && (
                          <div className="flex items-center text-xs text-text-dimmed">
                            <User className="w-3.5 h-3.5 mr-2 opacity-70" />
                            <span className="truncate">{opp.email}</span>
                          </div>
                        )}
                        {opp.phone && (
                          <div className="flex items-center text-xs text-text-dimmed">
                            <Phone className="w-3.5 h-3.5 mr-2 opacity-70" />
                            <span>{opp.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center text-xs text-text-dimmed">
                          <Calendar className="w-3.5 h-3.5 mr-2 opacity-70" />
                          <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
