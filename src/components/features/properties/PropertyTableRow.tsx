import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import {
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Building,
  Globe,
} from 'lucide-react';
import type { Property } from '@/types';

interface PropertyTableRowProps {
  property: Property;
  onView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

export function PropertyTableRow({
  property,
  onView,
  onEdit,
  onDelete,
}: PropertyTableRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{property.name}</div>
            <div className="text-sm text-muted-foreground">{property.type}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="truncate">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm truncate">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {property.city}, {property.country}
          </div>
        </div>
      </TableCell>
      <TableCell className="truncate">
        <div className="space-y-1">
          {property.phone && (
            <div className="flex items-center gap-2 text-sm truncate">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{property.phone}</span>
            </div>
          )}
          {property.email && (
            <div className="flex items-center gap-2 text-sm truncate">
              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{property.email}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {property.website ? (
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-green-600" />
            <Badge variant="outline" className="font-mono text-xs">
              {
                <a href={property.website} target="_blank" rel="noopener noreferrer">{property.website}</a>
              }
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={property.isActive ? 'default' : 'secondary'}>
          {property.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(property.createdAt)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onView(property)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => onEdit(property)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90"
            onClick={() => onDelete(property)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
