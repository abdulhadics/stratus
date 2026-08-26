import { z } from 'zod';

export const TRADE_OPTIONS = [
  'hvac', 'electrician', 'plumber', 'other'
] as const;

export const MARKET_OPTIONS = ['ottawa-gatineau', 'montreal', 'other'] as const;

export const OFFER_OPTIONS = ['presence', 'machine', 'command', 'founding'] as const;

export const LANGUAGE_OPTIONS = ['en', 'fr'] as const;

export const waitlistSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email is required').max(200),
  phone: z.string().min(7, 'Phone number is required').max(30),
  businessName: z.string().min(1, 'Business name is required').max(200),
  tradeType: z.enum(TRADE_OPTIONS, { error: 'Select a trade type' }),
  market: z.enum(MARKET_OPTIONS, { error: 'Select a market' }),
  offer: z.enum(OFFER_OPTIONS, { error: 'Select an offer' }),
  language: z.enum(LANGUAGE_OPTIONS).default('en'),
  honeypot: z.string().max(0, 'Invalid submission').optional(),
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;
