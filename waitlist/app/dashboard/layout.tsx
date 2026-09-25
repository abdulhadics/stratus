'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, Users, LogOut, Settings, Briefcase, ShieldAlert, Menu, X, MessageSquare, Calendar } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { StratusLogo, StratusWordmark } from '@/components/ui/StratusLogo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAdminRoute = pathname.startsWith('/dashboard/admin');

  const navigation = isAdminRoute 
    ? [{ name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldAlert }]
    : [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
        { name: 'Opportunities', href: '/dashboard/opportunities', icon: Briefcase },
        { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
        { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];

  if (session?.user?.role === 'ADMIN' && !isAdminRoute) {
    navigation.push({ name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldAlert });
  }

  if (session?.user?.role === 'ADMIN' && isAdminRoute) {
    navigation.push({ name: 'Back to Client Portal', href: '/dashboard', icon: LayoutDashboard });
  }

  const NavLinks = () => (
    <>
      {navigation.map((item, i) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-fade-in-up ${
              isActive 
                ? 'bg-gradient-to-r from-accent/20 to-accent/5 text-accent font-medium border border-accent/20 shadow-[0_0_15px_rgba(63,131,248,0.15)]' 
                : 'text-text-dimmed hover:bg-bg-surface hover:text-text-primary hover:border-border border border-transparent'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-accent' : 'text-text-dimmed group-hover:text-text-primary'}`} />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  const UserFooter = () => (
    <div className="p-4 mt-auto border-t border-border bg-bg-surface/50 backdrop-blur-md space-y-3">
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(63,131,248,0.4)]">
          {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-semibold text-text-primary truncate">{session?.user?.name || 'User'}</p>
          <p className="text-xs text-text-dimmed truncate">{session?.user?.email}</p>
        </div>
      </div>

      {/* Quick Appearance Toggle */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-bg-elevated border border-border">
        <span className="text-xs font-medium text-text-secondary">Theme</span>
        <ThemeToggle variant="pill" />
      </div>

      <button
        onClick={() => {
          import('next-auth/react').then(({ signOut }) => signOut({ callbackUrl: '/' }));
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-dimmed hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group cursor-pointer"
      >
        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-medium">Log out</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex relative selection:bg-accent/30 selection:text-white font-sans overflow-hidden transition-colors duration-200">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-accent/10 dark:bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/5 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <div className="w-72 bg-bg-secondary/95 backdrop-blur-xl border-r border-border hidden md:flex flex-col relative z-20 shadow-xl dark:shadow-2xl transition-colors duration-200">
        <div className="h-22 flex items-center justify-between px-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3.5 group py-2">
            <StratusLogo size={46} className="transition-transform duration-300 group-hover:scale-105" />
            <StratusWordmark fontSize="text-[22px]" />
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLinks />
        </nav>
        <UserFooter />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative flex flex-col w-72 max-w-sm h-full bg-bg-secondary border-r border-border shadow-2xl z-50 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
            <div className="h-22 flex items-center justify-between px-5 border-b border-border">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                <StratusLogo size={44} />
                <StratusWordmark fontSize="text-[22px]" />
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-text-dimmed hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <NavLinks />
            </nav>
            <UserFooter />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header */}
        <div className="md:hidden h-18 bg-bg-secondary/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
          <Link href="/dashboard" className="flex items-center gap-3">
            <StratusLogo size={38} />
            <StratusWordmark fontSize="text-[20px]" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-text-dimmed hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
