'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-sm text-text-dimmed">Manage your account preferences and integrations.</p>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface shadow-sm overflow-hidden p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
          <Settings className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Settings Panel Construction</h3>
        <p className="text-text-dimmed max-w-md mx-auto">
          The settings panel is currently under construction. Here you will be able to manage your GHL Location ID and API tokens.
        </p>
      </div>
    </div>
  );
}
