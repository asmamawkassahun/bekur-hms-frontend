'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Tooltip,
  Legend,
} from 'recharts';

interface OccupancyTrendChartProps {
  data: Array<{ date: string; rooms: number; beds: number }>;
}

export function OccupancyTrendChart({ data }: OccupancyTrendChartProps) {
  const avgOccupancy = Math.round(
    data.reduce((sum, item) => sum + item.rooms, 0) / data.length,
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Occupancy Trend</CardTitle>
            <CardDescription className="text-muted-foreground">
              Room and bed occupancy rates over time
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {avgOccupancy}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Occupancy</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value}%`}
              domain={[60, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#374151',
              }}
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={(value) => value}
            />
            <Legend />
            <ReferenceLine
              y={avgOccupancy}
              stroke="#6b7280"
              strokeDasharray="3 3"
              strokeWidth={1}
            >
              <Label
                value={`Avg: ${avgOccupancy}%`}
                position="insideTopRight"
                fill="#6b7280"
                fontSize={11}
              />
            </ReferenceLine>
            <Line
              type="monotone"
              dataKey="rooms"
              stroke="#8b5cf6"
              strokeWidth={3}
              name="Room Occupancy"
              dot={{
                fill: '#8b5cf6',
                r: 4,
                strokeWidth: 2,
                stroke: '#ffffff',
              }}
              activeDot={{
                r: 6,
                stroke: '#8b5cf6',
                strokeWidth: 2,
                fill: '#ffffff'
              }}
            />
            <Line
              type="monotone"
              dataKey="beds"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Bed Occupancy"
              dot={{
                fill: '#3b82f6',
                r: 4,
                strokeWidth: 2,
                stroke: '#ffffff',
              }}
              activeDot={{
                r: 6,
                stroke: '#3b82f6',
                strokeWidth: 2,
                fill: '#ffffff'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}