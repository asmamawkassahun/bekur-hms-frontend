import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Users, Star } from 'lucide-react';

interface GuestStatsCardsProps {
  stats: {
    totalGuests: number;
    vipGuests: number;
    newThisMonth: number;
    activeGuests: number;
  };
}

export function GuestStatsCards({ stats }: GuestStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Guests"
        value={stats.totalGuests}
        description="All registered guests"
        icon={Users}
        gradient="blue"
      />
      <StatsCard
        title="VIP Guests"
        value={stats.vipGuests}
        description="Platinum members"
        icon={Star}
        gradient="rose"
      />
      <StatsCard
        title="New This Month"
        value={stats.newThisMonth}
        description="New registrations"
        icon={Users}
        gradient="green"
      />
      <StatsCard
        title="Active Guests"
        value={stats.activeGuests}
        description="Currently active"
        icon={Users}
        gradient="violet"
      />
    </div>
  );
}
