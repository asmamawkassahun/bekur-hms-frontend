'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface RevenueByRoomTypeChartProps {
  data: Array<{
    name: string;
    amount: number;
    percentage: number;
    fill: string;
  }>;
  currency?: string;
}

const chartConfig = {
  percentage: {
    label: 'Percentage',
    color: 'hsl(var(--chart-1))',
  },
};

export function RevenueByRoomTypeChart({
  data,
  currency = 'USD',
}: RevenueByRoomTypeChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Transform data for RadialBarChart
  const chartData = data.map((item) => ({
    name: item.name,
    percentage: item.percentage,
    value: item.amount,
    fill: item.fill,
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Revenue by Room Type</CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribution of revenue across room categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm font-medium text-foreground">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">
                  {formatCurrency(item.amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
        <ChartContainer config={chartConfig} className="h-[280px] mt-4">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            barSize={20}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: 'hsl(var(--muted))' }}
              dataKey="percentage"
              cornerRadius={10}
              label={{
                position: 'insideStart',
                fill: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => [
                    `${formatCurrency(Number(props.payload.value))} (${value}%)`,
                    props.payload.name,
                  ]}
                />
              }
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
