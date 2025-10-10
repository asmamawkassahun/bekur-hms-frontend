'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { fetchBookingTypes, fetchBookingSources, createReservation, calculatePrice } from '@/store/slices/reservationSlice';
import { createPayment } from '@/store/slices/paymentSlice';
import { fetchRoomTypes } from '@/store/slices/roomTypeSlice';
import { fetchRooms } from '@/store/slices/roomSlice';
import { fetchGuests } from '@/store/slices/guestSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchBeds } from '@/store/slices/bedSlice';
import { GuestSelectionDialog } from '@/components/features/reservations/GuestSelectionDialog';
import { useNotification } from '@/hooks/useNotification';
import type { RootState, AppDispatch } from '@/store';
import type { Guest } from '@/types';
import Link from 'next/link';

interface ReservationFormProps {
  mode: 'booking' | 'direct-checkin';
  onSuccess?: () => void;
}

export function ReservationForm({ mode, onSuccess }: ReservationFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { success, error: showError } = useNotification();

  const {
    bookingTypes,
    bookingTypesLoading,
    bookingTypesError,
    bookingSources,
    bookingSourcesLoading,
    bookingSourcesError
  } = useSelector((state: RootState) => state.reservation);

  const { roomTypes, loading: roomTypesLoading } = useSelector(
    (state: RootState) => state.roomType
  );

  const { rooms, loading: roomsLoading } = useSelector(
    (state: RootState) => state.room
  );

  const { guests, loading: guestsLoading } = useSelector(
    (state: RootState) => state.guest
  );

  const { properties } = useSelector(
    (state: RootState) => state.property
  );

  const { beds, loading: bedsLoading } = useSelector(
    (state: RootState) => state.bed
  );

  // Helper functions for date/time
  const getDefaultCheckIn = () => {
    const today = new Date();
    today.setHours(14, 0, 0, 0);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getDefaultCheckOut = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  // State
  const [checkIn, setCheckIn] = useState(getDefaultCheckIn());
  const [checkOut, setCheckOut] = useState(getDefaultCheckOut());
  const [bookingReference, setBookingReference] = useState('');
  const [bookingRefNo, setBookingRefNo] = useState('');
  const [arrivalFrom, setArrivalFrom] = useState('');
  const [purposeOfVisit, setPurposeOfVisit] = useState('');
  const [bookingType, setBookingType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [guestSearchLoading, setGuestSearchLoading] = useState(false);
  const [lastGuestSearch, setLastGuestSearch] = useState('');
  const [accommodationType, setAccommodationType] = useState("ROOM");
  const [paymentMode, setPaymentMode] = useState('');
  const [advanceRemarks, setAdvanceRemarks] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);

  // Pricing fields
  const [discountReason, setDiscountReason] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [commissionAmount, setCommissionAmount] = useState(0);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchBookingTypes({ page: 1, limit: 100, isActive: true }));
    dispatch(fetchProperties({ page: 1, limit: 100 }));
    dispatch(fetchRoomTypes({ page: 1, limit: 100 }));
    dispatch(fetchBeds({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Auto-select first property
  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  // Handle guest loading state
  useEffect(() => {
    if (!guestsLoading && guestSearchLoading) {
      setGuestSearchLoading(false);
    }
  }, [guestsLoading, guestSearchLoading]);

  // Fetch booking sources when booking type changes
  useEffect(() => {
    if (bookingType) {
      const selectedType = bookingTypes.find(type => type.id === bookingType);
      if (selectedType) {
        let sourceTypeValue = selectedType.sourceType;
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
            sourceTypeValue = 'DIRECT';
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

  // Fetch rooms when room type changes
  useEffect(() => {
    if (roomType) {
      setRoomNo('');
      dispatch(fetchRooms({ page: 1, limit: 100, status: 'AVAILABLE' }));
    }
  }, [roomType, dispatch]);

  // Update capacity when room is selected
  useEffect(() => {
    if (roomNo) {
      const selectedRoom = rooms.find(room => room.id === roomNo);
      if (selectedRoom && selectedRoom.roomType) {
        setAdults(Math.min(adults, selectedRoom.roomType.adultCapacity));
        setChildren(Math.min(children, selectedRoom.roomType.childCapacity));
      }
    }
  }, [roomNo, rooms]);

  const handleSelecteAccommodation = () => {
    if (accommodationType === "ROOM") {
      setAccommodationType("BED");
    } else {
      setAccommodationType("ROOM");
    }
  };

  // Calculate price when room/bed is selected
  useEffect(() => {
    if (roomNo && selectedPropertyId && selectedGuests.length > 0 && checkIn && checkOut) {
      // Format dates to ISO string
      const formatToISO = (dateTimeLocal: string): string => {
        if (!dateTimeLocal) return '';
        const date = new Date(dateTimeLocal);
        return date.toISOString();
      };

      const calculatePriceData: any = {
        propertyId: selectedPropertyId,
        accommodationType: accommodationType,
        accommodationId: roomNo, // This is either room ID or bed ID based on accommodationType
        checkIn: formatToISO(checkIn),
        checkOut: formatToISO(checkOut),
        guestId: selectedGuests[0].id, // Single guest ID (primary guest)
      };

      // Only include bookingSourceId if it's selected
      if (bookingReference) {
        calculatePriceData.bookingSourceId = bookingReference;
      }

      dispatch(calculatePrice(calculatePriceData))
        .unwrap()
        .then((response) => {
          // Store the complete pricing data
          if (response.data) {
            setPricingData(response.data);

            // Populate form fields with API response
            const responseData = response.data as any;
            const pricing = responseData.pricing;
            const commission = responseData.commission;

            if (pricing) {
              setDiscountPercentage(pricing.discount || 0);
              setAdvanceAmount(pricing.finalPrice || 0);
            }

            if (commission) {
              setCommissionRate(commission.commissionRate || 0);
              setCommissionAmount(commission.commissionAmount || 0);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to calculate price:', err);
        });
    }
  }, [roomNo, selectedPropertyId, bookingReference, selectedGuests, checkIn, checkOut, accommodationType, dispatch]);

  const handleGuestSearch = (searchTerm: string) => {
    if (searchTerm === lastGuestSearch) return;
    setGuestSearchLoading(true);
    setLastGuestSearch(searchTerm);
    dispatch(fetchGuests({ page: 1, limit: 50, search: searchTerm || undefined }));
  };

  const handleGuestSelect = (guest: Guest) => {
    const isAlreadySelected = selectedGuests.some(g => g.id === guest.id);
    if (isAlreadySelected) {
      setSelectedGuests(selectedGuests.filter(g => g.id !== guest.id));
    } else {
      setSelectedGuests([...selectedGuests, guest]);
    }
    setGuestDialogOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    setGuestDialogOpen(open);
    if (!open) {
      setLastGuestSearch('');
      setGuestSearchLoading(false);
    }
  };

  const addGuest = () => {
    setGuestDialogOpen(true);
    if (guests.length === 0 && lastGuestSearch === '') {
      setGuestSearchLoading(true);
      setLastGuestSearch('');
      dispatch(fetchGuests({ page: 1, limit: 50, search: undefined }));
    }
  };

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

    if (!selectedPropertyId) {
      showError('Please select a property');
      return;
    }

    // For direct check-in, payment is required
    if (mode === 'direct-checkin') {
      if (!paymentMode || advanceAmount <= 0) {
        showError('Payment details are required for direct check-in');
        return;
      }
    }

    // Validate dates
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
      const formatToISO = (dateTimeLocal: string): string => {
        if (!dateTimeLocal) return '';
        const date = new Date(dateTimeLocal);
        return date.toISOString();
      };

      const reservationData = {
        propertyId: selectedPropertyId,
        guestIds: selectedGuests.map(guest => guest.id),
        bookingTypeId: bookingType,
        bookingSourceId: bookingReference,
        accommodationType: accommodationType as 'ROOM' | 'BED',
        ...(accommodationType === 'ROOM'
          ? { roomId: roomNo }
          : { bedId: roomNo }
        ),
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

      // Step 2: Create payment
      // For direct check-in: payment is required and marks as COMPLETED
      // For regular booking: payment is optional (advance payment)
      const shouldCreatePayment = mode === 'direct-checkin' || (advanceAmount > 0 && paymentMode);

      if (shouldCreatePayment && reservationResult.data) {
        const bookingId = reservationResult.data.id;
        const primaryGuestId = selectedGuests[0]?.id;

        if (!primaryGuestId) {
          showError('No guest selected for payment');
          return;
        }

        const paymentMethodMap: Record<string, 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CRYPTO'> = {
          'cash': 'CASH',
          'card': 'CARD',
          'bank': 'BANK_TRANSFER',
          'upi': 'MOBILE_MONEY',
          'crypto': 'CRYPTO',
        };

        const paymentData = {
          bookingId: bookingId,
          guestId: primaryGuestId,
          amount: advanceAmount,
          method: paymentMethodMap[paymentMode] || 'CASH',
          currency: 'ETB',
          notes: mode === 'direct-checkin'
            ? `Full payment for direct check-in ${bookingId}`
            : (advanceRemarks || `Advance payment for reservation ${bookingId}`),
        };

        console.log('Creating payment...', paymentData);

        const paymentResult = await dispatch(createPayment(paymentData)).unwrap();

        console.log('Payment created successfully:', paymentResult);
        success(mode === 'direct-checkin' ? 'Payment completed successfully' : 'Payment processed successfully');
      }

      console.log('Booking and payment process completed successfully');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (err: unknown) {
      console.error('Error during booking/payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle = mode === 'direct-checkin' ? 'Direct Check-In' : 'New Reservation';
  const pageDescription = mode === 'direct-checkin'
    ? 'Check-in a guest with immediate payment'
    : 'Create a new hotel reservation';
  const backLink = mode === 'direct-checkin'
    ? '/dashboard/reservations/check-in'
    : '/dashboard/reservations/list';
  const backLinkText = mode === 'direct-checkin' ? 'Check-In List' : 'Book List';

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">{pageDescription}</p>
          </div>
          <Link href={backLink} className="bg-primary flex items-center px-4 py-1.5 rounded-md text-primary-foreground hover:bg-primary/90 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            {backLinkText}
          </Link>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {/* Reservation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="checkIn" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Check In Date & Time*
                  </Label>
                  <Input
                    id="checkIn"
                    type="datetime-local"
                    value={checkIn}
                    onChange={(e) => {
                      const newCheckIn = e.target.value;
                      setCheckIn(newCheckIn);
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
                <div className="space-y-2">
                  <Label htmlFor="checkOut" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Check Out Date & Time*
                  </Label>
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
                        <SelectItem value="loading" disabled>Loading booking types...</SelectItem>
                      ) : bookingTypesError ? (
                        <SelectItem value="error" disabled>Error loading booking types</SelectItem>
                      ) : bookingTypes.length === 0 ? (
                        <SelectItem value="empty" disabled>No booking types available</SelectItem>
                      ) : (
                        bookingTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Second Row */}
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
                        <SelectItem value="loading" disabled>Loading booking sources...</SelectItem>
                      ) : bookingSourcesError ? (
                        <SelectItem value="error" disabled>Error loading booking sources</SelectItem>
                      ) : bookingSources.length === 0 ? (
                        <SelectItem value="empty" disabled>No booking sources available</SelectItem>
                      ) : (
                        bookingSources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingRefNo">Booking Reference No</Label>
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

          {/* Room Details - Continuing in next message due to length... */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Room Info</h3>
                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-10 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
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
                                <SelectItem value="empty" disabled>No properties available</SelectItem>
                              ) : (
                                properties.map((property) => (
                                  <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor="accommodationType" className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Accommodation Type
                          </Label>
                          <Select value={accommodationType} onValueChange={handleSelecteAccommodation}>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Choose Accommodation Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ROOM">Room</SelectItem>
                              <SelectItem value="BED">Bed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="roomType" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            {accommodationType === "ROOM" ? "Room Type*" : "Bed Type*"}
                          </Label>
                          <Select value={roomType} onValueChange={setRoomType}>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder={accommodationType === "ROOM" ? "Choose Room Type" : "Choose Bed Type"} />
                            </SelectTrigger>
                            <SelectContent>
                              {roomTypesLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading {accommodationType === "ROOM" ? "room types" : "bed types"}...
                                </SelectItem>
                              ) : roomTypes.length === 0 ? (
                                <SelectItem value="empty" disabled>
                                  No {accommodationType === "ROOM" ? "room types" : "bed types"} available
                                </SelectItem>
                              ) : (
                                roomTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="roomNo" className="flex items-center gap-2">
                            <ChevronsUpDown className="h-4 w-4" />
                            {accommodationType === "ROOM" ? "Room No.*" : "Bed No.*"}
                          </Label>
                          <Select value={roomNo} onValueChange={setRoomNo} disabled={!roomType}>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder={!roomType ? "Select type first" : accommodationType === "ROOM" ? "Choose Room No." : "Choose Bed No."} />
                            </SelectTrigger>
                            <SelectContent>
                              {(accommodationType === "ROOM" ? roomsLoading : bedsLoading) ? (
                                <SelectItem value="loading" disabled>
                                  Loading {accommodationType === "ROOM" ? "rooms" : "beds"}...
                                </SelectItem>
                              ) : !roomType ? (
                                <SelectItem value="no-type" disabled>
                                  Please select {accommodationType === "ROOM" ? "room type" : "bed type"} first
                                </SelectItem>
                              ) : accommodationType === "ROOM" ? (
                                rooms.filter(room => room.roomTypeId === roomType && room.status === 'AVAILABLE').length === 0 ? (
                                  <SelectItem value="empty" disabled>No available rooms for this type</SelectItem>
                                ) : (
                                  rooms
                                    .filter(room => room.roomTypeId === roomType && room.status === 'AVAILABLE')
                                    .map((room: any) => (
                                      <SelectItem key={room.id} value={room.id}>{room.number}</SelectItem>
                                    ))
                                )
                              ) : (
                                beds.filter(bed => bed.isActive && bed.status === 'AVAILABLE').length === 0 ? (
                                  <SelectItem value="empty" disabled>No available beds for this type</SelectItem>
                                ) : (
                                  beds
                                    .filter(bed => bed.isActive && bed.status === 'AVAILABLE')
                                    .map((bed: any) => (
                                      <SelectItem key={bed.id} value={bed.id}>{bed.number}</SelectItem>
                                    ))
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="adults" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            #Adults {roomNo && accommodationType === "ROOM" ? (rooms.find(r => r.id === roomNo) as any)?.roomType && `(Max: ${(rooms.find(r => r.id === roomNo) as any)?.roomType?.adultCapacity})` : ''}
                          </Label>
                          <div className="relative">
                            <Input
                              id="adults"
                              type="number"
                              value={adults}
                              onChange={(e) => {
                                const maxAdults = accommodationType === "ROOM"
                                  ? (rooms.find(r => r.id === roomNo) as any)?.roomType?.adultCapacity || 10
                                  : 1;
                                const value = Math.min(Number(e.target.value), maxAdults);
                                setAdults(Math.max(1, value));
                              }}
                              placeholder="Adults"
                              className="pl-10 pr-10"
                              min={1}
                              max={roomNo && accommodationType === "ROOM" ? (rooms.find(r => r.id === roomNo) as any)?.roomType?.adultCapacity : 1}
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                              <ChevronUp
                                className="h-3 w-3 cursor-pointer hover:text-blue-600"
                                onClick={() => {
                                  const maxAdults = accommodationType === "ROOM"
                                    ? (rooms.find(r => r.id === roomNo) as any)?.roomType?.adultCapacity || 10
                                    : 1;
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
                            #Children {roomNo && accommodationType === "ROOM" ? (rooms.find(r => r.id === roomNo) as any)?.roomType && `(Max: ${(rooms.find(r => r.id === roomNo) as any)?.roomType?.childCapacity})` : ''}
                          </Label>
                          <div className="relative">
                            <Input
                              id="children"
                              type="number"
                              value={children}
                              onChange={(e) => {
                                const maxChildren = accommodationType === "ROOM"
                                  ? (rooms.find(r => r.id === roomNo) as any)?.roomType?.childCapacity || 5
                                  : 0;
                                const value = Math.min(Number(e.target.value), maxChildren);
                                setChildren(Math.max(0, value));
                              }}
                              placeholder="0"
                              className="pl-10 pr-10"
                              min={0}
                              max={roomNo && accommodationType === "ROOM" ? (rooms.find(r => r.id === roomNo) as any)?.roomType?.childCapacity : 0}
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                              <ChevronUp
                                className="h-3 w-3 cursor-pointer hover:text-blue-600"
                                onClick={() => {
                                  const maxChildren = accommodationType === "ROOM"
                                    ? (rooms.find(r => r.id === roomNo) as any)?.roomType?.childCapacity || 5
                                    : 0;
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

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Details Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountReason" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Discount Reason
                    </Label>
                    <Input
                      id="discountReason"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="Discount Reason"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Discount (Max-100%)
                    </Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Commission (%)
                    </Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      placeholder="Commission rate"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionAmount" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Commission Amount
                    </Label>
                    <Input
                      id="commissionAmount"
                      type="number"
                      value={commissionAmount}
                      onChange={(e) => setCommissionAmount(Number(e.target.value))}
                      placeholder="Commission amount"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Details Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Billing Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600">Booking Charge</Label>
                    <div className="p-2 bg-gray-50 rounded border text-center">
                      {pricingData?.pricing?.subtotal || 0}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600">Tax</Label>
                    <div className="p-2 bg-gray-50 rounded border text-center">
                      {pricingData?.pricing?.taxAmount || 0}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600">Service Charge</Label>
                    <div className="p-2 bg-gray-50 rounded border text-center">
                      0
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600">Total</Label>
                    <div className="p-2 bg-gray-50 rounded border text-center font-semibold">
                      {pricingData?.pricing?.totalPrice || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advance Details Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Advance Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMode" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Mode{mode === 'direct-checkin' && '*'}
                    </Label>
                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Payment Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="upi">Mobile Money</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Amount
                    </Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      value={pricingData?.pricing?.finalPrice || 0}
                      placeholder="Total amount"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advanceRemarks" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Advance Remarks
                    </Label>
                    <Input
                      id="advanceRemarks"
                      value={advanceRemarks}
                      onChange={(e) => setAdvanceRemarks(e.target.value)}
                      placeholder="Advance Remarks"
                    />
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
                      placeholder="Advance Amount"
                      min="0"
                    />
                  </div>
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
            {isSaving ? 'Saving...' : mode === 'direct-checkin' ? 'Check In & Pay' : 'Save'}
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
