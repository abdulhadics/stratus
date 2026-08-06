export function SectionEyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-eyebrow mb-6 ${className}`}>
      {children}
    </p>
  );
}
