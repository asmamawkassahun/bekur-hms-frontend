import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Home, CheckCircle, Clock, XCircle } from 'lucide-react';

interface DormitoryStatsCardsProps {
  stats: {
    totalDormitories: number;
    availableDormitories: number;
    occupiedDormitories: number;
    maintenanceDormitories: number;
  };
}

export function DormitoryStatsCards({ stats }: DormitoryStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Dormitories"
        value={stats.totalDormitories}
        description="All dormitories in property"
        icon={Home}
        gradient="blue"
      />
      <StatsCard
        title="Available"
        value={stats.availableDormitories}
        description="Ready for booking"
        icon={CheckCircle}
        gradient="green"
      />
      <StatsCard
        title="Occupied"
        value={stats.occupiedDormitories}
        description="Currently occupied"
        icon={Clock}
        gradient="violet"
      />
      <StatsCard
        title="Maintenance"
        value={stats.maintenanceDormitories}
        description="Under maintenance"
        icon={XCircle}
        gradient="rose"
      />
    </div>
  );
}
