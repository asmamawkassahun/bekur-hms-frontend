'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GuestForm } from '@/components/features/guests/GuestForm';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { createGuest } from '@/store/slices/guestSlice';
import { useNotification } from '@/hooks/useNotification';
import type { Guest } from '@/types';

interface CreateGuestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGuestCreated: (guest: Guest) => void;
}

export function CreateGuestDialog({
    open,
    onOpenChange,
    onGuestCreated,
}: CreateGuestDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { success, error: showError } = useNotification();
    const [isCreating, setIsCreating] = React.useState(false);

    const handleSubmit = async (data: any) => {
        setIsCreating(true);
        try {
            // Prepare guest data (without documents for now - documents are handled separately)
            const guestData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                nationality: data.nationality || '',
                dateOfBirth: data.dateOfBirth || '',
                address: data.address || '',
                city: data.city || '',
                country: data.country || '',
                postalCode: data.postalCode || '',
                loyaltyTier: data.loyaltyTier,
                preferences: data.preferences || [],
                specialRequests: data.specialRequests || [],
                notes: data.notes || '',
                tags: data.tags || [],
                isActive: true,
            };

            const result = await dispatch(createGuest(guestData)).unwrap();

            success('Guest created successfully!');

            // Pass the created guest back to parent
            if (result.data) {
                onGuestCreated(result.data);
            }

            onOpenChange(false);
        } catch (err: any) {
            console.error('Failed to create guest:', err);
            showError(err.message || 'Failed to create guest');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[50vw] !max-w-[1400px] sm:!max-w-[1400px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Guest</DialogTitle>
                </DialogHeader>
                <GuestForm
                    onSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                    loading={isCreating}
                    isCreating={true}
                />
            </DialogContent>
        </Dialog>
    );
}

