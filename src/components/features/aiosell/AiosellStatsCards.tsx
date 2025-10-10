import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Globe, RefreshCw, CheckCircle } from 'lucide-react';

interface AiosellStatsCardsProps {
  connectedProperties: number;
}

export function AiosellStatsCards({
  connectedProperties,
}: AiosellStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Connected Properties"
        value={connectedProperties}
        icon={Globe}
        description="Properties syncing with Aiosell"
      />
      <StatsCard
        title="Auto Sync"
        value="Active"
        icon={RefreshCw}
        description="Real-time inventory sync enabled"
        valueClassName="text-green-600"
      />
      <StatsCard
        title="Connected OTAs"
        value="6+"
        icon={CheckCircle}
        description="Booking.com, Expedia, Agoda, etc."
      />
    </div>
  );
}
