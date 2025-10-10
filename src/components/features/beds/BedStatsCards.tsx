import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { BedDouble, CheckCircle, Clock, XCircle } from 'lucide-react';

interface BedStatsCardsProps {
  stats: {
    totalBeds: number;
    availableBeds: number;
    occupiedBeds: number;
    maintenanceBeds: number;
  };
}

export function BedStatsCards({ stats }: BedStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Beds"
        value={stats.totalBeds}
        description="All beds in dormitories"
        icon={BedDouble}
      />
      <StatsCard
        title="Available"
        value={stats.availableBeds}
        description="Ready for booking"
        icon={CheckCircle}
        className="[&>div>div>svg]:text-green-600"
      />
      <StatsCard
        title="Occupied"
        value={stats.occupiedBeds}
        description="Currently occupied"
        icon={Clock}
        className="[&>div>div>svg]:text-blue-600"
      />
      <StatsCard
        title="Maintenance"
        value={stats.maintenanceBeds}
        description="Under maintenance"
        icon={XCircle}
        className="[&>div>div>svg]:text-red-600"
      />
    </div>
  );
}
