'use client';

import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { MetricCard } from '@/components/ui/MetricCard';
import { useTranslation } from '@/lib/i18n';

export function ResultsSection() {
  const { t } = useTranslation();

  const metrics = [
    { value: 'results.m1.value', title: 'results.m1.title', desc: 'results.m1.desc' },
    { value: 'results.m2.value', title: 'results.m2.title', desc: 'results.m2.desc' },
    { value: 'results.m3.value', title: 'results.m3.title', desc: 'results.m3.desc' },
    { value: 'results.m4.value', title: 'results.m4.title', desc: 'results.m4.desc' },
  ] as const;

  return (
    <section id="why-it-works" className="py-[var(--section-padding)]">
      <Container>
        <div className="text-center mb-16">
          <SectionEyebrow className="justify-center">{t('results.eyebrow')}</SectionEyebrow>
          <h2 className="text-display mx-auto max-w-[500px]">
            <span className="italic">{t('results.heading.1')}</span><br />
            {t('results.heading.2')}
          </h2>
          <p className="text-body max-w-[560px] mx-auto mt-6">
            {t('results.body')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {metrics.map((m) => (
            <MetricCard
              key={m.value}
              value={t(m.value as any)}
              title={t(m.title as any)}
              description={t(m.desc as any)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
