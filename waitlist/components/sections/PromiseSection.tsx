'use client';

import { Container } from '@/components/layout/Container';
import { useTranslation } from '@/lib/i18n';

export function PromiseSection() {
  const { t } = useTranslation();

  return (
    <section id="the-promise" className="py-[var(--section-padding)]">
      <Container className="text-center">
        <h2 className="text-display max-w-[680px] mx-auto mb-6">
          {t('promise.heading.1')}<br />
          {t('promise.heading.2')}
        </h2>
        <p className="text-mono text-[11px] text-accent tracking-[0.12em]">
          {t('promise.subline')}
        </p>
      </Container>
    </section>
  );
}
