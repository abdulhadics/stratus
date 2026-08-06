'use client';

import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { useTranslation } from '@/lib/i18n';

export function LifeSection() {
  const { t } = useTranslation();

  return (
    <section id="the-life" className="py-[var(--section-padding)]">
      <Container>
        <SectionEyebrow>{t('life.eyebrow')}</SectionEyebrow>

        <h2 className="text-display mb-16 max-w-[560px]">
          {t('life.heading.1')}<br />
          {t('life.heading.2')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Editorial copy */}
          <div className="space-y-6">
            <p className="text-body">
              {t('life.body.1')}
            </p>
            <p className="text-body">
              {t('life.body.2')}
            </p>
            <div className="space-y-1">
              <p className="text-body">{t('life.body.3')}</p>
              <p className="text-body">{t('life.body.4')}</p>
              <p className="text-body">{t('life.body.5')}</p>
            </div>
            <p className="text-[16px] font-semibold text-text-primary mt-8">
              {t('life.bold')}
            </p>
            <div className="space-y-1 mt-6">
              <p className="text-body italic">{t('life.notTool')}</p>
              <p className="text-body italic">{t('life.notChatbot')}</p>
              <p className="text-body italic">{t('life.notAssistant')}</p>
            </div>
            <p className="text-body mt-6">
              {t('life.conclusion')}
            </p>
          </div>

          {/* Right: Currently Serving card */}
          <div className="flex flex-col justify-start">
            <div className="border border-border rounded-lg p-8 bg-bg-elevated/50">
              <p className="text-eyebrow mb-4">{t('serving.label')}</p>
              <h3 className="text-[20px] font-semibold text-text-primary mb-2">
                {t('serving.industry')}
              </h3>
              <p className="text-mono text-[10px] text-text-secondary mb-6">
                {t('serving.examples')}
              </p>

              {/* Blurred future industries */}
              <div className="space-y-3 select-none">
                {['Mortgage Brokers', 'Insurance Professionals', 'Legal Professionals', 'Health Professionals', 'Consultants and Coaches'].map((item, i) => (
                  <div
                    key={i}
                    className="text-[14px] text-text-dimmed"
                    style={{ filter: `blur(${3 + i * 1.5}px)`, opacity: Math.max(0.15, 0.5 - i * 0.1) }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Tagline */}
            <div className="mt-8 text-right">
              <p className="text-[13px] text-text-dimmed italic leading-relaxed">
                {t('serving.tagline.1')}<br />
                {t('serving.tagline.2')}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
