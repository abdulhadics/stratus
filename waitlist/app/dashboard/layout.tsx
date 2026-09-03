'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, Users, LogOut, Settings, Briefcase, ShieldAlert } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdminRoute = pathname.startsWith('/dashboard/admin');

  const navigation = isAdminRoute 
    ? [{ name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldAlert }]
    : [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
        { name: 'Opportunities', href: '/dashboard/opportunities', icon: Briefcase },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];

  if (session?.user?.role === 'ADMIN' && !isAdminRoute) {
    navigation.push({ name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldAlert });
  }

  if (session?.user?.role === 'ADMIN' && isAdminRoute) {
    navigation.push({ name: 'Back to Client Portal', href: '/dashboard', icon: LayoutDashboard });
  }

  return (
    <div className="min-h-screen bg-bg-main flex">
      {/* Sidebar */}
      <div className="w-64 bg-bg-surface border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Image
            src="/logolight-transparent.png"
            alt="STRATUS Logo"
            width={100}
            height={32}
            className="h-8 w-auto"
          />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-accent/10 text-accent font-medium' 
                    : 'text-text-dimmed hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-text-dimmed'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
              {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-text-dimmed truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-bg-surface border-b border-border flex items-center justify-between px-4">
          <Image
            src="/logolight-transparent.png"
            alt="STRATUS Logo"
            width={100}
            height={32}
            className="h-8 w-auto"
          />
          <button className="p-2 text-text-dimmed hover:text-text-primary">
            {/* Mobile menu icon could go here */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
