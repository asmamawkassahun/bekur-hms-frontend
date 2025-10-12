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
import type { HourlyOccupancyData } from '@/types/night-audit.types';

interface HourlyOccupancyChartProps {
  data: HourlyOccupancyData[];
}

export function HourlyOccupancyChart({ data }: HourlyOccupancyChartProps) {
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
          <CardTitle>Hourly Occupancy Trends</CardTitle>
          <CardDescription>No hourly data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No hourly occupancy data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find peak occupancy hour
  const peakRoomHour = data.reduce(
    (max, curr) =>
      curr.roomOccupancyRate > max.roomOccupancyRate ? curr : max,
    data[0] || { roomOccupancyRate: 0, hour: 0 },
  );

  const avgRoomOccupancy =
    data.reduce((sum, curr) => sum + curr.roomOccupancyRate, 0) / data.length;
  const avgBedOccupancy =
    data.reduce((sum, curr) => sum + curr.bedOccupancyRate, 0) / data.length;

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Hourly Occupancy Trends</CardTitle>
        <CardDescription>
          Room and bed occupancy rates throughout the day • Peak:{' '}
          {formatHour(peakRoomHour.hour)} (
          {peakRoomHour.roomOccupancyRate.toFixed(1)}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Avg Room Occupancy: </span>
            <span className="font-semibold">
              {avgRoomOccupancy.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Bed Occupancy: </span>
            <span className="font-semibold">{avgBedOccupancy.toFixed(1)}%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="colorRoomOccupancy"
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
              <linearGradient
                id="colorBedOccupancy"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const label =
                  name === 'roomOccupancyRate'
                    ? 'Room Occupancy'
                    : 'Bed Occupancy';
                return [`${Number(value).toFixed(1)}%`, label];
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
              dataKey="roomOccupancyRate"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorRoomOccupancy)"
              strokeWidth={2}
              name="Room Occupancy Rate"
            />
            <Area
              type="monotone"
              dataKey="bedOccupancyRate"
              stroke="hsl(142, 76%, 36%)"
              fillOpacity={1}
              fill="url(#colorBedOccupancy)"
              strokeWidth={2}
              name="Bed Occupancy Rate"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
