'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CardSkeletonProps {
    showIcon?: boolean;
    showTrend?: boolean;
    className?: string;
}

export function CardSkeleton({
    showIcon = true,
    showTrend = true,
    className = ""
}: CardSkeletonProps) {
    return (
        <div className={`bg-card border-0 shadow-sm rounded-lg p-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
                {showIcon && <Skeleton className="h-8 w-8 rounded" />}
            </div>
            {showTrend && (
                <div className="mt-4 flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-20" />
                </div>
            )}
        </div>
    );
}
