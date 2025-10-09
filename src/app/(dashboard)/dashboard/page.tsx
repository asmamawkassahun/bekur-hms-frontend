'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchReservations } from '@/store/slices/reservationSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  MoreHorizontal,
  Plus,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedTimeRange, setSelectedTimeRange] = useState('3months');

  useEffect(() => {
    // Load initial data
    dispatch(fetchReservations({}));
    dispatch(fetchProperties({}));
  }, [dispatch]);

  // Hotel PMS specific stats
  const stats = {
    totalRevenue: 125000,
    revenueChange: 12.5,
    totalGuests: 1234,
    guestsChange: -20,
    occupancyRate: 78.5,
    occupancyChange: 5.2,
    averageStay: 3.2,
    stayChange: 8.1,
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

  const recentReservations = [
    {
      id: '1',
      guestName: 'John Doe',
      roomNumber: '101',
      checkIn: '2024-07-20',
      checkOut: '2024-07-25',
      status: 'checked-in',
      totalAmount: 500,
      roomType: 'Deluxe Room',
      nights: 5,
      assignedTo: 'Sarah Johnson',
    },
    {
      id: '2',
      guestName: 'Jane Smith',
      roomNumber: '203',
      checkIn: '2024-07-22',
      checkOut: '2024-07-28',
      status: 'confirmed',
      totalAmount: 600,
      roomType: 'Executive Suite',
      nights: 6,
      assignedTo: 'Mike Chen',
    },
    {
      id: '3',
      guestName: 'Mike Johnson',
      roomNumber: '105',
      checkIn: '2024-07-25',
      checkOut: '2024-07-30',
      status: 'pending',
      totalAmount: 450,
      roomType: 'Standard Room',
      nights: 5,
      assignedTo: 'Lisa Wang',
    },
    {
      id: '4',
      guestName: 'Sarah Wilson',
      roomNumber: '301',
      checkIn: '2024-07-26',
      checkOut: '2024-08-02',
      status: 'checked-in',
      totalAmount: 750,
      roomType: 'Presidential Suite',
      nights: 7,
      assignedTo: 'Sarah Johnson',
    },
    {
      id: '5',
      guestName: 'David Brown',
      roomNumber: '205',
      checkIn: '2024-07-28',
      checkOut: '2024-08-01',
      status: 'confirmed',
      totalAmount: 400,
      roomType: 'Standard Room',
      nights: 4,
      assignedTo: 'Mike Chen',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'confirmed':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'Presidential Suite':
        return 'bg-purple-100 text-purple-800';
      case 'Executive Suite':
        return 'bg-blue-100 text-blue-800';
      case 'Deluxe Room':
        return 'bg-green-100 text-green-800';
      case 'Standard Room':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName}! Here's your hotel's performance
            overview for today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Last 3 months
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{stats.revenueChange}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                Trending up this month
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue for the last 6 months
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Guests
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {stats.totalGuests.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm text-red-600 font-medium">
                {stats.guestsChange}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                Down this period
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Guest acquisition needs attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {stats.occupancyRate}%
            </div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{stats.occupancyChange}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                Strong occupancy performance
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Room utilization exceeds targets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Stay
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {stats.averageStay} days
            </div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{stats.stayChange}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                Guest satisfaction improving
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Extended stays increasing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-card-foreground">
                Occupancy Rate
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Hotel occupancy rate for the last 3 months
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={
                  selectedTimeRange === '3months' ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedTimeRange('3months')}
              >
                Last 3 months
              </Button>
              <Button
                variant={selectedTimeRange === '30days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('30days')}
              >
                Last 30 days
              </Button>
              <Button
                variant={selectedTimeRange === '7days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('7days')}
              >
                Last 7 days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {/* Placeholder for chart - you can integrate Recharts here */}
            <div className="flex items-end justify-between h-full p-4 bg-muted rounded-lg">
              {chartData.map((point, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-8 bg-primary rounded-t"
                    style={{ height: `${point.occupancy * 2}px` }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    {point.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Section */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Tabs defaultValue="reservations" className="w-auto">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="reservations">Reservations</TabsTrigger>
                  <TabsTrigger value="checkin" className="flex items-center">
                    Check-ins Today
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full text-xs"
                    >
                      3
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="checkout" className="flex items-center">
                    Check-outs Today
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full text-xs"
                    >
                      2
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="maintenance">
                    Room Maintenance
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Reservation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold">Guest Name</TableHead>
                  <TableHead className="font-semibold">Room Type</TableHead>
                  <TableHead className="font-semibold">
                    Reservation Status
                  </TableHead>
                  <TableHead className="font-semibold">Nights</TableHead>
                  <TableHead className="font-semibold">Total Amount</TableHead>
                  <TableHead className="font-semibold">
                    Front Desk Staff
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReservations.map((reservation) => (
                  <TableRow
                    key={reservation.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center justify-center w-6 h-6 text-muted-foreground">
                        <div className="flex flex-col space-y-0.5">
                          <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                          <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                          <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                          <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                          <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                          <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-border"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {reservation.guestName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getRoomTypeColor(reservation.roomType)}
                      >
                        {reservation.roomType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(reservation.status)}
                        <span
                          className={`text-sm font-medium ${
                            reservation.status === 'checked-in'
                              ? 'text-green-600'
                              : reservation.status === 'confirmed'
                                ? 'text-blue-600'
                                : 'text-yellow-600'
                          }`}
                        >
                          {reservation.status === 'checked-in'
                            ? 'Checked In'
                            : reservation.status === 'confirmed'
                              ? 'Confirmed'
                              : 'Pending'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {reservation.nights}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${reservation.totalAmount}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {reservation.assignedTo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>0 of 5 reservation(s) selected.</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span>Rows per page</span>
                <select className="border border-border rounded px-2 py-1 bg-background">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span>Page 1 of 1</span>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
