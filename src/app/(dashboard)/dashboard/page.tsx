'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchReservations } from '@/store/slices/reservationSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchGuests } from '@/store/slices/guestSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  BarChart3,
  Activity,
  Building,
} from 'lucide-react';

// Import extracted components
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DashboardSkeleton } from '@/components/skeletons';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { reservations, loading: reservationsLoading } = useSelector((state: RootState) => state.reservation);
  const { properties, loading: propertiesLoading } = useSelector((state: RootState) => state.property);
  const { guests, loading: guestsLoading } = useSelector((state: RootState) => state.guest);

  // Show skeleton if any data is still loading
  const isLoading = authLoading || reservationsLoading || propertiesLoading || guestsLoading;


  useEffect(() => {
    // Load initial data
    dispatch(fetchReservations({ page: 1, limit: 10 }));
    dispatch(fetchProperties({ page: 1, limit: 10 }));
    dispatch(fetchGuests({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Calculate stats from actual data
  const stats = {
    totalRevenue: reservations?.reduce((sum, r) => sum + r.totalPrice, 0) || 0,
    revenueChange: 12.5, // This would be calculated from historical data
    totalGuests: guests?.length || 0,
    guestsChange: -20, // This would be calculated from historical data
    occupancyRate: 78.5, // This would be calculated from room/dormitory occupancy
    occupancyChange: 5.2, // This would be calculated from historical data
    averageStay: 3.2, // This would be calculated from reservation data
    stayChange: 8.1, // This would be calculated from historical data
  };

  const chartData = [
    { date: 'Apr 7', occupancy: 65 },
    { date: 'Apr 13', occupancy: 70 },
    { date: 'Apr 19', occupancy: 85 },
    { date: 'Apr 25', occupancy: 80 },
    { date: 'May 1', occupancy: 90 },
    { date: 'May 7', occupancy: 88 },
    { date: 'May 13', occupancy: 95 },
    { date: 'May 20', occupancy: 92 },
    { date: 'May 27', occupancy: 98 },
    { date: 'Jun 3', occupancy: 96 },
    { date: 'Jun 9', occupancy: 100 },
    { date: 'Jun 15', occupancy: 98 },
    { date: 'Jun 22', occupancy: 100 },
    { date: 'Jun 30', occupancy: 100 },
  ];

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800' },
      CHECKED_IN: { color: 'bg-green-100 text-green-800' },
      CHECKED_OUT: { color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { color: 'bg-red-100 text-red-800' },
      NO_SHOW: { color: 'bg-red-100 text-red-800' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return <Badge className={config.color}>{status.replace('_', ' ')}</Badge>;
  };

  const recentReservations = reservations?.slice(0, 5) || [];
  const recentGuests = guests?.slice(0, 5) || [];

  // Show skeleton during loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.firstName || 'User'}! Here's what's happening at your properties.`}
      >
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          description="This month"
          icon={DollarSign}
          trend={{
            value: stats.revenueChange,
            isPositive: stats.revenueChange > 0,
            label: 'vs last month',
          }}
          className="[&>div>div>svg]:text-green-600"
        />
        <StatsCard
          title="Total Guests"
          value={stats.totalGuests}
          description="All time"
          icon={Users}
          trend={{
            value: Math.abs(stats.guestsChange),
            isPositive: stats.guestsChange > 0,
            label: 'vs last month',
          }}
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          description="Current"
          icon={TrendingUp}
          trend={{
            value: stats.occupancyChange,
            isPositive: stats.occupancyChange > 0,
            label: 'vs last month',
          }}
          className="[&>div>div>svg]:text-blue-600"
        />
        <StatsCard
          title="Average Stay"
          value={`${stats.averageStay} nights`}
          description="Current"
          icon={Clock}
          trend={{
            value: stats.stayChange,
            isPositive: stats.stayChange > 0,
            label: 'vs last month',
          }}
          className="[&>div>div>svg]:text-purple-600"
        />
      </div>

      {/* Property Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Properties"
          value={properties?.length || 0}
          description="Total properties"
          icon={Building}
        />
        <StatsCard
          title="Reservations"
          value={reservations?.length || 0}
          description="Total reservations"
          icon={Calendar}
        />
        <StatsCard
          title="Guests"
          value={guests?.length || 0}
          description="Total guests"
          icon={Users}
        />
        <StatsCard
          title="Active Properties"
          value={properties?.filter((p) => p.isActive).length || 0}
          description="Currently active"
          icon={CheckCircle}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Occupancy Chart */}
        <div className="bg-card border-0 shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Occupancy Trend</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div
                  className="bg-primary rounded-t w-8 transition-all duration-300 hover:bg-primary/80"
                  style={{ height: `${item.occupancy}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border-0 shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Activity className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentReservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {reservation.guest?.firstName} {reservation.guest?.lastName}{' '}
                    checked in
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(reservation.checkIn)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {reservation.room?.number || reservation.bed?.number}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reservations and Guests */}
      <Tabs defaultValue="reservations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reservations">Recent Reservations</TabsTrigger>
          <TabsTrigger value="guests">Recent Guests</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-4">
          <div className="bg-card border-0 shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Reservations</h3>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  View All
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room/Bed</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reservation.guest?.firstName}{' '}
                              {reservation.guest?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {reservation.guest?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.room?.number || reservation.bed?.number}
                        </TableCell>
                        <TableCell>{formatDate(reservation.checkIn)}</TableCell>
                        <TableCell>
                          {formatDate(reservation.checkOut)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(reservation.status)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(
                            reservation.totalPrice,
                            reservation.currency,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guests" className="space-y-4">
          <div className="bg-card border-0 shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Guests</h3>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  View All
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Loyalty Tier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentGuests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell>
                          <div className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </div>
                        </TableCell>
                        <TableCell>{guest.email}</TableCell>
                        <TableCell>{guest.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {guest.loyaltyTier || 'No Tier'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={guest.isActive ? 'default' : 'secondary'}
                          >
                            {guest.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}