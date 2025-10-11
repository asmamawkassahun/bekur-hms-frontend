'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OccupancyTrendChartProps {
  data: Array<{ date: string; rooms: number; beds: number }>;
}

export function OccupancyTrendChart({ data }: OccupancyTrendChartProps) {
  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Occupancy Trend</CardTitle>
        <CardDescription>Room and bed occupancy rates over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, '']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="rooms"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Rooms"
            />
            <Line
              type="monotone"
              dataKey="beds"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Beds"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

