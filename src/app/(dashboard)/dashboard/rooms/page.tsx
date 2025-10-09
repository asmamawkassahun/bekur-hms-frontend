'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector as useReduxSelector, useDispatch as useReduxDispatch } from 'react-redux';
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
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select as ShadSelect, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem } from '@/components/ui/select';
import { roomService } from '@/services/room.service';
import { useNotification } from '@/hooks/useNotification';
import { RootState, AppDispatch } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { handleApiError } from '@/lib/api/error-handler';
import type { AxiosError } from 'axios';
import type { Room } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
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

// Rooms are now loaded from backend

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [totalRoomsAll, setTotalRoomsAll] = useState(0);
  const [availableRoomsAll, setAvailableRoomsAll] = useState(0);
  const [occupiedRoomsAll, setOccupiedRoomsAll] = useState(0);
  const { success, error } = useNotification();
  const { properties } = useReduxSelector((state: RootState) => state.property);
  const dispatch = useReduxDispatch<AppDispatch>();

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 100 }));
    }
  }, [dispatch, properties]);

  // Load rooms from backend when filters/search change
  useEffect(() => {
    const load = async () => {
      try {
        setListLoading(true);
        const params: Record<string, unknown> = {
          page,
          limit,
        };
        if (searchTerm) params.search = searchTerm;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (typeFilter !== 'all') params.type = typeFilter;
        if (propertyFilter !== 'all') params.propertyId = propertyFilter;
        const res = await roomService.getAll(params);
        setRooms(res.data.data || []);
        if (res.data.meta) {
          setTotal(res.data.meta.total || 0);
          setTotalPages(res.data.meta.totalPages || 0);
        }
      } catch (e) {
        const apiErr = handleApiError(e as AxiosError);
        error(apiErr.message);
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, [searchTerm, statusFilter, typeFilter, propertyFilter, page, limit, error]);

  // Load global stats (not limited by current pagination)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const baseParams: Record<string, unknown> = { page: 1, limit: 1 };
        if (propertyFilter !== 'all') baseParams.propertyId = propertyFilter;

        const [totalRes, availableRes, occupiedRes] = await Promise.all([
          roomService.getAll({ ...baseParams }),
          roomService.getAll({ ...baseParams, status: 'AVAILABLE' }),
          roomService.getAll({ ...baseParams, status: 'OCCUPIED' }),
        ]);

        const totalAll = totalRes.data.meta?.total || 0;
        const availableAll = availableRes.data.meta?.total || 0;
        const occupiedAll = occupiedRes.data.meta?.total || 0;

        setTotalRoomsAll(totalAll);
        setAvailableRoomsAll(availableAll);
        setOccupiedRoomsAll(occupiedAll);
      } catch (e) {
        const apiErr = handleApiError(e as AxiosError);
        error(apiErr.message);
      }
    };
    loadStats();
  }, [propertyFilter, error]);

  const createSchema = z.object({
    propertyId: z.string().min(1, 'Property is required'),
    number: z.string().min(1, 'Room number is required'),
    type: z.enum(['Single', 'Double', 'Twin', 'Suite', 'Family']),
    capacity: z
      .string()
      .min(1, 'Capacity is required')
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Capacity must be a positive number'),
    amenities: z.string().optional(),
    basePrice: z
      .string()
      .min(1, 'Base price is required')
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Base price must be a number'),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_ORDER']),
    floor: z
      .string()
      .min(1, 'Floor is required')
      .refine((v) => !isNaN(Number(v)), 'Floor must be a number'),
    isActive: z.boolean(),
  });

  type CreateFormValues = z.infer<typeof createSchema>;

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      propertyId: properties[0]?.id || '',
      number: '',
      type: 'Double',
      capacity: '2',
      amenities: 'WiFi,TV,Air Conditioning,Mini Bar',
      basePrice: '80',
      status: 'AVAILABLE',
      floor: '1',
      isActive: true,
    },
  });

  const editSchema = z.object({
    number: z.string().min(1, 'Room number is required'),
    type: z.enum(['Single', 'Double', 'Twin', 'Suite', 'Family']),
    capacity: z
      .string()
      .min(1, 'Capacity is required')
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Capacity must be a positive number'),
    amenities: z.string().optional(),
    basePrice: z
      .string()
      .min(1, 'Base price is required')
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Base price must be a number'),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_ORDER']),
    floor: z
      .string()
      .min(1, 'Floor is required')
      .refine((v) => !isNaN(Number(v)), 'Floor must be a number'),
    isActive: z.boolean(),
  });

  type EditFormValues = z.infer<typeof editSchema>;

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      number: '',
      type: 'Double',
      capacity: '2',
      amenities: '',
      basePrice: '80',
      status: 'AVAILABLE',
      floor: '1',
      isActive: true,
    },
  });

  const filteredRooms = rooms.filter((room) => {
    const term = searchTerm.trim().toLowerCase();
    const propertyName = properties.find((p) => p.id === room.propertyId)?.name || '';
    const searchable = [
      room.number,
      room.type,
      String(room.capacity),
      room.status,
      String(room.floor),
      String(room.basePrice),
      room.propertyId,
      propertyName,
      ...room.amenities,
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = term === '' || searchable.includes(term);
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
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
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Room
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Room</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const payload = {
                  propertyId: values.propertyId,
                  number: values.number,
                  type: values.type,
                  capacity: Number(values.capacity),
                  amenities: (values.amenities || '').split(',').map((a) => a.trim()).filter(Boolean),
                  basePrice: Number(values.basePrice),
                  status: values.status,
                  floor: Number(values.floor),
                  isActive: values.isActive,
                };
                console.log('🧪 Creating room with payload:', payload);
                const response = await roomService.create(payload);
                const created = response.data.data as Room;
                setRooms((prev) => [created, ...prev]);
                success('Room created');
                setOpen(false);
                form.reset();
              } catch (e: unknown) {
                const apiErr = handleApiError(e as AxiosError);
                console.error('❌ Room creation failed:', e);
                error(apiErr.message);
              }
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property</Label>
                <ShadSelect
                  value={form.watch('propertyId')}
                  onValueChange={(v) => form.setValue('propertyId', v)}
                >
                  <ShadSelectTrigger>
                    <ShadSelectValue placeholder="Select property" />
                  </ShadSelectTrigger>
                  <ShadSelectContent>
                    {properties.map((p) => (
                      <ShadSelectItem key={p.id} value={p.id}>
                        {p.name}
                      </ShadSelectItem>
                    ))}
                  </ShadSelectContent>
                </ShadSelect>
                {form.formState.errors.propertyId && (
                  <p className="text-sm text-red-600">{form.formState.errors.propertyId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Room Number</Label>
                <Input id="number" {...form.register('number')} />
                {form.formState.errors.number && (
                  <p className="text-sm text-red-600">{form.formState.errors.number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <ShadSelect
                  value={form.watch('type')}
                  onValueChange={(v) => form.setValue('type', v as any)}
                >
                  <ShadSelectTrigger>
                    <ShadSelectValue placeholder="Select type" />
                  </ShadSelectTrigger>
                  <ShadSelectContent>
                    <ShadSelectItem value="Single">Single</ShadSelectItem>
                    <ShadSelectItem value="Double">Double</ShadSelectItem>
                    <ShadSelectItem value="Twin">Twin</ShadSelectItem>
                    <ShadSelectItem value="Suite">Suite</ShadSelectItem>
                    <ShadSelectItem value="Family">Family</ShadSelectItem>
                  </ShadSelectContent>
                </ShadSelect>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" {...form.register('capacity')} />
                {form.formState.errors.capacity && (
                  <p className="text-sm text-red-600">{form.formState.errors.capacity.message}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="amenities">Amenities (comma separated)</Label>
                <Input id="amenities" {...form.register('amenities')} />
                {form.formState.errors.amenities && (
                  <p className="text-sm text-red-600">{form.formState.errors.amenities.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price</Label>
                <Input id="basePrice" type="number" step="0.01" {...form.register('basePrice')} />
                {form.formState.errors.basePrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <ShadSelect
                  value={form.watch('status')}
                  onValueChange={(v) => form.setValue('status', v as any)}
                >
                  <ShadSelectTrigger>
                    <ShadSelectValue placeholder="Select status" />
                  </ShadSelectTrigger>
                  <ShadSelectContent>
                    <ShadSelectItem value="AVAILABLE">Available</ShadSelectItem>
                    <ShadSelectItem value="OCCUPIED">Occupied</ShadSelectItem>
                    <ShadSelectItem value="CLEANING">Cleaning</ShadSelectItem>
                    <ShadSelectItem value="MAINTENANCE">Maintenance</ShadSelectItem>
                    <ShadSelectItem value="OUT_OF_ORDER">Out of Order</ShadSelectItem>
                  </ShadSelectContent>
                </ShadSelect>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" type="number" {...form.register('floor')} />
                {form.formState.errors.floor && (
                  <p className="text-sm text-red-600">{form.formState.errors.floor.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">
                Create Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Room Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Details</DialogTitle>
          </DialogHeader>
          {viewingRoom ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Room Number</p>
                  <p className="font-medium">{viewingRoom.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{viewingRoom.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium">{viewingRoom.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="font-medium">{formatCurrency(viewingRoom.basePrice)}/night</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingRoom.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-medium">{viewingRoom.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="font-medium">{viewingRoom.isActive ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{properties.find(p => p.id === viewingRoom.propertyId)?.name || viewingRoom.propertyId}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amenities</p>
                {viewingRoom.amenities.length ? (
                  <div className="flex flex-wrap gap-2">
                    {viewingRoom.amenities.map((a, idx) => (
                      <Badge key={idx} variant="outline">{a}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No amenities</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(viewingRoom.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="font-medium">{new Date(viewingRoom.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(async (values) => {
              if (!editingRoom) return;
              try {
                const updatePayload = {
                  type: values.type,
                  capacity: Number(values.capacity),
                  amenities: (values.amenities || '').split(',').map((a) => a.trim()).filter(Boolean),
                  basePrice: Number(values.basePrice),
                  floor: Number(values.floor),
                  isActive: values.isActive,
                };
                await roomService.update(editingRoom.id, updatePayload);
                if (values.status !== editingRoom.status) {
                  await roomService.updateStatus(editingRoom.id, { status: values.status });
                }
                setRooms((prev) => prev.map((r) => r.id === editingRoom.id ? {
                  ...r,
                  ...updatePayload,
                  status: values.status,
                  number: values.number, // allow number change locally
                } : r));
                success('Room updated');
                setEditOpen(false);
                setEditingRoom(null);
              } catch (e: unknown) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-number">Room Number</Label>
                <Input id="edit-number" {...editForm.register('number')} />
                {editForm.formState.errors.number && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <ShadSelect
                  value={editForm.watch('type')}
                  onValueChange={(v) => editForm.setValue('type', v as any)}
                >
                  <ShadSelectTrigger>
                    <ShadSelectValue placeholder="Select type" />
                  </ShadSelectTrigger>
                  <ShadSelectContent>
                    <ShadSelectItem value="Single">Single</ShadSelectItem>
                    <ShadSelectItem value="Double">Double</ShadSelectItem>
                    <ShadSelectItem value="Twin">Twin</ShadSelectItem>
                    <ShadSelectItem value="Suite">Suite</ShadSelectItem>
                    <ShadSelectItem value="Family">Family</ShadSelectItem>
                  </ShadSelectContent>
                </ShadSelect>
                {editForm.formState.errors.type && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input id="edit-capacity" type="number" {...editForm.register('capacity')} />
                {editForm.formState.errors.capacity && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.capacity.message}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-amenities">Amenities (comma separated)</Label>
                <Input id="edit-amenities" {...editForm.register('amenities')} />
                {editForm.formState.errors.amenities && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.amenities.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-basePrice">Base Price</Label>
                <Input id="edit-basePrice" type="number" step="0.01" {...editForm.register('basePrice')} />
                {editForm.formState.errors.basePrice && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <ShadSelect
                  value={editForm.watch('status')}
                  onValueChange={(v) => editForm.setValue('status', v as any)}
                >
                  <ShadSelectTrigger>
                    <ShadSelectValue placeholder="Select status" />
                  </ShadSelectTrigger>
                  <ShadSelectContent>
                    <ShadSelectItem value="AVAILABLE">Available</ShadSelectItem>
                    <ShadSelectItem value="OCCUPIED">Occupied</ShadSelectItem>
                    <ShadSelectItem value="CLEANING">Cleaning</ShadSelectItem>
                    <ShadSelectItem value="MAINTENANCE">Maintenance</ShadSelectItem>
                    <ShadSelectItem value="OUT_OF_ORDER">Out of Order</ShadSelectItem>
                  </ShadSelectContent>
                </ShadSelect>
                {editForm.formState.errors.status && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.status.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-floor">Floor</Label>
                <Input id="edit-floor" type="number" {...editForm.register('floor')} />
                {editForm.formState.errors.floor && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.floor.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="edit-isActive" checked={editForm.watch('isActive')} onCheckedChange={(v) => editForm.setValue('isActive', Boolean(v))} />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this room? This action cannot be undone.</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deletingRoom) return;
                try {
                  await roomService.delete(deletingRoom.id);
                  setRooms((prev) => prev.filter((r) => r.id !== deletingRoom.id));
                  success('Room deleted');
                  setDeleteOpen(false);
                  setDeletingRoom(null);
                } catch (e: unknown) {
                  const apiErr = handleApiError(e as AxiosError);
                  error(apiErr.message);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {totalRoomsAll}
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
              {availableRoomsAll}
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
              {occupiedRoomsAll}
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
              {totalRoomsAll > 0 ? Math.round((occupiedRoomsAll / totalRoomsAll) * 100) : 0}%
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
                  placeholder="Search rooms by any field (number, type, status, price, amenities, property)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {listLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading rooms...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRooms.length === 0 ? (
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
                          <Button variant="ghost" size="sm" onClick={() => { setViewingRoom(room); setViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditOpen(true);
                            setEditingRoom(room);
                            editForm.reset({
                              number: room.number,
                              type: room.type,
                              capacity: String(room.capacity),
                              amenities: room.amenities.join(', '),
                              basePrice: String(room.basePrice),
                              status: room.status,
                              floor: String(room.floor),
                              isActive: room.isActive,
                            });
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setDeleteOpen(true);
                            setDeletingRoom(room);
                          }}>
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
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {totalPages ? page : 0} of {totalPages}
              {total ? ` • ${total} total` : ''}
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" disabled={totalPages && page >= totalPages ? true : false} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
