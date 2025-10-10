import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { RoomType } from '@/types';

interface RoomTypeTableRowProps {
  roomType: RoomType;
  onView: (roomType: RoomType) => void;
  onEdit: (roomType: RoomType) => void;
  onDelete: (roomType: RoomType) => void;
}

export function RoomTypeTableRow({
  roomType,
  onView,
  onEdit,
  onDelete,
}: RoomTypeTableRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPropertyName = (propertyId: string) => {
    // This would need to be passed from parent or fetched
    return `Property ${propertyId}`;
  };
  console.log("roomType: ", roomType);

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <div>
          <div className="font-semibold">{roomType.name}</div>
         
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{roomType.adultCapacity} adults</div>
          <div className="text-muted-foreground">
            {roomType.childCapacity} children
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {roomType.adultCapacity + roomType.childCapacity} guests
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {formatCurrency(roomType.basePrice)}
      </TableCell>
      <TableCell>
        <Badge variant={roomType.isActive ? 'default' : 'secondary'}>
          {
            roomType.isActive ? 'Active' : 'Inactive'
          }
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onView(roomType)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onEdit(roomType)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onDelete(roomType)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
