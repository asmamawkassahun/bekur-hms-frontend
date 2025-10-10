'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
    items?: number;
    showDots?: boolean;
    showBadges?: boolean;
}

export function ListSkeleton({
    items = 5,
    showDots = true,
    showBadges = true
}: ListSkeletonProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                    {showDots && (
                        <Skeleton className="h-2 w-2 bg-green-500 rounded-full" />
                    )}
                    <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    {showBadges && (
                        <Skeleton className="h-5 w-12 rounded-full" />
                    )}
                </div>
            ))}
        </div>
    );
}
