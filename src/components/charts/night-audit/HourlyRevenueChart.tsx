'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HourlyRevenueData } from '@/types/night-audit.types';

interface HourlyRevenueChartProps {
  data: HourlyRevenueData[];
  currency?: string;
}

export function HourlyRevenueChart({
  data,
  currency = 'ETB',
}: HourlyRevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  // Handle undefined/null/empty data
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Hourly Revenue Breakdown</CardTitle>
          <CardDescription>No hourly data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No hourly revenue data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find peak revenue hour
  const peakHour = data.reduce(
    (max, curr) => (curr.revenue > max.revenue ? curr : max),
    data[0] || { revenue: 0, hour: 0 },
  );

  const totalRevenue = data.reduce((sum, curr) => sum + curr.revenue, 0);

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Hourly Revenue Breakdown</CardTitle>
        <CardDescription>
          Revenue distribution throughout the day • Peak:{' '}
          {formatHour(peakHour?.hour || 0)} (
          {formatCurrency(peakHour?.revenue || 0)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Revenue: </span>
            <span className="font-semibold">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="colorTotalRevenue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorRoomRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorBedRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(38, 92%, 50%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(38, 92%, 50%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.3}
            />
            <XAxis
              dataKey="hour"
              tickFormatter={formatHour}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tickFormatter={formatCurrency}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const label =
                  name === 'revenue'
                    ? 'Total Revenue'
                    : name === 'roomRevenue'
                      ? 'Room Revenue'
                      : 'Bed Revenue';
                return [formatCurrency(value), label];
              }}
              labelFormatter={(hour: number) => `Time: ${formatHour(hour)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorTotalRevenue)"
              strokeWidth={2}
              name="Total Revenue"
            />
            <Area
              type="monotone"
              dataKey="roomRevenue"
              stroke="hsl(142, 76%, 36%)"
              fillOpacity={1}
              fill="url(#colorRoomRevenue)"
              strokeWidth={1.5}
              name="Room Revenue"
            />
            <Area
              type="monotone"
              dataKey="bedRevenue"
              stroke="hsl(38, 92%, 50%)"
              fillOpacity={1}
              fill="url(#colorBedRevenue)"
              strokeWidth={1.5}
              name="Bed Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
