'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar,
    Building,
    User,
    Users,
    Baby,
    Trash2,
    Plus,
    Plane,
    Eye,
    MessageSquare,
    CreditCard,
    DollarSign,
    Filter,
    ChevronsUpDown,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';
import { fetchBookingTypes, fetchBookingSources, createReservation } from '@/store/slices/reservationSlice';
import { createPayment } from '@/store/slices/paymentSlice';
import { fetchRoomTypes } from '@/store/slices/roomTypeSlice';
import { fetchRooms } from '@/store/slices/roomSlice';
import { fetchGuests } from '@/store/slices/guestSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { GuestSelectionDialog } from '@/components/features/reservations/GuestSelectionDialog';
import { useNotification } from '@/hooks/useNotification';
import type { RootState, AppDispatch } from '@/store';
import type { Guest } from '@/types';

export default function NewBookingPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { success, error: showError } = useNotification();
    const {
        bookingTypes,
        bookingTypesLoading,
        bookingTypesError,
        bookingSources,
        bookingSourcesLoading,
        bookingSourcesError
    } = useSelector(
        (state: RootState) => state.reservation
    );

    const { roomTypes, loading: roomTypesLoading } = useSelector(
        (state: RootState) => state.roomType
    );

    const { rooms, loading: roomsLoading } = useSelector(
        (state: RootState) => state.room
    );

    const { guests, loading: guestsLoading } = useSelector(
        (state: RootState) => state.guest
    );

    const { properties, currentProperty } = useSelector(
        (state: RootState) => state.property
    );

    // Reservation Details State
    // Set default check-in to today at 2:00 PM and check-out to tomorrow at 11:00 AM
    const getDefaultCheckIn = () => {
        const today = new Date();
        today.setHours(14, 0, 0, 0); // 2:00 PM
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`; // Format: YYYY-MM-DDTHH:mm
    };

    const getDefaultCheckOut = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(11, 0, 0, 0); // 11:00 AM
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const hours = String(tomorrow.getHours()).padStart(2, '0');
        const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`; // Format: YYYY-MM-DDTHH:mm
    };

    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [checkIn, setCheckIn] = useState(getDefaultCheckIn());
    const [checkOut, setCheckOut] = useState(getDefaultCheckOut());
    const [bookingReference, setBookingReference] = useState('');
    const [bookingRefNo, setBookingRefNo] = useState('');
    const [arrivalFrom, setArrivalFrom] = useState('');
    const [purposeOfVisit, setPurposeOfVisit] = useState('');
    const [bookingType, setBookingType] = useState('');
    const [remarks, setRemarks] = useState('');

    // Property Selection State
    const [selectedPropertyId, setSelectedPropertyId] = useState('');

    // Room Details State
    const [roomType, setRoomType] = useState('');
    const [roomNo, setRoomNo] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    // Guest Selection State
    const [guestDialogOpen, setGuestDialogOpen] = useState(false);
    const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
    const [guestSearchLoading, setGuestSearchLoading] = useState(false);
    const [lastGuestSearch, setLastGuestSearch] = useState('');

    // Fetch booking types, properties, and room types on component mount
    useEffect(() => {
        dispatch(fetchBookingTypes({
            page: 1,
            limit: 100,
            isActive: true
        }));

        dispatch(fetchProperties({
            page: 1,
            limit: 100
        }));

        dispatch(fetchRoomTypes({
            page: 1,
            limit: 100
        }));
    }, [dispatch]);

    // Auto-select first property if available and none selected
    useEffect(() => {
        if (properties.length > 0 && !selectedPropertyId) {
            setSelectedPropertyId(properties[0].id);
        }
    }, [properties, selectedPropertyId]);

    // Handle guest loading state completion
    useEffect(() => {
        // When guests are loaded (either success or error), stop loading
        if (!guestsLoading && guestSearchLoading) {
            setGuestSearchLoading(false);
        }
    }, [guestsLoading, guestSearchLoading]);


    // Fetch booking sources when booking type changes
    useEffect(() => {
        if (bookingType) {
            // Find the selected booking type to get its source type
            const selectedType = bookingTypes.find(type => type.id === bookingType);
            if (selectedType) {
                // Use sourceType from API if available, otherwise map booking type name to source type
                let sourceTypeValue = selectedType.sourceType;

                // Fallback mapping if sourceType is not provided by API
                if (!sourceTypeValue) {
                    const nameUpper = selectedType.name.toUpperCase();
                    if (nameUpper.includes('WALK') || nameUpper.includes('DIRECT')) {
                        sourceTypeValue = 'DIRECT';
                    } else if (nameUpper.includes('OTA') || nameUpper.includes('ONLINE')) {
                        sourceTypeValue = 'OTA';
                    } else if (nameUpper.includes('CORPORATE') || nameUpper.includes('COMPANY')) {
                        sourceTypeValue = 'CORPORATE';
                    } else if (nameUpper.includes('AGENT') || nameUpper.includes('TRAVEL')) {
                        sourceTypeValue = 'AGENT';
                    } else if (nameUpper.includes('CHANNEL')) {
                        sourceTypeValue = 'CHANNEL_MANAGER';
                    } else {
                        sourceTypeValue = 'DIRECT'; // Default to DIRECT
                    }
                }

                dispatch(fetchBookingSources({
                    page: 1,
                    limit: 100,
                    sourceType: sourceTypeValue,
                    isActive: true
                }));
            }
        }
    }, [bookingType, bookingTypes, dispatch]);

    // Fetch rooms when room type changes and reset room number
    useEffect(() => {
        if (roomType) {
            // Reset room number when room type changes
            setRoomNo('');

            dispatch(fetchRooms({
                page: 1,
                limit: 100,
                status: 'AVAILABLE'
            }));
        }
    }, [roomType, dispatch]);

    // Update adults and children capacity when room is selected
    useEffect(() => {
        if (roomNo) {
            const selectedRoom = rooms.find(room => room.id === roomNo);
            if (selectedRoom && selectedRoom.roomType) {
                // Set adults to the room's adult capacity (or current value if less)
                setAdults(Math.min(adults, selectedRoom.roomType.adultCapacity));
                // Set children to 0 initially, but max is room's child capacity
                setChildren(Math.min(children, selectedRoom.roomType.childCapacity));
            }
        }
    }, [roomNo, rooms]);

    // Payment Details State (for advance payment)
    const [paymentMode, setPaymentMode] = useState('');
    const [advanceRemarks, setAdvanceRemarks] = useState('');
    const [advanceAmount, setAdvanceAmount] = useState(0);

    // Loading state for save operation
    const [isSaving, setIsSaving] = useState(false);

    // Handle guest search
    const handleGuestSearch = (searchTerm: string) => {
        // Prevent duplicate requests for the same search term
        if (searchTerm === lastGuestSearch) {
            return;
        }

        setGuestSearchLoading(true);
        setLastGuestSearch(searchTerm);

        dispatch(fetchGuests({
            page: 1,
            limit: 50,
            search: searchTerm || undefined, // Send undefined if empty string
        }));
    };

    // Handle guest selection
    const handleGuestSelect = (guest: Guest) => {
        // Check if guest is already selected
        const isAlreadySelected = selectedGuests.some(g => g.id === guest.id);

        if (isAlreadySelected) {
            // Remove guest if already selected
            setSelectedGuests(selectedGuests.filter(g => g.id !== guest.id));
        } else {
            // Add guest to selected list
            setSelectedGuests([...selectedGuests, guest]);
        }

        // Close dialog after selection
        setGuestDialogOpen(false);
    };

    // Handle dialog close
    const handleDialogClose = (open: boolean) => {
        setGuestDialogOpen(open);
        if (!open) {
            // Reset search state when dialog closes
            setLastGuestSearch('');
            setGuestSearchLoading(false);
        }
    };

    // Add new guest (open guest selection dialog)
    const addGuest = () => {
        setGuestDialogOpen(true);

        // Only fetch guests if we don't have any or if this is the first time opening
        if (guests.length === 0 && lastGuestSearch === '') {
            setGuestSearchLoading(true);
            setLastGuestSearch('');
            dispatch(fetchGuests({
                page: 1,
                limit: 50,
                search: undefined,
            }));
        }
    };

    // Remove guest
    const removeGuest = (id: string) => {
        setSelectedGuests(selectedGuests.filter(guest => guest.id !== id));
    };

    const handleSave = async () => {
        // Validation
        if (!roomType || !roomNo || !bookingType) {
            showError('Please fill in all required fields');
            return;
        }

        if (selectedGuests.length === 0) {
            showError('Please select at least one guest');
            return;
        }

        // Use the selected property ID
        if (!selectedPropertyId) {
            showError('Please select a property');
            return;
        }

        // Validate check-in and check-out dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const now = new Date();

        if (checkInDate < now) {
            showError('Check-in date cannot be in the past');
            return;
        }

        if (checkOutDate <= checkInDate) {
            showError('Check-out date must be after check-in date');
            return;
        }

        setIsSaving(true);

        try {
            // Convert datetime-local format to ISO 8601 format with timezone
            const formatToISO = (dateTimeLocal: string): string => {
                if (!dateTimeLocal) return '';
                // Create a Date object from the datetime-local value
                const date = new Date(dateTimeLocal);
                // Convert to ISO string format (e.g., "2024-01-15T14:00:00.000Z")
                return date.toISOString();
            };

            const reservationData = {
                propertyId: selectedPropertyId, // Use selected property ID
                guestIds: selectedGuests.map(guest => guest.id), // Use selected guests
                bookingTypeId: bookingType,
                bookingSourceId: bookingReference,
                accommodationType: 'ROOM' as const, // or 'BED' based on selection
                roomId: roomNo,
                checkIn: formatToISO(checkIn),
                checkOut: formatToISO(checkOut),
                adults: adults,
                children: children,
                specialRequests: purposeOfVisit ? [purposeOfVisit] : [],
                notes: remarks
            };

            console.log('Creating reservation...', reservationData);

            // Step 1: Create the reservation
            const reservationResult = await dispatch(createReservation(reservationData)).unwrap();

            console.log('Reservation created successfully:', reservationResult);
            success('Reservation created successfully');

            // Step 2: Create payment if advance amount is provided
            if (advanceAmount > 0 && paymentMode && reservationResult.data) {
                const bookingId = reservationResult.data.id;
                // Use the first selected guest as the primary guest for payment
                const primaryGuestId = selectedGuests[0]?.id;

                if (!primaryGuestId) {
                    showError('No guest selected for payment');
                    return;
                }

                // Map payment mode to API payment method
                const paymentMethodMap: Record<string, 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'ONLINE_GATEWAY'> = {
                    'cash': 'CASH',
                    'card': 'CARD',
                    'bank': 'BANK_TRANSFER',
                    'upi': 'MOBILE_MONEY',
                };

                const paymentData = {
                    bookingId: bookingId,
                    guestId: primaryGuestId,
                    amount: advanceAmount,
                    method: paymentMethodMap[paymentMode] || 'CASH',
                    currency: 'ETB',
                    notes: advanceRemarks || `Advance payment for reservation ${bookingId}`,
                };

                console.log('Creating payment...', paymentData);

                // Create the payment
                const paymentResult = await dispatch(createPayment(paymentData)).unwrap();

                console.log('Payment created successfully:', paymentResult);
                success('Payment processed successfully');
            }

            // Reset form or redirect to reservations list
            // For now, we'll just log success
            console.log('Booking and payment process completed successfully');

        } catch (err: unknown) {
            console.error('Error during booking/payment:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
            showError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">New Reservation</h1>
                        <p className="text-gray-600">Create a new hotel reservation</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Booking List
                    </Button>
                </div>

                <div className="flex flex-col gap-6 w-full">
                    {/* Left Column - Reservation Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Reservation Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Reservation Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* First Row - 4 columns */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                                    <div className="space-y-2">
                                        <Label htmlFor="checkIn" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Check In Date & Time*
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="checkIn"
                                                type="datetime-local"
                                                value={checkIn}
                                                onChange={(e) => {
                                                    const newCheckIn = e.target.value;
                                                    setCheckIn(newCheckIn);
                                                    // Automatically update check-out if it's before new check-in
                                                    if (checkOut && newCheckIn >= checkOut) {
                                                        const newCheckInDate = new Date(newCheckIn);
                                                        newCheckInDate.setDate(newCheckInDate.getDate() + 1);
                                                        const year = newCheckInDate.getFullYear();
                                                        const month = String(newCheckInDate.getMonth() + 1).padStart(2, '0');
                                                        const day = String(newCheckInDate.getDate()).padStart(2, '0');
                                                        const hours = String(newCheckInDate.getHours()).padStart(2, '0');
                                                        const minutes = String(newCheckInDate.getMinutes()).padStart(2, '0');
                                                        setCheckOut(`${year}-${month}-${day}T${hours}:${minutes}`);
                                                    }
                                                }}
                                                className="w-full"
                                                required
                                                min={getCurrentDateTime()}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="checkOut" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Check Out Date & Time*
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="checkOut"
                                                type="datetime-local"
                                                value={checkOut}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                className="w-full"
                                                required
                                                min={checkIn}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="arrivalFrom" className="flex items-center gap-2">
                                            <Plane className="h-4 w-4" />
                                            Arrival From
                                        </Label>
                                        <Input
                                            id="arrivalFrom"
                                            value={arrivalFrom}
                                            onChange={(e) => setArrivalFrom(e.target.value)}
                                            placeholder="Arrival From"
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bookingType" className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Booking Type
                                        </Label>
                                        <Select value={bookingType} onValueChange={setBookingType}>
                                            <SelectTrigger className="pl-10">
                                                <SelectValue placeholder="Choose Booking Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bookingTypesLoading ? (
                                                    <SelectItem value="loading" disabled>
                                                        Loading booking types...
                                                    </SelectItem>
                                                ) : bookingTypesError ? (
                                                    <SelectItem value="error" disabled>
                                                        Error loading booking types
                                                    </SelectItem>
                                                ) : bookingTypes.length === 0 ? (
                                                    <SelectItem value="empty" disabled>
                                                        No booking types available
                                                    </SelectItem>
                                                ) : (
                                                    bookingTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id}>
                                                            {type.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Second Row - 4 columns */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                                    <div className="space-y-2">
                                        <Label htmlFor="bookingReference" className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Choose Booking Reference
                                        </Label>
                                        <Select value={bookingReference} onValueChange={setBookingReference}>
                                            <SelectTrigger className="pl-10">
                                                <SelectValue placeholder="Choose Booking Reference" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bookingSourcesLoading ? (
                                                    <SelectItem value="loading" disabled>
                                                        Loading booking sources...
                                                    </SelectItem>
                                                ) : bookingSourcesError ? (
                                                    <SelectItem value="error" disabled>
                                                        Error loading booking sources
                                                    </SelectItem>
                                                ) : bookingSources.length === 0 ? (
                                                    <SelectItem value="empty" disabled>
                                                        No booking sources available
                                                    </SelectItem>
                                                ) : (
                                                    bookingSources.map((source) => (
                                                        <SelectItem key={source.id} value={source.id}>
                                                            {source.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bookingRefNo">
                                            Booking Reference No
                                        </Label>
                                        <Input
                                            id="bookingRefNo"
                                            value={bookingRefNo}
                                            onChange={(e) => setBookingRefNo(e.target.value)}
                                            placeholder="Booking Reference No."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="purposeOfVisit" className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Purpose of Visit
                                        </Label>
                                        <Input
                                            id="purposeOfVisit"
                                            value={purposeOfVisit}
                                            onChange={(e) => setPurposeOfVisit(e.target.value)}
                                            placeholder="Purpose of Visit"
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks" className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Remarks
                                        </Label>
                                        <Input
                                            id="remarks"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Remarks"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Room Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Room Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 flex ">
                                {/* Room Info */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Room Info</h3>
                                        <div className="grid grid-cols-12 gap-4 items-end">
                                            {/* Room Info Column - Takes most space */}
                                            <div className="col-span-10 space-y-4">
                                                <div className="grid grid-cols-5 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="property" className="flex items-center gap-2">
                                                            <Building className="h-4 w-4" />
                                                            Property*
                                                        </Label>
                                                        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                                                            <SelectTrigger className="pl-10">
                                                                <SelectValue placeholder="Choose Property" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {properties.length === 0 ? (
                                                                    <SelectItem value="empty" disabled>
                                                                        No properties available
                                                                    </SelectItem>
                                                                ) : (
                                                                    properties.map((property) => (
                                                                        <SelectItem key={property.id} value={property.id}>
                                                                            {property.name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="roomType" className="flex items-center gap-2">
                                                            <Filter className="h-4 w-4" />
                                                            Room Type*
                                                        </Label>
                                                        <Select value={roomType} onValueChange={setRoomType}>
                                                            <SelectTrigger className="pl-10">
                                                                <SelectValue placeholder="Choose Room Type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {roomTypesLoading ? (
                                                                    <SelectItem value="loading" disabled>
                                                                        Loading room types...
                                                                    </SelectItem>
                                                                ) : roomTypes.length === 0 ? (
                                                                    <SelectItem value="empty" disabled>
                                                                        No room types available
                                                                    </SelectItem>
                                                                ) : (
                                                                    roomTypes.map((type) => (
                                                                        <SelectItem key={type.id} value={type.id}>
                                                                            {type.name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="roomNo" className="flex items-center gap-2">
                                                            <ChevronsUpDown className="h-4 w-4" />
                                                            Room No.*
                                                        </Label>
                                                        <Select value={roomNo} onValueChange={setRoomNo} disabled={!roomType}>
                                                            <SelectTrigger className="pl-10">
                                                                <SelectValue placeholder={!roomType ? "Select room type first" : "Choose Room No."} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {roomsLoading ? (
                                                                    <SelectItem value="loading" disabled>
                                                                        Loading rooms...
                                                                    </SelectItem>
                                                                ) : !roomType ? (
                                                                    <SelectItem value="no-type" disabled>
                                                                        Please select room type first
                                                                    </SelectItem>
                                                                ) : rooms.filter(room => room.roomTypeId === roomType && room.status === 'AVAILABLE').length === 0 ? (
                                                                    <SelectItem value="empty" disabled>
                                                                        No available rooms for this type
                                                                    </SelectItem>
                                                                ) : (
                                                                    rooms
                                                                        .filter(room => room.roomTypeId === roomType && room.status === 'AVAILABLE')
                                                                        .map((room) => (
                                                                            <SelectItem key={room.id} value={room.id}>
                                                                                {room.number}
                                                                            </SelectItem>
                                                                        ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="adults" className="flex items-center gap-2">
                                                            <Users className="h-4 w-4" />
                                                            #Adults {roomNo && rooms.find(r => r.id === roomNo)?.roomType && `(Max: ${rooms.find(r => r.id === roomNo)?.roomType?.adultCapacity})`}
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="adults"
                                                                type="number"
                                                                value={adults}
                                                                onChange={(e) => {
                                                                    const selectedRoom = rooms.find(r => r.id === roomNo);
                                                                    const maxAdults = selectedRoom?.roomType?.adultCapacity || 10;
                                                                    const value = Math.min(Number(e.target.value), maxAdults);
                                                                    setAdults(Math.max(1, value));
                                                                }}
                                                                placeholder="Adults"
                                                                className="pl-10 pr-10"
                                                                min={1}
                                                                max={roomNo && rooms.find(r => r.id === roomNo)?.roomType?.adultCapacity}
                                                            />
                                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                                                                <ChevronUp
                                                                    className="h-3 w-3 cursor-pointer hover:text-blue-600"
                                                                    onClick={() => {
                                                                        const selectedRoom = rooms.find(r => r.id === roomNo);
                                                                        const maxAdults = selectedRoom?.roomType?.adultCapacity || 10;
                                                                        setAdults(prev => Math.min(prev + 1, maxAdults));
                                                                    }}
                                                                />
                                                                <ChevronDown className="h-3 w-3 cursor-pointer hover:text-blue-600" onClick={() => setAdults(prev => Math.max(1, prev - 1))} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="children" className="flex items-center gap-2">
                                                            <Baby className="h-4 w-4" />
                                                            #Children {roomNo && rooms.find(r => r.id === roomNo)?.roomType && `(Max: ${rooms.find(r => r.id === roomNo)?.roomType?.childCapacity})`}
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="children"
                                                                type="number"
                                                                value={children}
                                                                onChange={(e) => {
                                                                    const selectedRoom = rooms.find(r => r.id === roomNo);
                                                                    const maxChildren = selectedRoom?.roomType?.childCapacity || 5;
                                                                    const value = Math.min(Number(e.target.value), maxChildren);
                                                                    setChildren(Math.max(0, value));
                                                                }}
                                                                placeholder="0"
                                                                className="pl-10 pr-10"
                                                                min={0}
                                                                max={roomNo && rooms.find(r => r.id === roomNo)?.roomType?.childCapacity}
                                                            />
                                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                                                                <ChevronUp
                                                                    className="h-3 w-3 cursor-pointer hover:text-blue-600"
                                                                    onClick={() => {
                                                                        const selectedRoom = rooms.find(r => r.id === roomNo);
                                                                        const maxChildren = selectedRoom?.roomType?.childCapacity || 5;
                                                                        setChildren(prev => Math.min(prev + 1, maxChildren));
                                                                    }}
                                                                />
                                                                <ChevronDown className="h-3 w-3 cursor-pointer hover:text-blue-600" onClick={() => setChildren(prev => Math.max(0, prev - 1))} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guest Info */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-900">Selected Guests</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addGuest}
                                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Guest
                                            </Button>
                                        </div>

                                        {selectedGuests.length === 0 ? (
                                            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                                                <User className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">No guests selected</p>
                                                <p className="text-xs text-gray-400">Click "Add Guest" to select guests for this booking</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedGuests.map((guest) => (
                                                    <div
                                                        key={guest.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <User className="h-5 w-5 text-gray-500" />
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {guest.firstName} {guest.lastName}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {guest.email} {guest.phone && `• ${guest.phone}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeGuest(guest.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Advance Payment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Advance Payment (Optional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMode" className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Payment Mode
                                    </Label>
                                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose Payment Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                                            <SelectItem value="bank">Bank Transfer</SelectItem>
                                            <SelectItem value="upi">UPI / Mobile Money</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="advanceAmount" className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Advance Amount
                                    </Label>
                                    <Input
                                        id="advanceAmount"
                                        type="number"
                                        value={advanceAmount}
                                        onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                                        placeholder="0.00"
                                        min="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="advanceRemarks" className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Payment Notes
                                    </Label>
                                    <Input
                                        id="advanceRemarks"
                                        value={advanceRemarks}
                                        onChange={(e) => setAdvanceRemarks(e.target.value)}
                                        placeholder="Optional notes"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                        size="lg"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Guest Selection Dialog */}
            <GuestSelectionDialog
                open={guestDialogOpen}
                onOpenChange={handleDialogClose}
                guests={guests}
                loading={guestSearchLoading}
                onSearch={handleGuestSearch}
                onSelect={handleGuestSelect}
                selectedGuestIds={selectedGuests.map(g => g.id)}
            />
        </div>
    );
}
