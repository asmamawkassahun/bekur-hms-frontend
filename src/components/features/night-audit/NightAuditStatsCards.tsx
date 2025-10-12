import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { StatsCard } from '@/components/shared/StatsCard';
import { DollarSign, CreditCard, Home, Bed } from 'lucide-react';

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
      value: Number(audit.netRevenue).toLocaleString(),
      description: `After commission: ${Number(audit.netAfterCommission).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: 'Total Payments',
      value: Number(audit.totalPayments).toLocaleString(),
      description: `Refunds: ${Number(audit.totalRefunds).toLocaleString()}`,
      icon: CreditCard,
    },
    {
      title: 'Room Occupancy',
      value: `${Number(audit.roomOccupancyRate).toFixed(1)}%`,
      description: `${audit.occupiedRooms}/${audit.totalRooms} occupied`,
      icon: Home,
    },
    {
      title: 'Bed Occupancy',
      value: `${Number(audit.bedOccupancyRate).toFixed(1)}%`,
      description: `${audit.occupiedBeds}/${audit.totalBeds} occupied`,
      icon: Bed,
    },
  ];

  const gradients = ['green', 'blue', 'violet', 'yellow'] as const;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, index) => (
        <StatsCard
          key={s.title}
          title={s.title}
          value={s.value}
          description={s.description}
          icon={s.icon}
          gradient={gradients[index % gradients.length]}
        />
      ))}
    </div>
  );
}


