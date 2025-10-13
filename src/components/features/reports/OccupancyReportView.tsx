'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OccupancyTrendChart } from './OccupancyTrendChart';
import type { OccupancyReportData } from '@/types/report.types';

interface OccupancyReportViewProps {
  data: OccupancyReportData;
}

export function OccupancyReportView({ data }: OccupancyReportViewProps) {
  // Handle case where data might be undefined or have different structure
  if (!data) {
    return <div>No data available</div>;
  }

  // Debug: Log the actual data structure
  console.log('OccupancyReportView received data:', data);

  // Handle different possible data structures
  const summary = data.summary || data;
  const dailyData = data.dailyData || [];
  const charts = data.charts || {};

  // Handle case where summary might be undefined or empty
  if (!summary || (typeof summary === 'object' && Object.keys(summary).length === 0)) {
    return <div>Summary data not available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRooms || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalRoomNights || 0} room nights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBeds || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalBedNights || 0} bed nights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Room Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary.roomOccupancyRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Avg: {(summary.averageRoomOccupancy || 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary.bedOccupancyRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Avg: {(summary.averageBedOccupancy || 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
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
            <div className="text-center text-muted-foreground">Chart data not available</div>
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
                      <td className="p-2">{day.date || day.period || 'N/A'}</td>
                      <td className="text-right p-2">{day.occupiedRooms || 0}</td>
                      <td className="text-right p-2">{(day.roomOccupancyRate || 0).toFixed(1)}%</td>
                      <td className="text-right p-2">{day.occupiedBeds || 0}</td>
                      <td className="text-right p-2">{(day.bedOccupancyRate || 0).toFixed(1)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground p-4">
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
