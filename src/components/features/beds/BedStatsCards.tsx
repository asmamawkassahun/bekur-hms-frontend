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
        gradient="blue"
      />
      <StatsCard
        title="Available"
        value={stats.availableBeds}
        description="Ready for booking"
        icon={CheckCircle}
        gradient="green"
      />
      <StatsCard
        title="Occupied"
        value={stats.occupiedBeds}
        description="Currently occupied"
        icon={Clock}
        gradient="violet"
      />
      <StatsCard
        title="Maintenance"
        value={stats.maintenanceBeds}
        description="Under maintenance"
        icon={XCircle}
        gradient="rose"
      />
    </div>
  );
}
