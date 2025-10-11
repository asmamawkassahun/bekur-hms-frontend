'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Home, Bed, Percent, AlertTriangle } from 'lucide-react';
import { HourlyOccupancyChart } from '@/components/charts/night-audit/HourlyOccupancyChart';
import { OccupancyComparisonChart } from '@/components/charts/night-audit/OccupancyComparisonChart';
import type { NightAudit } from '@/types/night-audit.types';

interface OccupancyAnalysisSectionProps {
  audit: NightAudit;
}

export function OccupancyAnalysisSection({
  audit,
}: OccupancyAnalysisSectionProps) {
  // Safe defaults for numeric fields
  const roomOccupancyRate = Number(audit.roomOccupancyRate) || 0;
  const bedOccupancyRate = Number(audit.bedOccupancyRate) || 0;
  const occupiedRooms = audit.occupiedRooms || 0;
  const totalRooms = audit.totalRooms || 0;
  const availableRooms = audit.availableRooms || 0;
  const outOfOrderRooms = audit.outOfOrderRooms || 0;
  const occupiedBeds = audit.occupiedBeds || 0;
  const totalBeds = audit.totalBeds || 0;
  const availableBeds = audit.availableBeds || 0;

  const stats = [
    {
      title: 'Room Occupancy Rate',
      value: `${roomOccupancyRate.toFixed(1)}%`,
      description: `${occupiedRooms} of ${totalRooms} rooms occupied`,
      icon: Home,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Available Rooms',
      value: availableRooms.toString(),
      description: `${outOfOrderRooms} out of order`,
      icon: Home,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      title: 'Bed Occupancy Rate',
      value: `${bedOccupancyRate.toFixed(1)}%`,
      description: `${occupiedBeds} of ${totalBeds} beds occupied`,
      icon: Bed,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      title: 'Available Beds',
      value: availableBeds.toString(),
      description: 'Ready for booking',
      icon: Bed,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
  ];

  const avgOccupancy = (roomOccupancyRate + bedOccupancyRate) / 2;
  const occupancyStatus =
    avgOccupancy >= 90
      ? { text: 'Excellent', color: 'text-green-600' }
      : avgOccupancy >= 70
        ? { text: 'Good', color: 'text-blue-600' }
        : avgOccupancy >= 50
          ? { text: 'Moderate', color: 'text-amber-600' }
          : { text: 'Low', color: 'text-destructive' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Occupancy Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Detailed occupancy metrics with hourly trends and previous day
          comparison
        </p>
      </div>

      {/* Occupancy Status Banner */}
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Overall Occupancy Status
              </p>
              <p className={`text-3xl font-bold ${occupancyStatus.color}`}>
                {occupancyStatus.text}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Average occupancy: {avgOccupancy.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10">
              <Percent className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occupancy KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-card border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hourly Occupancy Chart */}
      {audit.hourlyOccupancy && audit.hourlyOccupancy.length > 0 && (
        <HourlyOccupancyChart data={audit.hourlyOccupancy} />
      )}

      {/* Comparison with Previous Day */}
      <OccupancyComparisonChart
        current={{
          roomOccupancyRate,
          bedOccupancyRate,
          totalBookings: audit.totalBookings || 0,
          checkIns: audit.checkIns || 0,
          checkOuts: audit.checkOuts || 0,
        }}
        previous={audit.previousDayComparison || null}
      />

      {/* Room/Bed Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Room Status Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">Total Rooms</span>
                <span className="text-lg font-bold">{totalRooms}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-600/10">
                <span className="text-sm font-medium text-green-600">
                  Occupied
                </span>
                <span className="text-lg font-bold text-green-600">
                  {occupiedRooms}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-600/10">
                <span className="text-sm font-medium text-blue-600">
                  Available
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {availableRooms}
                </span>
              </div>
              {outOfOrderRooms > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-amber-600/10">
                  <span className="text-sm font-medium text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Out of Order
                  </span>
                  <span className="text-lg font-bold text-amber-600">
                    {outOfOrderRooms}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bed Status Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">Total Beds</span>
                <span className="text-lg font-bold">{totalBeds}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-600/10">
                <span className="text-sm font-medium text-green-600">
                  Occupied
                </span>
                <span className="text-lg font-bold text-green-600">
                  {occupiedBeds}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-600/10">
                <span className="text-sm font-medium text-blue-600">
                  Available
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {availableBeds}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
