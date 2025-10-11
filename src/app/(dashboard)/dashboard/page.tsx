'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchDashboardOverview,
  setSelectedPeriod,
  setSelectedProperty,
} from '@/store/slices/dashboardSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Bed,
  RefreshCw,
} from 'lucide-react';

// Import components
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DashboardSkeleton } from '@/components/skeletons';
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart';
import { OccupancyTrendChart } from '@/components/charts/OccupancyTrendChart';
import { RevenueByRoomTypeChart } from '@/components/charts/RevenueByRoomTypeChart';
import { BookingStatusChart } from '@/components/charts/BookingStatusChart';
import { GuestDemographicsChart } from '@/components/charts/GuestDemographicsChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { overview, loading, selectedPeriod, selectedPropertyId } = useSelector(
    (state: RootState) => state.dashboard,
  );
  const { properties } = useSelector((state: RootState) => state.property);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Fetch dashboard data
  const loadDashboardData = () => {
    dispatch(
      fetchDashboardOverview({
        propertyId: selectedPropertyId || undefined,
        period: selectedPeriod,
      }),
    );
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedPropertyId]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      loadDashboardData();
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedPropertyId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handlePeriodChange = (period: string) => {
    dispatch(
      setSelectedPeriod(
        period as 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR',
      ),
    );
  };

  const handlePropertyChange = (propertyId: string) => {
    dispatch(setSelectedProperty(propertyId === 'all' ? null : propertyId));
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show skeleton during initial loading
  if (loading && !overview) {
    return <DashboardSkeleton />;
  }

  // Safe data extraction with defaults
  const kpis = overview?.kpis || {
    occupancy: {
      rooms: { occupied: 0, available: 0, total: 0, rate: 0 },
      beds: { occupied: 0, available: 0, total: 0, rate: 0 },
    },
    revenue: { today: 0, currency: 'ETB' },
    operations: { pendingCheckIns: 0, pendingCheckOuts: 0, pendingPayments: 0 },
    availability: { availableRooms: 0, availableBeds: 0 },
  };

  const trends = overview?.trends || {
    occupancy: [],
    revenue: [],
    bookings: [],
  };

  // Calculate total revenue from trends for the selected period
  const totalRevenue =
    trends?.revenue?.reduce(
      (sum: number, item: any) => sum + (Number(item.amount) || 0),
      0,
    ) || 0;

  const recentActivities = overview?.recentActivities || [];
  const alerts = overview?.alerts || [];
  const guestData = overview?.guestData || {
    byNationality: [],
    byLoyaltyTier: [],
  };
  const revenueData = overview?.revenueData || {
    byRoomType: [],
    byPaymentMethod: [],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Period Selector and Property Filter */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.firstName || 'User'}! Here's your hotel performance overview.`}
      >
        <div className="flex items-center gap-3">
          {/* Property Filter */}
          <Select
            value={selectedPropertyId || 'all'}
            onValueChange={handlePropertyChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Period Selector */}
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="WEEK">This Week</SelectItem>
              <SelectItem value="MONTH">This Month</SelectItem>
              <SelectItem value="QUARTER">This Quarter</SelectItem>
              <SelectItem value="YEAR">This Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="cursor-pointer"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </PageHeader>

      {/* Primary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Room Occupancy"
          value={`${kpis.occupancy.rooms.rate.toFixed(1)}%`}
          description={`${kpis.occupancy.rooms.occupied} of ${kpis.occupancy.rooms.total} rooms`}
          icon={Bed}
        />
        <StatsCard
          title="Bed Occupancy"
          value={`${kpis.occupancy.beds.rate.toFixed(1)}%`}
          description={`${kpis.occupancy.beds.occupied} of ${kpis.occupancy.beds.total} beds`}
          icon={Users}
        />
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(kpis.revenue.today, kpis.revenue.currency)}
          description="Revenue today"
          icon={DollarSign}
        />
        <StatsCard
          title="Pending Operations"
          value={
            kpis.operations.pendingCheckIns + kpis.operations.pendingCheckOuts
          }
          description={`${kpis.operations.pendingCheckIns} check-ins, ${kpis.operations.pendingCheckOuts} check-outs`}
          icon={Clock}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue, kpis.revenue.currency)}
          description={`${selectedPeriod === 'TODAY' ? 'Today' : selectedPeriod === 'WEEK' ? 'This week' : selectedPeriod === 'MONTH' ? 'This month' : selectedPeriod === 'QUARTER' ? 'This quarter' : 'This year'}`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Bookings"
          value={trends?.revenue?.length || 0}
          description={`${selectedPeriod === 'TODAY' ? 'Today' : selectedPeriod === 'WEEK' ? 'This week' : selectedPeriod === 'MONTH' ? 'This month' : selectedPeriod === 'QUARTER' ? 'This quarter' : 'This year'}`}
          icon={Calendar}
        />
        <StatsCard
          title="Available Rooms"
          value={kpis.occupancy.rooms.available}
          description="Ready for booking"
          icon={Bed}
        />
        <StatsCard
          title="Pending Payments"
          value={kpis.operations.pendingPayments}
          description="Awaiting payment"
          icon={DollarSign}
        />
      </div>

      {/* Charts Row 1 - Revenue & Occupancy */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueTrendChart
          data={trends.revenue}
          currency={kpis.revenue.currency}
        />
        <OccupancyTrendChart data={trends.occupancy} />
      </div>

      {/* Charts Row 2 - Distribution & Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {revenueData.byRoomType.length > 0 ? (
          <RevenueByRoomTypeChart
            data={revenueData.byRoomType}
            currency={kpis.revenue.currency}
          />
        ) : (
          <Card className="bg-card border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue by Room Type</CardTitle>
              <CardDescription>No data available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available for the selected period
              </div>
            </CardContent>
          </Card>
        )}
        <BookingStatusChart data={trends.bookings} />
      </div>

      {/* Charts Row 3 - Demographics */}
      {guestData.byNationality.length > 0 && (
        <GuestDemographicsChart data={guestData.byNationality} />
      )}

      {/* Bottom Row - Activities & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivities activities={recentActivities} />
        <AlertsPanel alerts={alerts} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
