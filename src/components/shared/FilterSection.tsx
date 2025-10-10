import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface FilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({
  children,
  className = '',
}: FilterSectionProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      {children}
      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        More Filters
      </Button>
    </div>
  );
}
