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
  const charts = data.charts || {};

  // Debug: Log the actual data structure
  console.log('GuestAnalyticsReportView received data:', data);
  console.log('Demographics data:', demographics);
  console.log('Charts data:', charts);

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
          value={summary?.totalGuests || 0}
          description={`${(summary?.averageStaysPerGuest || 0).toFixed(1)} avg stays`}
          icon={Users}
          gradient="violet"
        />

        <StatsCard
          title="Repeat Guests"

          value={summary?.repeatGuests || 0}
          description={`${summary?.totalGuests ? ((summary.repeatGuests / summary.totalGuests) * 100).toFixed(1) : '0.0'}% of total`}
          icon={UserCheck}
          gradient="green"
        />

        <StatsCard

          title="New Guests"
          value={summary?.newGuests || 0}
          description={`${summary?.totalGuests ? ((summary.newGuests / summary.totalGuests) * 100).toFixed(1) : '0.0'}% of total`}
          icon={Calendar}
          gradient="blue"
        />

        <StatsCard

          title="Avg Stays per Guest"
          value={`${(summary?.averageStaysPerGuest || 0).toFixed(1)} stays`}
          description="Average number of stays per guest"
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

            {charts?.ageDistribution ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={charts.ageDistribution.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(charts.ageDistribution.data || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available for chart
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guest Demographics by Gender</CardTitle>
          </CardHeader>
          <CardContent>

            {demographics.genders && demographics.genders.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={demographics.genders.map((item: any) => ({
                      name: item.gender,
                      value: item.count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(demographics.genders || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value, 
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available for chart
              </div>
            )}
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
              {demographics.countries && demographics.countries.length > 0 ? (
                demographics.countries.slice(0, 10).map((country: any, index: number) => {
                  const totalGuests = summary?.totalGuests || 1;
                  const percentage = (country.count / totalGuests) * 100;
                  return (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{country.country || 'Unknown'}</span>
                      <div className="text-right">
                        <div className="font-bold">{country.count || 0}</div>
                        <div className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No country data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      {/* Loyalty Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tier Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">

            {loyaltyAnalysis && loyaltyAnalysis.length > 0 ? (
              loyaltyAnalysis.map((tier: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{tier.tier}</span>
                  <div className="text-right">
                    <div className="font-bold">{tier.count}</div>
                    <div className="text-sm text-muted-foreground">
                      {tier.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No loyalty data available
              </div>
            )}
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
            {repeatGuests && repeatGuests.length > 0 ? (
              repeatGuests.slice(0, 10).map((guest: any) => (
                <div key={guest.id || Math.random()} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{guest.name || 'Unknown Guest'}</div>
                    <div className="text-sm text-muted-foreground">{guest.email || 'No email'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{guest.totalStays || 0}</div>
                    <div className="text-sm text-muted-foreground">stays</div>
                    <div className="text-xs text-muted-foreground">
                      ${guest.totalSpent || 0} spent
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No repeat guest data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}