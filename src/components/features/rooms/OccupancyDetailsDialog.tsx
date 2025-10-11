'use client';

import React from 'react';
import { format } from 'date-fns';
import { DailyOccupancy } from '@/types/room.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
  if (!data) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {format(date, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">No occupancy data available for this date.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getOccupancyBadgeColor = (occupancyRate: number) => {
    if (occupancyRate <= 40) {
      return 'bg-emerald-100 text-emerald-800';
    } else if (occupancyRate <= 70) {
      return 'bg-amber-100 text-amber-800';
    } else {
      return 'bg-rose-100 text-rose-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalRooms}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600">{data.occupiedRooms}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{data.availableRooms}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{data.occupancyRate.toFixed(1)}%</div>
                  <Badge className={getOccupancyBadgeColor(data.occupancyRate)}>
                    {data.occupancyRate <= 40 ? 'Low' : data.occupancyRate <= 70 ? 'Medium' : 'High'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Occupied Rooms Table */}
          {data.occupiedRoomDetails.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Occupied Rooms ({data.occupiedRoomDetails.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.occupiedRoomDetails.map((room, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{room.roomNumber}</TableCell>
                        <TableCell>{room.roomTypeName}</TableCell>
                        <TableCell>{room.guestName}</TableCell>
                        <TableCell>{format(new Date(room.checkIn), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{format(new Date(room.checkOut), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  <p>No rooms are occupied on this date.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

