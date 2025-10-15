'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  updateSearchCache,
  setLastSearchTerm,
} from '@/store/slices/propertySlice';
import { fetchRooms } from '@/store/slices/roomSlice';
import { fetchReservations } from '@/store/slices/reservationSlice';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Filter } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import type { AxiosError } from 'axios';
import type { Property, CreatePropertyData, UpdatePropertyData } from '@/types';

// Import extracted components
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PropertyStatsCards } from '@/components/features/properties/PropertyStatsCards';
import { PropertyTableRow } from '@/components/features/properties/PropertyTableRow';
import { PropertyForm } from '@/components/features/properties/PropertyForm';

export default function PropertiesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    properties,
    loading,
    pagination,
    searchCache,
    lastSearchTerm,
    isSearching,
  } = useSelector((state: RootState) => state.property);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  // Separate state for stats that don't change during search
  const [statsData, setStatsData] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalRooms: 0,
    totalRevenue: 0,
  });

  const { success, error } = useNotification();

  // Fetch overall stats data (not affected by search)
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const [propertiesRes, roomsRes, reservationsRes] = await Promise.all([
          dispatch(
            fetchProperties({
              page: 1,
              limit: 1000,
              search: undefined,
            }),
          ).unwrap(),
          dispatch(
            fetchRooms({
              page: 1,
              limit: 1000,
            }),
          ).unwrap(),
          dispatch(
            fetchReservations({
              page: 1,
              limit: 1000,
            }),
          ).unwrap(),
        ]);

        const allProperties = propertiesRes?.data || [];
        const allRooms = roomsRes?.data || [];
        const allReservations = reservationsRes?.data || [];

        const totalRooms = roomsRes?.meta?.total ?? allRooms.length;
        const totalRevenue = allReservations.reduce((sum: number, r: any) => {
          const price = Number(r?.totalPrice ?? r?.finalPrice ?? 0);
          return sum + (isNaN(price) ? 0 : price);
        }, 0);

        setStatsData({
          totalProperties: propertiesRes?.meta?.total || allProperties.length || 0,
          activeProperties: allProperties.filter((p: any) => p?.isActive).length,
          totalRooms,
          totalRevenue,
        });
      } catch (e) {
        console.error('Failed to fetch stats data:', e);
      }
    };

    fetchStatsData();
  }, [dispatch]);

  // Optimistic search - show cached results immediately
  useEffect(() => {
    if (searchTerm.trim() && searchCache[searchTerm]) {
      dispatch(
        updateSearchCache({
          term: searchTerm,
          results: searchCache[searchTerm],
        }),
      );
      dispatch(setLastSearchTerm(searchTerm));
    }
  }, [searchTerm, searchCache, dispatch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch with pagination
  useEffect(() => {
    dispatch(
      fetchProperties({
        page,
        limit,
        search: debouncedSearch || undefined,
      }),
    );
  }, [dispatch, debouncedSearch, page, limit]);

  const handleCreateProperty = async (formData: Partial<CreatePropertyData> & Pick<CreatePropertyData, 'name' | 'type' | 'address' | 'city' | 'country' | 'timezone' | 'currency'>) => {
    try {
      const data: CreatePropertyData = {
        name: formData.name,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        timezone: formData.timezone,
        currency: formData.currency,
        taxRate: formData.taxRate || 0,
        phone: formData.phone ?? undefined,
        email: formData.email ?? undefined,
        postalCode: formData.postalCode ?? undefined,
        description: formData.description ?? undefined,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        policies: formData.policies ?? undefined,
        website: formData.website ?? undefined,
        hotelCode: formData.hotelCode ?? undefined,
      };
      await dispatch(createProperty(data)).unwrap();
      success('Property created');
      setOpenCreate(false);
      // refetch with current search term
      dispatch(
        fetchProperties({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleEditProperty = async (formData: UpdatePropertyData) => {
    if (!selectedProperty) return;
    try {
      // Ensure all fields are properly sent to backend
      const data: UpdatePropertyData = {
        ...formData,
        website: formData.website ?? undefined,
        policies: formData.policies ?? undefined,
        hotelCode: formData.hotelCode ?? undefined,
        taxRate: typeof formData.taxRate === 'string' ? Number(formData.taxRate) : formData.taxRate,
      };

      await dispatch(updateProperty({ id: selectedProperty.id, data })).unwrap();
      success('Property updated');
      setOpenEdit(false);
      setSelectedProperty(null);
      // refetch with current search term
      dispatch(
        fetchProperties({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    try {
      await dispatch(deleteProperty(selectedProperty.id)).unwrap();
      success('Property deleted');
      setOpenDelete(false);
      setSelectedProperty(null);
      // refetch with current search term
      dispatch(
        fetchProperties({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const columns = [
    { key: 'property', label: 'Property', width: 'w-[200px]' },
    { key: 'location', label: 'Location', width: 'w-[200px]' },
    { key: 'contact', label: 'Contact', width: 'w-[200px]' },
    { key: 'website', label: 'Website', width: 'w-[200px]' },
    { key: 'isActive', label: 'Status', width: 'w-[200px]' },
    { key: 'createdAt', label: 'Created', width: 'w-[200px]' },
    { key: 'actions', label: 'Actions', width: 'w-[120px]', sortable: false },
  ];

  // Client-side filtering for type and status
  const displayedProperties = useMemo(() => {
    let filtered = properties || [];

    if (typeFilter !== 'all') {
      filtered = filtered.filter((p: Property) => p?.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((p: Property) => Boolean(p?.isActive) === isActive);
    }

    return filtered;
  }, [properties, typeFilter, statusFilter]);

  const renderPropertyRow = (property: Property) => (
    <PropertyTableRow
      key={property.id}
      property={property}
      onView={(p) => {
        setSelectedProperty(p);
        setOpenView(true);
      }}
      onEdit={(p) => {
        setSelectedProperty(p);
        setOpenEdit(true);
      }}
      onDelete={(p) => {
        setSelectedProperty(p);
        setOpenDelete(true);
      }}
    />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Properties"
        description="Manage hotel and hostel properties"
      >
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Property
            </Button>
          </DialogTrigger>
          <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Property</DialogTitle>
            </DialogHeader>
            <PropertyForm
              onSubmit={handleCreateProperty}
              onCancel={() => setOpenCreate(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Cards */}
      <PropertyStatsCards stats={statsData} />

      {/* Data Table with integrated search and filters */}
      <DataTable
        title="Properties"
        description="Manage and view all properties"
        columns={columns}
        data={displayedProperties}
        loading={loading}
        emptyMessage="No properties found"
        searchBar={
          <SearchBar
            placeholder="Search by name, city, or address..."
            value={searchTerm}
            onChange={setSearchTerm}
            loading={isSearching}
          />
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="HOTEL">Hotel</SelectItem>
                <SelectItem value="HOSTEL">Hostel</SelectItem>
                <SelectItem value="RESORT">Resort</SelectItem>
                <SelectItem value="MOTEL">Motel</SelectItem>
                <SelectItem value="BED_AND_BREAKFAST">
                  Bed & Breakfast
                </SelectItem>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
                <SelectItem value="COTTAGE">Cottage</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button> */}
          </div>
        }
        renderRow={renderPropertyRow}
        pagination={{
          page,
          limit,
          total: pagination?.total,
          totalPages: pagination?.totalPages,
          onPageChange: (p) => setPage(Math.max(1, p)),
          onLimitChange: (l) => {
            setLimit(l);
            setPage(1);
          },
        }}
      />

      {/* View Property Dialog */}
      <Dialog
        open={openView}
        onOpenChange={(open) => {
          setOpenView(open);
          if (!open) setSelectedProperty(null);
        }}
      >
        <DialogContent className="!w-[90vw] !max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedProperty.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedProperty.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedProperty.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{selectedProperty.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{selectedProperty.country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedProperty.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedProperty.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium">{selectedProperty.website || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium">{selectedProperty.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{selectedProperty.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tax Rate</p>
                  <p className="font-medium">{selectedProperty.taxRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hotel Code</p>
                  <p className="font-medium">{selectedProperty.hotelCode || 'N/A'}</p>
                </div>
              </div>
              {selectedProperty.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{selectedProperty.description}</p>
                </div>
              )}
              {selectedProperty.policies && (
                <div>
                  <p className="text-sm text-muted-foreground">Policies</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedProperty.policies}</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenView(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setOpenView(false);
                  setOpenEdit(true);
                }}>
                  Edit Property
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          if (!open) setSelectedProperty(null);
        }}
      >
        <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <PropertyForm
              property={selectedProperty}
              onSubmit={handleEditProperty}
              onCancel={() => setOpenEdit(false)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open);
          if (!open) setSelectedProperty(null);
        }}
        title="Delete Property"
        description={`Are you sure you want to delete ${selectedProperty ? selectedProperty.name : 'this property'
          }? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteProperty}
        loading={loading}
      />
    </div>
  );
}
