import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[var(--surface-1)] rounded-2xl shadow-sm p-5 lg:p-6 ${className}`}>
      {children}
    </div>
  );
}
