import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BedDouble, Users, DollarSign, Home, Square } from 'lucide-react';
import type { RoomType, Property, BedType } from '@/types';

interface RoomTypeDetailsDialogProps {
  roomType: RoomType | null;
  properties: Property[];
  bedTypes: BedType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomTypeDetailsDialog({
  roomType,
  properties,
  bedTypes,
  open,
  onOpenChange,
}: RoomTypeDetailsDialogProps) {
  if (!roomType) return null;

  const property = properties.find((p) => p.id === roomType.propertyId);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getBedTypeName = (bedTypeId: string) => {
    const bedType = bedTypes.find((bt) => bt.id === bedTypeId);
    return bedType?.name || 'Unknown Bed Type';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {roomType.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Property
                  </label>
                  <p className="text-sm">
                    {property?.name || 'Unknown Property'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={roomType.isActive ? 'default' : 'secondary'}
                    >
                      {roomType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Base Price
                  </label>
                  <p className="text-sm font-medium">
                    {formatCurrency(roomType.basePrice)}
                  </p>
                </div>
                {roomType.roomSize && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Room Size
                    </label>
                    <p className="text-sm">
                      {roomType.roomSize} {roomType.sizeUnit?.replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>
              {roomType.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm mt-1">{roomType.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capacity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Adults</p>
                    <p className="text-2xl font-bold">
                      {roomType.adultCapacity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Children</p>
                    <p className="text-2xl font-bold">
                      {roomType.childCapacity}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bed Configuration */}
          {roomType.beds && roomType.beds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5" />
                  Bed Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roomType.beds.map((bed, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {getBedTypeName(bed.bedTypeId)}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {bed.quantity} {bed.quantity === 1 ? 'bed' : 'beds'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {roomType.amenities && roomType.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roomType.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Images */}
          {roomType.images && roomType.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {roomType.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video bg-muted rounded-lg overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Room type ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reserve Condition */}
          {roomType.reserveCondition && (
            <Card>
              <CardHeader>
                <CardTitle>Reserve Condition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{roomType.reserveCondition}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
