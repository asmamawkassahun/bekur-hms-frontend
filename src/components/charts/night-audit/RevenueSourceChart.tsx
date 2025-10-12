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

interface RevenueSourceChartProps {
  data: HourlyRevenueData[];
  currency?: string;
}

export function RevenueSourceChart({
  data,
  currency = 'ETB',
}: RevenueSourceChartProps) {
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
          <CardTitle>Revenue Source Analysis</CardTitle>
          <CardDescription>No hourly data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No revenue source data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRoomRevenue = data.reduce(
    (sum, curr) => sum + curr.roomRevenue,
    0,
  );
  const totalBedRevenue = data.reduce((sum, curr) => sum + curr.bedRevenue, 0);
  const totalRevenue = totalRoomRevenue + totalBedRevenue;

  const roomPercentage =
    totalRevenue > 0 ? (totalRoomRevenue / totalRevenue) * 100 : 0;
  const bedPercentage =
    totalRevenue > 0 ? (totalBedRevenue / totalRevenue) * 100 : 0;

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Revenue Source Analysis</CardTitle>
        <CardDescription>
          Room vs Bed revenue distribution throughout the day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[hsl(142,76%,36%)]" />
              <p className="text-xs text-muted-foreground">Room Revenue</p>
            </div>
            <p className="text-lg font-semibold">
              {formatCurrency(totalRoomRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {roomPercentage.toFixed(1)}% of total
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[hsl(38,92%,50%)]" />
              <p className="text-xs text-muted-foreground">Bed Revenue</p>
            </div>
            <p className="text-lg font-semibold">
              {formatCurrency(totalBedRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {bedPercentage.toFixed(1)}% of total
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRoomRev" x1="0" y1="0" x2="0" y2="1">
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
              <linearGradient id="colorBedRev" x1="0" y1="0" x2="0" y2="1">
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
                  name === 'roomRevenue' ? 'Room Revenue' : 'Bed Revenue';
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
              dataKey="roomRevenue"
              stackId="1"
              stroke="hsl(142, 76%, 36%)"
              fillOpacity={1}
              fill="url(#colorRoomRev)"
              strokeWidth={2}
              name="Room Revenue"
            />
            <Area
              type="monotone"
              dataKey="bedRevenue"
              stackId="1"
              stroke="hsl(38, 92%, 50%)"
              fillOpacity={1}
              fill="url(#colorBedRev)"
              strokeWidth={2}
              name="Bed Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
