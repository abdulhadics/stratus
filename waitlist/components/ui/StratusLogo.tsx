export function StratusLogo({ className = '', size = 30 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`object-contain flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <rect width="40" height="40" rx="8" className="fill-accent" />
      <path d="M10 14L20 9L30 14L20 19L10 14Z" fill="white" />
      <path d="M10 20L20 15L30 20L20 25L10 20Z" fill="white" fillOpacity="0.85" />
      <path d="M10 26L20 21L30 26L20 31L10 26Z" fill="white" fillOpacity="0.65" />
    </svg>
  );
}

export function StratusWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-mono text-[15px] tracking-[0.2em] font-semibold text-text-primary ${className}`}>
      STRATUS
    </span>
  );
}
