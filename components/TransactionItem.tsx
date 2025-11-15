import React from 'react';
import Image from 'next/image';

interface TransactionItemProps {
  image: string;
  title: string;
  date: string;
  amount: string;
}

export default function TransactionItem({
  image,
  title,
  date,
  amount
}: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between py-2.5 lg:py-3">
      <div className="flex items-center gap-2.5 lg:gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden bg-gray-200 relative flex-shrink-0">
          <Image 
            src={image} 
            alt={title}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs lg:text-sm font-medium text-gray-900 truncate">{title}</h4>
          <p className="text-[10px] lg:text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <span className="text-base lg:text-lg font-semibold text-gray-900 ml-2 flex-shrink-0">{amount}</span>
    </div>
  );
}
