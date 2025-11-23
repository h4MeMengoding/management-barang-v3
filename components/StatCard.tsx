import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  previousValue: string;
  iconBgColor?: string;
  loading?: boolean;
}

export default function StatCard({
  icon,
  title,
  value,
  change,
  changeType,
  previousValue,
  iconBgColor = 'bg-gray-100'
  , loading = false
}: StatCardProps) {
  return (
    <div className="bg-[var(--surface-1)] rounded-2xl shadow-sm p-5 lg:p-6">
      {loading ? (
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-3 lg:mb-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className={`${iconBgColor} p-2.5 lg:p-3 rounded-xl flex items-center justify-center`}></div>
              <div className="w-24 h-4 bg-[var(--surface-2)] rounded"></div>
            </div>
            <div className="w-6 h-6 bg-[var(--surface-2)] rounded" />
          </div>

          <div className="flex items-end gap-2 lg:gap-3">
            <div className="w-32 h-10 bg-[var(--surface-2)] rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="w-20 h-4 bg-[var(--surface-2)] rounded"></div>
              <div className="w-32 h-3 bg-[var(--surface-2)] rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3 lg:mb-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className={`${iconBgColor} p-2.5 lg:p-3 rounded-xl flex items-center justify-center`}>
                {icon}
              </div>
              <h3 className="text-sm lg:text-base text-[var(--text-secondary)] font-medium">{title}</h3>
            </div>
            <button className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="12" cy="5" r="1" fill="currentColor"/>
                <circle cx="12" cy="19" r="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
          
          <div className="flex items-end gap-2 lg:gap-3">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">{value}</h2>
            <div className="flex items-center gap-1.5 lg:gap-2 mb-1">
              <span className={`text-xs lg:text-sm font-medium flex items-center gap-1 ${
                changeType === 'increase' ? 'text-[var(--color-success)]' : changeType === 'decrease' ? 'text-[var(--color-danger)]' : 'text-[var(--text-tertiary)]'
              }`}>
                <span className="text-[10px] lg:text-xs">
                  {changeType === 'increase' ? '▲' : changeType === 'decrease' ? '▼' : '—'}
                </span>
                {change}
              </span>
              <span className="text-xs lg:text-sm text-[var(--text-secondary)]">
                Total kemarin {previousValue}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
