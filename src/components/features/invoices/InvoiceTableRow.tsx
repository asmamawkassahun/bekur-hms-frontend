import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import type { Invoice } from '@/types';

interface InvoiceTableRowProps {
  invoice: Invoice;
  propertyName: string;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onMore: (invoice: Invoice) => void;
}

export function InvoiceTableRow({
  invoice,
  propertyName,
  onView,
  onEdit,
  onMore,
}: InvoiceTableRowProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'ETB',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default';
      case 'OVERDUE':
        return 'destructive';
      case 'PARTIALLY_PAID':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div>
          <div className="font-medium">{invoice.number}</div>
          <div className="text-sm text-muted-foreground">
            {invoice.currency} {invoice.total}
          </div>
        </div>
      </TableCell>
      <TableCell>{propertyName || '—'}</TableCell>
      <TableCell className="font-medium">
        {formatCurrency(invoice.total, invoice.currency)}
      </TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(invoice.status)}>
          {invoice.status?.replace('_', ' ') || 'Unknown'}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onView(invoice)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onEdit(invoice)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onMore(invoice)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
