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

// Import extracted components
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RoomTypeStatsCards } from '@/components/features/room-types/RoomTypeStatsCards';
import { RoomTypeTableRow } from '@/components/features/room-types/RoomTypeTableRow';
import { RoomTypeForm } from '@/components/features/room-types/RoomTypeForm';
import { RoomTypeDetailsDialog } from '@/components/features/room-types/RoomTypeDetailsDialog';

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

  // Stats data
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
      console.log("roomTypesResponse: ", roomTypesResponse);
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

  // Handlers
  const handleCreateRoomType = () => {
    createForm.reset();
    setCreateOpen(true);
  };

  const handleEditRoomType = (roomType: RoomType) => {
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
      images: roomType.images,
      reserveCondition: roomType.reserveCondition,
      beds:
        roomType.beds?.map((bed) => ({
          bedTypeId: bed.bedTypeId,
          quantity: bed.quantity,
        })) || [],
    });
    setEditOpen(true);
  };

  const handleViewRoomType = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setViewOpen(true);
  };

  const handleDeleteRoomType = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setDeleteOpen(true);
  };

  const handleCreateBedType = () => {
    bedTypeCreateForm.reset();
    setBedTypeCreateOpen(true);
  };

  const handleEditBedType = (bedType: BedType) => {
    setSelectedBedType(bedType);
    bedTypeEditForm.reset({
      name: bedType.name,
      description: bedType.description,
    });
    setBedTypeEditOpen(true);
  };

  const handleDeleteBedType = (bedType: BedType) => {
    setSelectedBedType(bedType);
    setBedTypeDeleteOpen(true);
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const columns = [
    { key: 'name', label: 'Name', width: 'w-[200px]' },
    { key: 'property', label: 'Property', width: 'w-[150px]' },
    { key: 'capacity', label: 'Capacity', width: 'w-[120px]' },
    { key: 'price', label: 'Price', width: 'w-[100px]' },
    { key: 'status', label: 'Status', width: 'w-[100px]' },
    { key: 'actions', label: 'Actions', width: 'w-[120px]' },
  ];

  const renderRoomTypeRow = (roomType: RoomType) => (
    <RoomTypeTableRow
      key={roomType.id}
      roomType={roomType}
      onView={handleViewRoomType}
      onEdit={handleEditRoomType}
      onDelete={handleDeleteRoomType}
    />
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Room Types"
        description="Manage room types and bed configurations"
      >
        <Button onClick={handleCreateRoomType}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room Type
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <RoomTypeStatsCards stats={statsData} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchBar
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bed Types</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBedTypesExpanded(!bedTypesExpanded)}
              >
                {bedTypesExpanded ? (
                  <ChevronUp className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                {bedTypesExpanded ? 'Collapse' : 'Expand'}
              </Button>
              <Button size="sm" onClick={handleCreateBedType}>
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
                          onClick={() => handleEditBedType(bedType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBedType(bedType)}
                          className="text-destructive hover:text-destructive"
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
      <DataTable
        title="Room Types"
        columns={columns}
        data={filteredRoomTypes}
        loading={loading}
        renderRow={renderRoomTypeRow}
      />

      {/* Create Room Type Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Room Type</DialogTitle>
          </DialogHeader>
          <RoomTypeForm
            mode="create"
            properties={properties}
            bedTypes={bedTypes}
            onSubmit={onCreateSubmit}
            onCancel={() => setCreateOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Room Type Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room Type</DialogTitle>
          </DialogHeader>
          <RoomTypeForm
            mode="edit"
            roomType={selectedRoomType || undefined}
            properties={properties}
            bedTypes={bedTypes}
            onSubmit={onEditSubmit}
            onCancel={() => setEditOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* View Room Type Dialog */}
      <RoomTypeDetailsDialog
        roomType={selectedRoomType}
        properties={properties}
        bedTypes={bedTypes}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      {/* Delete Room Type Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Room Type"
        description={`Are you sure you want to delete "${selectedRoomType?.name}"? This action cannot be undone.`}
        onConfirm={onDeleteConfirm}
      />

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
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBedTypeCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Bed Type</Button>
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
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBedTypeEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Bed Type</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Bed Type Dialog */}
      <ConfirmDialog
        open={bedTypeDeleteOpen}
        onOpenChange={setBedTypeDeleteOpen}
        title="Delete Bed Type"
        description={`Are you sure you want to delete "${selectedBedType?.name}"? This action cannot be undone.`}
        onConfirm={onBedTypeDeleteConfirm}
      />
    </div>
  );
}
