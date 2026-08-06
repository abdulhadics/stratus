'use client';

/* ──────────────────────────────────────────────────────────────
   ALL IMPORTS PRESERVED — uncomment when full site goes live
   ────────────────────────────────────────────────────────────── */
// import { useState } from 'react';
// import { Header } from '@/components/layout/Header';
// import { Footer } from '@/components/layout/Footer';
// import { HeroSection } from '@/components/sections/HeroSection';
// import { PromiseSection } from '@/components/sections/PromiseSection';
// import { SystemsSection } from '@/components/sections/SystemsSection';
// import { DemoSection } from '@/components/sections/DemoSection';
// import { LifeSection } from '@/components/sections/LifeSection';
// import { PricingSection } from '@/components/sections/PricingSection';
// import { ResultsSection } from '@/components/sections/ResultsSection';
// import { DataOwnershipSection } from '@/components/sections/DataOwnershipSection';
// import { FAQSection } from '@/components/sections/FAQSection';
// import { WaitlistSection } from '@/components/sections/WaitlistSection';

export default function Home() {
  /* ── Coming Soon Single Page ── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden selection:bg-blue-500/20">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.05),transparent_50%)]" />

      <div className="relative z-10 text-center px-6">
        {/* Logo / Brand */}
        <h1 className="text-[42px] sm:text-[56px] md:text-[72px] font-serif font-light tracking-[-0.03em] text-white mb-4">
          STRATUS
        </h1>
        <div className="w-12 h-px bg-white/20 mx-auto mb-8" />

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-blue-500/25 bg-blue-500/[0.07] mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-blue-400 tracking-[0.2em] uppercase font-mono">
            Coming Soon
          </span>
        </div>

        {/* Tagline */}
        <p className="text-[15px] sm:text-[17px] text-white/50 max-w-md mx-auto leading-relaxed font-light">
          A modern boutique operations team for home service businesses.
        </p>
      </div>

      {/* Bottom subtle text */}
      <p className="absolute bottom-8 text-[11px] text-white/20 tracking-[0.15em] uppercase font-mono">
        © {new Date().getFullYear()} Stratus
      </p>
    </div>
  );

  /* ──────────────────────────────────────────────────────────────
     FULL SITE LAYOUT — uncomment below & remove Coming Soon above
     when Adam finalizes copy and all sections are ready to go live.
     ──────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PromiseSection />
        <SystemsSection />
        <DemoSection />
        <LifeSection />
        <ResultsSection />
        <DataOwnershipSection />
        <PricingSection onSelectOffer={setSelectedOffer} />
        <FAQSection />
        <WaitlistSection preselectedOffer={selectedOffer} />
      </main>
      <Footer />
    </>
  );
  */
}
