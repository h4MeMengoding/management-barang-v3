import React from 'react';
import Image from 'next/image';

interface MaintenanceItemProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle: string;
  description: string;
  personName: string;
  personImage: string;
}

export default function MaintenanceItem({
  icon,
  iconBg,
  title,
  subtitle,
  description,
  personName,
  personImage
}: MaintenanceItemProps) {
  const wrapperClass = `w-10 h-10 lg:w-12 lg:h-12 ${iconBg ?? 'rounded-full bg-gray-100'} flex items-center justify-center flex-shrink-0`;

  return (
    <div className="flex items-center justify-between py-2.5 lg:py-3 gap-2">
      <div className="flex items-center gap-2.5 lg:gap-3 flex-1 min-w-0">
        <div className={wrapperClass}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs lg:text-sm font-medium text-gray-900 truncate">{title}</h4>
          <p className="text-[10px] lg:text-xs text-gray-500 truncate">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <span className="text-xs lg:text-sm font-semibold text-gray-900">{description}</span>
        {personImage && (
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-gray-200 relative flex-shrink-0">
            <Image 
              src={personImage} 
              alt={personName}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
