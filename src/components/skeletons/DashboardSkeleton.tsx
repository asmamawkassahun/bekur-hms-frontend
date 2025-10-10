'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    BarChart3,
    Activity,
} from 'lucide-react';

// Import shared components
import { PageHeader } from '@/components/shared/PageHeader';
import { CardSkeleton } from './CardSkeleton';
import { ChartSkeleton } from './ChartSkeleton';
import { ListSkeleton } from './ListSkeleton';
import { TableSkeleton } from './TableSkeleton';

export function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <PageHeader
                title="Dashboard"
                description="Loading dashboard data..."
            >
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Reservation
                </Button>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>

            {/* Property Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <CardSkeleton showTrend={false} />
                <CardSkeleton showTrend={false} />
                <CardSkeleton showTrend={false} />
                <CardSkeleton showTrend={false} />
            </div>

            {/* Charts and Tables */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Occupancy Chart */}
                <ChartSkeleton
                    title="Occupancy Trend"
                    showButton={true}
                    buttonText="View Details"
                    height="h-64"
                    dataPoints={14}
                />

                {/* Recent Activity */}
                <div className="bg-card border-0 shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-6 w-28" />
                        <Button variant="outline" size="sm" className="cursor-pointer">
                            <Activity className="h-4 w-4 mr-2" />
                            View All
                        </Button>
                    </div>
                    <ListSkeleton items={5} showDots={true} showBadges={true} />
                </div>
            </div>

            {/* Recent Reservations and Guests */}
            <Tabs defaultValue="reservations" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="reservations">Recent Reservations</TabsTrigger>
                    <TabsTrigger value="guests">Recent Guests</TabsTrigger>
                </TabsList>

                <TabsContent value="reservations" className="space-y-4">
                    <div className="bg-card border-0 shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-6 w-36" />
                                <Button variant="outline" size="sm" className="cursor-pointer">
                                    View All
                                </Button>
                            </div>
                            <TableSkeleton columns={6} rows={5} showHeader={true} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="guests" className="space-y-4">
                    <div className="bg-card border-0 shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-6 w-24" />
                                <Button variant="outline" size="sm" className="cursor-pointer">
                                    View All
                                </Button>
                            </div>
                            <TableSkeleton columns={5} rows={5} showHeader={true} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
