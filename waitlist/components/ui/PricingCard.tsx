import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Check } from 'lucide-react';

interface PricingCardProps {
  label: string;
  name: string;
  subtitle?: string;
  badge?: string;
  setupPrice?: string;
  setupOriginal?: string;
  setupLabel: string;
  monthlyPrice?: string;
  monthlyOriginal?: string;
  monthlyLabel: string;
  monthlyNote?: string;
  spotsRemaining?: string;
  features: string[];
  disclaimer?: string;
  ctaText: string;
  onCta: () => void;
  featured?: boolean;
  badgeVariant?: 'blue' | 'muted';
}

export function PricingCard({
  label,
  name,
  subtitle,
  badge,
  setupPrice,
  setupOriginal,
  setupLabel,
  monthlyPrice,
  monthlyOriginal,
  monthlyLabel,
  monthlyNote,
  spotsRemaining,
  features,
  disclaimer,
  ctaText,
  onCta,
  featured = false,
  badgeVariant = 'muted',
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col border rounded-lg p-8 transition-colors duration-300',
        featured
          ? 'border-accent/50 hover:border-accent bg-bg-elevated'
          : 'border-border hover:border-border-hover bg-bg-elevated/50'
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-6">
          <span
            className={cn(
              'text-mono text-[9px] tracking-[0.12em] px-3 py-1 rounded-sm inline-block',
              badgeVariant === 'blue'
                ? 'bg-accent text-white'
                : 'border border-border-strong text-text-secondary bg-bg-secondary'
            )}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <p className="text-mono text-[10px] text-accent mb-2">{label}</p>
        <h3 className="text-[28px] font-serif text-text-primary tracking-tight leading-none">{name}</h3>
        {subtitle && (
          <p className="text-mono text-[10px] text-text-secondary mt-2">{subtitle}</p>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-6 space-y-4">
        <div>
          <p className="text-mono text-[9px] text-text-dimmed mb-1">{setupLabel}</p>
          <div className="flex items-baseline gap-2">
            {setupOriginal && (
              <span className="text-text-dimmed line-through text-[14px]">{setupOriginal}</span>
            )}
            <span className="text-[24px] font-serif text-text-primary">
              {setupPrice}
            </span>
            {setupPrice && !setupPrice.includes('Custom') && (
              <span className="text-[12px] text-text-secondary">one-time</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-mono text-[9px] text-text-dimmed mb-1">{monthlyLabel}</p>
          <div className="flex items-baseline gap-2">
            {monthlyOriginal && (
              <span className="text-text-dimmed line-through text-[14px]">{monthlyOriginal}</span>
            )}
            <span className="text-[24px] font-serif text-text-primary">
              {monthlyPrice}
            </span>
            {monthlyPrice && !monthlyPrice.includes('application') && !monthlyPrice.includes('demande') && (
              <span className="text-[12px] text-text-secondary">/month</span>
            )}
          </div>
          {monthlyNote && (
            <p className="text-[11px] text-text-dimmed mt-1 italic">{monthlyNote}</p>
          )}
        </div>
      </div>

      {/* Spots remaining */}
      {spotsRemaining && (
        <div className="mb-6 border border-accent/30 bg-accent-muted rounded px-3 py-2">
          <p className="text-mono text-[9px] text-accent">{spotsRemaining}</p>
        </div>
      )}

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check size={14} className="text-accent mt-0.5 flex-shrink-0" />
            <span className="text-[13px] text-text-secondary leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Disclaimer */}
      {disclaimer && (
        <p className="text-[11px] text-text-dimmed mb-6 italic">{disclaimer}</p>
      )}

      {/* CTA */}
      <Button
        variant={featured ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
        onClick={onCta}
      >
        {ctaText} →
      </Button>
    </div>
  );
}
