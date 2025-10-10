import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Building, MapPin, Users, Star } from 'lucide-react';

interface PropertyStatsCardsProps {
  stats: {
    totalProperties: number;
    activeProperties: number;
    totalRooms: number;
    totalRevenue: number;
  };
}

export function PropertyStatsCards({ stats }: PropertyStatsCardsProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Properties"
        value={stats.totalProperties}
        description="All registered properties"
        icon={Building}
      />
      <StatsCard
        title="Active Properties"
        value={stats.activeProperties}
        description="Currently operational"
        icon={MapPin}
        className="[&>div>div>svg]:text-green-600"
      />
      <StatsCard
        title="Total Rooms"
        value={stats.totalRooms}
        description="Across all properties"
        icon={Users}
        className="[&>div>div>svg]:text-blue-600"
      />
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        description="All time revenue"
        icon={Star}
        className="[&>div>div>svg]:text-green-600"
      />
    </div>
  );
}
