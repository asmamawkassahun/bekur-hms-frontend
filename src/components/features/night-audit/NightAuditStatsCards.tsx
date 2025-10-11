import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { StatsCard } from '@/components/shared/StatsCard';

interface NightAuditStatsCardsProps {
  auditId?: string;
}

export function NightAuditStatsCards({ auditId }: NightAuditStatsCardsProps) {
  const { items, current } = useSelector((s: RootState) => s.nightAudit);
  const audit = auditId ? items.find((a) => a.id === auditId) : current || items[0];

  if (!audit) return null;

  const stats = [
    {
      title: 'Net Revenue',
      value: audit.netRevenue,
      helper: `After commission: ${audit.netAfterCommission.toLocaleString()}`,
    },
    {
      title: 'Total Payments',
      value: audit.totalPayments,
      helper: `Refunds: ${audit.totalRefunds.toLocaleString()}`,
    },
    {
      title: 'Room Occupancy',
      value: `${audit.roomOccupancyRate.toFixed(1)}%`,
      helper: `${audit.occupiedRooms}/${audit.totalRooms} occupied`,
    },
    {
      title: 'Bed Occupancy',
      value: `${audit.bedOccupancyRate.toFixed(1)}%`,
      helper: `${audit.occupiedBeds}/${audit.totalBeds} occupied`,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <StatsCard key={s.title} title={s.title} value={s.value} helper={s.helper} />
      ))}
    </div>
  );
}


