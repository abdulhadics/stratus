'use client';

import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';

export function DemoSection() {
  const { t } = useTranslation();
  const heygenUrl = process.env.NEXT_PUBLIC_HEYGEN_SHARE_URL;
  const teamImageUrl = process.env.NEXT_PUBLIC_TEAM_IMAGE_URL;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left: HeyGen embed / placeholder */}
          <div className="relative">
            {heygenUrl ? (
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-bg-elevated">
                <iframe
                  src={heygenUrl}
                  className="w-full h-full"
                  allow="camera; microphone; autoplay"
                  title="STRATUS Interactive Avatar"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-lg border border-border bg-bg-elevated flex flex-col items-center justify-center">
                <p className="text-mono text-[10px] text-accent mb-3">
                  {t('demo.avatar.placeholder')}
                </p>
                <p className="text-[12px] text-text-dimmed text-center px-8 max-w-[300px]">
                  {t('demo.avatar.desc')}
                </p>
              </div>
            )}
            <p className="text-[12px] text-text-dimmed mt-3">
              {t('demo.caption.left')}
            </p>
          </div>

          {/* Right: Team photo / placeholder */}
          <div className="relative">
            {teamImageUrl ? (
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-bg-elevated">
                <img
                  src={teamImageUrl}
                  alt="The STRATUS team"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-lg border border-border bg-bg-elevated flex items-center justify-center">
                <p className="text-mono text-[10px] text-text-dimmed">
                  {t('demo.team.placeholder')}
                </p>
              </div>
            )}
            <p className="text-[12px] text-text-dimmed mt-3">
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
