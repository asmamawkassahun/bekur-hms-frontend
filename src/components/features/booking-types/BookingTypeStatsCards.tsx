import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

interface BookingTypeStatsCardsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export function BookingTypeStatsCards({ stats }: BookingTypeStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Total Booking Types"
        value={stats.total}
        description="All booking types"
        icon={FileText}
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
    </div>
  );
}
