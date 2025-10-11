import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Calendar, Percent } from 'lucide-react';
import type { BookingSource } from '@/services/booking.service';

interface BookingSourceDetailsDialogProps {
  bookingSource: BookingSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingSourceDetailsDialog({
  bookingSource,
  open,
  onOpenChange,
}: BookingSourceDetailsDialogProps) {
  if (!bookingSource) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            {bookingSource.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm mt-1">{bookingSource.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={bookingSource.isActive ? 'default' : 'secondary'}
                    >
                      {bookingSource.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Booking Type
                  </label>
                  <div className="mt-1">
                    {bookingSource.bookingType ? (
                      <Badge variant="outline">
                        {bookingSource.bookingType.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Commission Rate
                  </label>
                  <p className="text-sm mt-1 font-medium">
                    {bookingSource.commissionRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Commission Calculation Example
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Booking Amount (example):
                </span>
                <span className="font-medium">$1000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission Rate:</span>
                <span className="font-medium">
                  {bookingSource.commissionRate}%
                </span>
              </div>
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>Commission Amount:</span>
                <span className="font-semibold">
                  ${((1000 * bookingSource.commissionRate) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Net Revenue:</span>
                <span className="font-semibold">
                  $
                  {(1000 - (1000 * bookingSource.commissionRate) / 100).toFixed(
                    2,
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Audit Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Audit Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="mt-1">{formatDate(bookingSource.createdAt)}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">
                    Updated At
                  </label>
                  <p className="mt-1">{formatDate(bookingSource.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
