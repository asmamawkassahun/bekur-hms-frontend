import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Power, Calculator } from 'lucide-react';
import type { BookingSource } from '@/services/booking.service';

interface BookingSourceTableRowProps {
  bookingSource: BookingSource;
  onView: (bookingSource: BookingSource) => void;
  onEdit: (bookingSource: BookingSource) => void;
  onDelete: (bookingSource: BookingSource) => void;
  onToggleStatus: (bookingSource: BookingSource) => void;
  onCalculateCommission: (bookingSource: BookingSource) => void;
}

export function BookingSourceTableRow({
  bookingSource,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onCalculateCommission,
}: BookingSourceTableRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div>
          <div className="font-semibold">{bookingSource.name}</div>
          {bookingSource.bookingType && (
            <div className="text-xs text-muted-foreground mt-1">
              {bookingSource.bookingType.name}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {bookingSource.bookingType ? (
          <Badge variant="outline">{bookingSource.bookingType.name}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell className="font-medium">
        {bookingSource.commissionRate}%
      </TableCell>
      <TableCell>
        <Badge variant={bookingSource.isActive ? 'default' : 'secondary'}>
          {bookingSource.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(bookingSource.createdAt)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onView(bookingSource)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onEdit(bookingSource)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-blue-600 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onCalculateCommission(bookingSource)}
            title="Calculate commission"
          >
            <Calculator className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] ${
              bookingSource.isActive ? 'text-orange-600' : 'text-green-600'
            }`}
            onClick={() => onToggleStatus(bookingSource)}
            title={bookingSource.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onDelete(bookingSource)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
