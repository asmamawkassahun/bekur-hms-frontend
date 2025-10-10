'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Calendar, User, Building, DollarSign, FileText } from 'lucide-react';
import { reservationService } from '@/services/reservation.service';
import type { Reservation } from '@/types';
import { LoadingState } from '@/components/shared/LoadingState';
import { useNotification } from '@/hooks/useNotification';

export default function ReservationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { error: showError } = useNotification();
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
        return <LoadingState message="Loading reservation details..." />;
    }

    if (!reservation) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-900">Reservation not found</h2>
                    <p className="text-gray-600 mt-2">The reservation you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push('/dashboard/reservations')} className="mt-4">
                        Back to Reservations
                    </Button>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            CHECKED_IN: 'bg-green-100 text-green-800',
            CHECKED_OUT: 'bg-gray-100 text-gray-800',
            CANCELLED: 'bg-red-100 text-red-800',
            NO_SHOW: 'bg-red-100 text-red-800',
        };

        return (
            <Badge className={statusConfig[status] || statusConfig.PENDING}>
                {status?.replace('_', ' ') || 'Unknown'}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: reservation.property?.currency || 'ETB',
        }).format(Number(amount));
    };

    const primaryGuest = reservation.primaryGuest;
    const allGuests = reservation.bookingGuests || [];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reservation Details</h1>
                        <p className="text-gray-600">Booking ID: {reservation.id.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(reservation.status)}
                    <Button
                        onClick={() => router.push(`/dashboard/reservations/edit/${reservation.id}`)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Guest Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Guest Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {primaryGuest?.firstName} {primaryGuest?.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">{primaryGuest?.email}</p>
                                <p className="text-sm text-gray-600">{primaryGuest?.phone}</p>
                            </div>

                            {allGuests.length > 1 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                                            Additional Guests ({allGuests.length - 1})
                                        </h4>
                                        <div className="space-y-2">
                                            {allGuests
                                                .filter((bg) => !bg.isPrimary)
                                                .map((bg) => (
                                                    <div key={bg.id} className="text-sm">
                                                        <p className="font-medium">
                                                            {bg.guest?.firstName} {bg.guest?.lastName}
                                                        </p>
                                                        <p className="text-gray-600">{bg.guest?.email}</p>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Booking Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Booking Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Check-in</p>
                                    <p className="font-medium">{formatDate(reservation.checkIn)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Check-out</p>
                                    <p className="font-medium">{formatDate(reservation.checkOut)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Adults</p>
                                    <p className="font-medium">{reservation.adults}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Children</p>
                                    <p className="font-medium">{reservation.children}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-gray-600">Booking Type</p>
                                <p className="font-medium">{reservation.bookingType?.name || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Booking Source</p>
                                <p className="font-medium">{reservation.bookingSource?.name || 'N/A'}</p>
                            </div>

                            {reservation.specialRequests && reservation.specialRequests.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600">Special Requests</p>
                                    <ul className="list-disc list-inside">
                                        {reservation.specialRequests.map((req, idx) => (
                                            <li key={idx} className="text-sm">{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {reservation.notes && (
                                <div>
                                    <p className="text-sm text-gray-600">Notes</p>
                                    <p className="text-sm">{reservation.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Room Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Accommodation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Property</p>
                                <p className="font-medium">{reservation.property?.name}</p>
                                <p className="text-sm text-gray-600">
                                    {reservation.property?.address}, {reservation.property?.city}
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-gray-600">Room</p>
                                <p className="font-medium">
                                    {reservation.room?.number} - {reservation.room?.roomType?.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Floor {reservation.room?.floor}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pricing Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base Price</span>
                                <span className="font-medium">{formatCurrency(reservation.basePrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">{formatCurrency(reservation.taxAmount)}</span>
                            </div>
                            {Number(reservation.discount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span className="font-medium">-{formatCurrency(reservation.discount)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Final Price</span>
                                <span>{formatCurrency(reservation.finalPrice)}</span>
                            </div>

                            {Number(reservation.commissionAmount) > 0 && (
                                <>
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Commission ({reservation.commissionRate}%)</span>
                                        <span className="text-gray-600">{formatCurrency(reservation.commissionAmount)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span className="text-gray-600">Net Revenue</span>
                                        <span>{formatCurrency(reservation.netRevenue)}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Metadata
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-600">Created</p>
                                <p className="font-medium">{formatDate(reservation.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Last Updated</p>
                                <p className="font-medium">{formatDate(reservation.updatedAt)}</p>
                            </div>
                            {reservation.confirmedAt && (
                                <div>
                                    <p className="text-gray-600">Confirmed At</p>
                                    <p className="font-medium">{formatDate(reservation.confirmedAt)}</p>
                                </div>
                            )}
                            {reservation.checkedInAt && (
                                <div>
                                    <p className="text-gray-600">Checked In At</p>
                                    <p className="font-medium">{formatDate(reservation.checkedInAt)}</p>
                                </div>
                            )}
                            {reservation.checkedOutAt && (
                                <div>
                                    <p className="text-gray-600">Checked Out At</p>
                                    <p className="font-medium">{formatDate(reservation.checkedOutAt)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

