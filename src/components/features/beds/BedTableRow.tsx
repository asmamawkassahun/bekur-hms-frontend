import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Eye, Edit, Trash2, BedDouble, Home, DollarSign } from 'lucide-react';
import type { Bed } from '@/types';

interface BedTableRowProps {
  bed: Bed;
  onView: (bed: Bed) => void;
  onEdit: (bed: Bed) => void;
  onDelete: (bed: Bed) => void;
}

export function BedTableRow({
  bed,
  onView,
  onEdit,
  onDelete,
}: BedTableRowProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { color: 'bg-green-100 text-green-800', icon: BedDouble },
      OCCUPIED: { color: 'bg-blue-100 text-blue-800', icon: BedDouble },
      MAINTENANCE: { color: 'bg-red-100 text-red-800', icon: BedDouble },
      OUT_OF_ORDER: { color: 'bg-gray-100 text-gray-800', icon: BedDouble },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.AVAILABLE;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status?.replace('_', ' ') || 'Unknown'}
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
            <BedDouble className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{bed.number}</div>
            <div className="text-sm text-muted-foreground">
              {bed.type?.name || 'Standard'}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-3 w-3 text-muted-foreground" />
            <span>{bed.dormitory?.name || 'N/A'}</span>
          </div>
          {bed.dormitory?.floor && (
            <div className="text-sm text-muted-foreground">
              Floor {bed.dormitory.floor}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">
            {formatCurrency(bed.price, bed.currency)}
          </div>
          <div className="text-sm text-muted-foreground">per night</div>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(bed.status)}</TableCell>
      <TableCell>
        <div className="space-y-1">
          {bed.amenities && bed.amenities.length > 0 && (
            <div className="text-sm">
              {bed.amenities.slice(0, 2).join(', ')}
              {bed.amenities.length > 2 && ` +${bed.amenities.length - 2} more`}
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
            onClick={() => onView(bed)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onEdit(bed)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90"
            onClick={() => onDelete(bed)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
