'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { OccupancyTrendChart } from './OccupancyTrendChart';
import { Bed, Users, TrendingUp, Calendar } from 'lucide-react';
import type { OccupancyReportData } from '@/types/report.types';

interface OccupancyReportViewProps {
  data: OccupancyReportData;
}

export function OccupancyReportView({ data }: OccupancyReportViewProps) {
  // Handle case where data might be undefined or have different structure
  if (!data) {
    return <div>No data available</div>;
  }

  // Handle different possible data structures
  const summary = data.summary || data;
  const dailyData = data.dailyData || [];
  const charts = data.charts || {};

  // Handle case where summary might be undefined or empty
  if (
    !summary ||
    (typeof summary === 'object' && Object.keys(summary).length === 0)
  ) {
    return <div>Summary data not available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Rooms"
          value={summary.totalRooms || 0}
          description={`${summary.totalRoomNights || 0} room nights`}
          icon={Bed}
          gradient="violet"
        />

        <StatsCard
          title="Total Beds"
          value={summary.totalBeds || 0}
          description={`${summary.totalBedNights || 0} bed nights`}
          icon={Users}
          gradient="blue"
        />

        <StatsCard
          title="Room Occupancy"
          value={`${(summary.roomOccupancyRate || 0).toFixed(1)}%`}
          description={`Avg: ${(summary.averageRoomOccupancy || 0).toFixed(1)}%`}
          icon={TrendingUp}
          gradient="green"
        />

        <StatsCard
          title="Bed Occupancy"
          value={`${(summary.bedOccupancyRate || 0).toFixed(1)}%`}
          description={`Avg: ${(summary.averageBedOccupancy || 0).toFixed(1)}%`}
          icon={Calendar}
          gradient="yellow"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {charts?.occupancyTrend ? (
            <OccupancyTrendChart data={charts.occupancyTrend} />
          ) : (
            <div className="text-center text-muted-foreground">
              Chart data not available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Occupancy Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-right p-2">Occupied Rooms</th>
                  <th className="text-right p-2">Room %</th>
                  <th className="text-right p-2">Occupied Beds</th>
                  <th className="text-right p-2">Bed %</th>
                </tr>
              </thead>
              <tbody>
                {dailyData && dailyData.length > 0 ? (
                  dailyData.map((day, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{day.date || 'N/A'}</td>
                      <td className="text-right p-2">
                        {day.occupiedRooms || 0}
                      </td>
                      <td className="text-right p-2">
                        {(day.roomOccupancyRate || 0).toFixed(1)}%
                      </td>
                      <td className="text-right p-2">
                        {day.occupiedBeds || 0}
                      </td>
                      <td className="text-right p-2">
                        {(day.bedOccupancyRate || 0).toFixed(1)}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-muted-foreground p-4"
                    >
                      No daily data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
