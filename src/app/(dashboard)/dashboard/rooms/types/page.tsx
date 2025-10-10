'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  BedDouble,
  Building,
  DollarSign,
  Users,
  Home,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { roomTypeService } from '@/services/room-type.service';
import { bedTypeService } from '@/services/bed-type.service';
import { propertyService } from '@/services/property.service';
import {
  RoomType,
  BedType,
  Property,
  CreateRoomTypeData,
  UpdateRoomTypeData,
  CreateBedTypeData,
  UpdateBedTypeData,
} from '@/types';

// Form schemas
const createRoomTypeSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  roomSize: z.number().optional(),
  sizeUnit: z.enum(['SQ_FT', 'SQ_M']).optional(),
  adultCapacity: z.number().min(1, 'Adult capacity is required'),
  childCapacity: z.number().min(0, 'Child capacity must be 0 or greater'),
  basePrice: z.number().min(0, 'Base price must be 0 or greater'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  reserveCondition: z.string().optional(),
  beds: z
    .array(
      z.object({
        bedTypeId: z.string().min(1, 'Bed type is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
      }),
    )
    .default([]),
});

const editRoomTypeSchema = createRoomTypeSchema.partial();

const createBedTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const editBedTypeSchema = createBedTypeSchema.partial();

export default function RoomTypesPage() {
  const dispatch = useDispatch();
  const { success, error } = useNotification();

  // State
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [bedTypesExpanded, setBedTypesExpanded] = useState(false);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bedTypeCreateOpen, setBedTypeCreateOpen] = useState(false);
  const [bedTypeEditOpen, setBedTypeEditOpen] = useState(false);
  const [bedTypeDeleteOpen, setBedTypeDeleteOpen] = useState(false);

  // Selected items
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    null,
  );
  const [selectedBedType, setSelectedBedType] = useState<BedType | null>(null);

  // Stats data (separate from filtered results)
  const [statsData, setStatsData] = useState({
    totalRoomTypes: 0,
    activeRoomTypes: 0,
    averagePrice: 0,
    totalRooms: 0,
  });

  // Forms
  const createForm = useForm<CreateRoomTypeData>({
    resolver: zodResolver(createRoomTypeSchema),
    defaultValues: {
      propertyId: '',
      name: '',
      description: '',
      roomSize: undefined,
      sizeUnit: 'SQ_FT',
      adultCapacity: 1,
      childCapacity: 0,
      basePrice: 0,
      amenities: [],
      images: [],
      reserveCondition: '',
      beds: [],
    },
  });

  const editForm = useForm<UpdateRoomTypeData>({
    resolver: zodResolver(editRoomTypeSchema),
  });

  const bedTypeCreateForm = useForm<CreateBedTypeData>({
    resolver: zodResolver(createBedTypeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const bedTypeEditForm = useForm<UpdateBedTypeData>({
    resolver: zodResolver(editBedTypeSchema),
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
        search: undefined,
        propertyId: undefined,
      });
      setRoomTypes(roomTypesResponse.data.data || []);

      // Load bed types
      const bedTypesResponse = await bedTypeService.getAll({
        page: 1,
        limit: 1000,
      });
      setBedTypes(bedTypesResponse.data.data || []);

      // Load properties
      const propertiesResponse = await propertyService.getAll({
        page: 1,
        limit: 1000,
      });
      setProperties(propertiesResponse.data.data || []);

      // Calculate stats
      const allRoomTypes = roomTypesResponse.data.data || [];
      setStatsData({
        totalRoomTypes: allRoomTypes.length,
        activeRoomTypes: allRoomTypes.filter((rt) => rt.isActive).length,
        averagePrice:
          allRoomTypes.length > 0
            ? allRoomTypes.reduce((sum, rt) => sum + rt.basePrice, 0) /
              allRoomTypes.length
            : 0,
        totalRooms: 0, // This would need to be calculated from rooms data
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter room types
  const filteredRoomTypes = roomTypes.filter((roomType) => {
    const matchesSearch =
      !searchTerm ||
      roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomType.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProperty =
      !selectedProperty ||
      selectedProperty === 'all' ||
      roomType.propertyId === selectedProperty;

    return matchesSearch && matchesProperty;
  });

  // Room Type CRUD
  const onCreateSubmit = async (data: CreateRoomTypeData) => {
    try {
      await roomTypeService.create(data);
      success('Room type created successfully');
      setCreateOpen(false);
      createForm.reset();
      loadData();
    } catch (err) {
      console.error('Failed to create room type:', err);
      error('Failed to create room type');
    }
  };

  const onEditSubmit = async (data: UpdateRoomTypeData) => {
    if (!selectedRoomType) return;

    try {
      await roomTypeService.update(selectedRoomType.id, data);
      success('Room type updated successfully');
      setEditOpen(false);
      setSelectedRoomType(null);
      editForm.reset();
      loadData();
    } catch (err) {
      console.error('Failed to update room type:', err);
      error('Failed to update room type');
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedRoomType) return;

    try {
      await roomTypeService.delete(selectedRoomType.id);
      success('Room type deleted successfully');
      setDeleteOpen(false);
      setSelectedRoomType(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete room type:', err);
      error('Failed to delete room type');
    }
  };

  // Bed Type CRUD
  const onBedTypeCreateSubmit = async (data: CreateBedTypeData) => {
    try {
      await bedTypeService.create(data);
      success('Bed type created successfully');
      setBedTypeCreateOpen(false);
      bedTypeCreateForm.reset();
      loadData();
    } catch (err) {
      console.error('Failed to create bed type:', err);
      error('Failed to create bed type');
    }
  };

  const onBedTypeEditSubmit = async (data: UpdateBedTypeData) => {
    if (!selectedBedType) return;

    try {
      await bedTypeService.update(selectedBedType.id, data);
      success('Bed type updated successfully');
      setBedTypeEditOpen(false);
      setSelectedBedType(null);
      bedTypeEditForm.reset();
      loadData();
    } catch (err) {
      console.error('Failed to update bed type:', err);
      error('Failed to update bed type');
    }
  };

  const onBedTypeDeleteConfirm = async () => {
    if (!selectedBedType) return;

    try {
      await bedTypeService.delete(selectedBedType.id);
      success('Bed type deleted successfully');
      setBedTypeDeleteOpen(false);
      setSelectedBedType(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete bed type:', err);
      error('Failed to delete bed type');
    }
  };

  // Helper functions
  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const getBedTypeName = (bedTypeId: string) => {
    const bedType = bedTypes.find((bt) => bt.id === bedTypeId);
    return bedType?.name || 'Unknown Bed Type';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Room Types</h1>
          <p className="text-muted-foreground">
            Manage room types and bed configurations
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Room Type
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Room Types
            </CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {statsData.totalRoomTypes}
            </div>
            <p className="text-xs text-muted-foreground">All room types</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Types
            </CardTitle>
            <BedDouble className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {statsData.activeRoomTypes}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Price
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(statsData.averagePrice)}
            </div>
            <p className="text-xs text-muted-foreground">Per night</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rooms
            </CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {statsData.totalRooms}
            </div>
            <p className="text-xs text-muted-foreground">All properties</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Search Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by property" />
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
          </div>
        </CardContent>
      </Card>

      {/* Bed Types Section */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bed Types</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBedTypesExpanded(!bedTypesExpanded)}
                className="cursor-pointer"
              >
                {bedTypesExpanded ? (
                  <ChevronUp className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                {bedTypesExpanded ? 'Collapse' : 'Expand'}
              </Button>
              <Button
                size="sm"
                onClick={() => setBedTypeCreateOpen(true)}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bed Type
              </Button>
            </div>
          </div>
        </CardHeader>
        {bedTypesExpanded && (
          <CardContent>
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bedTypes.map((bedType) => (
                  <TableRow key={bedType.id}>
                    <TableCell className="truncate font-medium">
                      {bedType.name}
                    </TableCell>
                    <TableCell className="truncate">
                      {bedType.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={bedType.isActive ? 'default' : 'secondary'}
                      >
                        {bedType.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBedType(bedType);
                            bedTypeEditForm.reset({
                              name: bedType.name,
                              description: bedType.description,
                            });
                            setBedTypeEditOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBedType(bedType);
                            setBedTypeDeleteOpen(true);
                          }}
                          className="text-destructive hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* Room Types Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-[150px]">Property</TableHead>
                <TableHead className="w-[120px]">Capacity</TableHead>
                <TableHead className="w-[100px]">Price</TableHead>
                <TableHead className="w-[200px]">Beds</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoomTypes.map((roomType) => (
                <TableRow key={roomType.id}>
                  <TableCell className="truncate">
                    <div>
                      <div className="font-medium">{roomType.name}</div>
                      {roomType.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {roomType.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="truncate">
                    {getPropertyName(roomType.propertyId)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {roomType.adultCapacity} adults
                      </div>
                      {roomType.childCapacity > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {roomType.childCapacity} children
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="truncate">
                    {formatCurrency(roomType.basePrice)}
                  </TableCell>
                  <TableCell className="truncate">
                    <div className="flex flex-wrap gap-1">
                      {roomType.beds.map((bed, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {bed.quantity}x {getBedTypeName(bed.bedTypeId)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={roomType.isActive ? 'default' : 'secondary'}
                    >
                      {roomType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRoomType(roomType);
                          setViewOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRoomType(roomType);
                          editForm.reset({
                            name: roomType.name,
                            description: roomType.description,
                            roomSize: roomType.roomSize,
                            sizeUnit: roomType.sizeUnit,
                            adultCapacity: roomType.adultCapacity,
                            childCapacity: roomType.childCapacity,
                            basePrice: roomType.basePrice,
                            amenities: roomType.amenities,
                            images: roomType.images || [],
                            reserveCondition: roomType.reserveCondition,
                          });
                          setEditOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRoomType(roomType);
                          setDeleteOpen(true);
                        }}
                        className="text-destructive hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Room Type Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Room Type</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
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
                            <SelectItem key={property.id} value={property.id}>
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
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Room type name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="roomSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Room size"
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
                  control={createForm.control}
                  name="sizeUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SQ_FT">Square Feet</SelectItem>
                          <SelectItem value="SQ_M">Square Meters</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="adultCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adult Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Adult capacity"
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
                  control={createForm.control}
                  name="childCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Child capacity"
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
                  control={createForm.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Base price"
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
                  control={createForm.control}
                  name="reserveCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserve Condition</FormLabel>
                      <FormControl>
                        <Input placeholder="Reserve condition" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Room type description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add amenities (press comma to add)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        maxImages={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Create Room Type
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Room Type Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room Type</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Room type name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="roomSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Room size"
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
                  control={editForm.control}
                  name="sizeUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SQ_FT">Square Feet</SelectItem>
                          <SelectItem value="SQ_M">Square Meters</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="adultCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adult Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Adult capacity"
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
                  control={editForm.control}
                  name="childCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Child capacity"
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
                  control={editForm.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Base price"
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
                  control={editForm.control}
                  name="reserveCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserve Condition</FormLabel>
                      <FormControl>
                        <Input placeholder="Reserve condition" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Room type description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add amenities (press comma to add)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || []}
                        onChange={field.onChange}
                        maxImages={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Update Room Type
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Room Type Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Room Type Details</DialogTitle>
          </DialogHeader>
          {selectedRoomType && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedRoomType.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {getPropertyName(selectedRoomType.propertyId)}
                  </p>
                  {selectedRoomType.description && (
                    <p className="mt-2 text-sm">
                      {selectedRoomType.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(selectedRoomType.basePrice)}
                  </div>
                  <p className="text-sm text-muted-foreground">per night</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium">Capacity</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoomType.adultCapacity} adults,{' '}
                    {selectedRoomType.childCapacity} children
                  </p>
                </div>
                {selectedRoomType.roomSize && (
                  <div>
                    <h4 className="font-medium">Size</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoomType.roomSize} {selectedRoomType.sizeUnit}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium">Status</h4>
                  <Badge
                    variant={
                      selectedRoomType.isActive ? 'default' : 'secondary'
                    }
                  >
                    {selectedRoomType.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {selectedRoomType.amenities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoomType.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedRoomType.beds.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Bed Configuration</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoomType.beds.map((bed, index) => (
                      <Badge key={index} variant="outline">
                        {bed.quantity}x {getBedTypeName(bed.bedTypeId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedRoomType.images &&
                selectedRoomType.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRoomType.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Room type image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border"
                        />
                      ))}
                    </div>
                  </div>
                )}

              {selectedRoomType.reserveCondition && (
                <div>
                  <h4 className="font-medium mb-2">Reserve Condition</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoomType.reserveCondition}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Room Type Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete "{selectedRoomType?.name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onDeleteConfirm}
                className="cursor-pointer"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Bed Type Dialog */}
      <Dialog open={bedTypeCreateOpen} onOpenChange={setBedTypeCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bed Type</DialogTitle>
          </DialogHeader>
          <Form {...bedTypeCreateForm}>
            <form
              onSubmit={bedTypeCreateForm.handleSubmit(onBedTypeCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={bedTypeCreateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Bed type name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bedTypeCreateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Bed type description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBedTypeCreateOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Create Bed Type
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Bed Type Dialog */}
      <Dialog open={bedTypeEditOpen} onOpenChange={setBedTypeEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bed Type</DialogTitle>
          </DialogHeader>
          <Form {...bedTypeEditForm}>
            <form
              onSubmit={bedTypeEditForm.handleSubmit(onBedTypeEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={bedTypeEditForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Bed type name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bedTypeEditForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Bed type description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBedTypeEditOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Update Bed Type
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Bed Type Dialog */}
      <Dialog open={bedTypeDeleteOpen} onOpenChange={setBedTypeDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bed Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete "{selectedBedType?.name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setBedTypeDeleteOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onBedTypeDeleteConfirm}
                className="cursor-pointer"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
