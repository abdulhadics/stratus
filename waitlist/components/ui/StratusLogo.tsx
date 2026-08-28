export function StratusLogo({ className = '', size = 32 }: { className?: string; size?: number; showHexagon?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {/* Light Mode Logo */}
      <img
        src="/logolight-transparent.png"
        alt="STRATUS Logo"
        width={size}
        height={size}
        className="logo-light-img object-contain w-full h-full"
      />
      {/* Dark Mode Logo */}
      <img
        src="/logolight-transparent.png"
        alt="STRATUS Logo"
        width={size}
        height={size}
        className="logo-dark-img object-contain w-full h-full filter brightness-125"
      />
    </div>
  );
}

export function StratusWordmark({ className = '', fontSize = 'text-[20px]' }: { className?: string; fontSize?: string }) {
  return (
    <span className={`text-mono ${fontSize} tracking-[0.2em] font-semibold text-text-primary ${className}`}>
      STRATUS
    </span>
  );
}
