'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Home,
  Bed,
  Building,
  Users,
  DollarSign,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { roomService } from '@/services/room.service';
import { roomTypeService } from '@/services/room-type.service';
import { propertyService } from '@/services/property.service';
import {
  RoomType,
  Property,
  CreateRoomData,
  BulkCreateRoomsData,
  RoomStatus,
} from '@/types';
import Link from 'next/link';

// Form schemas
const singleRoomSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  roomTypeId: z.string().min(1, 'Room type is required'),
  number: z.string().min(1, 'Room number is required'),
  floor: z.number().min(0, 'Floor must be 0 or greater'),
  status: z.enum([
    'AVAILABLE',
    'OCCUPIED',
    'CLEANING',
    'MAINTENANCE',
    'OUT_OF_ORDER',
  ]),
  isActive: z.boolean(),
});

const bulkRoomSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  roomTypeId: z.string().min(1, 'Room type is required'),
  floor: z.number().min(0, 'Floor must be 0 or greater'),
  prefix: z.string().min(1, 'Prefix is required'),
  count: z
    .number()
    .min(1, 'Count must be at least 1')
    .max(50, 'Count cannot exceed 50'),
  startingNumber: z.number().min(1, 'Starting number must be at least 1'),
});

export default function AddRoomPage() {
  const router = useRouter();
  const { success, error } = useNotification();

  // State
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('single');

  // Forms
  const singleForm = useForm<CreateRoomData>({
    resolver: zodResolver(singleRoomSchema),
    defaultValues: {
      propertyId: '',
      roomTypeId: '',
      number: '',
      floor: 0,
      status: 'AVAILABLE',
      isActive: true,
    },
  });

  const bulkForm = useForm<BulkCreateRoomsData>({
    resolver: zodResolver(bulkRoomSchema),
    defaultValues: {
      propertyId: '',
      roomTypeId: '',
      floor: 0,
      prefix: '',
      count: 1,
      startingNumber: 1,
    },
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load room types
      const roomTypesResponse = await roomTypeService.getAll({
        page: 1,
        limit: 1000,
      });
      setRoomTypes(roomTypesResponse.data.data || []);

      // Load properties
      const propertiesResponse = await propertyService.getAll({
        page: 1,
        limit: 1000,
      });
      setProperties(propertiesResponse.data.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const getRoomTypeName = (roomTypeId: string) => {
    const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
    return roomType?.name || 'Unknown Room Type';
  };

  const getRoomTypeDetails = (roomTypeId: string) => {
    const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
    return roomType
      ? {
          capacity: `${roomType.adultCapacity} adults, ${roomType.childCapacity} children`,
          price: roomType.basePrice,
        }
      : null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Filter room types by selected property
  const filteredRoomTypes = (propertyId: string) => {
    return roomTypes.filter((rt) => rt.propertyId === propertyId);
  };

  // Generate room number preview for bulk creation
  const generateRoomNumbers = (
    prefix: string,
    count: number,
    startingNumber: number,
  ) => {
    return Array.from(
      { length: count },
      (_, i) => `${prefix}-${String(startingNumber + i).padStart(2, '0')}`,
    );
  };

  // Form submissions
  const onSingleSubmit = async (data: CreateRoomData) => {
    try {
      setSubmitting(true);
      await roomService.create(data);
      success('Room created successfully');
      router.push('/dashboard/rooms/list');
    } catch (err) {
      console.error('Failed to create room:', err);
      error('Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const onBulkSubmit = async (data: BulkCreateRoomsData) => {
    try {
      setSubmitting(true);
      await roomService.bulkCreate(data);
      success(`${data.count} rooms created successfully`);
      router.push('/dashboard/rooms/list');
    } catch (err) {
      console.error('Failed to create rooms:', err);
      error('Failed to create rooms');
    } finally {
      setSubmitting(false);
    }
  };

  // Watch form values for preview
  const watchedBulkValues = bulkForm.watch();
  const roomNumbersPreview = generateRoomNumbers(
    watchedBulkValues.prefix || '',
    watchedBulkValues.count || 0,
    watchedBulkValues.startingNumber || 0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/rooms/list">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rooms
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Room</h1>
          <p className="text-muted-foreground">
            Create single rooms or bulk create multiple rooms
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="cursor-pointer">
            Single Room
          </TabsTrigger>
          <TabsTrigger value="bulk" className="cursor-pointer">
            Bulk Creation
          </TabsTrigger>
        </TabsList>

        {/* Single Room Tab */}
        <TabsContent value="single" className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Single Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...singleForm}>
                <form
                  onSubmit={singleForm.handleSubmit(onSingleSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={singleForm.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {properties.map((property) => (
                                <SelectItem
                                  key={property.id}
                                  value={property.id}
                                >
                                  {property.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="roomTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!singleForm.watch('propertyId')}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select room type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredRoomTypes(
                                singleForm.watch('propertyId'),
                              ).map((roomType) => (
                                <SelectItem
                                  key={roomType.id}
                                  value={roomType.id}
                                >
                                  {roomType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 101, A-01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Floor number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AVAILABLE">
                                Available
                              </SelectItem>
                              <SelectItem value="OCCUPIED">Occupied</SelectItem>
                              <SelectItem value="CLEANING">Cleaning</SelectItem>
                              <SelectItem value="MAINTENANCE">
                                Maintenance
                              </SelectItem>
                              <SelectItem value="OUT_OF_ORDER">
                                Out of Order
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Room Type Details Preview */}
                  {singleForm.watch('roomTypeId') && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">Room Type Details</h4>
                        {(() => {
                          const details = getRoomTypeDetails(
                            singleForm.watch('roomTypeId'),
                          );
                          return details ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{details.capacity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {formatCurrency(details.price)} per night
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end gap-2">
                    <Link href="/dashboard/rooms/list">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="cursor-pointer"
                    >
                      {submitting ? 'Creating...' : 'Create Room'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Creation Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Bulk Create Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...bulkForm}>
                <form
                  onSubmit={bulkForm.handleSubmit(onBulkSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={bulkForm.control}
                      name="propertyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {properties.map((property) => (
                                <SelectItem
                                  key={property.id}
                                  value={property.id}
                                >
                                  {property.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="roomTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!bulkForm.watch('propertyId')}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select room type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredRoomTypes(
                                bulkForm.watch('propertyId'),
                              ).map((roomType) => (
                                <SelectItem
                                  key={roomType.id}
                                  value={roomType.id}
                                >
                                  {roomType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Floor number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="prefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefix</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2A, B, 101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Rooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              placeholder="Number of rooms"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="startingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Number</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Starting number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Room Type Details Preview */}
                  {bulkForm.watch('roomTypeId') && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">Room Type Details</h4>
                        {(() => {
                          const details = getRoomTypeDetails(
                            bulkForm.watch('roomTypeId'),
                          );
                          return details ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{details.capacity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {formatCurrency(details.price)} per night
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Room Numbers Preview */}
                  {watchedBulkValues.prefix &&
                    watchedBulkValues.count &&
                    watchedBulkValues.startingNumber && (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-2">
                            Preview ({watchedBulkValues.count} rooms):
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {roomNumbersPreview.map((roomNumber, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {roomNumber}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Rooms will be created with status: Available
                          </p>
                        </CardContent>
                      </Card>
                    )}

                  <div className="flex justify-end gap-2">
                    <Link href="/dashboard/rooms/list">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="cursor-pointer"
                    >
                      {submitting
                        ? 'Creating...'
                        : `Create ${watchedBulkValues.count || 0} Rooms`}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
