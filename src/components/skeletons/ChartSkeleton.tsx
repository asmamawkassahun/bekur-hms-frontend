'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface ChartSkeletonProps {
    title?: string;
    showButton?: boolean;
    buttonText?: string;
    height?: string;
    dataPoints?: number;
}

export function ChartSkeleton({
    title = "Loading Chart",
    showButton = true,
    buttonText = "View Details",
    height = "h-64",
    dataPoints = 14
}: ChartSkeletonProps) {
    return (
        <div className="bg-card border-0 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                {showButton && (
                    <Button variant="outline" size="sm" className="cursor-pointer">
                        {buttonText}
                    </Button>
                )}
            </div>
            <div className={`${height} flex items-end justify-between space-x-1`}>
                {Array.from({ length: dataPoints }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                        <Skeleton
                            className="bg-primary rounded-t w-8"
                            style={{ height: `${Math.random() * 40 + 40}%` }}
                        />
                        <Skeleton className="h-3 w-8" />
                    </div>
                ))}
            </div>
        </div>
    );
}
