'use client';

import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { useTranslation } from '@/lib/i18n';

export function DataOwnershipSection() {
  const { t } = useTranslation();

  return (
    <section className="py-[var(--section-padding)] bg-bg-secondary">
      <Container className="text-center max-w-[720px]">
        <SectionEyebrow className="justify-center">{t('data.eyebrow')}</SectionEyebrow>

        <h2 className="text-heading mb-8">
          {t('data.heading.1')}<br />
          {t('data.heading.2')}
        </h2>

        <p className="text-body mx-auto max-w-[600px] mb-12">
          {t('data.body')}
        </p>

        <p className="text-mono text-[9px] text-text-dimmed tracking-[0.1em] max-w-[600px] mx-auto leading-relaxed">
          {t('data.subline')}
        </p>
      </Container>
    </section>
  );
}
