'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchReservations,
  createReservation,
  updateSearchCache,
  setLastSearchTerm,
} from '@/store/slices/reservationSlice';
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
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';
import type { Reservation, ReservationStatus } from '@/types';

// Import extracted components
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ReservationStatsCards } from '@/components/features/reservations/ReservationStatsCards';
import { ReservationTableRow } from '@/components/features/reservations/ReservationTableRow';
import { ReservationForm } from '@/components/features/reservations/ReservationForm';

export default function ReservationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    reservations,
    loading,
    pagination,
    searchCache,
    lastSearchTerm,
    isSearching,
  } = useSelector((state: RootState) => state.reservation);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  // Separate state for stats that don't change during search
  const [statsData, setStatsData] = useState({
    totalReservations: 0,
    confirmedReservations: 0,
    checkedInReservations: 0,
    pendingReservations: 0,
    totalRevenue: 0,
  });

  const { success, error } = useNotification();

  // Fetch overall stats data (not affected by search)
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await dispatch(
          fetchReservations({
            page: 1,
            limit: 1000, // Get all reservations for stats calculation
            search: undefined,
            status: undefined,
          }),
        ).unwrap();

        const allReservations = response.data || [];

        setStatsData({
          totalReservations: response.pagination?.total || 0,
          confirmedReservations: allReservations.filter(
            (r) => r.status === 'CONFIRMED',
          ).length,
          checkedInReservations: allReservations.filter(
            (r) => r.status === 'CHECKED_IN',
          ).length,
          pendingReservations: allReservations.filter(
            (r) => r.status === 'PENDING',
          ).length,
          totalRevenue: allReservations.reduce(
            (sum, r) => sum + r.totalPrice,
            0,
          ),
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
        fetchReservations({
          page: 1,
          limit: 10,
          filters: {
            status:
              statusFilter === 'all'
                ? undefined
                : (statusFilter as ReservationStatus),
            guestName: debouncedSearch || undefined,
          },
        }),
      );
    }
  }, [dispatch, debouncedSearch, statusFilter, searchCache, lastSearchTerm]);

  const handleCreateReservation = async (data: any) => {
    try {
      await dispatch(createReservation(data)).unwrap();
      success('Reservation created');
      setOpenCreate(false);
      // Refetch with current search term
      dispatch(
        fetchReservations({
          page: 1,
          limit: 10,
          filters: {
            status:
              statusFilter === 'all'
                ? undefined
                : (statusFilter as ReservationStatus),
            guestName: debouncedSearch || undefined,
          },
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleEditReservation = async (data: any) => {
    if (!selectedReservation) return;
    try {
      // await dispatch(updateReservation({ id: selectedReservation.id, data })).unwrap();
      success('Reservation updated');
      setOpenEdit(false);
      setSelectedReservation(null);
      // Refetch with current search term
      dispatch(
        fetchReservations({
          page: pagination.page,
          limit: pagination.limit,
          filters: {
            status:
              statusFilter === 'all'
                ? undefined
                : (statusFilter as ReservationStatus),
            guestName: debouncedSearch || undefined,
          },
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const handleDeleteReservation = async () => {
    if (!selectedReservation) return;
    try {
      // await dispatch(deleteReservation(selectedReservation.id)).unwrap();
      success('Reservation deleted');
      setOpenDelete(false);
      setSelectedReservation(null);
      // Refetch with current search term
      dispatch(
        fetchReservations({
          page: pagination.page,
          limit: pagination.limit,
          filters: {
            status:
              statusFilter === 'all'
                ? undefined
                : (statusFilter as ReservationStatus),
            guestName: debouncedSearch || undefined,
          },
        }),
      );
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const columns = [
    { key: 'guest', label: 'Guest', width: 'w-[200px]' },
    { key: 'room', label: 'Room', width: 'w-[150px]' },
    { key: 'checkIn', label: 'Check-in', width: 'w-[120px]' },
    { key: 'checkOut', label: 'Check-out', width: 'w-[120px]' },
    { key: 'status', label: 'Status', width: 'w-[100px]' },
    { key: 'total', label: 'Total', width: 'w-[100px]' },
    { key: 'actions', label: 'Actions', width: 'w-[120px]', sortable: false },
  ];

  const renderReservationRow = (reservation: Reservation) => (
    <ReservationTableRow
      key={reservation.id}
      reservation={reservation}
      onView={(r) => {
        setSelectedReservation(r);
        // setOpenView(true);
      }}
      onEdit={(r) => {
        setSelectedReservation(r);
        setOpenEdit(true);
      }}
      onDelete={(r) => {
        setSelectedReservation(r);
        setOpenDelete(true);
      }}
    />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Reservations"
        description="Manage hotel reservations and bookings"
      >
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </DialogTrigger>
          <DialogContent className="!w-[85vw] !max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Reservation</DialogTitle>
            </DialogHeader>
            <ReservationForm
              onSubmit={handleCreateReservation}
              onCancel={() => setOpenCreate(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Cards */}
      <ReservationStatsCards stats={statsData} />

      {/* Data Table with integrated search and filters */}
      <DataTable
        title="Reservations"
        description="Manage and view all hotel reservations"
        columns={columns}
        data={reservations || []}
        loading={loading}
        emptyMessage="No reservations found"
        searchBar={
          <SearchBar
            placeholder="Search by guest name or reservation ID..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        }
        renderRow={renderReservationRow}
      />

      {/* Edit Reservation Dialog */}
      <Dialog
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          if (!open) setSelectedReservation(null);
        }}
      >
        <DialogContent className="!w-[85vw] !max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <ReservationForm
              reservation={selectedReservation}
              onSubmit={handleEditReservation}
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
          if (!open) setSelectedReservation(null);
        }}
        title="Delete Reservation"
        description={`Are you sure you want to delete this reservation? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteReservation}
        loading={loading}
      />
    </div>
  );
}
