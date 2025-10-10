'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderSkeletonProps {
    sidebarOpen?: boolean;
    onToggle: () => void;
    onMobileMenuToggle: () => void;
}

export function HeaderSkeleton({ onToggle, onMobileMenuToggle }: HeaderSkeletonProps) {
    return (
        <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMobileMenuToggle}
                    className="md:hidden cursor-pointer"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Desktop sidebar toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="hidden md:flex cursor-pointer"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Search skeleton */}
                <div className="hidden md:block">
                    <Skeleton className="h-10 w-64" />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
                {/* Theme Toggle skeleton */}
                <Skeleton className="h-9 w-9 rounded-md" />

                {/* Notifications skeleton */}
                <Skeleton className="h-9 w-9 rounded-md" />

                {/* User Menu skeleton */}
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="hidden md:block text-left space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                </div>
            </div>
        </header>
    );
}
