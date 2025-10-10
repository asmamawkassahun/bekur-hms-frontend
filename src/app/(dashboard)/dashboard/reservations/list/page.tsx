'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchReservations,
  createReservation,
  confirmReservation,
  checkInGuest,
} from '@/store/slices/reservationSlice';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReservationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const {
    reservations,
    loading,
    pagination,
    isSearching,
  } = useSelector((state: RootState) => state.reservation);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    totalPaidAmount: 0,
    totalUnpaidAmount: 0,
    paidReservations: 0,
    currency: 'ETB',
  });

  const { success, error: showError } = useNotification();

  // Fetch overall stats data (not affected by search)
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await dispatch(
          fetchReservations({
            page: 1,
            limit: 1000, // Get all reservations for stats calculation
          }),
        ).unwrap();

        const allReservations = response?.data || [];
        const total = response?.meta?.total || allReservations.length;

        // Calculate stats with safe property access
        const confirmedCount = allReservations.filter(
          (r) => r?.status === 'CONFIRMED',
        ).length;

        const checkedInCount = allReservations.filter(
          (r) => r?.status === 'CHECKED_IN',
        ).length;

        const pendingCount = allReservations.filter(
          (r) => r?.status === 'PENDING',
        ).length;

        const totalRevenue = allReservations.reduce(
          (sum, r) => {
            const price = Number(r?.totalPrice || r?.finalPrice || 0);
            return sum + (isNaN(price) ? 0 : price);
          },
          0,
        );

        // Calculate payment statistics from paymentSummary or paymentStatus
        const totalPaidAmount = allReservations.reduce((sum, r) => {
          // Try paymentSummary first, then paymentStatus, then fallback to 0
          const reservation = r as any;
          const paidAmount = reservation?.paymentSummary?.paidAmount || reservation?.paymentStatus?.paidAmount || 0;
          const amount = Number(paidAmount);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const totalUnpaidAmount = allReservations.reduce((sum, r) => {
          // Try paymentSummary first, then paymentStatus, then fallback to 0
          const reservation = r as any;
          const unpaidAmount = reservation?.paymentSummary?.unpaidAmount || reservation?.paymentStatus?.unpaidAmount || 0;
          const amount = Number(unpaidAmount);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const paidReservations = allReservations.filter((r) => {
          // Check if reservation has any paid amount
          const reservation = r as any;
          const paidAmount = reservation?.paymentSummary?.paidAmount || reservation?.paymentStatus?.paidAmount || 0;
          return Number(paidAmount) > 0;
        }).length;

        // Get currency from first reservation's property, fallback to ETB
        const currency = allReservations[0]?.property?.currency || 'ETB';

        setStatsData({
          totalReservations: total,
          confirmedReservations: confirmedCount,
          checkedInReservations: checkedInCount,
          pendingReservations: pendingCount,
          totalRevenue: totalRevenue,
          totalPaidAmount: totalPaidAmount,
          totalUnpaidAmount: totalUnpaidAmount,
          paidReservations: paidReservations,
          currency: currency,
        });
      } catch (e) {
        console.error('Failed to fetch stats data:', e);
        // Set default stats on error
        setStatsData({
          totalReservations: 0,
          confirmedReservations: 0,
          checkedInReservations: 0,
          pendingReservations: 0,
          totalRevenue: 0,
          totalPaidAmount: 0,
          totalUnpaidAmount: 0,
          paidReservations: 0,
          currency: 'ETB',
        });
      }
    };

    fetchStatsData();
  }, [dispatch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch with filtering - always fetch when filters change
  useEffect(() => {
    dispatch(
      fetchReservations({
        page: 1,
        limit: 100, // Increased limit to show more results
        filters: {
          status:
            statusFilter === 'all'
              ? undefined
              : (statusFilter as ReservationStatus),
          guestName: debouncedSearch || undefined,
        },
      }),
    ).catch((err) => {
      console.error('Failed to fetch reservations:', err);
      showError('Failed to load reservations');
    });
  }, [dispatch, debouncedSearch, statusFilter, showError]);

  const handleDeleteReservation = async () => {
    if (!selectedReservation) return;
    try {
      // TODO: Uncomment when deleteReservation is implemented
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
      console.error('Delete reservation error:', e);
      const apiErr = handleApiError(e as AxiosError);
      showError(apiErr.message || 'Failed to delete reservation');
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

  const handleConfirm = async (reservation: Reservation) => {
    try {
      await dispatch(confirmReservation(reservation.id)).unwrap();
      success('Reservation confirmed successfully!');

      // Refresh the reservations list
      dispatch(
        fetchReservations({
          page: pagination.page,
          limit: pagination.limit,
        }),
      );
    } catch (error: any) {
      console.error('Failed to confirm reservation:', error);
      showError(error || 'Failed to confirm reservation');
    }
  };

  const handleCheckIn = async (reservation: Reservation) => {
    try {
      const checkInData = {
        reservationId: reservation.id,
        actualCheckIn: new Date().toISOString(),
        notes: 'Checked in via dashboard',
      };

      await dispatch(checkInGuest(checkInData)).unwrap();
      success('Guest checked in successfully!');

      // Refresh the reservations list
      dispatch(
        fetchReservations({
          page: pagination.page,
          limit: pagination.limit,
        }),
      );
    } catch (error: any) {
      console.error('Failed to check in guest:', error);
      showError(error || 'Failed to check in guest');
    }
  };

  const renderReservationRow = (reservation: Reservation) => (
    <ReservationTableRow
      key={reservation.id}
      reservation={reservation}
      onView={(r) => {
        router.push(`/dashboard/reservations/list/${r.id}`);
      }}
      onEdit={(r) => {
        router.push(`/dashboard/reservations/edit/${r.id}`);
      }}
      onConfirm={(r) => {
        handleConfirm(r);
      }}
      onCheckIn={(r) => {
        handleCheckIn(r);
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
        <Link href="/dashboard/reservations/new-booking" className="bg-primary flex items-center px-4 py-1.5 rounded-md text-primary-foreground hover:bg-primary/90 cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Link>
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
