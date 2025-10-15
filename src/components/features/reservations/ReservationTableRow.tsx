import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Eye, Edit, Ban, CheckCircle, Clock, XCircle, LogIn, Check } from 'lucide-react';
import type { Reservation } from '@/types';

interface ReservationTableRowProps {
  reservation: Reservation;
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
  onConfirm: (reservation: Reservation) => void;
  onCheckIn: (reservation: Reservation) => void;
}

export function ReservationTableRow({
  reservation,
  onView,
  onEdit,
  onCancel,
  onConfirm,
  onCheckIn,
}: ReservationTableRowProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      CHECKED_IN: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CHECKED_OUT: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      NO_SHOW: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status?.replace('_', ' ') || 'Unknown'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // Get guest information from primaryGuest or bookingGuests
  const primaryGuest = reservation.primaryGuest || reservation.guest;
  const allGuests = reservation.bookingGuests || [];
  const guestCount = allGuests.length;

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div>
          <div className="font-medium">
            {primaryGuest?.firstName} {primaryGuest?.lastName}
            {guestCount > 1 && (
              <span className="ml-2 text-xs text-muted-foreground">
                +{guestCount - 1} guest{guestCount - 1 > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {primaryGuest?.email}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">
            {reservation.room?.number || '-'}
          </div>
          <div className="text-sm text-muted-foreground">
            {reservation.room?.roomType?.name || ''}
          </div>
        </div>
      </TableCell>
      <TableCell>{formatDate(reservation.checkIn)}</TableCell>
      <TableCell>{formatDate(reservation.checkOut)}</TableCell>
      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
      <TableCell className="font-medium">
        {formatCurrency(
          Number(reservation.totalPrice || reservation.finalPrice),
          reservation.property?.currency || reservation.currency || 'ETB',
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onView(reservation)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onEdit(reservation)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {/* Show confirm button for PENDING reservations */}
          {reservation.status === 'PENDING' && (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer text-blue-600 hover:text-blue-700"
              onClick={() => onConfirm(reservation)}
              title="Confirm Reservation"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          {/* Show check-in button for CONFIRMED reservations only */}
          {reservation.status === 'CONFIRMED' && (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer text-green-600 hover:text-green-700"
              onClick={() => onCheckIn(reservation)}
              title="Check In Guest"
            >
              <LogIn className="h-4 w-4" />
            </Button>
          )}
          {/* Show cancel button for PENDING/CONFIRMED reservations (before checkout) */}
          {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer text-destructive hover:text-destructive/90"
              onClick={() => onCancel(reservation)}
              title="Cancel Reservation"
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
