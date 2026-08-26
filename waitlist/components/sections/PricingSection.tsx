'use client';

import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { PricingCard } from '@/components/ui/PricingCard';
import { useTranslation } from '@/lib/i18n';

interface PricingSectionProps {
  onSelectOffer: (offer: string) => void;
}

export function PricingSection({ onSelectOffer }: PricingSectionProps) {
  const { t } = useTranslation();

  const handleCta = (offer: string) => {
    onSelectOffer(offer);
    document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="packages" className="py-[var(--section-padding)] bg-bg-secondary">
      <Container>
        <div className="text-center mb-16">
          <SectionEyebrow className="justify-center">{t('pricing.eyebrow')}</SectionEyebrow>
          <h2 className="text-display mx-auto">
            <span className="italic">{t('pricing.heading.1')}</span><br />
            {t('pricing.heading.2')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* PRESENCE */}
          <PricingCard
            label={t('pricing.presence.label')}
            name={t('pricing.presence.name')}
            setupOriginal="$1,595"
            setupPrice="$995"
            setupLabel={t('pricing.setup')}
            monthlyOriginal="$495"
            monthlyPrice="$295"
            monthlyLabel={t('pricing.monthly')}
            monthlyNote={t('pricing.ongoing')}
            features={[
              t('pricing.presence.f0'),
              t('pricing.presence.f1'),
              t('pricing.presence.f2'),
              t('pricing.presence.f3'),
              t('pricing.presence.f4'),
              t('pricing.presence.f5'),
              t('pricing.presence.f6'),
              t('pricing.presence.f7'),
            ]}
            disclaimer={t('pricing.presence.disclaimer')}
            ctaText={t('pricing.cta')}
            onCta={() => handleCta('presence')}
          />

          {/* MACHINE (featured) */}
          <PricingCard
            label={t('pricing.machine.label')}
            name={t('pricing.machine.name')}
            subtitle={t('pricing.machine.subtitle')}
            badge={t('pricing.machine.badge')}
            badgeVariant="blue"
            setupOriginal="$3,995"
            setupPrice="$1,695"
            setupLabel={t('pricing.setup')}
            monthlyOriginal="$995"
            monthlyPrice="$695"
            monthlyLabel={t('pricing.monthly')}
            monthlyNote={t('pricing.machine.note')}
            spotsRemaining={t('pricing.machine.spots')}
            features={[
              t('pricing.machine.f1'),
              t('pricing.machine.f2'),
              t('pricing.machine.f3'),
            ]}
            disclaimer={t('pricing.machine.disclaimer')}
            ctaText={t('pricing.cta')}
            onCta={() => handleCta('machine')}
            featured
          />

          {/* COMMAND */}
          <PricingCard
            label={t('pricing.command.label')}
            name={t('pricing.command.name')}
            subtitle={t('pricing.command.subtitle')}
            badge={t('pricing.command.badge')}
            badgeVariant="muted"
            setupPrice={t('pricing.command.custom')}
            setupLabel={t('pricing.setup')}
            monthlyPrice={t('pricing.command.byApp')}
            monthlyLabel={t('pricing.monthly')}
            monthlyNote={t('pricing.command.included')}
            features={[
              t('pricing.command.f1'),
              t('pricing.command.f2'),
              t('pricing.command.f3'),
              t('pricing.command.f4'),
              t('pricing.command.f5'),
            ]}
            disclaimer={t('pricing.command.disclaimer')}
            ctaText={t('pricing.cta')}
            onCta={() => handleCta('founding')}
          />
        </div>
      </Container>
    </section>
  );
}
