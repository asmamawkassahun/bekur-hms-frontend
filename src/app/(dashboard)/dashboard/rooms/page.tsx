'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bed,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Home,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
} from 'lucide-react';

// Mock data for rooms
const mockRooms = [
  {
    id: '1',
    number: '101',
    type: 'Single',
    capacity: 1,
    amenities: ['WiFi', 'TV', 'Air Conditioning'],
    basePrice: 50,
    floor: 1,
    status: 'AVAILABLE',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    number: '102',
    type: 'Double',
    capacity: 2,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
    basePrice: 80,
    floor: 1,
    status: 'OCCUPIED',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    number: '201',
    type: 'Suite',
    capacity: 4,
    amenities: [
      'WiFi',
      'TV',
      'Air Conditioning',
      'Mini Bar',
      'Balcony',
      'Jacuzzi',
    ],
    basePrice: 150,
    floor: 2,
    status: 'CLEANING',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    number: '202',
    type: 'Family',
    capacity: 6,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Kitchenette', 'Balcony'],
    basePrice: 120,
    floor: 2,
    status: 'MAINTENANCE',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export default function RoomsPage() {
  const [rooms] = useState(mockRooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { color: 'bg-green-100 text-green-800', icon: Bed },
      OCCUPIED: { color: 'bg-red-100 text-red-800', icon: Bed },
      CLEANING: { color: 'bg-yellow-100 text-yellow-800', icon: Bed },
      MAINTENANCE: { color: 'bg-orange-100 text-orange-800', icon: Bed },
      OUT_OF_ORDER: { color: 'bg-gray-100 text-gray-800', icon: Bed },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.AVAILABLE;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap = {
      WiFi: Wifi,
      TV: Tv,
      'Air Conditioning': Wind,
      'Mini Bar': Coffee,
      Parking: Car,
      Balcony: Home,
      Jacuzzi: Home,
      Kitchenette: Home,
    };

    const Icon = iconMap[amenity as keyof typeof iconMap] || Home;
    return <Icon className="h-3 w-3" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRoomTypeColor = (type: string) => {
    const typeConfig = {
      Single: 'bg-blue-100 text-blue-800',
      Double: 'bg-green-100 text-green-800',
      Twin: 'bg-purple-100 text-purple-800',
      Suite: 'bg-yellow-100 text-yellow-800',
      Family: 'bg-pink-100 text-pink-800',
    };

    return (
      typeConfig[type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800'
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Manage hotel rooms and availability
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Room
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rooms
            </CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {rooms.length}
            </div>
            <p className="text-xs text-muted-foreground">All room types</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
            <Bed className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {rooms.filter((r) => r.status === 'AVAILABLE').length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for guests</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupied
            </CardTitle>
            <Bed className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {rooms.filter((r) => r.status === 'OCCUPIED').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {Math.round(
                (rooms.filter((r) => r.status === 'OCCUPIED').length /
                  rooms.length) *
                  100,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Current occupancy</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by room number or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="CLEANING">Cleaning</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Double">Double</SelectItem>
                <SelectItem value="Twin">Twin</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
          <CardDescription>Manage and view all hotel rooms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Amenities</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">Room {room.number}</div>
                          <div className="text-sm text-muted-foreground">
                            Floor {room.floor}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoomTypeColor(room.type)}>
                          {room.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4 text-muted-foreground" />
                          {room.capacity}{' '}
                          {room.capacity === 1 ? 'Guest' : 'Guests'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 text-xs text-muted-foreground"
                            >
                              {getAmenityIcon(amenity)}
                              {amenity}
                            </div>
                          ))}
                          {room.amenities.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{room.amenities.length - 3} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(room.basePrice)}/night
                      </TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
