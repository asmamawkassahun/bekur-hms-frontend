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
      />
      <StatsCard
        title="Available"
        value={stats.availableDormitories}
        description="Ready for booking"
        icon={CheckCircle}
        className="[&>div>div>svg]:text-green-600"
      />
      <StatsCard
        title="Occupied"
        value={stats.occupiedDormitories}
        description="Currently occupied"
        icon={Clock}
        className="[&>div>div>svg]:text-blue-600"
      />
      <StatsCard
        title="Maintenance"
        value={stats.maintenanceDormitories}
        description="Under maintenance"
        icon={XCircle}
        className="[&>div>div>svg]:text-red-600"
      />
    </div>
  );
}
