'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchReservations,
  checkInGuest,
  checkOutGuest,
} from '@/store/slices/reservationSlice';
import { fetchPayments } from '@/store/slices/paymentSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { CheckInTableRow } from '@/components/features/reservations/CheckInTableRow';
import { PaymentDialog } from '@/components/features/reservations/PaymentDialog';
import type { Payment } from '@/types/payment.types';

export default function CheckInPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { reservations, loading } = useSelector(
    (state: RootState) => state.reservation,
  );
  const { payments } = useSelector((state: RootState) => state.payment);
  const { success, error: showError } = useNotification();

  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [actualCheckIn, setActualCheckIn] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<any>(null);
  const [checkedInReservations, setCheckedInReservations] = useState<any[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedReservationForPayment, setSelectedReservationForPayment] =
    useState<any>(null);
  const [unpaidAmount, setUnpaidAmount] = useState(0);

  // Fetch pending/confirmed reservations and checked-in reservations on mount
  useEffect(() => {
    dispatch(
      fetchReservations({
        page: 1,
        limit: 100,
        filters: { status: 'CONFIRMED' },
      }),
    );

    // Fetch checked-in reservations for the list
    dispatch(
      fetchReservations({
        page: 1,
        limit: 100,
        filters: { status: 'CHECKED_IN' },
      }),
    ).then((result: any) => {
      if (result.payload?.data) {
        setCheckedInReservations(result.payload.data);
      }
    });

    // Fetch all payments to match with reservations
    dispatch(fetchPayments({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Set default check-in time to now
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setActualCheckIn(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  const handleCheckIn = async () => {
    if (!selectedReservationId) {
      showError('Please select a reservation');
      return;
    }

    if (!actualCheckIn) {
      showError('Please select check-in date and time');
      return;
    }

    setIsSubmitting(true);
    setApiResponse(null);
    setApiError(null);

    try {
      const checkInData = {
        reservationId: selectedReservationId,
        actualCheckIn: new Date(actualCheckIn).toISOString(),
        notes: notes || undefined,
      };

      console.log('Check-in Request:', checkInData);

      const response = await dispatch(checkInGuest(checkInData)).unwrap();

      console.log('Check-in Response:', response);
      setApiResponse(response);
      success('Guest checked in successfully!');

      // Refresh both confirmed and checked-in reservations list
      dispatch(
        fetchReservations({
          page: 1,
          limit: 100,
          filters: { status: 'CONFIRMED' },
        }),
      );


      dispatch(
        fetchReservations({
          page: 1,
          limit: 100,
          filters: { status: 'CHECKED_IN' },
        }),
      ).then((result: any) => {
        if (result.payload?.data) {
          setCheckedInReservations(result.payload.data);
        }
      });

      // Reset form
      setSelectedReservationId('');
      setNotes('');
    } catch (err: any) {
      console.error('Check-in Error:', err);
      setApiError(err);
      showError(err.message || 'Failed to check in guest');
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

  // Handle checkout
  const handleCheckOut = async (reservation: any) => {
    // First check payment status before attempting checkout
    const paymentStatus = getPaymentStatus(reservation.id);
    
    console.log('Payment status check:', {
      reservationId: reservation.id,
      paymentStatus: paymentStatus.status,
      paid: paymentStatus.paid,
      total: paymentStatus.total
    });

    // If payment is not completed, show payment dialog first
    if (paymentStatus.status !== 'COMPLETED') {
      console.log('💳 Payment required - Opening payment dialog:', {
        paymentStatus: paymentStatus.status,
        reservation: reservation.id,
        guest: `${reservation.primaryGuest?.firstName} ${reservation.primaryGuest?.lastName}`,
      });

      // Get unpaid amount from reservation's payment summary or payment status
      const reservationData = reservation as any;
      const unpaidAmount = reservationData?.paymentSummary?.unpaidAmount || 
                          reservationData?.paymentStatus?.unpaidAmount || 
                          (Number(reservationData?.finalPrice || reservationData?.totalPrice || 0) - paymentStatus.paid);

      console.log('Unpaid amount calculation:', {
        paymentSummaryUnpaid: reservationData?.paymentSummary?.unpaidAmount,
        paymentStatusUnpaid: reservationData?.paymentStatus?.unpaidAmount,
        finalPrice: reservationData?.finalPrice,
        totalPrice: reservationData?.totalPrice,
        paidAmount: paymentStatus.paid,
        calculatedUnpaid: unpaidAmount
      });

      setUnpaidAmount(Number(unpaidAmount));
      setSelectedReservationForPayment(reservation);
      setShowPaymentDialog(true);

      showError('Payment required before checkout');
      return;
    }

    // If payment is completed, proceed with checkout
    try {
      const checkOutData = {
        reservationId: reservation.id,
        actualCheckOut: new Date().toISOString(),
        notes: 'Checked out via dashboard',
      };

      await dispatch(checkOutGuest(checkOutData)).unwrap();
      success('Guest checked out successfully!');

      // Refresh the checked-in reservations list
      dispatch(
        fetchReservations({
          page: 1,
          limit: 100,
          filters: { status: 'CHECKED_IN' },
        }),
      ).then((result: any) => {
        if (result.payload?.data) {
          setCheckedInReservations(result.payload.data);
        }
      });
    } catch (err: any) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to check out guest';

      console.error('Check-out Error:', errorMessage);
      showError(errorMessage);
    }
  };

  // Handle payment success and retry checkout
  const handlePaymentSuccess = async () => {
    if (!selectedReservationForPayment) return;

    try {
      // Store reservation before closing dialog
      const reservation = selectedReservationForPayment;

      // Close the payment dialog first
      setShowPaymentDialog(false);

      // Refresh payments to get updated status
      await dispatch(fetchPayments({ page: 1, limit: 1000 }));

      // Now attempt checkout with the stored reservation
      const checkOutData = {
        reservationId: reservation.id,
        actualCheckOut: new Date().toISOString(),
        notes: 'Checked out via dashboard',
      };


      await dispatch(checkOutGuest(checkOutData)).unwrap();
      success('Guest checked out successfully!');

      // Refresh the checked-in reservations list
      dispatch(
        fetchReservations({
          page: 1,
          limit: 100,
          filters: { status: 'CHECKED_IN' },
        }),
      ).then((result: any) => {
        if (result.payload?.data) {
          setCheckedInReservations(result.payload.data);
        }
      });

      // Clear the selected reservation state
      setSelectedReservationForPayment(null);
      setUnpaidAmount(0);
    } catch (err: any) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to check out guest after payment';

      console.error('Check-out Error after payment:', errorMessage);
      showError(errorMessage);

      // Reset payment dialog state
      setShowPaymentDialog(false);
      setSelectedReservationForPayment(null);
      setUnpaidAmount(0);
    }
  };

  // Calculate stats for checked-in guests
  const checkedInStats = {
    totalCheckedIn: checkedInReservations.length,
    confirmedWaiting: reservations.filter((r) => r.status === 'CONFIRMED')
      .length,
    checkedInToday: checkedInReservations.filter((r) => {
      const checkInDate = new Date(r.actualCheckIn || r.checkIn);
      const today = new Date();
      return checkInDate.toDateString() === today.toDateString();
    }).length,
    unpaidGuests: checkedInReservations.filter((r) => {
      const paymentStatus = getPaymentStatus(r.id);
      return paymentStatus.status !== 'COMPLETED';
    }).length,
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Check-In Guest"
        description="Process guest check-in for confirmed reservations"
      >
        <Link
          href="/dashboard/reservations/direct-check-in"
          className="bg-primary flex items-center px-4 py-1.5 rounded-md text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Direct Check-In
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Checked In"
          value={checkedInStats.totalCheckedIn}
          description="Currently in hotel"
          icon={CheckCircle}
          gradient="green"
        />
        <StatsCard
          title="Confirmed & Waiting"
          value={checkedInStats.confirmedWaiting}
          description="Ready to check in"
          icon={Clock}
          gradient="yellow"
        />
        <StatsCard
          title="Checked In Today"
          value={checkedInStats.checkedInToday}
          description="Arrivals today"
          icon={Calendar}
          gradient="blue"
        />
        <StatsCard
          title="Unpaid Guests"
          value={checkedInStats.unpaidGuests}
          description="Payment pending"
          icon={AlertCircle}
          gradient="rose"
        />
      </div>


      {/* Check-In List */}
      <DataTable
        title="Check In List"
        description="View and manage all checked-in guests"
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
          { key: 'dueAmount', label: 'Due', width: 'w-[90px]' },
          { key: 'bookingStatus', label: 'Status', width: 'w-[100px]' },
          { key: 'paymentStatus', label: 'Payment', width: 'w-[100px]' },
          {
            key: 'actions',
            label: 'Actions',
            width: 'w-[150px]',
            sortable: false,
          },
        ]}
        data={checkedInReservations}
        loading={loading}
        emptyMessage="No guests currently checked in"
        renderRow={(reservation, index) => (
          <CheckInTableRow
            key={reservation.id}
            reservation={reservation}
            index={index}
            onEdit={(r) => {
              router.push(`/dashboard/reservations/edit/${r.id}`);
            }}
            onCheckOut={(r) => {
              handleCheckOut(r);
            }}
            getPaymentStatus={getPaymentStatus}
          />
        )}
      />

      {/* Payment Dialog */}
      {selectedReservationForPayment && (
        <PaymentDialog
          open={showPaymentDialog}
          onClose={() => {
            setShowPaymentDialog(false);
            setSelectedReservationForPayment(null);
            setUnpaidAmount(0);
          }}
          reservation={selectedReservationForPayment}
          unpaidAmount={unpaidAmount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
