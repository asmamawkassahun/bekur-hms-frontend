import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Edit, ThumbsUp, Eye, Printer, X, CheckCircle, AlertCircle, Clock, Phone, Delete, DeleteIcon, Trash2 } from 'lucide-react';

interface CheckOutTableRowProps {
    reservation: any;
    index: number;
    onView: (reservation: any) => void;
    onDelete: (reservation: any) => void;
    getPaymentStatus: (bookingId: string) => { status: string; paid: number; total: number };
}

export function CheckOutTableRow({
    reservation,
    index,
    onView,
    onDelete,
    getPaymentStatus,
}: CheckOutTableRowProps) {
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
                {reservation.room?.roomType?.name || '-'}
            </TableCell>
            <TableCell className="font-medium text-center">
                {reservation.room?.number || '-'}
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
                {reservation.primaryGuest?.phone || '-'}
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
            <TableCell>
                <div className="text-xs">
                    <div className="font-medium">
                        {formatDateTime(reservation.checkedOutAt || reservation.checkOut, false)}
                    </div>
                    <div className="text-muted-foreground">
                        {formatDateTime(reservation.checkedOutAt || reservation.checkOut, true).split(' ')[1]}
                    </div>
                </div>
            </TableCell>
            <TableCell className="font-medium text-green-600 text-sm">
                {formatCurrency(paidAmount, reservation.property?.currency)}
            </TableCell>
            {/* <TableCell className="font-medium text-red-600 text-sm">
                {formatCurrency(dueAmount, reservation.property?.currency)}
            </TableCell> */}
            {/* <TableCell>
                <Badge className="bg-red-100 text-red-800 text-xs">
                    Check Out
                </Badge>
            </TableCell>
            <TableCell>
                {getPaymentStatusBadge(paymentStatus.status)}
            </TableCell> */}
            <TableCell>
                <div className="flex items-center gap-1">
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-yellow-100 hover:bg-yellow-200"
                        onClick={() => onEdit(reservation)}
                    >
                        <Edit className="h-3 w-3 text-yellow-700" />
                    </Button> */}
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-gray-100 hover:bg-gray-200"
                    >
                        <ThumbsUp className="h-3 w-3 text-gray-700" />
                    </Button> */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => onView(reservation)}
                    >
                        <Eye className="h-3 w-" />
                    </Button>
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-blue-100 hover:bg-blue-200"
                        onClick={() => onPrint(reservation)}
                    >
                        <Printer className="h-3 w-3 text-blue-700" />
                    </Button> */}
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        className=" cursor-pointer text-destructive hover:text-destructive/90"
                        onClick={() => onDelete(reservation)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button> */}
                </div>
            </TableCell>
        </TableRow>
    );
}
