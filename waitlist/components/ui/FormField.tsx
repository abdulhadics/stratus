import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-mono text-[10px] text-text-secondary block">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[12px] text-error mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-2.5 bg-bg-input border border-border rounded text-[14px] text-text-primary placeholder:text-text-dimmed outline-none transition-colors duration-200',
        'focus:border-accent focus:ring-1 focus:ring-accent/30',
        'hover:border-border-strong',
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full px-4 py-2.5 bg-bg-input border border-border rounded text-[14px] text-text-primary outline-none appearance-none transition-colors duration-200 cursor-pointer',
          'focus:border-accent focus:ring-1 focus:ring-accent/30',
          'hover:border-border-strong',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-dimmed">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-2.5 bg-bg-input border border-border rounded text-[14px] text-text-primary placeholder:text-text-dimmed outline-none transition-colors duration-200 resize-y min-h-[100px]',
        'focus:border-accent focus:ring-1 focus:ring-accent/30',
        'hover:border-border-strong',
        className
      )}
      {...props}
    />
  );
}
