'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Container } from '@/components/layout/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { useTranslation } from '@/lib/i18n';
import { waitlistSchema, type WaitlistFormData, TRADE_OPTIONS, MARKET_OPTIONS, OFFER_OPTIONS } from '@/lib/validations';
import { CheckCircle } from 'lucide-react';

interface WaitlistSectionProps {
  preselectedOffer?: string;
}

export function WaitlistSection({ preselectedOffer }: WaitlistSectionProps) {
  const { t, language } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof WaitlistFormData, string>>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    tradeType: '',
    market: '',
    offer: preselectedOffer || '',
    honeypot: '',
  });

  // Update offer when preselected from pricing cards
  useEffect(() => {
    if (preselectedOffer) {
      setFormData(prev => ({ ...prev, offer: preselectedOffer }));
    }
  }, [preselectedOffer]);

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field as keyof WaitlistFormData]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [fieldErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    setErrorMessage('');

    const payload = {
      ...formData,
      language,
    };

    // Client-side validation
    const result = waitlistSchema.safeParse(payload);
    if (!result.success) {
      const errors: Partial<Record<keyof WaitlistFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof WaitlistFormData;
        if (!errors[field]) {
          // Use translated messages
          const validationKey = `validation.${field === 'businessName' ? 'business' : field}` as any;
          errors[field] = t(validationKey) || issue.message;
        }
      }
      setFieldErrors(errors);

      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField && formRef.current) {
        const el = formRef.current.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        el?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
      } else {
        // Show translated error
        if (response.status === 400) {
          setErrorMessage(t('error.validation'));
        } else if (data.error?.code === 'SERVICE_CONFIGURATION_ERROR') {
          setErrorMessage(t('error.unavailable'));
        } else {
          setErrorMessage(t('error.general'));
        }
        setStatus('error');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setErrorMessage(t('error.general'));
      } else {
        setErrorMessage(t('error.general'));
      }
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (status === 'success') {
    return (
      <section id="waitlist" className="py-[var(--section-padding)] bg-bg-secondary">
        <Container className="max-w-[600px] text-center">
          <div className="animate-fade-in-up">
            <CheckCircle size={48} className="text-success mx-auto mb-6" />
            <h2 className="text-heading mb-4">{t('success.heading')}</h2>
            <p className="text-body mb-8">{t('success.body')}</p>
            <Button
              variant="secondary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              {t('success.cta')}
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="waitlist" className="py-[var(--section-padding)] bg-bg-secondary">
      <Container className="max-w-[600px]">
        <div className="text-center mb-12">
          <SectionEyebrow className="justify-center">{t('waitlist.eyebrow')}</SectionEyebrow>
          <h2 className="text-heading mb-4">
            {t('waitlist.heading.1')}<br />
            {t('waitlist.heading.2')}
          </h2>
          <p className="text-body">{t('waitlist.body')}</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Honeypot */}
          <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={(e) => updateField('honeypot', e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <FormField label={t('waitlist.name')} error={fieldErrors.name}>
            <Input
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={language === 'fr' ? 'Jean Dupont' : 'John Doe'}
            />
          </FormField>

          <FormField label={t('waitlist.email')} error={fieldErrors.email}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="john@example.com"
            />
          </FormField>

          <FormField label={t('waitlist.business')} error={fieldErrors.businessName}>
            <Input
              name="businessName"
              type="text"
              autoComplete="organization"
              value={formData.businessName}
              onChange={(e) => updateField('businessName', e.target.value)}
              placeholder={language === 'fr' ? 'Plomberie Dupont' : 'Doe Plumbing'}
            />
          </FormField>

          <FormField label={t('waitlist.phone')} error={fieldErrors.phone}>
            <Input
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(613) 555-1234"
            />
          </FormField>

          <FormField label={t('waitlist.trade')} error={fieldErrors.tradeType}>
            <Select
              name="tradeType"
              value={formData.tradeType}
              onChange={(e) => updateField('tradeType', e.target.value)}
            >
              <option value="">{t('trade.placeholder')}</option>
              {TRADE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`trade.${opt}` as any)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={t('waitlist.market')} error={fieldErrors.market}>
            <Select
              name="market"
              value={formData.market}
              onChange={(e) => updateField('market', e.target.value)}
            >
              <option value="">{t('market.placeholder')}</option>
              {MARKET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`market.${opt === 'ottawa-gatineau' ? 'ottawa' : opt}` as any)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={t('waitlist.offer')} error={fieldErrors.offer}>
            <Select
              name="offer"
              value={formData.offer}
              onChange={(e) => updateField('offer', e.target.value)}
            >
              <option value="">{t('offer.placeholder')}</option>
              {OFFER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`offer.${opt}` as any)}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Error message */}
          {status === 'error' && errorMessage && (
            <div className="p-3 bg-error-muted border border-error/20 rounded" role="alert">
              <p className="text-[13px] text-error">{errorMessage}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('waitlist.submitting') : t('waitlist.submit')} →
          </Button>

          {/* Tagline */}
          <p className="text-mono text-[9px] text-text-dimmed text-center tracking-[0.1em] pt-4">
            {t('waitlist.tagline')}
          </p>
        </form>
      </Container>
    </section>
  );
}
