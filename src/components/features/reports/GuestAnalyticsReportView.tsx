'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, TrendingUp, Calendar, UserCheck } from 'lucide-react';
import type { GuestAnalyticsReportData } from '@/types/report.types';

interface GuestAnalyticsReportViewProps {
  data: GuestAnalyticsReportData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function GuestAnalyticsReportView({ data }: GuestAnalyticsReportViewProps) {
  // Handle case where data might be undefined or have different structure
  if (!data) {
    return <div>No data available</div>;
  }

  // Handle different possible data structures
  const summary = data.summary || data;
  const demographics = data.demographics || { ageGroups: [], genders: [], countries: [] };
  const bookingPatterns = data.bookingPatterns || { advanceBooking: {}, dayOfWeek: {}, lengthOfStay: {} };
  const loyaltyAnalysis = data.loyaltyAnalysis || [];
  const repeatGuests = data.repeatGuests || [];

  // Handle case where summary might be undefined or empty
  if (!summary || (typeof summary === 'object' && Object.keys(summary).length === 0)) {
    return <div>Summary data not available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Guests"
          value={summary.totalGuests || 0}
          description={`${(summary.averageStaysPerGuest || 0).toFixed(1)} avg stays`}
          icon={Users}
          gradient="violet"
        />

        <StatsCard
          title="Repeat Guests"
          value={summary.repeatGuests || 0}
          description={`${(summary.repeatGuestPercentage || 0).toFixed(1)}% of total`}
          icon={UserCheck}
          gradient="green"
        />

        <StatsCard
          title="Avg Length of Stay"
          value={`${(summary.averageLengthOfStay || 0).toFixed(1)} days`}
          icon={Calendar}
          gradient="blue"
        />

        <StatsCard
          title="Advance Booking"
          value={`${(summary.averageAdvanceBooking || 0).toFixed(1)} days`}
          icon={TrendingUp}
          gradient="yellow"
        />
      </div>

      {/* Demographics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Guest Demographics by Age</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographics.ageGroups}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demographics.ageGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guest Demographics by Gender</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographics.genders}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demographics.genders.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {demographics.countries.slice(0, 10).map((country, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium">{country.name}</span>
                <div className="text-right">
                  <div className="font-bold">{country.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {country.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Repeat Guests */}
      <Card>
        <CardHeader>
          <CardTitle>Repeat Guests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {repeatGuests.slice(0, 10).map((guest) => (
              <div key={guest.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{guest.guestName}</div>
                  <div className="text-sm text-muted-foreground">{guest.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{guest.totalStays}</div>
                  <div className="text-sm text-muted-foreground">stays</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}