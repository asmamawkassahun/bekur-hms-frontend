import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Eye, Edit, Trash2, Mail, Phone, MapPin, Star } from 'lucide-react';
import type { Guest } from '@/types';

interface GuestTableRowProps {
  guest: Guest;
  onView: (guest: Guest) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
}

export function GuestTableRow({
  guest,
  onView,
  onEdit,
  onDelete,
}: GuestTableRowProps) {
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
    <TableRow className="hover:bg-muted/50">
      <TableCell className="truncate">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={undefined} />
            <AvatarFallback>
              {getInitials(guest.firstName, guest.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">
              {guest.firstName} {guest.lastName}
            </div>
           
          </div>
        </div>
      </TableCell>
      <TableCell className="truncate">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm truncate">
            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{guest.email}</span>
          </div>
          {guest.phone && (
            <div className="flex items-center gap-2 text-sm truncate">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{guest.phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="truncate">
        <div className="space-y-1">
          {guest.city && (
            <div className="flex items-center gap-2 text-sm truncate">
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {guest.city}, {guest.country}
              </span>
            </div>
          )}
          {guest.nationality && (
            <div className="text-sm text-muted-foreground truncate">
              {guest.nationality}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {guest.loyaltyTier ? (
          getLoyaltyBadge(guest.loyaltyTier)
        ) : (
          <Badge variant="outline">No Tier</Badge>
        )}
      </TableCell>
      <TableCell>{formatDate(guest.createdAt)}</TableCell>
      <TableCell>
        <Badge variant={guest.isActive ? 'default' : 'secondary'}>
          {guest.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onView(guest)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onEdit(guest)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive/90 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onDelete(guest)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
