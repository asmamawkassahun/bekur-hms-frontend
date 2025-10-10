import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchBeds, deleteBed } from '@/store/slices/bedSlice';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import type { AxiosError } from 'axios';
import type { Dormitory, Bed } from '@/types';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
    Home,
    Users,
    DollarSign,
    MapPin,
    CheckCircle,
    XCircle,
    Bed as BedIcon,
    Trash,
} from 'lucide-react';

interface DormitoryDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dormitory: Dormitory | null;
}

export function DormitoryDetailsDialog({
    open,
    onOpenChange,
    dormitory,
}: DormitoryDetailsDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { error, success } = useNotification();
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loadingBeds, setLoadingBeds] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch beds when dialog opens
    useEffect(() => {
        if (open && dormitory) {
            fetchDormitoryBeds();
        }
    }, [open, dormitory]);

    const fetchDormitoryBeds = async () => {
        if (!dormitory) return;

        setLoadingBeds(true);
        try {
            const response = await dispatch(
                fetchBeds({
                    page: 1,
                    limit: 100,
                    dormitoryId: dormitory.id,
                }),
            ).unwrap();
            setBeds(response.data || []);
        } catch (e) {
            const apiErr = handleApiError(e as AxiosError);
            error(apiErr.message);
        } finally {
            setLoadingBeds(false);
        }
    };

    const handleRequestDelete = (bedId: string) => {
        setSelectedBedId(bedId);
        setOpenDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedBedId) return;
        setDeleting(true);
        try {
            await dispatch(deleteBed(selectedBedId)).unwrap();
            setBeds((prev) => prev.filter((b) => b.id !== selectedBedId));
            setOpenDelete(false);
            setSelectedBedId(null);
            success('Bed deleted');
        } catch (e) {
            const apiErr = handleApiError(e as AxiosError);
            error(apiErr.message);
        } finally {
            setDeleting(false);
        }
    };

    if (!dormitory) return null;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            AVAILABLE: { color: 'bg-green-100 text-green-800' },
            OCCUPIED: { color: 'bg-blue-100 text-blue-800' },
            MAINTENANCE: { color: 'bg-red-100 text-red-800' },
            OUT_OF_ORDER: { color: 'bg-gray-100 text-gray-800' },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.AVAILABLE;

        return (
            <Badge className={config.color}>
                {status?.replace('_', ' ') || 'Unknown'}
            </Badge>
        );
    };

    const formatCurrency = (amount: number | string, currency?: string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(numAmount);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Dormitory Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Dormitory Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Name</p>
                                            <p className="text-sm text-muted-foreground">
                                                {dormitory.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Type & Capacity</p>
                                            <p className="text-sm text-muted-foreground">
                                                {dormitory.type} - {dormitory.capacity} beds
                                            </p>
                                        </div>
                                    </div>

                                    {/* Floor info not available on Dormitory type */}

                                    <div className="flex items-start gap-3">
                                        <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Price Per Bed</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(dormitory.basePrice)} per night
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Status & Amenities
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium mb-1">Status</p>
                                        <div className="flex items-center gap-2">
                                            {/* {getStatusBadge(dormitory.status)} */}
                                            {dormitory.isActive ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {dormitory.amenities && dormitory.amenities.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Amenities</p>
                                            <div className="flex flex-wrap gap-1">
                                                {dormitory.amenities.map((amenity, index) => (
                                                    <Badge key={index} variant="outline">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description not available on Dormitory type */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Beds Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <BedIcon className="h-5 w-5" />
                                Beds ({loadingBeds ? '...' : beds.length})
                            </h3>
                            <Badge variant="outline">
                                {beds.filter((b) => b.status === 'AVAILABLE').length} Available
                            </Badge>
                        </div>

                        {loadingBeds ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : beds.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Bed Number</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                            {/* <TableHead>Amenities</TableHead> */}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {beds.map((bed) => (
                                            <TableRow key={bed.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <BedIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium"> {bed.number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{(bed as any)?.bedType?.name || (bed as any)?.type?.name || 'Standard'}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(bed.basePrice)}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(bed.status)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRequestDelete(bed.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                                {/* <TableCell>
                                                    {bed.amenities && bed.amenities.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {bed.amenities.slice(0, 2).map((amenity, index) => (
                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                    {amenity}
                                                                </Badge>
                                                            ))}
                                                            {bed.amenities.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{bed.amenities.length - 2} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            No amenities
                                                        </span>
                                                    )}
                                                </TableCell> */}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <BedIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>No beds found for this dormitory</p>
                            </div>
                        )}
                    </div>
                </div>
                <ConfirmDialog
                    open={openDelete}
                    onOpenChange={(o) => {
                        setOpenDelete(o);
                        if (!o) setSelectedBedId(null);
                    }}
                    title="Delete bed?"
                    description="This action cannot be undone. This will permanently delete the bed."
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                    onConfirm={handleConfirmDelete}
                    loading={deleting}
                />
            </DialogContent>
        </Dialog>
    );
}

