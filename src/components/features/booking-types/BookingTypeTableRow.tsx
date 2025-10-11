import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Power } from 'lucide-react';
import type { BookingType } from '@/services/booking.service';

interface BookingTypeTableRowProps {
  bookingType: BookingType;
  onView: (bookingType: BookingType) => void;
  onEdit: (bookingType: BookingType) => void;
  onDelete: (bookingType: BookingType) => void;
  onToggleStatus: (bookingType: BookingType) => void;
}

export function BookingTypeTableRow({
  bookingType,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: BookingTypeTableRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div>
          <div className="font-semibold">{bookingType.name}</div>
          {bookingType.description && (
            <div className="text-sm text-muted-foreground">
              {bookingType.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={bookingType.isActive ? 'default' : 'secondary'}>
          {bookingType.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(bookingType.createdAt)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onView(bookingType)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onEdit(bookingType)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] ${
              bookingType.isActive ? 'text-orange-600' : 'text-green-600'
            }`}
            onClick={() => onToggleStatus(bookingType)}
            title={bookingType.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onDelete(bookingType)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
