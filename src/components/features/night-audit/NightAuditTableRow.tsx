import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { NightAudit } from '@/types/night-audit.types';

interface NightAuditTableRowProps {
  item: NightAudit;
  onView: (audit: NightAudit) => void;
}

export function NightAuditTableRow({ item, onView }: NightAuditTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>{new Date(item.businessDate).toLocaleDateString()}</TableCell>
      <TableCell>{item.status}</TableCell>
      <TableCell>{item.totalRevenue.toLocaleString()}</TableCell>
      <TableCell>{item.netAfterCommission.toLocaleString()}</TableCell>
      <TableCell>
        {item.roomOccupancyRate.toFixed(1)}% / {item.bedOccupancyRate.toFixed(1)}%
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" onClick={() => onView(item)} className="cursor-pointer">
          <Eye className="h-4 w-4 mr-2" /> View
        </Button>
      </TableCell>
    </TableRow>
  );
}


