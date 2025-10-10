import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Eye, Edit, Trash2, Bed, Users, DollarSign } from 'lucide-react';
import type { Room } from '@/types';

interface RoomTableRowProps {
  room: Room;
  onView: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

export function RoomTableRow({
  room,
  onView,
  onEdit,
  onDelete,
}: RoomTableRowProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { color: 'bg-green-100 text-green-800', icon: Bed },
      OCCUPIED: { color: 'bg-blue-100 text-blue-800', icon: Bed },
      MAINTENANCE: { color: 'bg-red-100 text-red-800', icon: Bed },
      OUT_OF_ORDER: { color: 'bg-gray-100 text-gray-800', icon: Bed },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.AVAILABLE;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
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
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bed className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{room.number}</div>
            <div className="text-sm text-muted-foreground">
              {room.type?.name || 'Standard'}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{room.capacity} guests</span>
          </div>
          {room.floor && (
            <div className="text-sm text-muted-foreground">
              Floor {room.floor}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">
            {formatCurrency(room.basePrice, room.currency)}
          </div>
          <div className="text-sm text-muted-foreground">per night</div>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(room.status)}</TableCell>
      <TableCell>
        <div className="space-y-1">
          {room.amenities && room.amenities.length > 0 && (
            <div className="text-sm">
              {room.amenities.slice(0, 2).join(', ')}
              {room.amenities.length > 2 &&
                ` +${room.amenities.length - 2} more`}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onView(room)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onEdit(room)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90"
            onClick={() => onDelete(room)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
