'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { NightAudit } from '@/types/night-audit.types';

interface ComparisonSectionProps {
  audit: NightAudit;
  currency?: string;
}

export function ComparisonSection({
  audit,
  currency = 'ETB',
}: ComparisonSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderTrendIndicator = (
    current: number,
    previous: number,
    isCurrency = false,
  ) => {
    const diff = current - previous;
    const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;

    if (diff > 0) {
      return (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-green-600">
            <ArrowUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isCurrency
                ? formatCurrency(Math.abs(diff))
                : Math.abs(diff).toFixed(0)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            +{percentChange.toFixed(1)}%
          </span>
        </div>
      );
    } else if (diff < 0) {
      return (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-destructive">
            <ArrowDown className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isCurrency
                ? formatCurrency(Math.abs(diff))
                : Math.abs(diff).toFixed(0)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {percentChange.toFixed(1)}%
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span className="text-sm font-medium">No change</span>
      </div>
    );
  };

  if (!audit.previousDayComparison) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Day-over-Day Comparison</h2>
          <p className="text-sm text-muted-foreground">
            Previous day data not available for comparison
          </p>
        </div>
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Run night audit for previous day to enable comparison
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const prev = audit.previousDayComparison;

  // Safe defaults for numeric fields
  const totalRevenue = Number(audit.totalRevenue) || 0;
  const netRevenue = Number(audit.netRevenue) || 0;
  const netAfterCommission = Number(audit.netAfterCommission) || 0;
  const roomOccupancyRate = Number(audit.roomOccupancyRate) || 0;
  const bedOccupancyRate = Number(audit.bedOccupancyRate) || 0;
  const totalBookings = audit.totalBookings || 0;
  const checkIns = audit.checkIns || 0;
  const checkOuts = audit.checkOuts || 0;
  const totalGuests = audit.totalGuests || 0;
  const newGuests = audit.newGuests || 0;

  const comparisonMetrics = [
    {
      category: 'Revenue Metrics',
      metrics: [
        {
          label: 'Total Revenue',
          current: totalRevenue,
          previous: prev.totalRevenue,
          isCurrency: true,
        },
        {
          label: 'Net Revenue',
          current: netRevenue,
          previous: prev.netRevenue,
          isCurrency: true,
        },
        {
          label: 'Net After Commission',
          current: netAfterCommission,
          previous: prev.netAfterCommission,
          isCurrency: true,
        },
      ],
    },
    {
      category: 'Occupancy Metrics',
      metrics: [
        {
          label: 'Room Occupancy Rate',
          current: roomOccupancyRate,
          previous: prev.roomOccupancyRate,
          isCurrency: false,
          suffix: '%',
        },
        {
          label: 'Bed Occupancy Rate',
          current: bedOccupancyRate,
          previous: prev.bedOccupancyRate,
          isCurrency: false,
          suffix: '%',
        },
      ],
    },
    {
      category: 'Booking Activity',
      metrics: [
        {
          label: 'Total Bookings',
          current: totalBookings,
          previous: prev.totalBookings,
          isCurrency: false,
        },
        {
          label: 'Check-ins',
          current: checkIns,
          previous: prev.checkIns,
          isCurrency: false,
        },
        {
          label: 'Check-outs',
          current: checkOuts,
          previous: prev.checkOuts,
          isCurrency: false,
        },
      ],
    },
    {
      category: 'Guest Metrics',
      metrics: [
        {
          label: 'Total Guests',
          current: totalGuests,
          previous: prev.totalGuests,
          isCurrency: false,
        },
        {
          label: 'New Guests',
          current: newGuests,
          previous: prev.newGuests,
          isCurrency: false,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Day-over-Day Comparison</h2>
        <p className="text-sm text-muted-foreground">
          Current day vs {new Date(prev.businessDate).toLocaleDateString()} •
          Detailed metric comparison
        </p>
      </div>

      {comparisonMetrics.map((category) => (
        <Card key={category.category} className="bg-card border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
            <div className="space-y-3">
              {category.metrics.map((metric) => (
                <div key={metric.label} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        {metric.label}
                      </p>
                      <div className="flex items-baseline gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Current
                          </p>
                          <p className="text-xl font-bold">
                            {metric.isCurrency
                              ? formatCurrency(metric.current)
                              : metric.current.toFixed(metric.suffix ? 1 : 0)}
                            {metric.suffix || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Previous
                          </p>
                          <p className="text-lg font-medium text-muted-foreground">
                            {metric.isCurrency
                              ? formatCurrency(metric.previous)
                              : metric.previous.toFixed(metric.suffix ? 1 : 0)}
                            {metric.suffix || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {renderTrendIndicator(
                        metric.current,
                        metric.previous,
                        metric.isCurrency,
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Key Insights */}
      <Card className="bg-primary/10 border-primary/20 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Key Insights
          </h3>
          <ul className="space-y-2">
            {totalRevenue > prev.totalRevenue && (
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>
                  Revenue increased by{' '}
                  {formatCurrency(totalRevenue - prev.totalRevenue)} (
                  {(
                    ((totalRevenue - prev.totalRevenue) / prev.totalRevenue) *
                    100
                  ).toFixed(1)}
                  % growth)
                </span>
              </li>
            )}
            {roomOccupancyRate > prev.roomOccupancyRate && (
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>
                  Room occupancy improved by{' '}
                  {(roomOccupancyRate - prev.roomOccupancyRate).toFixed(1)}{' '}
                  percentage points
                </span>
              </li>
            )}
            {totalBookings > prev.totalBookings && (
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>
                  Bookings increased by {totalBookings - prev.totalBookings} (
                  {(
                    ((totalBookings - prev.totalBookings) /
                      prev.totalBookings) *
                    100
                  ).toFixed(1)}
                  % more bookings)
                </span>
              </li>
            )}
            {newGuests > prev.newGuests && (
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>
                  New guest acquisition increased by{' '}
                  {newGuests - prev.newGuests} guests
                </span>
              </li>
            )}
            {totalRevenue < prev.totalRevenue && (
              <li className="flex items-start gap-2 text-sm">
                <span className="text-amber-600 mt-0.5">!</span>
                <span>
                  Revenue decreased by{' '}
                  {formatCurrency(prev.totalRevenue - totalRevenue)} compared to
                  previous day
                </span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
