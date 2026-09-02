'use client';

import { Briefcase } from 'lucide-react';

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Opportunities</h1>
        <p className="text-sm text-text-dimmed">Track your deals and pipeline stages from GHL.</p>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface shadow-sm overflow-hidden p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
          <Briefcase className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Pipeline Integration Coming Soon</h3>
        <p className="text-text-dimmed max-w-md mx-auto">
          We are building the UI to display your GoHighLevel opportunities in a Kanban board. Stay tuned!
        </p>
      </div>
    </div>
  );
}
