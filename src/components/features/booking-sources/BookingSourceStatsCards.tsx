import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Globe, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface BookingSourceStatsCardsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    averageCommission: number;
  };
}

export function BookingSourceStatsCards({
  stats,
}: BookingSourceStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Sources"
        value={stats.total}
        description="All booking sources"
        icon={Globe}
        gradient="blue"
      />
      <StatsCard
        title="Active"
        value={stats.active}
        description="Currently active"
        icon={CheckCircle}
        gradient="green"
      />
      <StatsCard
        title="Inactive"
        value={stats.inactive}
        description="Deactivated"
        icon={XCircle}
        gradient="rose"
      />
      <StatsCard
        title="Avg Commission"
        value={`${stats.averageCommission.toFixed(2)}%`}
        description="Average rate"
        icon={TrendingUp}
        gradient="yellow"
      />
    </div>
  );
}
