import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, Mail, Phone, Check } from 'lucide-react';
import type { Guest } from '@/types';

interface GuestSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guests: Guest[];
    loading: boolean;
    onSearch: (term: string) => void;
    onSelect: (guest: Guest) => void;
    selectedGuestIds?: string[];
}

export function GuestSelectionDialog({
    open,
    onOpenChange,
    guests,
    loading,
    onSearch,
    onSelect,
    selectedGuestIds = [],
}: GuestSelectionDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Reset search when dialog opens
    useEffect(() => {
        if (open) {
            setSearchTerm('');
            setDebouncedSearch('');
        }
    }, [open]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Call onSearch when debounced search changes
    useEffect(() => {
        onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);

    const isGuestSelected = (guestId: string) => selectedGuestIds.includes(guestId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Select Guest
                    </DialogTitle>
                </DialogHeader>

                {/* Search Field */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Guest List */}
                    <div className="overflow-y-auto max-h-[500px] space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                Loading guests...
                            </div>
                        ) : guests.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {searchTerm ? 'No guests found matching your search' : 'No guests available'}
                            </div>
                        ) : (
                            guests.map((guest) => (
                                <div
                                    key={guest.id}
                                    onClick={() => onSelect(guest)}
                                    className={`
                                        p-4 border rounded-lg cursor-pointer transition-all
                                        ${isGuestSelected(guest.id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {guest.firstName} {guest.lastName}
                                                    {guest.loyaltyTier && (
                                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                                                            {guest.loyaltyTier}
                                                        </span>
                                                    )}
                                                </h4>
                                                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                                    {guest.email && (
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {guest.email}
                                                        </div>
                                                    )}
                                                    {guest.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {guest.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isGuestSelected(guest.id) && (
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

