'use client';

import { EditReservationForm } from '@/components/features/reservations/EditReservationForm';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReservations } from '@/store/slices/reservationSlice';
import type { RootState, AppDispatch } from '@/store';

export default function EditReservationPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const { reservations, loading } = useSelector((state: RootState) => state.reservation);

    const reservationId = params.id as string;

    // Fetch reservations if not already loaded
    useEffect(() => {
        if (reservations.length === 0) {
            dispatch(fetchReservations({ page: 1, limit: 100 }));
        }
    }, [dispatch, reservations.length]);

    const handleSuccess = () => {
        router.push('/dashboard/reservations/list');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <EditReservationForm
                reservationId={reservationId}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
