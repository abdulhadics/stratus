'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';
import { AvatarGateModal } from '@/components/ui/AvatarGateModal';

export function DemoSection() {
  const { t } = useTranslation();
  const heygenUrl = process.env.NEXT_PUBLIC_HEYGEN_SHARE_URL;
  const teamImageUrl = process.env.NEXT_PUBLIC_TEAM_IMAGE_URL || '/team.jpeg';
  const [isVerified, setIsVerified] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('stratus_avatar_verified');
    if (verified === 'true') {
      setIsVerified(true);
    }
  }, []);

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
          {/* Left: AI Avatar Gate / Interactive Experience */}
          <div className="relative flex flex-col justify-between">
            {isVerified ? (
              /* Unlocked Avatar Experience */
              heygenUrl ? (
                <div className="aspect-square rounded-xl overflow-hidden border border-border bg-bg-elevated shadow-sm">
                  <iframe
                    src={heygenUrl}
                    className="w-full h-full"
                    allow="camera; microphone; autoplay"
                    title="STRATUS Interactive Avatar"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-xl border border-accent/40 bg-bg-elevated p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase tracking-wider border border-emerald-500/20">
                    ✓ Verified Access
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-3">
                    <span className="text-accent text-xl">🤖</span>
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    STRATUS AI Digital Assistant
                  </h4>
                  <p className="text-xs text-text-secondary max-w-[280px] mb-4">
                    "Hi! I'm an AI digital assistant. How can I help streamline your operations today?"
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => scrollTo('#waitlist')}>
                    Book Discovery Call →
                  </Button>
                </div>
              )
            ) : (
              /* Locked Avatar Gate Preview with 3-Second Teaser Video */
              <div className="aspect-square rounded-xl border border-accent/40 bg-bg-elevated p-4 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-md group">
                {/* 3s Teaser Video / Background Animation */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/0 via-black/10 to-black/80 flex items-center justify-center">
                  <video
                    src={process.env.NEXT_PUBLIC_AVATAR_TEASER_URL || "https://cdn.pixabay.com/video/2023/10/22/186104-877287752_tiny.mp4"}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-90 filter contrast-110"
                  />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 w-full flex items-center justify-between">
                  <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-wider border border-white/20 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    3s Teaser Preview
                  </div>
                  <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs">
                    🔒
                  </div>
                </div>

                {/* Cinematic Subtitle (At the bottom, above the button) */}
                <div className="relative z-10 mt-auto mb-4 w-full flex justify-center">
                  <div className="px-3 py-1.5 rounded bg-black/50 backdrop-blur-sm border border-white/10 text-white shadow-md inline-block max-w-[90%]">
                    <p className="text-[11px] font-medium tracking-wide">
                      "Hi! How can we help you streamline your business operations today?"
                    </p>
                  </div>
                </div>

                {/* Bottom Overlay & Unlock Action */}
                <div className="relative z-10 w-full">
                  <p className="text-[11px] text-white/90 mb-2 font-medium drop-shadow-md">
                    Verify email to unlock full interactive voice AI
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setIsGateOpen(true)} className="w-full shadow-lg">
                    Unlock Interactive AI Avatar →
                  </Button>
                </div>
              </div>
            )}

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
            <p className="text-[12px] text-text-dimmed mt-3">
              {t('demo.caption.right')}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button variant="primary" size="lg" onClick={() => scrollTo('#waitlist')}>
          {t('nav.joinWaitlist')} →
        </Button>

        {/* Avatar Gate Verification Modal */}
        <AvatarGateModal
          isOpen={isGateOpen}
          onClose={() => setIsGateOpen(false)}
          onVerified={() => setIsVerified(true)}
        />
      </Container>
    </section>
  );
}
