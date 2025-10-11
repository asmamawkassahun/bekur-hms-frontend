'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';
import { HourlyRevenueChart } from '@/components/charts/night-audit/HourlyRevenueChart';
import { RevenueSourceChart } from '@/components/charts/night-audit/RevenueSourceChart';
import type { NightAudit } from '@/types/night-audit.types';

interface RevenueAnalysisSectionProps {
  audit: NightAudit;
  currency?: string;
}

export function RevenueAnalysisSection({
  audit,
  currency = 'ETB',
}: RevenueAnalysisSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Safe defaults for numeric fields
  const totalRevenue = Number(audit.totalRevenue) || 0;
  const roomRevenue = Number(audit.roomRevenue) || 0;
  const bedRevenue = Number(audit.bedRevenue) || 0;
  const totalBookings = audit.totalBookings || 0;

  const roomRevenuePercent =
    totalRevenue > 0 ? (roomRevenue / totalRevenue) * 100 : 0;
  const bedRevenuePercent =
    totalRevenue > 0 ? (bedRevenue / totalRevenue) * 100 : 0;

  const avgRevenuePerBooking =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Calculate revenue growth if previous day data exists
  const revenueGrowth = audit.previousDayComparison
    ? ((totalRevenue - audit.previousDayComparison.totalRevenue) /
        audit.previousDayComparison.totalRevenue) *
      100
    : null;

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      description:
        revenueGrowth !== null
          ? `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs yesterday`
          : 'Day-end total',
      icon: DollarSign,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Room Revenue',
      value: formatCurrency(roomRevenue),
      description: `${roomRevenuePercent.toFixed(1)}% of total revenue`,
      icon: TrendingUp,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      title: 'Bed Revenue',
      value: formatCurrency(bedRevenue),
      description: `${bedRevenuePercent.toFixed(1)}% of total revenue`,
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      title: 'Avg Revenue per Booking',
      value: formatCurrency(avgRevenuePerBooking),
      description: `From ${totalBookings} bookings`,
      icon: DollarSign,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-600/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Revenue Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Hourly revenue breakdown with source analysis and booking performance
        </p>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-card border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hourly Revenue Chart */}
      {audit.hourlyRevenue && audit.hourlyRevenue.length > 0 && (
        <HourlyRevenueChart data={audit.hourlyRevenue} currency={currency} />
      )}

      {/* Revenue Source Chart */}
      {audit.hourlyRevenue && audit.hourlyRevenue.length > 0 && (
        <RevenueSourceChart data={audit.hourlyRevenue} currency={currency} />
      )}

      {/* Revenue by Booking Source */}
      {audit.bookingBreakdown?.bySource &&
        Object.keys(audit.bookingBreakdown.bySource).length > 0 && (
          <Card className="bg-card border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue by Booking Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                        Source
                      </th>
                      <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                        Bookings
                      </th>
                      <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                        Revenue
                      </th>
                      <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                        Commission
                      </th>
                      <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                        Net Revenue
                      </th>
                      <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(audit.bookingBreakdown.bySource)
                      .sort(([, a], [, b]) => b.revenue - a.revenue)
                      .map(([source, data]) => (
                        <tr key={source} className="border-b hover:bg-muted/30">
                          <td className="p-2 text-sm font-medium">{source}</td>
                          <td className="p-2 text-sm text-right">
                            {data.count}
                          </td>
                          <td className="p-2 text-sm text-right font-medium">
                            {formatCurrency(data.revenue)}
                          </td>
                          <td className="p-2 text-sm text-right text-destructive">
                            {formatCurrency(data.commission)}
                          </td>
                          <td className="p-2 text-sm text-right font-medium text-green-600">
                            {formatCurrency(data.netRevenue)}
                          </td>
                          <td className="p-2 text-sm text-right text-muted-foreground">
                            {totalRevenue > 0
                              ? ((data.revenue / totalRevenue) * 100).toFixed(1)
                              : 0}
                            %
                          </td>
                        </tr>
                      ))}
                    <tr className="border-b bg-muted/30 font-semibold">
                      <td className="p-2 text-sm">Total</td>
                      <td className="p-2 text-sm text-right">
                        {Object.values(audit.bookingBreakdown.bySource).reduce(
                          (sum, d) => sum + d.count,
                          0,
                        )}
                      </td>
                      <td className="p-2 text-sm text-right">
                        {formatCurrency(totalRevenue)}
                      </td>
                      <td className="p-2 text-sm text-right text-destructive">
                        {formatCurrency(Number(audit.totalCommission) || 0)}
                      </td>
                      <td className="p-2 text-sm text-right text-green-600">
                        {formatCurrency(Number(audit.netAfterCommission) || 0)}
                      </td>
                      <td className="p-2 text-sm text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
