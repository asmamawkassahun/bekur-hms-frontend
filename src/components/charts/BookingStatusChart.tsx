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
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface BookingStatusChartProps {
  data: Array<{ status: string; count: number; fill: string }>;
}

const chartConfig = {
  count: {
    label: 'Bookings',
    color: 'hsl(var(--chart-1))',
  },
};

export function BookingStatusChart({ data }: BookingStatusChartProps) {
  const totalBookings = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Booking Status</CardTitle>
            <CardDescription className="text-muted-foreground">
              Current status of all bookings
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {totalBookings}
            </div>
            <div className="text-xs text-muted-foreground">Total Bookings</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer config={chartConfig} className="h-[340px] w-full">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="status"
              className="stroke-muted-foreground"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              className="stroke-muted-foreground"
              style={{ fontSize: '12px' }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [value, 'Bookings']}
                />
              }
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              <LabelList
                dataKey="count"
                position="top"
                className="fill-foreground"
                fontSize={12}
                fontWeight="bold"
              />
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
