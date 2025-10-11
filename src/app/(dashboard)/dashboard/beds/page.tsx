'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchBeds,
  createBed,
  updateSearchCache,
  setLastSearchTerm,
} from '@/store/slices/bedSlice';
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
import type { Bed } from '@/types';

// Import extracted components
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { BedStatsCards } from '@/components/features/beds/BedStatsCards';
import { BedTableRow } from '@/components/features/beds/BedTableRow';
import { BedForm } from '@/components/features/beds/BedForm';

export default function BedsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    beds,
    loading,
    pagination,
    searchCache,
    lastSearchTerm,
    isSearching,
  } = useSelector((state: RootState) => state.bed);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dormitoryFilter, setDormitoryFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  // Separate state for stats that don't change during search
  const [statsData, setStatsData] = useState({
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    maintenanceBeds: 0,
  });

  const { success, error } = useNotification();

  // Fetch overall stats data (not affected by search)
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await dispatch(
          fetchBeds({
            page: 1,
            limit: 1000, // Get all beds for stats calculation
            search: undefined,
            status: undefined,
            dormitoryId: undefined,
          }),
        ).unwrap();

        const allBeds = response.data || [];

        setStatsData({
          totalBeds: (response.meta?.total as number) || (allBeds.length || 0),
          availableBeds: allBeds.filter((b) => b.status === 'AVAILABLE').length,
          occupiedBeds: allBeds.filter((b) => b.status === 'OCCUPIED').length,
          maintenanceBeds: allBeds.filter((b) => b.status === 'MAINTENANCE')
            .length,
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
        fetchBeds({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          dormitoryId: dormitoryFilter === 'all' ? undefined : dormitoryFilter,
        }),
      );
    }
  }, [
    dispatch,
    debouncedSearch,
    statusFilter,
    dormitoryFilter,
    searchCache,
    lastSearchTerm,
  ]);

  const handleCreateBed = async (data: any) => {
    try {
      await dispatch(createBed(data)).unwrap();
      success('Bed created');
      setOpenCreate(false);
      // refetch with current search term
      dispatch(
        fetchBeds({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          dormitoryId: dormitoryFilter === 'all' ? undefined : dormitoryFilter,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleEditBed = async (data: any) => {
    if (!selectedBed) return;
    try {
      // await dispatch(updateBed({ id: selectedBed.id, data })).unwrap();
      success('Bed updated');
      setOpenEdit(false);
      setSelectedBed(null);
      // refetch with current search term
      dispatch(
        fetchBeds({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          dormitoryId: dormitoryFilter === 'all' ? undefined : dormitoryFilter,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleDeleteBed = async () => {
    if (!selectedBed) return;
    try {
      // await dispatch(deleteBed(selectedBed.id)).unwrap();
      success('Bed deleted');
      setOpenDelete(false);
      setSelectedBed(null);
      // refetch with current search term
      dispatch(
        fetchBeds({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          dormitoryId: dormitoryFilter === 'all' ? undefined : dormitoryFilter,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const columns = [
    { key: 'bed', label: 'Bed', width: 'w-[200px]' },
    { key: 'dormitory', label: 'Dormitory', width: 'w-[150px]' },
    { key: 'type', label: 'Bed Type', width: 'w-[150px]' },
    { key: 'price', label: 'Price', width: 'w-[120px]' },
    { key: 'status', label: 'Status', width: 'w-[120px]' },
    { key: 'amenities', label: 'Amenities', width: 'w-[200px]' },
    { key: 'actions', label: 'Actions', width: 'w-[120px]', sortable: false },
  ];

  const renderBedRow = (bed: Bed) => (
    <BedTableRow
      key={bed.id}
      bed={bed}
      onView={(b) => {
        setSelectedBed(b);
        // setOpenView(true);
      }}
      onEdit={(b) => {
        setSelectedBed(b);
        setOpenEdit(true);
      }}
      onDelete={(b) => {
        setSelectedBed(b);
        setOpenDelete(true);
      }}
    />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Beds"
        description="Manage dormitory beds and shared accommodations"
      >
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Bed
            </Button>
          </DialogTrigger>
          <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Bed</DialogTitle>
            </DialogHeader>
            <BedForm
              onSubmit={handleCreateBed}
              onCancel={() => setOpenCreate(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Cards */}
      <BedStatsCards stats={statsData} />

      {/* Data Table with integrated search and filters */}
      <DataTable
        title="Beds"
        description="Manage and view all beds"
        columns={columns}
        data={beds || []}
        loading={loading}
        emptyMessage="No beds found"
        searchBar={
          <SearchBar
            placeholder="Search by bed number or dormitory..."
            value={searchTerm}
            onChange={setSearchTerm}
            loading={isSearching}
          />
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dormitoryFilter} onValueChange={setDormitoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Dormitory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dormitories</SelectItem>
                {/* This would be populated from dormitories state */}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        }
        renderRow={renderBedRow}
      />

      {/* Edit Bed Dialog */}
      <Dialog
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          if (!open) setSelectedBed(null);
        }}
      >
        <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bed</DialogTitle>
          </DialogHeader>
          {selectedBed && (
            <BedForm
              bed={selectedBed}
              onSubmit={handleEditBed}
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
          if (!open) setSelectedBed(null);
        }}
        title="Delete Bed"
        description={`Are you sure you want to delete ${
          selectedBed ? `bed ${selectedBed.number}` : 'this bed'
        }? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteBed}
        loading={loading}
      />
    </div>
  );
}
