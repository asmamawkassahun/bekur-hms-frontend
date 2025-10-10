import React from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center space-x-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
