'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchProperties,
  createProperty,
  updateSearchCache,
  setLastSearchTerm,
} from '@/store/slices/propertySlice';
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
import type { Property } from '@/types';

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
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
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
        const response = await dispatch(
          fetchProperties({
            page: 1,
            limit: 1000, // Get all properties for stats calculation
            search: undefined,
            type: undefined,
            isActive: undefined,
          }),
        ).unwrap();

        const allProperties = response.data || [];

        setStatsData({
          totalProperties: response.pagination?.total || 0,
          activeProperties: allProperties.filter((p) => p.isActive).length,
          totalRooms: allProperties.reduce(
            (sum, p) => sum + (p.rooms?.length || 0),
            0,
          ),
          totalRevenue: 0, // This would need to be calculated from reservations
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

  // Fetch with caching
  useEffect(() => {
    const shouldFetch =
      !searchCache[debouncedSearch] || debouncedSearch !== lastSearchTerm;
    if (shouldFetch) {
      dispatch(
        fetchProperties({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          isActive:
            statusFilter === 'all' ? undefined : statusFilter === 'active',
        }),
      );
    }
  }, [
    dispatch,
    debouncedSearch,
    typeFilter,
    statusFilter,
    searchCache,
    lastSearchTerm,
  ]);

  const handleCreateProperty = async (data: any) => {
    try {
      await dispatch(createProperty(data)).unwrap();
      success('Property created');
      setOpenCreate(false);
      // refetch with current search term
      dispatch(
        fetchProperties({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          isActive:
            statusFilter === 'all' ? undefined : statusFilter === 'active',
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleEditProperty = async (data: any) => {
    if (!selectedProperty) return;
    try {
      // await dispatch(updateProperty({ id: selectedProperty.id, data })).unwrap();
      success('Property updated');
      setOpenEdit(false);
      setSelectedProperty(null);
      // refetch with current search term
      dispatch(
        fetchProperties({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          isActive:
            statusFilter === 'all' ? undefined : statusFilter === 'active',
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
      // await dispatch(deleteProperty(selectedProperty.id)).unwrap();
      success('Property deleted');
      setOpenDelete(false);
      setSelectedProperty(null);
      // refetch with current search term
      dispatch(
        fetchProperties({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          isActive:
            statusFilter === 'all' ? undefined : statusFilter === 'active',
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
    { key: 'contact', label: 'Contact', width: 'w-[180px]' },
    { key: 'isActive', label: 'Status', width: 'w-[100px]' },
    { key: 'createdAt', label: 'Created', width: 'w-[120px]' },
    { key: 'actions', label: 'Actions', width: 'w-[120px]', sortable: false },
  ];

  const renderPropertyRow = (property: Property) => (
    <PropertyTableRow
      key={property.id}
      property={property}
      onView={(p) => {
        setSelectedProperty(p);
        // setOpenView(true);
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
        data={properties || []}
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
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        }
        renderRow={renderPropertyRow}
      />

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
        description={`Are you sure you want to delete ${
          selectedProperty ? selectedProperty.name : 'this property'
        }? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteProperty}
        loading={loading}
      />
    </div>
  );
}
