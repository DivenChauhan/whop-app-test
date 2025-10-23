'use client';

interface MetricsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function MetricsCard({ title, value, subtitle, icon }: MetricsCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-xl p-6 hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/60 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-blue-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

