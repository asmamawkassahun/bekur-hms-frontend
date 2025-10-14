'use client';
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bed, Users, DollarSign } from 'lucide-react';
import type { Room } from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';

interface RoomViewDialogProps {
  open: boolean;
  room: Room | null;
  onOpenChange: (open: boolean) => void;
}

export function RoomViewDialog({
  open,
  room,
  onOpenChange,
}: RoomViewDialogProps) {
  // Hooks must be called at the top level before any early returns
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((state: RootState) => state.property);

  useEffect(() => {
    if (!open) return;
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 1000 }));
    }
  }, [open, properties, dispatch]);

  // Early return after hooks
  if (!room) return null;

  const statusColor: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    OCCUPIED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-red-100 text-red-800',
    OUT_OF_ORDER: 'bg-gray-100 text-gray-800',
    CLEANING: 'bg-amber-100 text-amber-800',
  };

  const currency = 'USD';
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      amount || 0,
    );

  const propertyName = properties?.find((p) => p.id === room.propertyId)?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center">
              <Bed className="h-4 w-4 text-primary" />
            </div>
            Room {room.number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={`${statusColor[room.status] || 'bg-gray-100 text-gray-800'}`}
            >
              {room.status?.replace('_', ' ')}
            </Badge>
            {room.isActive ? (
              <Badge variant="outline">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Property</div>
              <div className="font-medium break-words">
                {propertyName || room.propertyId}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Room Type</div>
              <div className="font-medium break-words">
                {room.roomType?.name || room.roomTypeId}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Floor</div>
              <div className="font-medium">{room.floor}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Base Price</div>
              <div className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {formatCurrency(
                  room.basePrice || room.roomType?.basePrice || 0,
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Capacity</div>
              <div className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {(room.roomType?.adultCapacity || 0) +
                  (room.roomType?.childCapacity || 0)}{' '}
                guests
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Amenities</div>
              <div className="text-sm text-muted-foreground">
                {(room.roomType?.amenities || []).length
                  ? room.roomType?.amenities?.join(', ')
                  : '—'}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RoomViewDialog;
