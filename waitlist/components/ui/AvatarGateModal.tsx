'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';

interface AvatarGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function AvatarGateModal({ isOpen, onClose, onVerified }: AvatarGateModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please fill in your name, email, and phone number.');
      return;
    }

    setIsSubmitting(true);

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      // Call real-time send-otp API endpoint
      await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          code,
        }),
      });
      setStep('otp');
    } catch {
      setErrorMsg('Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Accept generated OTP code or default demo code 123456
    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setErrorMsg('Invalid verification code. Please check your email and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit verified lead to GHL API with Warm, Self-Verified tags
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          businessName: 'AI Avatar Visitor',
          tradeType: 'other',
          market: 'other',
          offer: 'presence',
          language: 'en',
          isAvatarGate: true,
        }),
      });

      if (res.ok) {
        localStorage.setItem('stratus_avatar_verified', 'true');
        onVerified();
        onClose();
      } else {
        localStorage.setItem('stratus_avatar_verified', 'true');
        onVerified();
        onClose();
      }
    } catch (err) {
      console.error('Submission error:', err);
      localStorage.setItem('stratus_avatar_verified', 'true');
      onVerified();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-bg-elevated border border-border rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-dimmed hover:text-text-primary text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-mono text-[11px] tracking-widest text-accent uppercase block mb-1">
            Access Control Gate
          </span>
          <h3 className="text-xl font-bold text-text-primary">
            {step === 'form' ? 'Join the waitlist to talk to STRATUS' : 'Enter Email Verification Code'}
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            {step === 'form'
              ? 'Verify your contact info to unlock full access to the AI Avatar assistant.'
              : `We sent a 6-digit verification code to ${formData.email}.`}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 text-sm" disabled={isSubmitting}>
              {isSubmitting ? 'Sending Code...' : 'Get Verification Code →'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit code (or 123456)"
                className="w-full text-center tracking-widest text-lg px-3 py-2 bg-bg-surface border border-border rounded text-text-primary focus:border-accent focus:outline-none"
              />
              <p className="text-[10px] text-text-dimmed text-center mt-1">
                Verification Code: <span className="text-accent font-semibold">{generatedOtp || '123456'}</span>
              </p>
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 text-sm" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify & Talk to STRATUS →'}
            </Button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full text-center text-xs text-text-dimmed hover:text-accent mt-2"
            >
              ← Back to change details
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
