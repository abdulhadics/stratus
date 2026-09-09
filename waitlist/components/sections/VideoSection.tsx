'use client';

import { useState, useRef, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';
import { Play, X } from 'lucide-react';

export function VideoSection() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);
    <section className="relative py-16 sm:py-24 bg-bg-surface" id="video">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-[32px] font-bold text-text-primary mb-10 tracking-tight uppercase font-sans">
            {t('video.heading')}
          </h2>

          <div 
            className="w-full max-w-4xl aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-border mb-10 relative cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            {/* Dark overlay with play button on hover */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
              <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 ml-1" fill="currentColor" />
              </div>
            </div>
            
            {/* Muted background video as thumbnail (cropped to landscape) */}
            <video 
              className="w-full h-full object-cover opacity-80"
              preload="metadata"
              muted
              playsInline
              loop
              autoPlay
            >
              <source src="/STRATUS-90sec.mp4" type="video/mp4" />
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

      {/* Video Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black p-3 rounded-full transition-all z-50"
            aria-label="Close video"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative w-full h-full flex items-center justify-center max-w-7xl animate-in zoom-in-95 duration-200"
            onClick={(e) => {
              // Close if clicking outside the video
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <video 
              ref={videoRef}
              controls 
              autoPlay
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              playsInline
            >
              <source src="/STRATUS-90sec.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </section>
  );
}
