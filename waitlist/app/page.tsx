'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { PromiseSection } from '@/components/sections/PromiseSection';
import { SystemsSection } from '@/components/sections/SystemsSection';
import { DemoSection } from '@/components/sections/DemoSection';
import { LifeSection } from '@/components/sections/LifeSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { ResultsSection } from '@/components/sections/ResultsSection';
import { DataOwnershipSection } from '@/components/sections/DataOwnershipSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { WaitlistSection } from '@/components/sections/WaitlistSection';

export default function Home() {
  const [selectedOffer, setSelectedOffer] = useState<string>('');

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        {/* Temporarily commented out until Adam finalizes copy & sections */}
        {/* <PromiseSection /> */}
        {/* <SystemsSection /> */}
        {/* <DemoSection /> */}
        {/* <LifeSection /> */}
        {/* <ResultsSection /> */}
        {/* <DataOwnershipSection /> */}
        {/* <PricingSection onSelectOffer={setSelectedOffer} /> */}
        {/* <FAQSection /> */}
        <WaitlistSection preselectedOffer={selectedOffer} />
      </main>
      <Footer />
    </>
  );
}
