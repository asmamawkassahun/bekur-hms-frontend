import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Calendar, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface ReservationStatsCardsProps {
  stats: {
    totalReservations: number;
    confirmedReservations: number;
    checkedInReservations: number;
    pendingReservations: number;
    totalRevenue: number;
  };
}

export function ReservationStatsCards({ stats }: ReservationStatsCardsProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Reservations"
        value={stats.totalReservations}
        description="All time reservations"
        icon={Calendar}
      />
      <StatsCard
        title="Checked In"
        value={stats.checkedInReservations}
        description="Currently in hotel"
        icon={CheckCircle}
        className="[&>div>div>svg]:text-green-600"
      />
      <StatsCard
        title="Pending"
        value={stats.pendingReservations}
        description="Awaiting confirmation"
        icon={Clock}
        className="[&>div>div>svg]:text-yellow-600"
      />
      <StatsCard
        title="Revenue"
        value={formatCurrency(stats.totalRevenue)}
        description="Total revenue"
        icon={DollarSign}
        className="[&>div>div>svg]:text-green-600"
      />
    </div>
  );
}
