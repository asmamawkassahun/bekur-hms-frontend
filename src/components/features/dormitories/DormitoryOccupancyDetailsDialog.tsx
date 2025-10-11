'use client';

import React from 'react';
import { format } from 'date-fns';
import { DailyDormitoryOccupancy } from '@/types/dormitory.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Home, Bed, Calendar, BarChart3 } from 'lucide-react';

interface DormitoryOccupancyDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: DailyDormitoryOccupancy | null;
  date: Date;
}

export function DormitoryOccupancyDetailsDialog({
  isOpen,
  onClose,
  data,
  date,
}: DormitoryOccupancyDetailsDialogProps) {
  const getOccupancyBadgeColor = (occupancyRate: number) => {
    if (occupancyRate >= 80) return 'destructive';
    if (occupancyRate >= 60) return 'default';
    return 'secondary';
  };

  const getOccupancyLabel = (occupancyRate: number) => {
    if (occupancyRate >= 80) return 'High';
    if (occupancyRate >= 60) return 'Medium';
    return 'Low';
  };

  if (!data) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{format(date, 'EEEE, MMMM d, yyyy')}</DialogTitle>
            <DialogDescription>Dormitory occupancy details</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No occupancy data available for this date.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{format(date, 'EEEE, MMMM d, yyyy')}</DialogTitle>
          <DialogDescription>
            Dormitory occupancy details and bed availability
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Occupancy Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {data.occupancyRate.toFixed(1)}%
                </span>
                <Badge variant={getOccupancyBadgeColor(data.occupancyRate)}>
                  {getOccupancyLabel(data.occupancyRate)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bed className="h-4 w-4" />
                <span>Total Beds</span>
              </div>
              <div className="text-2xl font-bold">{data.totalBeds}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bed className="h-4 w-4" />
                <span>Occupied Beds</span>
              </div>
              <div className="text-2xl font-bold text-destructive">
                {data.occupiedBeds}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <span>Dormitories</span>
              </div>
              <div className="text-2xl font-bold">{data.totalDormitories}</div>
            </div>
          </div>

          <Separator />

          {/* Dormitory Summary */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Dormitory Summary</h3>
              <p className="text-sm text-muted-foreground">
                Occupancy breakdown by dormitory
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dormitory Name</TableHead>
                    <TableHead className="text-center">Total Beds</TableHead>
                    <TableHead className="text-center">Occupied</TableHead>
                    <TableHead className="text-center">
                      Occupancy Rate
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.dormitorySummaries.map((dormitory) => (
                    <TableRow key={dormitory.dormitoryId}>
                      <TableCell className="font-medium">
                        {dormitory.dormitoryName}
                      </TableCell>
                      <TableCell className="text-center">
                        {dormitory.totalBeds}
                      </TableCell>
                      <TableCell className="text-center">
                        {dormitory.occupiedBeds}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={getOccupancyBadgeColor(
                            dormitory.occupancyRate,
                          )}
                        >
                          {dormitory.occupancyRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Occupied Beds Details */}
          {data.occupiedBedDetails.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Occupied Beds</h3>
                <p className="text-sm text-muted-foreground">
                  {data.occupiedBedDetails.length} bed
                  {data.occupiedBedDetails.length !== 1 ? 's' : ''} currently
                  occupied
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dormitory</TableHead>
                      <TableHead className="w-[120px]">Bed Number</TableHead>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.occupiedBedDetails.map((bed) => (
                      <TableRow key={bed.bedId}>
                        <TableCell className="font-medium">
                          {bed.dormitoryName}
                        </TableCell>
                        <TableCell>{bed.bedNumber}</TableCell>
                        <TableCell>{bed.guestName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(bed.checkIn), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(bed.checkOut), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
              <Bed className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">
                No beds are occupied on this date
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
