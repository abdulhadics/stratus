'use client';

import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ConfirmationPage() {
  const { t } = useTranslation();
  const calendarUrl = process.env.NEXT_PUBLIC_GHL_CALENDAR_URL;
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Container className="max-w-[640px] text-center py-20">
        <div className="animate-fade-in-up">
          <CheckCircle size={52} className="text-success mx-auto mb-8" />

          <h1 className="text-heading mb-4">
            {t('confirm.heading')}
          </h1>

          <p className="text-body mb-10 max-w-[480px] mx-auto">
            {t('confirm.body')}
          </p>

          {/* Calendar embed */}
          {calendarUrl && (
            <div className="mb-10">
              <h2 className="text-mono text-[11px] text-accent mb-4">
                {t('confirm.calendar.heading')}
              </h2>
              <div className="relative border border-border rounded-lg overflow-hidden bg-bg-elevated" style={{ minHeight: 600 }}>
                {!calendarLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-mono text-[10px] text-text-dimmed animate-pulse">
                      {t('confirm.calendar.loading')}
                    </p>
                  </div>
                )}
                <iframe
                  src={calendarUrl}
                  className="w-full"
                  style={{ minHeight: 600, border: 'none' }}
                  title="Book your discovery call"
                  loading="lazy"
                  onLoad={() => setCalendarLoaded(true)}
                />
              </div>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
          >
            {t('confirm.backHome')}
          </Button>
        </div>
      </Container>
    </main>
  );
}
