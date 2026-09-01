import { Users, Briefcase, TrendingUp } from 'lucide-react';

export default function DashboardOverview() {
  const stats = [
    { label: 'Total Contacts', value: '1,248', icon: Users, change: '+12%', positive: true },
    { label: 'Active Opportunities', value: '45', icon: Briefcase, change: '+5%', positive: true },
    { label: 'Conversion Rate', value: '24.8%', icon: TrendingUp, change: '-2%', positive: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Overview</h1>
        <p className="text-text-dimmed">Welcome back, U1. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-bg-surface border border-border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-accent" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.positive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-text-primary mb-1">{stat.value}</h3>
            <p className="text-sm text-text-dimmed">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-2xl bg-bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
        </div>
        <div className="p-12 text-center text-text-dimmed flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-bg-elevated flex items-center justify-center">
             <TrendingUp className="w-8 h-8 opacity-50" />
          </div>
          <p>Your recent pipeline activity will appear here.</p>
        </div>
      </div>
    </div>
  );
}
