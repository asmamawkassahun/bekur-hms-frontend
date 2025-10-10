import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Eye, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Reservation } from '@/types';

interface ReservationTableRowProps {
  reservation: Reservation;
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
}

export function ReservationTableRow({
  reservation,
  onView,
  onEdit,
  onDelete,
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
        {status.replace('_', ' ')}
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

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div>
          <div className="font-medium">
            {reservation.guest?.firstName} {reservation.guest?.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {reservation.guest?.email}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">
            {reservation.room?.number || reservation.bed?.number}
          </div>
          <div className="text-sm text-muted-foreground">
            {reservation.room?.type || 'Bed'}
          </div>
        </div>
      </TableCell>
      <TableCell>{formatDate(reservation.checkIn)}</TableCell>
      <TableCell>{formatDate(reservation.checkOut)}</TableCell>
      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
      <TableCell className="font-medium">
        {formatCurrency(reservation.totalPrice, reservation.currency)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
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
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90"
            onClick={() => onDelete(reservation)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
