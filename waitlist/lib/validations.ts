import { z } from 'zod';

export const TRADE_OPTIONS = [
  'hvac', 'electrician', 'plumber', 'other'
] as const;

export const MARKET_OPTIONS = ['ottawa-gatineau', 'montreal', 'other'] as const;

export const OFFER_OPTIONS = ['presence', 'machine', 'command'] as const;

export const LANGUAGE_OPTIONS = ['en', 'fr'] as const;

export const REVENUE_OPTIONS = ['<99k', '100k-149k', '150k-249k', '250k-500k', '500k+'] as const;

export const waitlistPage1Schema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email is required').max(200),
  phone: z.string().min(7, 'Phone number is required').max(30),
  language: z.enum(LANGUAGE_OPTIONS).default('en'),
  honeypot: z.string().max(0, 'Invalid submission').optional(),
});

export const waitlistPage2Schema = z.object({
  frustrationQuestion: z.string().min(2, 'Please answer this question').max(2000),
  businessName: z.string().min(1, 'Business name is required').max(200),
  tradeType: z.enum(TRADE_OPTIONS, { error: 'Select a trade type' }),
  market: z.enum(MARKET_OPTIONS, { error: 'Select a market' }),
  onlinePresence: z.string().max(500).optional(),
  jobVolume: z.string().max(200).optional(),
  offer: z.enum(OFFER_OPTIONS, { error: 'Select an offer' }),
  revenueBand: z.enum(REVENUE_OPTIONS, { error: 'Select a revenue band' }),
  isAvatarGate: z.boolean().optional(),
});

export const waitlistSchema = waitlistPage1Schema.merge(waitlistPage2Schema);

export type WaitlistFormData = z.infer<typeof waitlistSchema>;
