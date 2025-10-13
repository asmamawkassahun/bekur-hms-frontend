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
  LabelList,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface GuestDemographicsChartProps {
  data: Array<{ country: string; guests: number }>;
}

const chartConfig = {
  guests: {
    label: 'Guests',
    color: 'hsl(var(--chart-1))',
  },
};

export function GuestDemographicsChart({ data }: GuestDemographicsChartProps) {
  // Sort by count and take top 6
  const topCountries = [...data]
    .sort((a, b) => b.guests - a.guests)
    .slice(0, 6);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Guest Demographics</CardTitle>
        <CardDescription className="text-muted-foreground">
          Guest distribution by country
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={topCountries} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              opacity={0.5}
              horizontal={false}
            />
            <XAxis
              type="number"
              className="stroke-muted-foreground"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              dataKey="country"
              type="category"
              className="stroke-muted-foreground"
              width={80}
              style={{ fontSize: '12px' }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent formatter={(value) => [value, 'Guests']} />
              }
            />
            <Bar dataKey="guests" fill="#60a5fa" radius={[0, 8, 8, 0]}>
              <LabelList
                dataKey="guests"
                position="right"
                className="fill-foreground"
                fontSize={12}
                fontWeight="bold"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
