import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { BadgePercent, CalendarRange, Layers3, Power } from 'lucide-react';
import type { PricingRule } from '@/types';

interface PricingStatsCardsProps {
  rules: PricingRule[];
}

export function PricingStatsCards({ rules }: PricingStatsCardsProps) {
  const totalRules = rules.length;
  const activeRules = rules.filter((r) => r.isActive).length;
  const seasonalRules = rules.filter((r) => r.type === 'SEASONAL').length;
  const discountRules = rules.filter((r) =>
    ['PROMOTIONAL', 'EARLY_BIRD', 'LAST_MINUTE', 'PACKAGE'].includes(r.type),
  ).length;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Rules"
        value={totalRules}
        description="All pricing rules"
        icon={Layers3}
      />
      <StatsCard
        title="Active Rules"
        value={activeRules}
        description="Currently applied"
        icon={Power}
      />
      <StatsCard
        title="Seasonal"
        value={seasonalRules}
        description="Season multipliers"
        icon={CalendarRange}
      />
      <StatsCard
        title="Discount Rules"
        value={discountRules}
        description="Promo & deals"
        icon={BadgePercent}
      />
    </div>
  );
}


