export function StratusLogo({ className = '', size = 32 }: { className?: string; size?: number; showHexagon?: boolean }) {
  return (
    <img
      src="/logolight.png"
      alt="STRATUS Logo"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function StratusWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-mono text-[15px] tracking-[0.2em] font-semibold text-text-primary ${className}`}>
      STRATUS
    </span>
  );
}
