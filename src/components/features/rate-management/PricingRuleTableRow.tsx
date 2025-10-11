import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Edit, Eye, Trash2 } from 'lucide-react';
import type { PricingRule } from '@/types';

interface PricingRuleRowProps {
  rule: PricingRule;
  onView: (rule: PricingRule) => void;
  onEdit: (rule: PricingRule) => void;
  onDelete: (rule: PricingRule) => void;
}

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

export function PricingRuleTableRow({ rule, onView, onEdit, onDelete }: PricingRuleRowProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="font-medium truncate">{rule.name}</div>
        <div className="text-sm text-muted-foreground truncate">{rule.property?.name || rule.propertyId}</div>
      </TableCell>
      <TableCell className="truncate">{rule.type.replaceAll('_', ' ')}</TableCell>
      <TableCell className="truncate">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(rule.startDate)}</span>
          <span>–</span>
          <span>{formatDate(rule.endDate)}</span>
        </div>
      </TableCell>
      <TableCell>{rule.priority}</TableCell>
      <TableCell>
        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
          {rule.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => onView(rule)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => onEdit(rule)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90"
            onClick={() => onDelete(rule)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}


