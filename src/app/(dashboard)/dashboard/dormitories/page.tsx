'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchDormitories,
  createDormitory,
  updateSearchCache,
  setLastSearchTerm,
} from '@/store/slices/dormitorySlice';
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
import type { Dormitory } from '@/types';

// Import extracted components
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DormitoryStatsCards } from '@/components/features/dormitories/DormitoryStatsCards';
import { DormitoryTableRow } from '@/components/features/dormitories/DormitoryTableRow';
import { DormitoryWizardFormCompact } from '@/components/features/dormitories/DormitoryWizardFormCompact';
import { DormitoryEditForm } from '@/components/features/dormitories/DormitoryEditForm';
import { DormitoryDetailsDialog } from '@/components/features/dormitories/DormitoryDetailsDialog';

export default function DormitoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    dormitories,
    loading,
    pagination,
    searchCache,
    lastSearchTerm,
    isSearching,
  } = useSelector((state: RootState) => state.dormitory);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedDormitory, setSelectedDormitory] = useState<Dormitory | null>(
    null,
  );

  // Separate state for stats that don't change during search
  const [statsData, setStatsData] = useState({
    totalDormitories: 0,
    availableDormitories: 0,
    occupiedDormitories: 0,
    maintenanceDormitories: 0,
  });

  const { success, error } = useNotification();

  // Fetch overall stats data (not affected by search)
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await dispatch(
          fetchDormitories({
            page: 1,
            limit: 1000, // Get all dormitories for stats calculation
            search: undefined,
            status: undefined,
            type: undefined,
          }),
        ).unwrap();

        const allDormitories = response.data || [];

        setStatsData({
          totalDormitories: allDormitories.length,
          availableDormitories: allDormitories.filter(
            (d) => d.status === 'AVAILABLE',
          ).length,
          occupiedDormitories: allDormitories.filter(
            (d) => d.status === 'OCCUPIED',
          ).length,
          maintenanceDormitories: allDormitories.filter(
            (d) => d.status === 'MAINTENANCE',
          ).length,
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
        fetchDormitories({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        }),
      );
    }
  }, [
    dispatch,
    debouncedSearch,
    statusFilter,
    typeFilter,
    searchCache,
    lastSearchTerm,
  ]);

  const handleCreateDormitory = async (data: any) => {
    try {
      await dispatch(createDormitory(data)).unwrap();
      success('Dormitory created');
      setOpenCreate(false);
      // refetch with current search term
      dispatch(
        fetchDormitories({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleWizardSubmit = async (dormitory: Dormitory, beds: any[]) => {
    try {
      success(`Dormitory and ${beds.length} beds created successfully!`);
      setOpenCreate(false);
      // refetch with current search term
      dispatch(
        fetchDormitories({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleEditDormitory = async (data: any) => {
    if (!selectedDormitory) return;
    try {
      // await dispatch(updateDormitory({ id: selectedDormitory.id, data })).unwrap();
      success('Dormitory updated');
      setOpenEdit(false);
      setSelectedDormitory(null);
      // refetch with current search term
      dispatch(
        fetchDormitories({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleDeleteDormitory = async () => {
    if (!selectedDormitory) return;
    try {
      // await dispatch(deleteDormitory(selectedDormitory.id)).unwrap();
      success('Dormitory deleted');
      setOpenDelete(false);
      setSelectedDormitory(null);
      // refetch with current search term
      dispatch(
        fetchDormitories({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const columns = [
    { key: 'dormitory', label: 'Dormitory', width: 'w-[200px]' },
    { key: 'capacity', label: 'Capacity', width: 'w-[120px]' },
    { key: 'price', label: 'Price', width: 'w-[120px]' },
    { key: 'status', label: 'Status', width: 'w-[120px]' },
    { key: 'amenities', label: 'Amenities', width: 'w-[200px]' },
    { key: 'actions', label: 'Actions', width: 'w-[120px]', sortable: false },
  ];

  const renderDormitoryRow = (dormitory: Dormitory) => (
    <DormitoryTableRow
      key={dormitory.id}
      dormitory={dormitory}
      onView={(d) => {
        setSelectedDormitory(d);
        setOpenView(true);
      }}
      onEdit={(d) => {
        setSelectedDormitory(d);
        setOpenEdit(true);
      }}
      onDelete={(d) => {
        setSelectedDormitory(d);
        setOpenDelete(true);
      }}
    />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Dormitories"
        description="Manage hostel dormitories and shared accommodations"
      >
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Dormitory
            </Button>
          </DialogTrigger>
          <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Dormitory</DialogTitle>
            </DialogHeader>
            <DormitoryWizardFormCompact
              onSubmit={handleWizardSubmit}
              onCancel={() => setOpenCreate(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Cards */}
      <DormitoryStatsCards stats={statsData} />

      {/* Data Table with integrated search and filters */}
      <DataTable
        title="Dormitories"
        description="Manage and view all dormitories"
        columns={columns}
        data={dormitories || []}
        loading={loading}
        emptyMessage="No dormitories found"
        searchBar={
          <SearchBar
            placeholder="Search by name or type..."
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MIXED">Mixed</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        }
        renderRow={renderDormitoryRow}
      />

      {/* Edit Dormitory Dialog */}
      <Dialog
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          if (!open) setSelectedDormitory(null);
        }}
      >
        <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Dormitory</DialogTitle>
          </DialogHeader>
          {selectedDormitory && (
            <DormitoryEditForm
              dormitory={selectedDormitory}
              onSubmit={handleEditDormitory}
              onCancel={() => setOpenEdit(false)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dormitory Details Dialog */}
      <DormitoryDetailsDialog
        open={openView}
        onOpenChange={(open) => {
          setOpenView(open);
          if (!open) setSelectedDormitory(null);
        }}
        dormitory={selectedDormitory}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open);
          if (!open) setSelectedDormitory(null);
        }}
        title="Delete Dormitory"
        description={`Are you sure you want to delete ${selectedDormitory ? selectedDormitory.name : 'this dormitory'
          }? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteDormitory}
        loading={loading}
      />
    </div>
  );
}
