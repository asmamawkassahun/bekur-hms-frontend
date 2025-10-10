import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, Download, Eye, FileText } from 'lucide-react';
import type { Guest, GuestDocument } from '@/types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchGuestDocuments } from '@/store/slices/guestSlice';

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
  const dispatch = useDispatch<AppDispatch>();
  const [documents, setDocuments] = useState<GuestDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    if (guest && open) {
      setLoadingDocuments(true);
      dispatch(fetchGuestDocuments(guest.id))
        .unwrap()
        .then((response) => {
          // Handle the API response structure
          const docs = Array.isArray(response) ? response : response?.data || [];
          setDocuments(docs);
        })
        .catch(() => setDocuments([]))
        .finally(() => setLoadingDocuments(false));
    }
  }, [guest, open, dispatch]);

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

  const handleViewDocument = (doc: GuestDocument) => {
    const url = doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://${doc.fileUrl}`;
    // Try to open the document, but handle access denied gracefully
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      alert('Unable to open document. Please try downloading instead.');
    }
  };

  const handleDownloadDocument = (doc: GuestDocument) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://${doc.fileUrl}`;
    link.download = doc.fileName;
    link.target = '_blank';
    link.click();
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType === 'ID_CARD') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
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

          {/* Documents Section */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-3">
              Identity Documents
            </div>
            {loadingDocuments ? (
              <div className="text-sm text-muted-foreground">Loading documents...</div>
            ) : documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(doc.fileType)}
                      <div>
                        <div className="text-sm font-medium">{doc.fileName}</div>
                        <div className="text-xs text-muted-foreground">
                          {doc.description || doc.fileType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No documents uploaded
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
