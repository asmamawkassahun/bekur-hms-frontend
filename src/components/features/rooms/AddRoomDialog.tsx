'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { AppDispatch, RootState } from '@/store';
import { closeModal } from '@/store/slices/uiSlice';
import { useNotification } from '@/hooks/useNotification';
import { roomService } from '@/services/room.service';
import { roomTypeService } from '@/services/room-type.service';
import { propertyService } from '@/services/property.service';
import { fetchRooms } from '@/store/slices/roomSlice';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { DollarSign, Plus, Users } from 'lucide-react';

import type { Property, RoomType, BulkCreateRoomsData, CreateRoomData } from '@/types';

const singleRoomSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  roomTypeId: z.string().min(1, 'Room type is required'),
  number: z.string().min(1, 'Room number is required'),
  floor: z.number().min(0, 'Floor must be 0 or greater'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_ORDER']),
});

const bulkRoomSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  roomTypeId: z.string().min(1, 'Room type is required'),
  floor: z.number().min(0, 'Floor must be 0 or greater'),
  prefix: z.string().min(1, 'Prefix is required'),
  count: z.number().min(1, 'Count must be at least 1').max(50, 'Count cannot exceed 50'),
  startingNumber: z.number().min(1, 'Starting number must be at least 1'),
});

type SingleFormValues = z.infer<typeof singleRoomSchema>;
type BulkFormValues = z.infer<typeof bulkRoomSchema>;

