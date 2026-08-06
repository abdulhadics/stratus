export function Container({
  children,
  className = '',
  as: Component = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Component className={`w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </Component>
  );
}
