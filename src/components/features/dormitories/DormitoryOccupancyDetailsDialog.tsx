'use client';

import React from 'react';
import { format } from 'date-fns';
import { DailyDormitoryOccupancy } from '@/types/dormitory.types';
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
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Dormitory Occupancy - {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {data.occupancyRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Overall Occupancy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {data.totalBeds}
                </div>
                <div className="text-sm text-gray-600">Total Beds</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {data.occupiedBeds}
                </div>
                <div className="text-sm text-gray-600">Occupied Beds</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {data.totalDormitories}
                </div>
                <div className="text-sm text-gray-600">Dormitories</div>
              </CardContent>
            </Card>
          </div>

          {/* Dormitory Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Dormitory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dormitory Name</TableHead>
                    <TableHead className="text-center">Total Beds</TableHead>
                    <TableHead className="text-center">Occupied Beds</TableHead>
                    <TableHead className="text-center">Occupancy Rate</TableHead>
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
                        <Badge className={getOccupancyBadgeColor(dormitory.occupancyRate)}>
                          {dormitory.occupancyRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Occupied Beds Section */}
          <Card>
            <CardHeader>
              <CardTitle>Occupied Beds Details</CardTitle>
            </CardHeader>
            <CardContent>
              {data.occupiedBedDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dormitory</TableHead>
                      <TableHead>Bed Number</TableHead>
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
                        <TableCell>
                          {format(new Date(bed.checkIn), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(bed.checkOut), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No occupied beds for this date.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
