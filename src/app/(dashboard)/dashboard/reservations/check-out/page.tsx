'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchReservations, checkOutGuest } from '@/store/slices/reservationSlice';
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
import { LogOut, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { CheckOutTableRow } from '@/components/features/reservations/CheckOutTableRow';
import type { Payment } from '@/types/payment.types';

export default function CheckOutPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { reservations, loading } = useSelector((state: RootState) => state.reservation);
    const { payments } = useSelector((state: RootState) => state.payment);
    const { success, error: showError } = useNotification();

    const [selectedReservationId, setSelectedReservationId] = useState('');
    const [actualCheckOut, setActualCheckOut] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [apiError, setApiError] = useState<any>(null);
    const [checkedOutReservations, setCheckedOutReservations] = useState<any[]>([]);

    // Fetch checked-in reservations and checked-out reservations on mount
    useEffect(() => {
        dispatch(
            fetchReservations({
                page: 1,
                limit: 100,
                filters: { status: 'CHECKED_IN' },
            }),
        );

        // Fetch checked-out reservations for the list
        dispatch(
            fetchReservations({
                page: 1,
                limit: 100,
                filters: { status: 'CHECKED_OUT' },
            }),
        ).then((result: any) => {
            if (result.payload?.data) {
                setCheckedOutReservations(result.payload.data);
            }
        });

        // Fetch all payments to match with reservations
        dispatch(fetchPayments({ page: 1, limit: 1000 }));
    }, [dispatch]);

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
                    page: 1,
                    limit: 100,
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

    const selectedReservation = reservations.find((r) => r.id === selectedReservationId);

    // Check payment status for a reservation
    const getPaymentStatus = (bookingId: string) => {
        const reservationPayments = payments.filter(
            (p: Payment) => p.reservationId === bookingId || (p as any).bookingId === bookingId
        );

        if (reservationPayments.length === 0) {
            return { status: 'PENDING', paid: 0, total: 0 };
        }

        const totalPaid = reservationPayments
            .filter((p: Payment) => p.status === 'COMPLETED')
            .reduce((sum: number, p: Payment) => sum + Number(p.amount), 0);

        const allCompleted = reservationPayments.every((p: Payment) => p.status === 'COMPLETED');

        return {
            status: allCompleted ? 'COMPLETED' : 'PARTIAL',
            paid: totalPaid,
            total: totalPaid,
        };
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Check-Out Guest"
                description="Process guest check-out for checked-in reservations"
            />
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
                    { key: 'dueAmount', label: 'Due', width: 'w-[90px]' },
                    { key: 'bookingStatus', label: 'Status', width: 'w-[100px]' },
                    { key: 'paymentStatus', label: 'Payment', width: 'w-[100px]' },
                    { key: 'actions', label: 'Actions', width: 'w-[150px]', sortable: false },
                ]}
                data={checkedOutReservations}
                loading={loading}
                emptyMessage="No guests checked out yet"
                renderRow={(reservation, index) => (
                    <CheckOutTableRow
                        key={reservation.id}
                        reservation={reservation}
                        index={index}
                        onEdit={(reservation) => console.log('Edit:', reservation)}
                        onView={(reservation) => console.log('View:', reservation)}
                        onPrint={(reservation) => console.log('Print:', reservation)}
                        onDelete={(reservation) => console.log('Delete:', reservation)}
                        getPaymentStatus={getPaymentStatus}
                    />
                )}
            />
        </div>
    );
}