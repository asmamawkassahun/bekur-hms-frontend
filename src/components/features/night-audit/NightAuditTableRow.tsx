import React from 'react';
import { useRouter } from 'next/navigation';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import type { NightAudit } from '@/types/night-audit.types';

interface NightAuditTableRowProps {
  item: NightAudit;
  onView: (audit: NightAudit) => void;
}

export function NightAuditTableRow({ item, onView }: NightAuditTableRowProps) {
  const router = useRouter();
  const formatCurrency = (value: string | number) =>
    Number(value).toLocaleString();
  const formatPercent = (value: string | number) => Number(value).toFixed(1);

  const handleViewReport = () => {
    router.push(`/dashboard/reports/night-audit/${item.id}`);
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>{new Date(item.businessDate).toLocaleDateString()}</TableCell>
      <TableCell>{item.status}</TableCell>
      <TableCell>{formatCurrency(item.totalRevenue)}</TableCell>
      <TableCell>{formatCurrency(item.netAfterCommission)}</TableCell>
      <TableCell>
        {formatPercent(item.roomOccupancyRate)}% /{' '}
        {formatPercent(item.bedOccupancyRate)}%
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(item)}
            className="cursor-pointer"
          >
            <Eye className="h-4 w-4 mr-2" /> Quick View
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleViewReport}
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-2" /> Detailed Report
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
