'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { PreviousDayComparison } from '@/types/night-audit.types';

interface OccupancyComparisonChartProps {
  current: {
    roomOccupancyRate: number;
    bedOccupancyRate: number;
    totalBookings: number;
    checkIns: number;
    checkOuts: number;
  };
  previous: PreviousDayComparison | null;
}

export function OccupancyComparisonChart({
  current,
  previous,
}: OccupancyComparisonChartProps) {
  if (!previous) {
    return (
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Day-over-Day Comparison</CardTitle>
          <CardDescription>
            No previous day data available for comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Run night audit for previous day to enable comparison
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    {
      metric: 'Room Occ %',
      current: current.roomOccupancyRate,
      previous: previous.roomOccupancyRate,
    },
    {
      metric: 'Bed Occ %',
      current: current.bedOccupancyRate,
      previous: previous.bedOccupancyRate,
    },
  ];

  const renderTrendIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;

    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowUp className="h-4 w-4" />
          <span className="text-sm font-medium">
            +{percentChange.toFixed(1)}%
          </span>
        </div>
      );
    } else if (diff < 0) {
      return (
        <div className="flex items-center gap-1 text-destructive">
          <ArrowDown className="h-4 w-4" />
          <span className="text-sm font-medium">
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

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Day-over-Day Comparison</CardTitle>
        <CardDescription>
          Current day vs {new Date(previous.businessDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.3}
            />
            <XAxis
              dataKey="metric"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              formatter={(value: number) => `${Number(value).toFixed(1)}%`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar
              dataKey="current"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              name="Current Day"
            />
            <Bar
              dataKey="previous"
              fill="hsl(var(--muted))"
              radius={[8, 8, 0, 0]}
              name="Previous Day"
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Room Occupancy</p>
            <p className="text-lg font-semibold">
              {current.roomOccupancyRate.toFixed(1)}%
            </p>
            {renderTrendIndicator(
              current.roomOccupancyRate,
              previous.roomOccupancyRate,
            )}
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Bed Occupancy</p>
            <p className="text-lg font-semibold">
              {current.bedOccupancyRate.toFixed(1)}%
            </p>
            {renderTrendIndicator(
              current.bedOccupancyRate,
              previous.bedOccupancyRate,
            )}
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Total Bookings</p>
            <p className="text-lg font-semibold">{current.totalBookings}</p>
            {renderTrendIndicator(
              current.totalBookings,
              previous.totalBookings,
            )}
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Check-ins</p>
            <p className="text-lg font-semibold">{current.checkIns}</p>
            {renderTrendIndicator(current.checkIns, previous.checkIns)}
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Check-outs</p>
            <p className="text-lg font-semibold">{current.checkOuts}</p>
            {renderTrendIndicator(current.checkOuts, previous.checkOuts)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
