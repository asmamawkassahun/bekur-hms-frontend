'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface OccupancyTrendChartProps {
  data: Array<{ date: string; rooms: number; beds: number }>;
}

const chartConfig = {
  rooms: {
    label: 'Room Occupancy',
    color: 'hsl(var(--chart-1))',
  },
  beds: {
    label: 'Bed Occupancy',
    color: 'hsl(var(--chart-2))',
  },
};

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
            <CardDescription className="text-muted-foreground">Room and bed occupancy rates over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{avgOccupancy}%</div>
            <div className="text-xs text-muted-foreground">Avg Occupancy</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="date"
              className="stroke-muted-foreground"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              className="stroke-muted-foreground"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `${value}%`}
              domain={[60, 100]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: number) => [`${value}%`, '']}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine
              y={avgOccupancy}
              className="stroke-muted-foreground"
              strokeDasharray="3 3"
              strokeWidth={1}
            >
              <Label
                value={`Avg: ${avgOccupancy}%`}
                position="insideTopRight"
                className="fill-muted-foreground"
                fontSize={11}
              />
            </ReferenceLine>
            <Line
              type="monotone"
              dataKey="rooms"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              name="Room Occupancy"
              dot={{ fill: "hsl(var(--chart-1))", r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="beds"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              name="Bed Occupancy"
              dot={{ fill: "hsl(var(--chart-2))", r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

