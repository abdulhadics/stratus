'use client';

import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';
import { PublicTextChatWidget } from '@/components/ui/PublicTextChatWidget';

export function DemoSection() {
  const { t } = useTranslation();
  const teamImageUrl = process.env.NEXT_PUBLIC_TEAM_IMAGE_URL || '/team.jpeg';

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-[var(--section-padding)] bg-bg-secondary" id="meet-the-system">
      <Container>
        <SectionEyebrow>{t('demo.eyebrow')}</SectionEyebrow>

        <h2 className="text-heading mb-4 max-w-[560px]">
          {t('demo.heading')}
        </h2>

        <p className="text-body max-w-[520px] mb-12">
          {t('demo.body')}
        </p>

        {/* Two-column demo area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* Left: AI Avatar Chat Widget */}
          <div className="relative flex flex-col justify-between">
            <div className="aspect-square rounded-xl overflow-hidden">
              <PublicTextChatWidget />
            </div>
            <p className="text-[12px] text-text-dimmed mt-3">
              {t('demo.caption.left')}
            </p>
          </div>

          {/* Right: Team photo */}
          <div className="relative flex flex-col justify-between">
            <div className="aspect-square rounded-xl overflow-hidden border border-border bg-[#e4f1fb] dark:bg-bg-elevated flex items-center justify-center p-2 shadow-sm">
              <img
                src={teamImageUrl}
                alt="Meet The People - The STRATUS team"
                className="w-full h-full object-contain rounded-lg"
                loading="lazy"
              />
            </div>
            <p className="text-lg font-medium text-text-primary mt-3">
              {t('demo.caption.right')}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button variant="primary" size="lg" onClick={() => scrollTo('#waitlist')}>
          {t('nav.joinWaitlist')} →
        </Button>
      </Container>
    </section>
  );
}
