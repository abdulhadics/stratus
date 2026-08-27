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
              href="mailto:admin@stratusystems.co"
              className="text-[13px] text-text-secondary hover:text-accent transition-colors block"
            >
              {t('footer.email')}
            </a>
            <a
              href="https://stratusystems.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-text-secondary hover:text-accent transition-colors block"
            >
              {t('footer.site')}
            </a>
            {/* Social Links: LinkedIn, Instagram, Facebook */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/company/stratus-system/about/"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-dimmed hover:text-accent transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z"/>
                </svg>
              </a>
              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/stratus__worldelite/"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-dimmed hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/profile.php?id=61572432297088"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-dimmed hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
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
