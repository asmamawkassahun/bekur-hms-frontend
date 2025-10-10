'use client';

import { ReservationForm } from '@/components/features/reservations/ReservationForm';
import { useRouter } from 'next/navigation';

export default function NewBookingPage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect to reservations list after successful booking
        router.push('/dashboard/reservations/list');
    };

    return <ReservationForm mode="booking" onSuccess={handleSuccess} />;
}
