import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingState({
  rows = 5,
  columns = 4,
  className = '',
}: LoadingStateProps) {
  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Search bar skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border">
            <div className="p-4">
              {/* Table header */}
              <div className="flex space-x-4 mb-4">
                {Array.from({ length: columns }).map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
              </div>

              {/* Table rows */}
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex space-x-4 mb-3">
                  {Array.from({ length: columns }).map((_, j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
