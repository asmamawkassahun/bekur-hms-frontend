'use client';

import { ReservationForm } from '@/components/features/reservations/ReservationForm';
import { useRouter } from 'next/navigation';

export default function DirectCheckInPage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect to check-in list after successful direct check-in
        router.push('/dashboard/reservations/check-in');
    };

    return <ReservationForm mode="direct-checkin" onSuccess={handleSuccess} />;
}

