'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BookingStatusChartProps {
  data: Array<{ date: string; confirmed: number; pending: number; cancelled: number }>;
}

export function BookingStatusChart({ data }: BookingStatusChartProps) {
  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Booking Status Trend</CardTitle>
        <CardDescription>Daily booking status distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="confirmed" fill="hsl(var(--chart-1))" name="Confirmed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="hsl(var(--chart-3))" name="Pending" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" fill="hsl(var(--chart-5))" name="Cancelled" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