export function AddRoomDialog() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const { success, error } = useNotification();
  const open = useSelector((s: RootState) => Boolean(s.ui.modals['addRoom']));

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  // Forms
  const singleForm = useForm<SingleFormValues>({
    resolver: zodResolver(singleRoomSchema),
    defaultValues: {
      propertyId: '',
      roomTypeId: '',
      number: '',
      floor: 0,
      status: 'AVAILABLE',
    },
  });

  const bulkForm = useForm<BulkFormValues>({
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

  // Load data when opened
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const [roomTypesResponse, propertiesResponse] = await Promise.all([
          roomTypeService.getAll({ page: 1, limit: 1000 }),
          propertyService.getAll({ page: 1, limit: 1000 }),
        ]);
        setRoomTypes(roomTypesResponse.data.data || []);
        setProperties(propertiesResponse.data.data || []);
      } catch (e) {
        console.error('Failed to load data:', e);
        error('Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, error]);

  // Derived helpers
  const filteredRoomTypes = useMemo(
    () =>
      (propertyId: string) => roomTypes.filter((rt) => rt.propertyId === propertyId),
    [roomTypes],
  );

  const getRoomTypeDetails = (roomTypeId: string) => {
    const rt = roomTypes.find((r) => r.id === roomTypeId);
    return rt
      ? {
        capacity: `${rt.adultCapacity} adults, ${rt.childCapacity} children`,
        price: rt.basePrice,
      }
      : null;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const generateRoomNumbers = (prefix: string, count: number, startingNumber: number) =>
    Array.from({ length: count }, (_, i) => `${prefix}-${String(startingNumber + i).padStart(2, '0')}`);

  const watchedBulkValues = bulkForm.watch();
  const roomNumbersPreview = generateRoomNumbers(
    watchedBulkValues.prefix || '',
    watchedBulkValues.count || 0,
    watchedBulkValues.startingNumber || 0,
  );

  const close = () => dispatch(closeModal('addRoom'));

  const refreshRoomsIfOnList = () => {
    if (pathname?.startsWith('/dashboard/rooms/list')) {
      dispatch(
        fetchRooms({ page: 1, limit: 10, search: undefined, status: undefined, propertyId: undefined }),
      );
    }
  };

  const onSingleSubmit = async (data: SingleFormValues) => {
    try {
      setSubmitting(true);
      const payload: CreateRoomData = { ...data, isActive: true } as CreateRoomData;
      await roomService.create(payload);
      success('Room created successfully');
      refreshRoomsIfOnList();
      close();
    } catch (e) {
      console.error('Failed to create room:', e);
      error('Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const onBulkSubmit = async (data: BulkFormValues) => {
    try {
      setSubmitting(true);
      await roomService.bulkCreate(data);
      success(`${data.count} rooms created successfully`);
      refreshRoomsIfOnList();
      close();
    } catch (e) {
      console.error('Failed to create rooms:', e);
      error('Failed to create rooms');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? close() : null)}>
      <DialogContent className="w-[150vw] !max-w-[52rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'bulk')} className="w-full">
          <Card className="w-full">
            <CardHeader className="p-0 ">
              <div className="px-4">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="single" className="cursor-pointer">Single Room</TabsTrigger>
                  <TabsTrigger value="bulk" className="cursor-pointer">Bulk Creation</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="">
              {/* Single Room Tab */}
              <TabsContent value="single" className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form {...singleForm}>
                      <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-6 md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={singleForm.control} name="propertyId" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select property" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {properties.map((property) => (
                                    <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={singleForm.control} name="roomTypeId" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!singleForm.watch('propertyId') || loading}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select room type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredRoomTypes(singleForm.watch('propertyId')).map((roomType) => (
                                    <SelectItem key={roomType.id} value={roomType.id}>{roomType.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={singleForm.control} name="number" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 101, A-01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={singleForm.control} name="floor" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Floor</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Floor number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={singleForm.control} name="status" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AVAILABLE">Available</SelectItem>
                                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                                  <SelectItem value="CLEANING">Cleaning</SelectItem>
                                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                  <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        {singleForm.watch('roomTypeId') && (
                          <Card className="bg-muted/50">
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Room Type Details</h4>
                              {(() => {
                                const details = getRoomTypeDetails(singleForm.watch('roomTypeId'));
                                return details ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span>{details.capacity}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                                      <span>{formatCurrency(details.price)} per night</span>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </CardContent>
                          </Card>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" className="cursor-pointer" onClick={close}>Cancel</Button>
                          <Button type="submit" disabled={submitting} className="cursor-pointer">{submitting ? 'Creating...' : 'Create Room'}</Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </TabsContent>

              {/* Bulk Creation Tab */}
              <TabsContent value="bulk" className="space-y-6">
                <div className="space-y-6">
                  <Form {...bulkForm}>
                    <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={bulkForm.control} name="propertyId" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {properties.map((property) => (
                                  <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={bulkForm.control} name="roomTypeId" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!bulkForm.watch('propertyId') || loading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select room type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredRoomTypes(bulkForm.watch('propertyId')).map((roomType) => (
                                  <SelectItem key={roomType.id} value={roomType.id}>{roomType.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={bulkForm.control} name="floor" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Floor number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={bulkForm.control} name="prefix" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prefix</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2A, B, 101" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={bulkForm.control} name="count" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Rooms</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="50" placeholder="Number of rooms" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={bulkForm.control} name="startingNumber" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starting Number</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="Starting number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {bulkForm.watch('roomTypeId') && (
                        <Card className="bg-muted/50">
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-2">Room Type Details</h4>
                            {(() => {
                              const details = getRoomTypeDetails(bulkForm.watch('roomTypeId'));
                              return details ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{details.capacity}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatCurrency(details.price)} per night</span>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </CardContent>
                        </Card>
                      )}

                      {watchedBulkValues.prefix && watchedBulkValues.count && watchedBulkValues.startingNumber && (
                        <Card className="bg-muted/50">
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-2">Preview ({watchedBulkValues.count} rooms):</h4>
                            <div className="flex flex-wrap gap-2">
                              {roomNumbersPreview.map((roomNumber, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{roomNumber}</Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Rooms will be created with status: Available</p>
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" className="cursor-pointer" onClick={close}>Cancel</Button>
                        <Button type="submit" disabled={submitting} className="cursor-pointer">{submitting ? 'Creating...' : `Create ${watchedBulkValues.count || 0} Rooms`}</Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AddRoomDialog;


