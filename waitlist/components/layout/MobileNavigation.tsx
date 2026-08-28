'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { StratusLogo, StratusWordmark } from '@/components/ui/StratusLogo';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{ key: 'nav.promise' | 'nav.life' | 'nav.howItWorks' | 'nav.packages' | 'nav.faq'; href: string }>;
  onNavigate: (href: string) => void;
}

export function MobileNavigation({ isOpen, onClose, navItems, onNavigate }: MobileNavigationProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and handle Escape
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('nav-open');
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.classList.remove('nav-open');
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Trap focus
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, a, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 lg:hidden ${
        isOpen ? 'visible' : 'invisible pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-bg-primary/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute inset-0 bg-bg-primary flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8" style={{ height: 'var(--header-height)' }}>
          <div className="flex items-center gap-3">
            <StratusLogo size={44} />
            <StratusWordmark fontSize="text-[20px]" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col items-start justify-center px-8 gap-6" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.href)}
              className="text-mono text-[13px] text-text-secondary hover:text-text-primary transition-colors"
            >
              {t(item.key)}
            </button>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="px-8 pb-10 space-y-6">
          <div className="flex items-center justify-between">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => onNavigate('#waitlist')}
          >
            {t('nav.joinWaitlist')} →
          </Button>
        </div>
      </div>
    </div>
  );
}
