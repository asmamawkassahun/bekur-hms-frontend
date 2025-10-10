import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Building, MapPin } from 'lucide-react';
import Link from 'next/link';
import { aiosellService } from '@/services/aiosell.service';
import { useNotification } from '@/hooks/useNotification';
import { PropertySyncStatus } from './PropertySyncStatus';
import type { Property } from '@/types';

interface AiosellTableRowProps {
  property: Property;
}

export function AiosellTableRow({ property }: AiosellTableRowProps) {
  const { showSuccess, showError } = useNotification();
  const [syncing, setSyncing] = useState(false);

  const handleFullSync = async () => {
    setSyncing(true);
    try {
      await aiosellService.triggerFullSync(property.id);
      showSuccess(
        'Full sync initiated successfully. This may take a few moments.',
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to trigger sync';
      showError(errorMessage);
    } finally {
      setSyncing(false);
    }
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
      <TableCell>
        <Badge variant="outline" className="font-mono">
          {property.hotelCode}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm truncate">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="truncate">
            {property.city}, {property.country}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <PropertySyncStatus propertyId={property.id} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            asChild
          >
            <Link href={`/dashboard/aiosell/logs?propertyId=${property.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={handleFullSync}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Full Sync
              </>
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

