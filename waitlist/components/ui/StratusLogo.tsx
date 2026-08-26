export function StratusLogo({ className = '', size = 32, showHexagon = true }: { className?: string; size?: number; showHexagon?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`object-contain flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showHexagon && (
        <path
          d="M 50 6 L 88 28 L 88 72 L 50 94 L 12 72 L 12 28 Z"
          className="stroke-accent"
          stroke="#2563EB"
          strokeWidth="6"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      <path
        d="M 32 30 H 64 C 68 30 71 33 66 39 L 58 47 H 32 Z"
        className="fill-accent"
        fill="#2563EB"
      />
      <path
        d="M 30 48 H 64 C 67 48 67 56 64 56 H 28 Z"
        className="fill-accent"
        fill="#2563EB"
      />
      <path
        d="M 24 57 H 58 C 66 57 70 63 64 71 L 56 80 H 26 C 21 80 19 76 24 71 Z"
        className="fill-accent"
        fill="#2563EB"
      />
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
