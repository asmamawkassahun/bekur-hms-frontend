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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { GuestDemographics } from '@/types/night-audit.types';

interface GuestDemographicsChartsProps {
  demographics: GuestDemographics;
  currency?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(221, 83%, 53%)',
  'hsl(280, 76%, 50%)',
  'hsl(340, 82%, 52%)',
  'hsl(200, 98%, 39%)',
  'hsl(162, 73%, 46%)',
];

export function GuestDemographicsCharts({
  demographics,
  currency = 'ETB',
}: GuestDemographicsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Handle undefined/null demographics
  if (!demographics) {
    return (
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Guest Demographics</CardTitle>
          <CardDescription>No demographic data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No guest demographic data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  // Top 10 nationalities
  const topNationalities = (demographics.byNationality || []).slice(0, 10);

  // Age group data
  const ageGroupData = (demographics.byAgeGroup || []).filter(
    (item) => item.count > 0,
  );

  // Loyalty data
  const loyaltyData = (demographics.byLoyaltyStatus || []).filter(
    (item) => item.count > 0,
  );

  // Booking channel data
  const channelData = demographics.byBookingChannel || [];

  return (
    <div className="space-y-6">
      {/* Nationality Distribution */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Guest Nationality Distribution</CardTitle>
          <CardDescription>Top 10 countries by guest count</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={topNationalities}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                opacity={0.3}
              />
              <XAxis
                type="number"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                type="category"
                dataKey="country"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'count') return [value, 'Guests'];
                  if (name === 'revenue')
                    return [formatCurrency(Number(value)), 'Revenue'];
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[0, 8, 8, 0]}
                name="Guest Count"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Age Groups and Loyalty Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Age Group Distribution */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Age Group Distribution</CardTitle>
            <CardDescription>Guests by age category</CardDescription>
          </CardHeader>
          <CardContent>
            {ageGroupData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageGroupData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="ageGroup"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    formatter={(value) => [value, 'Guests']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(142, 76%, 36%)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No age group data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loyalty Status Distribution */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Loyalty Status Distribution</CardTitle>
            <CardDescription>Guests by loyalty tier</CardDescription>
          </CardHeader>
          <CardContent>
            {loyaltyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={loyaltyData as any} // Temporary cast until types are unified; ideally, define a type union extending ChartDataInput
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }: any) =>
                      `${status}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {loyaltyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Guests']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No loyalty data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Channel Revenue */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Revenue by Booking Channel</CardTitle>
          <CardDescription>Channel performance comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                opacity={0.3}
              />
              <XAxis
                dataKey="channel"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                className="text-xs"
                tickFormatter={formatCurrency}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'revenue')
                    return [formatCurrency(Number(value)), 'Revenue'];
                  if (name === 'count') return [value, 'Bookings'];
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
                name="Revenue"
              />
              <Bar
                dataKey="count"
                fill="hsl(38, 92%, 50%)"
                radius={[8, 8, 0, 0]}
                name="Booking Count"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
