import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Bed, CheckCircle, Clock, XCircle } from 'lucide-react';

interface RoomStatsCardsProps {
  stats: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
  };
}

export function RoomStatsCards({ stats }: RoomStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Rooms"
        value={stats.totalRooms}
        description="All rooms in property"
        icon={Bed}
      />
      <StatsCard
        title="Available"
        value={stats.availableRooms}
        description="Ready for booking"
        icon={CheckCircle}
        className="[&>div>div>svg]:text-green-600"
      />
      <StatsCard
        title="Occupied"
        value={stats.occupiedRooms}
        description="Currently occupied"
        icon={Clock}
        className="[&>div>div>svg]:text-blue-600"
      />
      <StatsCard
        title="Maintenance"
        value={stats.maintenanceRooms}
        description="Under maintenance"
        icon={XCircle}
        className="[&>div>div>svg]:text-red-600"
      />
    </div>
  );
}
