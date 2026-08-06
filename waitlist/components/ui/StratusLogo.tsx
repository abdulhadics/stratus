export function StratusLogo({ className = '', size = 28 }: { className?: string; size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="STRATUS Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
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
