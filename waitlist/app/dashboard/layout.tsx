'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Settings, 
  Briefcase, 
  ShieldAlert, 
  Menu, 
  X, 
  MessageSquare, 
  Calendar,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
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
  const isAdmin = session?.user?.role === 'ADMIN';

  const baseNavigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
    { name: 'Opportunities', href: '/dashboard/opportunities', icon: Briefcase },
    { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const adminNav = [
    { name: 'Admin Command Center', href: '/dashboard/admin', icon: ShieldAlert },
    { name: 'Back to Client Portal', href: '/dashboard', icon: ArrowLeft },
  ];

  const navigation = isAdminRoute
    ? adminNav
    : [
        ...baseNavigation,
        ...(isAdmin ? [{ name: 'Admin Command Center', href: '/dashboard/admin', icon: ShieldAlert }] : []),
      ];

  // Mobile Bottom Dock Navigation items
  const bottomDockItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
    { name: 'Deals', href: '/dashboard/opportunities', icon: Briefcase },
    { name: 'Chat', href: '/dashboard/conversations', icon: MessageSquare },
    ...(isAdmin
      ? [{ name: 'Admin', href: '/dashboard/admin', icon: ShieldAlert }]
      : [{ name: 'More', href: '#more', icon: MoreHorizontal, onClick: () => setMobileMenuOpen(true) }]),
  ];

  const NavLinks = () => (
    <>
      {navigation.map((item, i) => {
        const isActive = pathname === item.href;
        const isBack = item.href === '/dashboard' && isAdminRoute;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isBack
                ? 'bg-accent/15 text-accent font-semibold border border-accent/30 hover:bg-accent/25'
                : isActive 
                  ? 'bg-gradient-to-r from-accent/20 to-accent/5 text-accent font-semibold border border-accent/20 shadow-[0_0_15px_rgba(63,131,248,0.15)]' 
                  : 'text-text-dimmed hover:bg-bg-surface hover:text-text-primary hover:border-border border border-transparent'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
              isBack ? 'text-accent' : isActive ? 'text-accent' : 'text-text-dimmed group-hover:text-text-primary'
            }`} />
            <span className="flex-1">{item.name}</span>
            {isActive && !isBack && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            )}
          </Link>
        );
      })}
    </>
  );

  const UserFooter = () => (
    <div className="p-4 mt-auto border-t border-border bg-bg-surface/50 backdrop-blur-md space-y-3">
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(63,131,248,0.4)] shrink-0">
          {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-semibold text-text-primary truncate">{session?.user?.name || 'User'}</p>
          <p className="text-xs text-text-dimmed truncate">{session?.user?.email}</p>
        </div>
        {isAdmin && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Admin
          </span>
        )}
      </div>

      {/* Quick Appearance Toggle */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-bg-elevated border border-border">
        <span className="text-xs font-medium text-text-secondary">Theme</span>
        <ThemeToggle variant="pill" />
      </div>

      {/* Primary Log Out Button */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 font-semibold text-xs cursor-pointer group shadow-xs"
      >
        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Log Out of Portal</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex relative selection:bg-accent/30 selection:text-white font-sans overflow-hidden transition-colors duration-200">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-accent/10 dark:bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/5 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <div className="w-72 bg-bg-secondary/95 backdrop-blur-xl border-r border-border hidden md:flex flex-col relative z-20 shadow-xl dark:shadow-2xl transition-colors duration-200 shrink-0">
        <div className="h-20 min-h-[80px] flex items-center justify-between px-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3.5 group py-2">
            <StratusLogo size={46} className="transition-transform duration-300 group-hover:scale-105" />
            <StratusWordmark fontSize="text-[22px]" />
          </Link>
          <ThemeToggle />
        </div>

        {/* Admin context bar if in Admin Panel */}
        {isAdminRoute && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" /> Admin Mode
            </span>
            <Link href="/dashboard" className="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Exit
            </Link>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLinks />
        </nav>
        <UserFooter />
      </div>

      {/* Mobile Sidebar Overlay / Full Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative flex flex-col w-80 max-w-[85vw] h-full bg-bg-secondary border-r border-border shadow-2xl z-50 animate-fade-in-up" style={{ animationDuration: '0.25s' }}>
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                <StratusLogo size={40} />
                <StratusWordmark fontSize="text-[20px]" />
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 text-text-dimmed hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isAdminRoute && (
              <div className="px-4 py-3 bg-accent/15 border-b border-accent/20">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-bold text-accent"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Client Portal
                </Link>
              </div>
            )}

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <NavLinks />
            </nav>
            <UserFooter />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Mobile Header (Fixed & Sturdy, h-16) */}
        <header className="md:hidden h-16 shrink-0 bg-bg-secondary/95 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <StratusLogo size={36} />
              <StratusWordmark fontSize="text-[19px]" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {/* If in admin on phone, show explicit back button */}
            {isAdminRoute && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1 bg-accent/15 hover:bg-accent/25 text-accent text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-accent/30 transition-all mr-1"
                title="Return to Client Portal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal</span>
              </Link>
            )}

            {/* Quick Theme Toggle */}
            <ThemeToggle />

            {/* Quick 1-tap Logout icon on phone */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Log Out"
              aria-label="Log out"
              className="p-2 text-text-dimmed hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Hamburger trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-text-dimmed hover:text-text-primary rounded-xl hover:bg-bg-surface transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content Area with safe bottom padding on mobile for the dock */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 lg:p-12 pb-24 md:pb-12">
          {children}
        </main>

        {/* Mobile Persistent Bottom Dock (HCI - 1-Thumb Reachability) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-secondary/95 backdrop-blur-xl border-t border-border px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
          {bottomDockItems.map((item) => {
            const isActive = item.href !== '#more' && pathname === item.href;
            
            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-text-dimmed hover:text-text-primary transition-colors cursor-pointer"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium mt-1">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-accent font-semibold scale-105'
                    : 'text-text-dimmed hover:text-text-primary'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-accent/15' : ''}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
