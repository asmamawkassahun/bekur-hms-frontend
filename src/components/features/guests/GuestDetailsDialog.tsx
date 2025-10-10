import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import type { Guest } from '@/types';

interface GuestDetailsDialogProps {
  guest: Guest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestDetailsDialog({
  guest,
  open,
  onOpenChange,
}: GuestDetailsDialogProps) {
  if (!guest) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getLoyaltyBadge = (tier: string) => {
    const tierConfig = {
      BRONZE: { color: 'bg-amber-100 text-amber-800', icon: Star },
      SILVER: { color: 'bg-gray-100 text-gray-800', icon: Star },
      GOLD: { color: 'bg-yellow-100 text-yellow-800', icon: Star },
      PLATINUM: { color: 'bg-purple-100 text-purple-800', icon: Star },
    };

    const config =
      tierConfig[tier as keyof typeof tierConfig] || tierConfig.BRONZE;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {tier}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Guest Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={undefined} />
              <AvatarFallback>
                {getInitials(guest.firstName, guest.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">
                {guest.firstName} {guest.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                Member since {formatDate(guest.createdAt)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-sm">{guest.email}</div>
            </div>
            {guest.phone && (
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="text-sm">{guest.phone}</div>
              </div>
            )}
            {(guest.city || guest.country) && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="text-sm">
                  {guest.city || ''}
                  {guest.city && guest.country ? ', ' : ''}
                  {guest.country || ''}
                </div>
              </div>
            )}
            {guest.address && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="text-sm">{guest.address}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Loyalty Tier</div>
              <div className="mt-1">
                {guest.loyaltyTier ? (
                  getLoyaltyBadge(guest.loyaltyTier)
                ) : (
                  <Badge variant="outline">No Tier</Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="mt-1">
                <Badge variant={guest.isActive ? 'default' : 'secondary'}>
                  {guest.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            {guest.tags && guest.tags.length > 0 && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">Tags</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {guest.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {guest.preferences && guest.preferences.length > 0 && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">Preferences</div>
                <div className="text-sm">{guest.preferences.join(', ')}</div>
              </div>
            )}
            {guest.specialRequests && guest.specialRequests.length > 0 && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">
                  Special Requests
                </div>
                <div className="text-sm">
                  {guest.specialRequests.join(', ')}
                </div>
              </div>
            )}
            {guest.notes && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">Notes</div>
                <div className="text-sm">{guest.notes}</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
