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
  Cell,
} from 'recharts';

interface BookingAnalysisChartProps {
  checkIns: number;
  checkOuts: number;
  cancellations: number;
  noShows: number;
  totalBookings: number;
}

const METRIC_COLORS = {
  checkIns: 'hsl(142, 76%, 36%)',
  checkOuts: 'hsl(var(--primary))',
  cancellations: 'hsl(var(--destructive))',
  noShows: 'hsl(38, 92%, 50%)',
  totalBookings: 'hsl(221, 83%, 53%)',
};

export function BookingAnalysisChart({
  checkIns,
  checkOuts,
  cancellations,
  noShows,
  totalBookings,
}: BookingAnalysisChartProps) {
  const data = [
    { name: 'Check-ins', value: checkIns, color: METRIC_COLORS.checkIns },
    { name: 'Check-outs', value: checkOuts, color: METRIC_COLORS.checkOuts },
    {
      name: 'Cancellations',
      value: cancellations,
      color: METRIC_COLORS.cancellations,
    },
    { name: 'No-shows', value: noShows, color: METRIC_COLORS.noShows },
    {
      name: 'Total Bookings',
      value: totalBookings,
      color: METRIC_COLORS.totalBookings,
    },
  ];

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Booking Activity Analysis</CardTitle>
        <CardDescription>Daily booking operations summary</CardDescription>
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
              dataKey="name"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              formatter={(value) => [value, 'Count']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.map((item) => (
            <div key={item.name} className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
              <p className="text-lg font-semibold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
