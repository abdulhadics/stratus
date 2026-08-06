'use client';

import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { Accordion } from '@/components/ui/Accordion';
import { useTranslation } from '@/lib/i18n';

export function FAQSection() {
  const { t } = useTranslation();

  const items = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    { question: t('faq.q6'), answer: t('faq.a6') },
    { question: t('faq.q7'), answer: t('faq.a7') },
  ];

  return (
    <section id="faq" className="py-[var(--section-padding)]">
      <Container className="max-w-[720px]">
        <SectionEyebrow>{t('faq.eyebrow')}</SectionEyebrow>

        <h2 className="text-display mb-12">
          {t('faq.heading.1')}<br />
          {t('faq.heading.2')}
        </h2>

        <Accordion items={items} defaultOpen={0} />
      </Container>
    </section>
  );
}
