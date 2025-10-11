'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, LogIn, LogOut, XCircle, AlertTriangle } from 'lucide-react';
import { BookingAnalysisChart } from '@/components/charts/night-audit/BookingAnalysisChart';
import type { NightAudit } from '@/types/night-audit.types';

interface OperationalAnalysisSectionProps {
  audit: NightAudit;
}

export function OperationalAnalysisSection({
  audit,
}: OperationalAnalysisSectionProps) {
  // Safe defaults for numeric fields
  const totalBookings = audit.totalBookings || 0;
  const checkIns = audit.checkIns || 0;
  const checkOuts = audit.checkOuts || 0;
  const cancellations = audit.cancellations || 0;
  const noShows = audit.noShows || 0;

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings.toString(),
      description: 'Created today',
      icon: Calendar,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Check-ins',
      value: checkIns.toString(),
      description: 'Guests arrived',
      icon: LogIn,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      title: 'Check-outs',
      value: checkOuts.toString(),
      description: 'Guests departed',
      icon: LogOut,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      title: 'Cancellations',
      value: cancellations.toString(),
      description: 'Bookings cancelled',
      icon: XCircle,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'No-shows',
      value: noShows.toString(),
      description: 'Did not arrive',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-600/10',
    },
  ];

  const totalIssues = cancellations + noShows;
  const issueRate = totalBookings > 0 ? (totalIssues / totalBookings) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Operational Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Daily booking operations with check-in/check-out activity and issue
          tracking
        </p>
      </div>

      {/* Operational Status Banner */}
      {totalIssues > 0 && (
        <Card className="bg-amber-600/10 border-amber-600/20 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  {totalIssues} Issues Detected
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {cancellations} cancellations and {noShows} no-shows (
                  {issueRate.toFixed(1)}% issue rate)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operational KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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

      {/* Booking Analysis Chart */}
      <BookingAnalysisChart
        checkIns={checkIns}
        checkOuts={checkOuts}
        cancellations={cancellations}
        noShows={noShows}
        totalBookings={totalBookings}
      />

      {/* Booking Type Breakdown */}
      {audit.bookingBreakdown?.byType &&
        Object.keys(audit.bookingBreakdown.byType).length > 0 && (
          <Card className="bg-card border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Bookings by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(audit.bookingBreakdown.byType).map(
                  ([type, data]) => (
                    <div key={type} className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm font-medium text-muted-foreground">
                        {type}
                      </p>
                      <p className="text-2xl font-bold mt-1">{data.count}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalBookings > 0
                          ? ((data.count / totalBookings) * 100).toFixed(1)
                          : 0}
                        % of bookings
                      </p>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Accommodation Type Split */}
      {audit.bookingBreakdown?.byAccommodation && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Room Bookings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Count</span>
                  <span className="text-2xl font-bold">
                    {audit.bookingBreakdown.byAccommodation.ROOM?.count || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'ETB',
                      minimumFractionDigits: 0,
                    }).format(
                      audit.bookingBreakdown.byAccommodation.ROOM?.revenue || 0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    % of Total
                  </span>
                  <span className="text-lg font-semibold">
                    {totalBookings > 0
                      ? (
                          ((audit.bookingBreakdown.byAccommodation.ROOM
                            ?.count || 0) /
                            totalBookings) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bed Bookings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Count</span>
                  <span className="text-2xl font-bold">
                    {audit.bookingBreakdown.byAccommodation.BED?.count || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'ETB',
                      minimumFractionDigits: 0,
                    }).format(
                      audit.bookingBreakdown.byAccommodation.BED?.revenue || 0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    % of Total
                  </span>
                  <span className="text-lg font-semibold">
                    {totalBookings > 0
                      ? (
                          ((audit.bookingBreakdown.byAccommodation.BED?.count ||
                            0) /
                            totalBookings) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Discrepancies Section */}
      {audit.discrepancies && audit.discrepancies.length > 0 && (
        <Card className="bg-destructive/10 border-destructive/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Discrepancies Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {audit.discrepancies.map((discrepancy, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>{discrepancy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
