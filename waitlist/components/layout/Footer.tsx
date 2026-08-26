'use client';

import { Container } from './Container';
import { StratusLogo, StratusWordmark } from '@/components/ui/StratusLogo';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/lib/i18n';

const NAV_LINKS = [
  { key: 'footer.nav.promise' as const, href: '#the-promise' },
  { key: 'footer.nav.life' as const, href: '#the-life' },
  { key: 'footer.nav.works' as const, href: '#why-it-works' },
  { key: 'footer.nav.packages' as const, href: '#packages' },
  { key: 'footer.nav.faq' as const, href: '#faq' },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/60 bg-bg-primary">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start">
          {/* Left Column: Logo + tagline */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <StratusLogo size={22} />
              <StratusWordmark />
            </div>
            <p className="text-[13px] text-text-dimmed leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Middle Column: Centered Nav */}
          <div className="flex flex-col items-center justify-center text-center">
            <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                >
                  {t(link.key)}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Column: Contact & Location */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right space-y-2">
            <p className="text-[13px] text-text-secondary">{t('footer.location')}</p>
            <a
              href="mailto:hello@stratussystems.co"
              className="text-[13px] text-text-secondary hover:text-accent transition-colors block"
            >
              {t('footer.email')}
            </a>
            <a
              href="https://stratussystems.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-text-secondary hover:text-accent transition-colors block"
            >
              {t('footer.site')}
            </a>
            {/* LinkedIn icon link */}
            <a
              href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-dimmed hover:text-accent transition-colors pt-1 inline-block"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Horizontal Line & Bottom Row */}
        <div className="border-t border-border/40 mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-text-dimmed">
            {t('footer.copyright')}
          </p>
          <LanguageToggle />
        </div>
      </Container>
    </footer>
  );
}
