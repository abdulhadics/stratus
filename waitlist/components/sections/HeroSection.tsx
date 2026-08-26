'use client';

import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';

export function HeroSection() {
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24" id="hero">
      <Container>
        <div className="max-w-[720px]">
          {/* Eyebrow */}
          <SectionEyebrow className="animate-fade-in-up opacity-0">
            {t('hero.eyebrow')}
          </SectionEyebrow>

          {/* Main Headline */}
          <h1 className="text-display-lg mb-8 animate-fade-in-up opacity-0 animate-delay-100">
            {t('hero.headline.1')}<br />
            {t('hero.headline.2')}<br />
            {t('hero.headline.3')}
          </h1>

          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 mb-6 animate-fade-in-up opacity-0 animate-delay-200">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span className="text-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 tracking-[0.18em]">
              {t('hero.badge')}
            </span>
          </div>

          {/* Badge supporting text */}
          <p className="text-[15px] text-text-primary font-medium leading-relaxed mb-8 max-w-[520px] animate-fade-in-up opacity-0 animate-delay-200">
            {t('hero.badgeText')}
          </p>

          {/* Body copy */}
          <div className="space-y-4 mb-10 animate-fade-in-up opacity-0 animate-delay-300">
            <p className="text-body max-w-[480px]">
              {t('hero.body.1')}
            </p>
            <p className="text-[15px] text-text-primary font-medium">
              {t('hero.body.2')}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up opacity-0 animate-delay-400">
            <Button variant="primary" size="lg" onClick={() => scrollTo('#waitlist')}>
              {t('hero.cta.primary')} →
            </Button>
            <Button variant="secondary" size="lg" onClick={() => scrollTo('#packages')}>
              {t('hero.cta.secondary')}
            </Button>
          </div>
        </div>
      </Container>

      {/* Metric Strip */}
      <Container className="mt-16 sm:mt-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border rounded-lg overflow-hidden border border-border">
          {[
            { value: 'metric.response.value', label: 'metric.response.label' },
            { value: 'metric.video.value', label: 'metric.video.label' },
            { value: 'metric.launch.value', label: 'metric.launch.label' },
            { value: 'metric.systems.value', label: 'metric.systems.label' },
            { value: 'metric.bilingual.value', label: 'metric.bilingual.label' },
          ].map((m) => (
            <div key={m.value} className="bg-bg-primary p-4 sm:p-5">
              <p className="text-[18px] sm:text-[22px] font-serif text-text-primary mb-1">
                {t(m.value as any)}
              </p>
              <p className="text-mono text-[9px] text-text-secondary leading-tight">
                {t(m.label as any)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
