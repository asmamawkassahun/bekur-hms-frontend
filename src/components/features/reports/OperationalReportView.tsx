'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, Users, XCircle, CheckCircle } from 'lucide-react';
import type { OperationalReportData } from '@/types/report.types';

interface OperationalReportViewProps {
  data: OperationalReportData;
}

export function OperationalReportView({ data }: OperationalReportViewProps) {
  // Handle case where data might be undefined or have different structure
  if (!data) {
    return <div>No data available</div>;
  }

  // Handle different possible data structures
  const summary = data.summary || data;
  const arrivals = data.arrivals || [];
  const departures = data.departures || [];
  const currentGuests = data.currentGuests || [];
  const noShows = data.noShows || [];
  const housekeepingStatus = data.housekeepingStatus || [];

  // Handle case where summary might be undefined or empty
  if (!summary || (typeof summary === 'object' && Object.keys(summary).length === 0)) {
    return <div>Summary data not available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Arrivals"
          value={summary.totalArrivals || 0}
          icon={ArrowUpCircle}
          gradient="green"
        />

        <StatsCard
          title="Departures"
          value={summary.totalDepartures || 0}
          icon={ArrowDownCircle}
          gradient="blue"
        />

        <StatsCard
          title="Current Guests"
          value={summary.currentGuests || 0}
          icon={Users}
          gradient="violet"
        />

        <StatsCard
          title="No Shows"
          value={summary.noShows || 0}
          icon={XCircle}
          gradient="rose"
        />

        <StatsCard
          title="Housekeeping Completed"
          value={summary.housekeepingTasksCompleted || 0}
          description={`${summary.housekeepingTasksPending || 0} pending`}
          icon={CheckCircle}
          gradient="yellow"
        />
      </div>

      {/* Housekeeping Status */}
      <Card>
        <CardHeader>
          <CardTitle>Housekeeping Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(housekeepingStatus || []).map((status, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{status.count}</div>
                <div className="text-sm text-muted-foreground">{status.status}</div>
                <div className="text-xs text-muted-foreground">{status.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(arrivals || []).map((arrival) => (
                <div key={arrival.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{arrival.guestName}</div>
                    <div className="text-sm text-muted-foreground">Room {arrival.roomNumber}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{arrival.status}</Badge>
                    <div className="text-xs text-muted-foreground">
                      {arrival.checkIn ? new Date(arrival.checkIn).toLocaleTimeString() : 'TBD'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Departures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(departures || []).map((departure) => (
                <div key={departure.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{departure.guestName}</div>
                    <div className="text-sm text-muted-foreground">Room {departure.roomNumber}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{departure.status}</Badge>
                    <div className="text-xs text-muted-foreground">
                      {departure.checkOut ? new Date(departure.checkOut).toLocaleTimeString() : 'TBD'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(currentGuests || []).map((guest) => (
                <div key={guest.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{guest.guestName}</div>
                    <div className="text-sm text-muted-foreground">Room {guest.roomNumber}</div>
                  </div>
                  <Badge variant="outline">{guest.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>No Shows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(noShows || []).map((noShow) => (
                <div key={noShow.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{noShow.guestName}</div>
                    <div className="text-sm text-muted-foreground">Room {noShow.roomNumber}</div>
                  </div>
                  <Badge variant="destructive">{noShow.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

