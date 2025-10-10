import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowDownLeft, ArrowUpRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { AiosellSyncLog } from '@/types/aiosell.types';

interface SyncLogTableRowProps {
  log: AiosellSyncLog;
}

export function SyncLogTableRow({ log }: SyncLogTableRowProps) {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm:ss');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{formatTime(log.createdAt)}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(log.createdAt)}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <span className="text-sm">{log.property?.name || 'Unknown Property'}</span>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className="text-xs">
          {log.syncType}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {log.direction === 'INBOUND' ? (
            <>
              <ArrowDownLeft className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Inbound</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Outbound</span>
            </>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge
          variant={
            log.status === 'SUCCESS'
              ? 'default'
              : log.status === 'FAILED'
                ? 'destructive'
                : 'secondary'
          }
          className="text-xs"
        >
          {log.status}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sync Log Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Property</p>
                  <p className="text-sm text-muted-foreground">
                    {log.property?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <Badge variant="outline">{log.syncType}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Direction</p>
                  <Badge variant="outline">{log.direction}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge
                    variant={
                      log.status === 'SUCCESS'
                        ? 'default'
                        : log.status === 'FAILED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {log.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Created At</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Retry Count</p>
                  <p className="text-sm text-muted-foreground">{log.retryCount}</p>
                </div>
              </div>

              {log.errorMessage && (
                <div>
                  <p className="text-sm font-medium mb-2">Error Message</p>
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {log.errorMessage}
                  </div>
                </div>
              )}

              {log.systemData && Object.keys(log.systemData).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">System Data</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(log.systemData, null, 2)}
                  </pre>
                </div>
              )}

              {log.aiosellPayload && Object.keys(log.aiosellPayload).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Aiosell Payload</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(log.aiosellPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

