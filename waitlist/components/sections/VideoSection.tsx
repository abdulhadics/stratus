'use client';

import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';

export function VideoSection() {
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-16 sm:py-24 bg-bg-surface" id="video">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-[32px] font-bold text-text-primary mb-10 tracking-tight uppercase font-sans">
            {t('video.heading')}
          </h2>

          <div className="w-full max-w-4xl bg-[#EDF0F5] dark:bg-bg-secondary rounded-lg overflow-hidden shadow-sm border border-border mb-10 flex items-center justify-center">
            <video 
              controls 
              className="w-full aspect-video object-cover"
              preload="metadata"
            >
              <source src="/STRATUS-90sec.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto px-8 py-3 uppercase tracking-wider text-sm font-semibold rounded-md shadow-md"
            onClick={() => scrollTo('#waitlist')}
          >
            {t('video.cta')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
