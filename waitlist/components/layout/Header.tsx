'use client';

import { useState, useEffect } from 'react';
import { Container } from './Container';
import { MobileNavigation } from './MobileNavigation';
import { StratusLogo, StratusWordmark } from '@/components/ui/StratusLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';
import { Menu } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'nav.promise' as const, href: '#the-promise' },
  { key: 'nav.life' as const, href: '#the-life' },
  { key: 'nav.howItWorks' as const, href: '#why-it-works' },
  { key: 'nav.packages' as const, href: '#packages' },
  { key: 'nav.faq' as const, href: '#faq' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-primary/90 backdrop-blur-md border-b border-border'
            : 'bg-transparent'
        }`}
        style={{ height: 'var(--header-height)' }}
      >
        <Container className="h-full flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity py-1"
          >
            <StratusLogo size={52} />
            <StratusWordmark fontSize="text-[22px]" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.href)}
                className="text-mono text-[10px] text-text-secondary hover:text-text-primary transition-colors"
              >
                {t(item.key)}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-accent text-accent hover:bg-accent/10"
              onClick={() => { window.location.href = '/login'; }}
            >
              Client Portal
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => handleNavClick('#waitlist')}
            >
              {t('nav.joinWaitlist')}
            </Button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden flex items-center justify-center w-8 h-8 text-text-secondary hover:text-text-primary"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </Container>
      </header>

      <MobileNavigation
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={NAV_ITEMS}
        onNavigate={handleNavClick}
      />

      {/* Spacer for fixed header */}
      <div style={{ height: 'var(--header-height)' }} />
    </>
  );
}
