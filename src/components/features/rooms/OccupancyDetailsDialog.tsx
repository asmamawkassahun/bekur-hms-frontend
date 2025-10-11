'use client';

import React from 'react';
import { format } from 'date-fns';
import { DailyOccupancy } from '@/types/room.types';
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
import { Building2, Bed, Calendar } from 'lucide-react';

interface OccupancyDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: DailyOccupancy | null;
  date: Date;
}

export function OccupancyDetailsDialog({
  isOpen,
  onClose,
  data,
  date,
}: OccupancyDetailsDialogProps) {
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
            <DialogDescription>Occupancy details</DialogDescription>
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{format(date, 'EEEE, MMMM d, yyyy')}</DialogTitle>
          <DialogDescription>
            Room occupancy details and guest information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Total Rooms</span>
              </div>
              <div className="text-2xl font-bold">{data.totalRooms}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bed className="h-4 w-4" />
                <span>Occupied</span>
              </div>
              <div className="text-2xl font-bold text-destructive">
                {data.occupiedRooms}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bed className="h-4 w-4" />
                <span>Available</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {data.availableRooms}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
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
          </div>

          <Separator />

          {/* Occupied Rooms Table */}
          {data.occupiedRoomDetails.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Occupied Rooms</h3>
                <p className="text-sm text-muted-foreground">
                  {data.occupiedRoomDetails.length} room
                  {data.occupiedRoomDetails.length !== 1 ? 's' : ''} currently
                  occupied
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Room Number</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.occupiedRoomDetails.map((room, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {room.roomNumber}
                        </TableCell>
                        <TableCell>{room.roomTypeName}</TableCell>
                        <TableCell>{room.guestName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(room.checkIn), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(room.checkOut), 'MMM d, yyyy')}
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
                No rooms are occupied on this date
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
