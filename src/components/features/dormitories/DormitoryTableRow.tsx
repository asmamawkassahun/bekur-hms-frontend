import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Eye, Edit, Trash2, Home, Users, DollarSign } from 'lucide-react';
import type { Dormitory } from '@/types';

interface DormitoryTableRowProps {
  dormitory: Dormitory;
  onView: (dormitory: Dormitory) => void;
  onEdit: (dormitory: Dormitory) => void;
  onDelete: (dormitory: Dormitory) => void;
}

export function DormitoryTableRow({
  dormitory,
  onView,
  onEdit,
  onDelete,
}: DormitoryTableRowProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { color: 'bg-green-100 text-green-800', icon: Home },
      OCCUPIED: { color: 'bg-blue-100 text-blue-800', icon: Home },
      MAINTENANCE: { color: 'bg-red-100 text-red-800', icon: Home },
      OUT_OF_ORDER: { color: 'bg-gray-100 text-gray-800', icon: Home },
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
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{dormitory.name}</div>
            <div className="text-sm text-muted-foreground">
              {dormitory.type || 'Standard'}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{dormitory.capacity} beds</span>
          </div>
          {dormitory.floor && (
            <div className="text-sm text-muted-foreground">
              Floor {dormitory.floor}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">
            {formatCurrency(dormitory.pricePerBed, dormitory.currency)}
          </div>
          <div className="text-sm text-muted-foreground">per bed per night</div>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(dormitory.status)}</TableCell>
      <TableCell>
        <div className="space-y-1">
          {dormitory.amenities && dormitory.amenities.length > 0 && (
            <div className="text-sm">
              {dormitory.amenities.slice(0, 2).join(', ')}
              {dormitory.amenities.length > 2 &&
                ` +${dormitory.amenities.length - 2} more`}
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
            onClick={() => onView(dormitory)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onEdit(dormitory)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90"
            onClick={() => onDelete(dormitory)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
