interface MetricCardProps {
  value: string;
  title: string;
  description: string;
}

export function MetricCard({ value, title, description }: MetricCardProps) {
  return (
    <div className="group border border-border rounded-lg p-8 hover:border-border-hover transition-colors duration-300 bg-bg-elevated/50">
      <p className="text-metric mb-3">{value}</p>
      <p className="text-[14px] font-semibold text-text-primary mb-2">{title}</p>
      <p className="text-[13px] text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
