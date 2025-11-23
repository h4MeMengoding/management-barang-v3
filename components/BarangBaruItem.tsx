import React from 'react';

interface BarangBaruItemProps {
  icon: React.ReactNode;
  name: string;
  date: string;
  quantity: string;
  bgColor: string;
}

export default function BarangBaruItem({
  icon,
  name,
  date,
  quantity,
  bgColor
}: BarangBaruItemProps) {
  return (
    <div className="flex items-center justify-between py-2.5 lg:py-3 gap-2">
      <div className="flex items-center gap-2.5 lg:gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs lg:text-sm font-medium text-[var(--text-primary)] truncate">{name}</h4>
          <p className="text-[10px] lg:text-xs text-[var(--text-tertiary)]">{date}</p>
        </div>
      </div>
      <span className="text-sm lg:text-base font-semibold text-[var(--text-primary)] ml-2 flex-shrink-0">{quantity}</span>
    </div>
  );
}
