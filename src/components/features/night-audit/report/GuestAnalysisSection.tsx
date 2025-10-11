'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, UserCheck } from 'lucide-react';
import { GuestDemographicsCharts } from '@/components/charts/night-audit/GuestDemographicsCharts';
import type { NightAudit } from '@/types/night-audit.types';

interface GuestAnalysisSectionProps {
  audit: NightAudit;
  currency?: string;
}

export function GuestAnalysisSection({
  audit,
  currency = 'ETB',
}: GuestAnalysisSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Safe defaults for numeric fields
  const totalGuests = audit.totalGuests || 0;
  const newGuests = audit.newGuests || 0;
  const returningGuests = audit.returningGuests || 0;
  const totalBookings = audit.totalBookings || 0;

  const newGuestRate = totalGuests > 0 ? (newGuests / totalGuests) * 100 : 0;
  const returningGuestRate =
    totalGuests > 0 ? (returningGuests / totalGuests) * 100 : 0;

  const stats = [
    {
      title: 'Total Guests',
      value: totalGuests.toString(),
      description: 'Checked in today',
      icon: Users,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'New Guests',
      value: newGuests.toString(),
      description: `${newGuestRate.toFixed(1)}% of total guests`,
      icon: UserPlus,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      title: 'Returning Guests',
      value: returningGuests.toString(),
      description: `${returningGuestRate.toFixed(1)}% of total guests`,
      icon: UserCheck,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
  ];

  // Calculate top spenders from guest ledger
  const topSpenders = (audit.guestLedger || [])
    .sort((a, b) => b.charges.totalAmount - a.charges.totalAmount)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Guest Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Comprehensive guest demographics with nationality, age groups, booking
          channels, and loyalty status
        </p>
      </div>

      {/* Guest KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Guest Demographics Charts */}
      {audit.guestDemographics && (
        <GuestDemographicsCharts
          demographics={audit.guestDemographics}
          currency={currency}
        />
      )}

      {/* Top Guests by Spend */}
      {topSpenders.length > 0 && (
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Guests by Spend</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                      Rank
                    </th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                      Guest
                    </th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                      Accommodation
                    </th>
                    <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                      Total Spend
                    </th>
                    <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                      Balance
                    </th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topSpenders.map((entry, index) => (
                    <tr
                      key={entry.bookingId}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="p-2 text-sm font-medium">{index + 1}</td>
                      <td className="p-2 text-sm">
                        <div>
                          <p className="font-medium">
                            {entry.primaryGuest.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.primaryGuest.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-2 text-sm">{entry.accommodation}</td>
                      <td className="p-2 text-sm text-right font-medium">
                        {formatCurrency(entry.charges.totalAmount)}
                      </td>
                      <td className="p-2 text-sm text-right">
                        <span
                          className={
                            entry.balance > 0
                              ? 'text-amber-600 font-medium'
                              : 'text-green-600'
                          }
                        >
                          {formatCurrency(entry.balance)}
                        </span>
                      </td>
                      <td className="p-2 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            entry.status === 'CHECKED_OUT'
                              ? 'bg-blue-600/10 text-blue-600'
                              : entry.status === 'CHECKED_IN'
                                ? 'bg-green-600/10 text-green-600'
                                : entry.status === 'CONFIRMED'
                                  ? 'bg-amber-600/10 text-amber-600'
                                  : 'bg-muted'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guest Acquisition Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Guest Acquisition</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-600/10">
                <p className="text-sm text-muted-foreground mb-1">New Guests</p>
                <p className="text-3xl font-bold text-green-600">{newGuests}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  First time visitors - {newGuestRate.toFixed(1)}% acquisition
                  rate
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-600/10">
                <p className="text-sm text-muted-foreground mb-1">
                  Returning Guests
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {returningGuests}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Repeat customers - {returningGuestRate.toFixed(1)}% retention
                  rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Guest Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">Total Guests</span>
                <span className="text-lg font-bold">{totalGuests}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">
                  Avg Guests per Booking
                </span>
                <span className="text-lg font-bold">
                  {totalBookings > 0
                    ? (totalGuests / totalBookings).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">
                  Unique Nationalities
                </span>
                <span className="text-lg font-bold">
                  {audit.guestDemographics?.byNationality?.length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
