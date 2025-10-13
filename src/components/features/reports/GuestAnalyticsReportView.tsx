'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalGuests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(summary.averageStaysPerGuest || 0).toFixed(1)} avg stays
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.newGuests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalGuests ? ((summary.newGuests || 0) / summary.totalGuests * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Repeat Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.repeatGuests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalGuests ? ((summary.repeatGuests || 0) / summary.totalGuests * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Stays per Guest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary.averageStaysPerGuest || 0).toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
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
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {demographics.genders && demographics.genders.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={demographics.genders}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.gender} ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="gender"
                  >
                    {(demographics.genders || []).map((entry, index) => (
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

        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(demographics.countries || []).slice(0, 5).map((country, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{country.country}</span>
                  <span className="text-sm text-muted-foreground">{country.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Patterns */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Advance Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(bookingPatterns.advanceBooking || {}).map(([range, count]) => (
                <div key={range} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{range} days</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(bookingPatterns.dayOfWeek || {}).map(([day, count]) => (
                <div key={day} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium capitalize">{day}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Length of Stay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(bookingPatterns.lengthOfStay || {}).map(([range, count]) => (
                <div key={range} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{range} {range === '1' ? 'night' : 'nights'}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tier Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {(loyaltyAnalysis || []).map((tier, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{tier.count}</div>
                <div className="text-sm text-muted-foreground">{tier.tier}</div>
                <div className="text-xs text-muted-foreground">{tier.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Repeat Guests */}
      <Card>
        <CardHeader>
          <CardTitle>Top Repeat Guests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(repeatGuests || []).slice(0, 10).map((guest) => (
              <div key={guest.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{guest.name}</div>
                  <div className="text-sm text-muted-foreground">{guest.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{guest.totalStays} stays</div>
                  <div className="text-xs text-muted-foreground">
                    Last: {new Date(guest.lastStay).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

