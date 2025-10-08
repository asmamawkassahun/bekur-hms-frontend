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
  Mail,
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
    dispatch(fetchProperties());
  }, [dispatch]);

  // Enhanced mock data for demonstration
  const stats = {
    totalRevenue: 125000,
    revenueChange: 12.5,
    newCustomers: 1234,
    customersChange: -20,
    activeAccounts: 45678,
    accountsChange: 12.5,
    growthRate: 4.5,
    growthChange: 4.5,
  };

  const chartData = [
    { date: 'Apr 7', visitors: 4000 },
    { date: 'Apr 13', visitors: 3000 },
    { date: 'Apr 19', visitors: 5000 },
    { date: 'Apr 25', visitors: 4500 },
    { date: 'May 1', visitors: 6000 },
    { date: 'May 7', visitors: 5500 },
    { date: 'May 13', visitors: 7000 },
    { date: 'May 20', visitors: 6500 },
    { date: 'May 27', visitors: 8000 },
    { date: 'Jun 3', visitors: 7500 },
    { date: 'Jun 9', visitors: 9000 },
    { date: 'Jun 15', visitors: 8500 },
    { date: 'Jun 22', visitors: 9500 },
    { date: 'Jun 30', visitors: 10000 },
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
      sectionType: 'Narrative',
      target: 18,
      limit: 5,
      reviewer: 'Eddie Lake',
    },
    {
      id: '2',
      guestName: 'Jane Smith',
      roomNumber: '203',
      checkIn: '2024-07-22',
      checkOut: '2024-07-28',
      status: 'confirmed',
      totalAmount: 600,
      sectionType: 'Technical content',
      target: 29,
      limit: 24,
      reviewer: 'Eddie Lake',
    },
    {
      id: '3',
      guestName: 'Mike Johnson',
      roomNumber: '105',
      checkIn: '2024-07-25',
      checkOut: '2024-07-30',
      status: 'pending',
      totalAmount: 450,
      sectionType: 'Narrative',
      target: 10,
      limit: 13,
      reviewer: 'Jamik Tashpulatov',
    },
    {
      id: '4',
      guestName: 'Sarah Wilson',
      roomNumber: '301',
      checkIn: '2024-07-26',
      checkOut: '2024-08-02',
      status: 'checked-in',
      totalAmount: 750,
      sectionType: 'Narrative',
      target: 27,
      limit: 23,
      reviewer: 'Jamik Tashpulatov',
    },
    {
      id: '5',
      guestName: 'David Brown',
      roomNumber: '205',
      checkIn: '2024-07-28',
      checkOut: '2024-08-01',
      status: 'confirmed',
      totalAmount: 400,
      sectionType: 'Technical content',
      target: 2,
      limit: 16,
      reviewer: 'Assign reviewer',
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

  const getSectionTypeColor = (type: string) => {
    switch (type) {
      case 'Narrative':
        return 'bg-blue-100 text-blue-800';
      case 'Technical content':
        return 'bg-purple-100 text-purple-800';
      case 'Cover page':
        return 'bg-gray-100 text-gray-800';
      case 'Table of contents':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening
              with your hotel today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Last 3 months
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <Button size="sm" className="bg-black text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              Quick Create
              <Mail className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  +{stats.revenueChange}%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  Trending up this month
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Visitors for the last 6 months
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                New Customers
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.newCustomers.toLocaleString()}
              </div>
              <div className="flex items-center mt-1">
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">
                  {stats.customersChange}%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  Down this period
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Acquisition needs attention
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Accounts
              </CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.activeAccounts.toLocaleString()}
              </div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  +{stats.accountsChange}%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  Strong user retention
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Engagement exceed targets
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Growth Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.growthRate}%
              </div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  +{stats.growthChange}%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  Steady performance increase
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Meets growth projections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Total Visitors
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Total for the last 3 months
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
                  variant={
                    selectedTimeRange === '30days' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setSelectedTimeRange('30days')}
                >
                  Last 30 days
                </Button>
                <Button
                  variant={
                    selectedTimeRange === '7days' ? 'default' : 'outline'
                  }
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
              <div className="flex items-end justify-between h-full p-4 bg-gray-50 rounded-lg">
                {chartData.map((point, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${(point.visitors / 10000) * 200}px` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">
                      {point.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table Section */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Tabs defaultValue="outline" className="w-auto">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="outline">Outline</TabsTrigger>
                    <TabsTrigger
                      value="performance"
                      className="flex items-center"
                    >
                      Past Performance
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 w-5 rounded-full text-xs"
                      >
                        3
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="personnel"
                      className="flex items-center"
                    >
                      Key Personnel
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 w-5 rounded-full text-xs"
                      >
                        2
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="documents">Focus Documents</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Customize Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold">Header</TableHead>
                    <TableHead className="font-semibold">
                      Section Type
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Target</TableHead>
                    <TableHead className="font-semibold">Limit</TableHead>
                    <TableHead className="font-semibold">Reviewer</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReservations.map((reservation) => (
                    <TableRow
                      key={reservation.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center justify-center w-6 h-6 text-gray-400">
                          <div className="flex flex-col space-y-0.5">
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {reservation.guestName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getSectionTypeColor(
                            reservation.sectionType,
                          )}
                        >
                          {reservation.sectionType}
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
                              ? 'Done'
                              : reservation.status === 'confirmed'
                                ? 'In Process'
                                : 'In Process'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {reservation.target}
                      </TableCell>
                      <TableCell className="font-medium">
                        {reservation.limit}
                      </TableCell>
                      <TableCell>
                        {reservation.reviewer === 'Assign reviewer' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-600"
                          >
                            Assign reviewer
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {reservation.reviewer}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>0 of 68 row(s) selected.</div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span>Rows per page</span>
                  <select className="border rounded px-2 py-1">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Page 1 of 7</span>
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
    </div>
  );
}
