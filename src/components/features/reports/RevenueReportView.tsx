'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueTrendChart } from './RevenueTrendChart';
import { RevenueByMethodChart } from './RevenueByMethodChart';
import { RevenueByRoomTypeChart } from './RevenueByRoomTypeChart';
import type { RevenueReportData } from '@/types/report.types';

interface RevenueReportViewProps {
  data: RevenueReportData;
}

export function RevenueReportView({ data }: RevenueReportViewProps) {
  // Handle case where data might be undefined or have different structure
  if (!data) {
    return <div>No data available</div>;
  }

  // Debug: Log the actual data structure
  console.log('RevenueReportView received data:', data);

  // Handle different possible data structures
  const summary = data.summary || data;
  const dailyData = data.dailyData || [];
  const revenueByMethod = data.revenueByMethod || [];
  const revenueByRoomType = data.revenueByRoomType || [];
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalReservations || 0} reservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg per Reservation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.averageRevenuePerReservation || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.averageDailyRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalReservations || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.revenueTrend ? (
              <RevenueTrendChart data={charts.revenueTrend} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available for chart
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.revenueByMethod ? (
              <RevenueByMethodChart data={charts.revenueByMethod} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available for chart
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Room Type</CardTitle>
        </CardHeader>
        <CardContent>
          {charts?.revenueByRoomType ? (
            <RevenueByRoomTypeChart data={charts.revenueByRoomType} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for chart
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Breakdown Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueByMethod.map((method, index) => {
                const amount = typeof method.amount === 'number' ? method.amount : (Number(method.amount) || 0);
                const percentage = typeof method.percentage === 'number' ? method.percentage : (Number(method.percentage) || 0);
                
                return (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{method.method}</span>
                    <div className="text-right">
                      <div className="font-bold">
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'ETB' 
                        }).format(amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Room Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueByRoomType.map((type, index) => {
                const amount = typeof type.amount === 'number' ? type.amount : (Number(type.amount) || 0);
                const percentage = typeof type.percentage === 'number' ? type.percentage : (Number(type.percentage) || 0);
                
                return (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{type.type}</span>
                    <div className="text-right">
                      <div className="font-bold">
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'ETB' 
                        }).format(amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

