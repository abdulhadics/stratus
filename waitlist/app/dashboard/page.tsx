import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  Users, 
  Briefcase, 
  ShieldAlert, 
  Sparkles, 
  DollarSign, 
  ArrowRight, 
  MessageSquare, 
  Calendar,
  Layers
} from 'lucide-react';
import { AvatarChatWidget } from '@/components/ui/AvatarChatWidget';
import Link from 'next/link';

async function getDashboardStats(session: any) {
  try {
    const GHL_API_TOKEN = session?.user?.ghlApiToken || process.env.GHL_DASHBOARD_API_TOKEN;
    const GHL_LOCATION_ID = session?.user?.ghlLocationId;

    if (!GHL_API_TOKEN || !GHL_LOCATION_ID) {
      return { totalContacts: 0, totalOpps: 0, pipelineValue: 0 };
    }

    const headers = {
      'Authorization': `Bearer ${GHL_API_TOKEN}`,
      'Version': '2021-07-28',
      'Accept': 'application/json'
    };

    const cRes = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=1`, { headers, next: { revalidate: 60 } });
    const cData = await cRes.json();
    const totalContacts = cData.meta?.total || 0;

    const oRes = await fetch(`https://services.leadconnectorhq.com/opportunities/search?location_id=${GHL_LOCATION_ID}`, { headers, next: { revalidate: 60 } });
    const oData = await oRes.json();
    const totalOpps = oData.meta?.total || 0;
    const pipelineValue = (oData.opportunities || []).reduce((sum: number, opp: any) => sum + (opp.monetaryValue || 0), 0);

    return { totalContacts, totalOpps, pipelineValue };
  } catch (err) {
    console.error('Failed to fetch dashboard stats', err);
    return null;
  }
}

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardStats(session);
  
  const stats = [
    { 
      label: 'Total Contacts', 
      value: data?.totalContacts || 0, 
      icon: Users, 
      change: 'Live Sync', 
      color: 'from-blue-500 to-accent',
      href: '/dashboard/contacts',
      cta: 'View all contacts'
    },
    { 
      label: 'Active Opportunities', 
      value: data?.totalOpps || 0, 
      icon: Briefcase, 
      change: 'Live Sync', 
      color: 'from-accent to-purple-500',
      href: '/dashboard/opportunities',
      cta: 'View active pipeline'
    },
    { 
      label: 'Pipeline Value', 
      value: `$${(data?.pipelineValue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      change: 'Live Sync', 
      color: 'from-emerald-400 to-emerald-600',
      href: '/dashboard/opportunities',
      cta: 'View revenue stages'
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative z-10 animate-fade-in">
      {/* Header section with gradient text */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-blue-600 to-accent dark:from-white dark:via-blue-100 dark:to-accent mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Entrepreneur'}.
          </h1>
          <p className="text-text-secondary text-base md:text-lg">Here is what is happening with your operations today.</p>
        </div>
        
        {session?.user?.role === 'ADMIN' && (
          <Link 
            href="/dashboard/admin" 
            className="group inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0 w-fit cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Go to Admin Panel</span>
          </Link>
        )}
      </div>

      {/* Quick Navigation Chips (Instant 1-Click Access for Both PC & Mobile) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-text-dimmed uppercase tracking-wider flex items-center gap-1.5 shrink-0 pr-1">
          <Layers className="w-3.5 h-3.5 text-accent" /> Quick Jump:
        </span>
        <Link 
          href="/dashboard/contacts" 
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-elevated border border-border hover:border-accent/40 text-text-primary text-xs font-semibold transition-all shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>Contacts ({data?.totalContacts || 0})</span>
        </Link>
        <Link 
          href="/dashboard/opportunities" 
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-elevated border border-border hover:border-accent/40 text-text-primary text-xs font-semibold transition-all shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
        >
          <Briefcase className="w-3.5 h-3.5 text-accent" />
          <span>Opportunities ({data?.totalOpps || 0})</span>
        </Link>
        <Link 
          href="/dashboard/conversations" 
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-elevated border border-border hover:border-accent/40 text-text-primary text-xs font-semibold transition-all shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
          <span>Conversations</span>
        </Link>
        <Link 
          href="/dashboard/appointments" 
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-elevated border border-border hover:border-accent/40 text-text-primary text-xs font-semibold transition-all shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span>Appointments</span>
        </Link>
      </div>

      {/* Interactive Stats Grid (Clickable Cards with direct navigation to Contacts & Opps) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="group relative block p-6 rounded-2xl bg-bg-surface/90 hover:bg-bg-surface backdrop-blur-xl border border-border hover:border-accent/50 shadow-sm hover:shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          >
            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-[0_0_15px_rgba(63,131,248,0.3)] transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                {stat.change}
              </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-4xl font-bold text-text-primary mb-1 tracking-tight group-hover:text-accent transition-colors">{stat.value}</h3>
              <p className="text-xs font-semibold text-text-dimmed uppercase tracking-wider mb-4">{stat.label}</p>
              
              {/* Interactive CTA Link Indicator */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-accent group-hover:text-blue-500 transition-colors">
                <span>{stat.cta}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Avatar Chat Widget Container */}
      <div className="mt-8 rounded-2xl bg-bg-surface/90 backdrop-blur-xl border border-border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden h-[600px] flex flex-col relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        
        <div className="px-6 py-5 border-b border-border bg-bg-elevated/40 flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> AI Operations Assistant
            </h2>
            <p className="text-sm text-text-secondary mt-1">Ask questions about your data or calculate job costs instantly.</p>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-bg-primary/40 relative z-10">
          <AvatarChatWidget />
        </div>
      </div>
    </div>
  );
}
