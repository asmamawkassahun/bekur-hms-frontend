import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Home, DollarSign, Users, CheckCircle } from 'lucide-react';

interface RoomTypeStatsCardsProps {
  stats: {
    totalRoomTypes: number;
    activeRoomTypes: number;
    averagePrice: number;
    totalRooms: number;
  };
}

export function RoomTypeStatsCards({ stats }: RoomTypeStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Room Types"
        value={stats.totalRoomTypes}
        description="All room types"
        icon={Home}
      />
      <StatsCard
        title="Active Room Types"
        value={stats.activeRoomTypes}
        description="Currently active"
        icon={CheckCircle}
      />
      <StatsCard
        title="Average Price"
        value={formatCurrency(stats.averagePrice)}
        description="Per room type"
        icon={DollarSign}
      />
      <StatsCard
        title="Total Rooms"
        value={stats.totalRooms}
        description="All rooms"
        icon={Users}
      />
    </div>
  );
}
