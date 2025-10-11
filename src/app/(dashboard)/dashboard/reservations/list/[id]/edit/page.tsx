'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { reservationService } from '@/services/reservation.service';
import type { Reservation } from '@/types';
import { LoadingState } from '@/components/shared/LoadingState';
import { useNotification } from '@/hooks/useNotification';

export default function EditReservationPage() {
  const params = useParams();
  const router = useRouter();
  const { error: showError, success } = useNotification();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true);
        const response = await reservationService.getById(params.id as string);
        setReservation(response.data.data || null);
      } catch (err) {
        showError('Failed to load reservation details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchReservation();
    }
  }, [params.id, showError]);

  if (loading) {
    return <LoadingState />;
  }

  if (!reservation) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            Reservation not found
          </h2>
          <p className="text-gray-600 mt-2">
            The reservation you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push('/dashboard/reservations')}
            className="mt-4"
          >
            Back to Reservations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/reservations/${reservation.id}`)
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Reservation
              </h1>
              <p className="text-gray-600">
                Booking ID: {reservation.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Edit Functionality Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            The reservation edit form is currently under development. For now,
            you can view the reservation details.
          </p>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/reservations/${reservation.id}`)
              }
            >
              View Details
            </Button>
            <Button onClick={() => router.push('/dashboard/reservations')}>
              Back to Reservations
            </Button>
          </div>
        </div>

        {/* Reservation Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-4">
            Current Reservation Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Guest</p>
              <p className="font-medium">
                {reservation.primaryGuest?.firstName}{' '}
                {reservation.primaryGuest?.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Room</p>
              <p className="font-medium">{reservation.room?.number}</p>
            </div>
            <div>
              <p className="text-gray-600">Check-in</p>
              <p className="font-medium">
                {new Date(reservation.checkIn).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Check-out</p>
              <p className="font-medium">
                {new Date(reservation.checkOut).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
