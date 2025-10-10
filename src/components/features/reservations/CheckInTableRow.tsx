import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Edit, LogOut, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface CheckInTableRowProps {
    reservation: any;
    index: number;
    onEdit: (reservation: any) => void;
    onCheckOut: (reservation: any) => void;
    getPaymentStatus: (bookingId: string) => { status: string; paid: number; total: number };
}

export function CheckInTableRow({
    reservation,
    index,
    onEdit,
    onCheckOut,
    getPaymentStatus,
}: CheckInTableRowProps) {
    const paymentStatus = getPaymentStatus(reservation.id);
    const totalAmount = Number(reservation.finalPrice || reservation.totalPrice || 0);
    const paidAmount = paymentStatus.paid;
    const dueAmount = totalAmount - paidAmount;

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                );
            case 'PARTIAL':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Partial
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
        }
    };

    const formatDateTime = (dateString: string, includeTime = true) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString();
        const timeStr = includeTime ? date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }) : '';
        return includeTime ? `${dateStr} ${timeStr}` : dateStr;
    };

    const formatCurrency = (amount: number, currency = 'ETB') => {
        return `${currency} ${amount.toFixed(2)}`;
    };

    return (
        <TableRow className="hover:bg-muted/50">
            <TableCell className="font-medium text-center">{index + 1}</TableCell>
            <TableCell className="font-mono text-xs">
                {reservation.id.substring(0, 8).toUpperCase()}
            </TableCell>
            <TableCell className="text-xs">
                {reservation.room?.roomType?.name || 'N/A'}
            </TableCell>
            <TableCell className="font-medium text-center">
                {reservation.room?.number || 'N/A'}
            </TableCell>
            <TableCell className="min-w-0">
                <div className="font-medium text-sm truncate">
                    {reservation.primaryGuest?.firstName} {reservation.primaryGuest?.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                    {reservation.primaryGuest?.email}
                </div>
            </TableCell>
            <TableCell className="text-xs">
                {reservation.primaryGuest?.phone || 'N/A'}
            </TableCell>
            <TableCell>
                <div className="text-xs">
                    <div className="font-medium">
                        {formatDateTime(reservation.checkedInAt || reservation.checkIn, false)}
                    </div>
                    <div className="text-muted-foreground">
                        {formatDateTime(reservation.checkedInAt || reservation.checkIn, true).split(' ')[1]}
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-xs">
                {formatDateTime(reservation.checkOut, true)}
            </TableCell>
            <TableCell className="font-medium text-green-600 text-sm">
                {formatCurrency(paidAmount, reservation.property?.currency)}
            </TableCell>
            <TableCell className="font-medium text-red-600 text-sm">
                {formatCurrency(dueAmount, reservation.property?.currency)}
            </TableCell>
            <TableCell>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Check In
                </Badge>
            </TableCell>
            <TableCell>
                {getPaymentStatusBadge(paymentStatus.status)}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
                        onClick={() => onEdit(reservation)}
                        title="Edit Reservation"
                    >
                        <Edit className="h-4 w-4 text-yellow-700" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 bg-red-100 hover:bg-red-200 cursor-pointer"
                        onClick={() => onCheckOut(reservation)}
                        title="Check Out Guest"
                    >
                        <LogOut className="h-4 w-4 text-red-700" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
