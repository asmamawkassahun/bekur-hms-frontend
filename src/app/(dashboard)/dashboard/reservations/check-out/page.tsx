'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchReservations,
  checkOutGuest,
  deleteReservation,
} from '@/store/slices/reservationSlice';
import { fetchPayments } from '@/store/slices/paymentSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { CheckOutTableRow } from '@/components/features/reservations/CheckOutTableRow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { Reservation } from '@/types';
import type { Payment } from '@/types/payment.types';

export default function CheckOutPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { reservations, loading, pagination } = useSelector(
    (state: RootState) => state.reservation,
  );
  const { payments } = useSelector((state: RootState) => state.payment);
  const { success, error: showError } = useNotification();

  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [actualCheckOut, setActualCheckOut] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<any>(null);
  const [checkedOutReservations, setCheckedOutReservations] = useState<any[]>(
    [],
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Reservation | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Initial fetch for stats and payments
  useEffect(() => {
    dispatch(
      fetchReservations({
        page: 1,
        limit: 100,
        filters: { status: 'CHECKED_IN' },
      }),
    );
    dispatch(fetchPayments({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Fetch checked-out reservations with pagination
  useEffect(() => {
    dispatch(
      fetchReservations({
        page,
        limit,
        filters: { status: 'CHECKED_OUT' },
      }),
    ).then((result: any) => {
      if (result.payload?.data) {
        setCheckedOutReservations(result.payload.data);
      }
    });
  }, [dispatch, page, limit]);

  // Set default check-out time to now
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    setActualCheckOut(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  const handleCheckOut = async () => {
    if (!selectedReservationId || !actualCheckOut) {
      showError('Please select a reservation and check-out time');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setApiResponse(null);

    try {
      const checkOutData = {
        reservationId: selectedReservationId,
        actualCheckOut: actualCheckOut,
        notes: notes || undefined,
      };

      console.log('Check-out Request:', checkOutData);

      const response = await dispatch(checkOutGuest(checkOutData)).unwrap();

      console.log('Check-out Response:', response);
      setApiResponse(response);
      success('Guest checked out successfully!');

      // Refresh both checked-in and checked-out reservations list
      dispatch(
        fetchReservations({
          page: 1,
          limit: 100,
          filters: { status: 'CHECKED_IN' },
        }),
      );

      dispatch(
        fetchReservations({
          page,
          limit,
          filters: { status: 'CHECKED_OUT' },
        }),
      ).then((result: any) => {
        if (result.payload?.data) {
          setCheckedOutReservations(result.payload.data);
        }
      });

      // Reset form
      setSelectedReservationId('');
      setNotes('');
    } catch (err: any) {
      console.error('Check-out Error:', err);
      setApiError(err);
      showError(err.message || 'Failed to check out guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReservation = reservations.find(
    (r) => r.id === selectedReservationId,
  );

  // Check payment status for a reservation
  const getPaymentStatus = (bookingId: string) => {
    const reservationPayments = payments.filter(
      (p: Payment) =>
        p.reservationId === bookingId || (p as any).bookingId === bookingId,
    );

    if (reservationPayments.length === 0) {
      return { status: 'PENDING', paid: 0, total: 0 };
    }

    const totalPaid = reservationPayments
      .filter((p: Payment) => p.status === 'COMPLETED')
      .reduce((sum: number, p: Payment) => sum + Number(p.amount), 0);

    const allCompleted = reservationPayments.every(
      (p: Payment) => p.status === 'COMPLETED',
    );

    return {
      status: allCompleted ? 'COMPLETED' : 'PARTIAL',
      paid: totalPaid,
      total: totalPaid,
    };
  };

  const handleDeleteCheckout = async () => {
    if (!selectedRow) return;
    try {
      await dispatch(deleteReservation(selectedRow.id)).unwrap();
      setCheckedOutReservations((prev) => prev.filter((r) => r.id !== selectedRow.id));
      setDeleteOpen(false);
      setSelectedRow(null);
      success('Checkout record deleted');
    } catch (err: any) {
      console.error('Delete checkout error:', err);
      showError(err?.message || 'Failed to delete checkout record');
    }
  };

  // Calculate stats for checkout
  const checkOutStats = {
    checkedIn: reservations.filter((r) => r.status === 'CHECKED_IN').length,
    checkedOutToday: checkedOutReservations.filter((r) => {
      const checkOutDate = new Date(r.actualCheckOut || r.checkOut);
      const today = new Date();
      return checkOutDate.toDateString() === today.toDateString();
    }).length,
    totalCheckedOut: checkedOutReservations.length,
    unpaidCheckouts: checkedOutReservations.filter((r) => {
      const paymentStatus = getPaymentStatus(r.id);
      return paymentStatus.status !== 'COMPLETED';
    }).length,
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Check-Out Guest"
        description="Process guest check-out for checked-in reservations"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ready to Check Out"
          value={checkOutStats.checkedIn}
          description="Currently checked in"
          icon={Clock}
          gradient="yellow"
        />
        <StatsCard
          title="Checked Out Today"
          value={checkOutStats.checkedOutToday}
          description="Departures today"
          icon={CheckCircle}
          gradient="green"
        />
        <StatsCard
          title="Total Checked Out"
          value={checkOutStats.totalCheckedOut}
          description="All time checkouts"
          icon={LogOut}
          gradient="blue"
        />
        <StatsCard
          title="Unpaid Checkouts"
          value={checkOutStats.unpaidCheckouts}
          description="Payment pending"
          icon={AlertCircle}
          gradient="rose"
        />
      </div>

      {/* Check-Out List */}
      <DataTable
        title="Check Out List"
        description="View and manage all checked-out guests"
        columns={[
          { key: 'slNo', label: 'SL No', width: 'w-[60px]' },
          { key: 'bookingNumber', label: 'Booking No.', width: 'w-[100px]' },
          { key: 'roomType', label: 'Room Type', width: 'w-[110px]' },
          { key: 'roomNumber', label: 'Room No.', width: 'w-[80px]' },
          { key: 'guestName', label: 'Guest Name', width: 'w-[180px]' },
          { key: 'phone', label: 'Phone', width: 'w-[110px]' },
          { key: 'checkIn', label: 'Check In', width: 'w-[120px]' },
          { key: 'checkOut', label: 'Check Out', width: 'w-[120px]' },
          { key: 'paidAmount', label: 'Paid', width: 'w-[90px]' },
          // { key: 'dueAmount', label: 'Due', width: 'w-[90px]' },
          // { key: 'bookingStatus', label: 'Status', width: 'w-[100px]' },
          // { key: 'paymentStatus', label: 'Payment', width: 'w-[100px]' },
          {
            key: 'actions',
            label: 'Actions',
            width: 'w-[150px]',
            sortable: false,
          },
        ]}
        data={checkedOutReservations}
        loading={loading}
        emptyMessage="No guests checked out yet"
        renderRow={(reservation, index) => (
          <CheckOutTableRow
            key={reservation.id}
            reservation={reservation}
            index={index}
            onView={(reservation) => {
              setSelectedRow(reservation);
              setViewOpen(true);
            }}
            onDelete={(reservation) => {
              setSelectedRow(reservation);
              setDeleteOpen(true);
            }}
            getPaymentStatus={getPaymentStatus}
          />
        )}
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

      {/* View Checkout Details */}
      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setSelectedRow(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Checkout Details</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-muted-foreground">Booking No.</div>
                  <div className="font-medium">{selectedRow.id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Guest</div>
                  <div className="font-medium">
                    {selectedRow.primaryGuest?.firstName} {selectedRow.primaryGuest?.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Room</div>
                  <div className="font-medium">{selectedRow.room?.roomType?.name} • {selectedRow.room?.number}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Check In</div>
                  <div className="font-medium">{new Date(selectedRow.checkedInAt || selectedRow.checkIn).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Check Out</div>
                  <div className="font-medium">{new Date(selectedRow.checkedOutAt || selectedRow.checkOut).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Payment</div>
                {(() => {
                  const p = getPaymentStatus(selectedRow.id);
                  return (
                    <div className="font-medium">
                      Status: {p.status} • Paid: {p.paid}
                    </div>
                  );
                })()}
              </div>
              {selectedRow.notes && (
                <div>
                  <div className="text-muted-foreground">Notes</div>
                  <div className="whitespace-pre-wrap">{selectedRow.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Checkout Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelectedRow(null);
        }}
        title="Delete Checkout"
        description={`Are you sure you want to delete checkout ${selectedRow ? selectedRow.id : ''}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteCheckout}
        loading={loading}
      />
    </div>
  );
}
