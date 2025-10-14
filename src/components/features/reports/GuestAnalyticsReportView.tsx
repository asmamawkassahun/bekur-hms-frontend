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

  // Safely derive optional metrics that may not exist on some payloads
  const avgLengthOfStay: number = Number(((summary as any)?.averageLengthOfStay ?? 0));
  const avgAdvanceBooking: number = Number(((summary as any)?.averageAdvanceBooking ?? 0));

  // Normalize chart datasets to expected { name: string; value: number } shape
  const ageGroupsData: Array<{ name: string; value: number }> = (demographics.ageGroups || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ag: any) => ({ name: ag.name ?? ag.label ?? ag.group ?? 'Unknown', value: Number(ag.value ?? ag.count ?? 0) })
  );
  const genderData: Array<{ name: string; value: number }> = (demographics.genders || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (g: any) => ({ name: g.name ?? g.label ?? g.gender ?? 'Unknown', value: Number(g.value ?? g.count ?? 0) })
  );
  const countriesData: Array<{ name: string; value: number; percentage: number }> = (demographics.countries || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => ({
      name: c.name ?? c.country ?? c.label ?? 'Unknown',
      value: Number(c.value ?? c.count ?? c.total ?? 0),
      percentage: Number(
        c.percentage ?? c.percent ?? (((c.value ?? c.count ?? 0) / Math.max(1, summary.totalGuests || 0)) * 100)
      ),
    })
  );

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
          description={`${(
            ((summary.repeatGuests || 0) / Math.max(1, summary.totalGuests || 0)) * 100
          ).toFixed(1)}% of total`}
          icon={UserCheck}
          gradient="green"
        />

        <StatsCard
          title="Avg Length of Stay"
          value={`${avgLengthOfStay.toFixed(1)} days`}
          icon={Calendar}
          gradient="blue"
        />

        <StatsCard
          title="Advance Booking"
          value={`${avgAdvanceBooking.toFixed(1)} days`}
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
                  data={ageGroupsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props?.name} ${(((props?.percent ?? 0) as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageGroupsData.map((entry, index) => (
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
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props?.name} ${(((props?.percent ?? 0) as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
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
            {countriesData.slice(0, 10).map((country, index) => (
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
                  <div className="font-medium">{(guest as any).guestName ?? guest.name}</div>
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