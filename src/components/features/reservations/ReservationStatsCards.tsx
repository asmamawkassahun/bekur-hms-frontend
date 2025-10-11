import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

interface ReservationStatsCardsProps {
  stats: {
    totalReservations: number;
    confirmedReservations: number;
    checkedInReservations: number;
    pendingReservations: number;
    totalRevenue: number;
    totalPaidAmount: number;
    totalUnpaidAmount: number;
    paidReservations: number;
    currency: string;
  };
}

export function ReservationStatsCards({ stats }: ReservationStatsCardsProps) {
  const formatCurrency = (amount: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue, stats.currency)}
        description="Total booking value"
        icon={DollarSign}
        className="[&>div>div>svg]:text-green-600"
      />
      <StatsCard
        title="Paid Amount"
        value={formatCurrency(stats.totalPaidAmount, stats.currency)}
        description={`${stats.paidReservations} reservations paid`}
        icon={CreditCard}
        className="[&>div>div>svg]:text-blue-600"
      />
      <StatsCard
        title="Unpaid Amount"
        value={formatCurrency(stats.totalUnpaidAmount, stats.currency)}
        description="Outstanding payments"
        icon={AlertCircle}
        className="[&>div>div>svg]:text-red-600"
      />
    </div>
  );
}
