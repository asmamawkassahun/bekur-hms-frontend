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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Building,
  User,
  Users,
  Trash2,
  Plus,
  CreditCard,
  DollarSign,
  UserPlus,
  Search,
  ChevronDown,
} from 'lucide-react';
import {
  fetchBookingTypes,
  createReservation,
  calculatePrice,
} from '@/store/slices/reservationSlice';
import { fetchBookingSources } from '@/store/slices/bookingSourceSlice';
import { createPayment } from '@/store/slices/paymentSlice';
import { fetchRoomTypes } from '@/store/slices/roomTypeSlice';
import { fetchRooms, fetchAvailableRooms } from '@/store/slices/roomSlice';
import { fetchGuests } from '@/store/slices/guestSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchBeds, fetchAvailableBeds } from '@/store/slices/bedSlice';
import { fetchDormitories } from '@/store/slices/dormitorySlice';
import { GuestSelectionDialog } from '@/components/features/reservations/GuestSelectionDialog';
import { CreateGuestDialog } from '@/components/features/reservations/CreateGuestDialog';
import { PricingBreakdown } from '@/components/features/reservations/PricingBreakdown';
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

  const { bookingTypes, bookingTypesLoading, bookingTypesError } = useSelector(
    (state: RootState) => state.reservation,
  );

  const {
    bookingSources,
    loading: bookingSourcesLoading,
    error: bookingSourcesError,
  } = useSelector((state: RootState) => state.bookingSource);

  // Debug logging
  useEffect(() => {
    console.log('Booking Types State:', {
      bookingTypes,
      bookingTypesLoading,
      bookingTypesError,
      count: bookingTypes.length,
    });
  }, [bookingTypes, bookingTypesLoading, bookingTypesError]);

  const { roomTypes, loading: roomTypesLoading } = useSelector(
    (state: RootState) => state.roomType,
  );

  const {
    rooms,
    loading: roomsLoading,
    availableRooms,
    availableRoomsLoading,
  } = useSelector((state: RootState) => state.room);

  const { guests, loading: guestsLoading } = useSelector(
    (state: RootState) => state.guest,
  );

  const { properties } = useSelector((state: RootState) => state.property);

  const {
    beds,
    loading: bedsLoading,
    availableBeds,
    availableBedsLoading,
  } = useSelector((state: RootState) => state.bed);

  const { dormitories, loading: dormitoriesLoading } = useSelector(
    (state: RootState) => state.dormitory,
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

  const formatCurrency = (amount: number) => {
    const currency =
      properties.find((p) => p.id === selectedPropertyId)?.currency || 'ETB';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // State
  const [checkIn, setCheckIn] = useState(getDefaultCheckIn());
  const [checkOut, setCheckOut] = useState(getDefaultCheckOut());
  const [bookingReference, setBookingReference] = useState('');
  const [bookingRefNo, setBookingRefNo] = useState('');
  const [bookingType, setBookingType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [createGuestDialogOpen, setCreateGuestDialogOpen] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [guestSearchLoading, setGuestSearchLoading] = useState(false);
  const [lastGuestSearch, setLastGuestSearch] = useState('');
  const [accommodationType, setAccommodationType] = useState('ROOM');
  const [selectedDormitoryId, setSelectedDormitoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [externalTransactionId, setExternalTransactionId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    console.log('Fetching booking types...');
    dispatch(fetchBookingTypes({ page: 1, limit: 100, isActive: true }))
      .unwrap()
      .then((response) => {
        console.log('Booking types fetched successfully:', response);
      })
      .catch((error) => {
        console.error('Failed to fetch booking types:', error);
      });

    dispatch(fetchProperties({ page: 1, limit: 100 }));
    dispatch(fetchRoomTypes({ page: 1, limit: 100 }));
    dispatch(fetchDormitories({ page: 1, limit: 100 }));
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
      // Fetch booking sources filtered by the selected booking type
      dispatch(
        fetchBookingSources({
          page: 1,
          limit: 100,
          bookingTypeId: bookingType,
          isActive: true,
        }),
      );
    }
  }, [bookingType, dispatch]);

  // Fetch available rooms when dates, property, accommodation type, or room type changes
  useEffect(() => {
    if (
      selectedPropertyId &&
      checkIn &&
      checkOut &&
      accommodationType === 'ROOM' &&
      roomType
    ) {
      setRoomNo(''); // Reset selected room when filters change

      // Format dates to ISO string
      const formatToISO = (dateTimeLocal: string): string => {
        if (!dateTimeLocal) return '';
        const date = new Date(dateTimeLocal);
        return date.toISOString();
      };

      dispatch(
        fetchAvailableRooms({
          propertyId: selectedPropertyId,
          checkIn: formatToISO(checkIn),
          checkOut: formatToISO(checkOut),
          roomTypeId: roomType,
        }),
      );
    }
  }, [
    selectedPropertyId,
    checkIn,
    checkOut,
    accommodationType,
    roomType,
    dispatch,
  ]);

  // Fetch available beds when dates, property, accommodation type, or dormitory changes
  useEffect(() => {
    if (
      selectedPropertyId &&
      checkIn &&
      checkOut &&
      accommodationType === 'BED' &&
      selectedDormitoryId
    ) {
      setRoomNo(''); // Reset selected bed when filters change

      // Format dates to ISO string
      const formatToISO = (dateTimeLocal: string): string => {
        if (!dateTimeLocal) return '';
        const date = new Date(dateTimeLocal);
        return date.toISOString();
      };

      dispatch(
        fetchAvailableBeds({
          propertyId: selectedPropertyId,
          checkIn: formatToISO(checkIn),
          checkOut: formatToISO(checkOut),
          dormitoryId: selectedDormitoryId,
        }),
      );
    }
  }, [
    selectedPropertyId,
    checkIn,
    checkOut,
    accommodationType,
    selectedDormitoryId,
    dispatch,
  ]);

  // Update capacity when room is selected
  useEffect(() => {
    if (roomNo) {
      const selectedRoom = availableRooms.find((room) => room.id === roomNo);
      if (selectedRoom && selectedRoom.roomType) {
        setAdults(Math.min(adults, selectedRoom.roomType.adultCapacity));
        setChildren(Math.min(children, selectedRoom.roomType.childCapacity));
      }
    }
  }, [roomNo, availableRooms]);

  const handleSelecteAccommodation = () => {
    if (accommodationType === 'ROOM') {
      setAccommodationType('BED');
      setRoomType('');
      setSelectedDormitoryId('');
    } else {
      setAccommodationType('ROOM');
      setRoomType('');
      setSelectedDormitoryId('');
    }
    setRoomNo('');
    setPricingData(null);
  };

  // Calculate price when room/bed is selected
  useEffect(() => {
    if (
      roomNo &&
      selectedPropertyId &&
      selectedGuests.length > 0 &&
      checkIn &&
      checkOut
    ) {
      setPricingLoading(true);
      setPricingError(null);

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
            // Set advance amount to final price by default
            setAdvanceAmount(response.data.pricing?.finalPrice || 0);
          }
          setPricingLoading(false);
        })
        .catch((err) => {
          console.error('Failed to calculate price:', err);
          setPricingError(err.message || 'Failed to calculate price');
          setPricingLoading(false);
          showError('Failed to calculate price. Please try again.');
        });
    } else {
      // Reset pricing when requirements not met
      setPricingData(null);
      setPricingError(null);
    }
  }, [
    roomNo,
    selectedPropertyId,
    bookingReference,
    selectedGuests,
    checkIn,
    checkOut,
    accommodationType,
    dispatch,
    showError,
  ]);

  const handleGuestSearch = (searchTerm: string) => {
    if (searchTerm === lastGuestSearch) return;
    setGuestSearchLoading(true);
    setLastGuestSearch(searchTerm);
    dispatch(
      fetchGuests({ page: 1, limit: 50, search: searchTerm || undefined }),
    );
  };

  const handleGuestSelect = (guest: Guest) => {
    const isAlreadySelected = selectedGuests.some((g) => g.id === guest.id);
    if (isAlreadySelected) {
      setSelectedGuests(selectedGuests.filter((g) => g.id !== guest.id));
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

  const addOldGuest = () => {
    setGuestDialogOpen(true);
    if (guests.length === 0 && lastGuestSearch === '') {
      setGuestSearchLoading(true);
      setLastGuestSearch('');
      dispatch(fetchGuests({ page: 1, limit: 50, search: undefined }));
    }
  };

  const addNewGuest = () => {
    setCreateGuestDialogOpen(true);
  };

  const handleGuestCreated = (guest: Guest) => {
    // Add newly created guest to selected guests
    setSelectedGuests([...selectedGuests, guest]);
  };

  const removeGuest = (id: string) => {
    setSelectedGuests(selectedGuests.filter((guest) => guest.id !== id));
  };

  const handleSave = async () => {
    // Validation
    const hasRoomTypeOrDormitory =
      accommodationType === 'ROOM' ? roomType : selectedDormitoryId;

    if (!hasRoomTypeOrDormitory || !roomNo || !bookingType) {
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
      if (!paymentMethod || advanceAmount <= 0) {
        showError('Payment details are required for direct check-in');
        return;
      }
    }

    // For advance payment (booking mode), validate payment method if amount > 0
    if (mode === 'booking' && advanceAmount > 0 && !paymentMethod) {
      showError('Please select a payment method for advance payment');
      return;
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
        guestIds: selectedGuests.map((guest) => guest.id), // Array of guest IDs (first is primary)
        bookingTypeId: bookingType,
        bookingSourceId: bookingReference,
        accommodationType: accommodationType as 'ROOM' | 'BED',
        ...(accommodationType === 'ROOM'
          ? { roomId: roomNo }
          : { bedId: roomNo }),
        checkIn: formatToISO(checkIn),
        checkOut: formatToISO(checkOut),
        adults: adults,
        children: children,
        specialRequests: remarks ? [remarks] : undefined, // Convert remarks to array for specialRequests
        notes: notes || undefined, // General notes
        externalBookingReference: bookingRefNo || undefined, // External booking reference number
      };

      console.log('Creating reservation...', reservationData);

      // Step 1: Create the reservation
      const reservationResult = await dispatch(
        createReservation(reservationData),
      ).unwrap();

      console.log('Reservation created successfully:', reservationResult);
      success('Reservation created successfully');

      // Step 2: Create payment (only if amount > 0)
      if (advanceAmount > 0 && reservationResult.data) {
        if (!paymentMethod) {
          showError('Please select a payment method');
          setIsSaving(false);
          return;
        }

        const bookingId = reservationResult.data.id;
        const selectedPropertyCurrency =
          properties.find((p) => p.id === selectedPropertyId)?.currency ||
          'ETB';

        const paymentData = {
          bookingId: bookingId,
          guestId: selectedGuests[0].id,
          amount: advanceAmount,
          method: paymentMethod, // Already using backend enum values (CASH, CARD, etc.)
          currency: selectedPropertyCurrency,
          status: mode === 'direct-checkin' ? 'COMPLETED' : 'PENDING',
          externalTransactionId: externalTransactionId || undefined,
          notes: paymentNotes || undefined,
        };

        console.log('Creating payment...', paymentData);

        await dispatch(createPayment(paymentData)).unwrap();

        console.log('Payment created successfully');
        success('Booking and payment created successfully');
      } else {
        success('Booking created successfully');
      }

      console.log('Booking and payment process completed successfully');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error('Error during booking/payment:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create booking';
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle =
    mode === 'direct-checkin' ? 'Direct Check-In' : 'New Reservation';
  const pageDescription =
    mode === 'direct-checkin'
      ? 'Check-in a guest with immediate payment'
      : 'Create a new hotel reservation';
  const backLink =
    mode === 'direct-checkin'
      ? '/dashboard/reservations/check-in'
      : '/dashboard/reservations/list';
  const backLinkText =
    mode === 'direct-checkin' ? 'Check-In List' : 'Book List';

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">{pageDescription}</p>
          </div>
          <Link
            href={backLink}
            className="bg-primary flex items-center px-4 py-1.5 rounded-md text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
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
            <CardContent className="space-y-6">
              {/* First Row: Check In, Check Out, Booking Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
                        const month = String(
                          newCheckInDate.getMonth() + 1,
                        ).padStart(2, '0');
                        const day = String(newCheckInDate.getDate()).padStart(
                          2,
                          '0',
                        );
                        const hours = String(
                          newCheckInDate.getHours(),
                        ).padStart(2, '0');
                        const minutes = String(
                          newCheckInDate.getMinutes(),
                        ).padStart(2, '0');
                        setCheckOut(
                          `${year}-${month}-${day}T${hours}:${minutes}`,
                        );
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
                  <Label
                    htmlFor="bookingType"
                    className="flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Booking Type*
                  </Label>
                  <Select value={bookingType} onValueChange={setBookingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Booking Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookingTypesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading booking types...
                        </SelectItem>
                      ) : bookingTypesError ? (
                        <SelectItem value="error" disabled>
                          Error: {bookingTypesError}
                        </SelectItem>
                      ) : bookingTypes.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No booking types found. Please create one first.
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

              {/* Second Row: Booking Reference fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-2">
                  <Label
                    htmlFor="bookingReference"
                    className="flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Choose Booking Source
                  </Label>
                  <Select
                    value={bookingReference}
                    onValueChange={setBookingReference}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Booking Source" />
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
                    External Booking Reference No
                  </Label>
                  <Input
                    id="bookingRefNo"
                    value={bookingRefNo}
                    onChange={(e) => setBookingRefNo(e.target.value)}
                    placeholder="External booking reference number"
                  />
                </div>
              </div>

              {/* Third Row: Notes and Special Requests as textareas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="General notes about the booking"
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks">Special Requests</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Any special requests from guest"
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accommodation Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Accommodation Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Row 1: Property and Accommodation Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property">Property*</Label>
                  <Select
                    value={selectedPropertyId}
                    onValueChange={(value) => {
                      setSelectedPropertyId(value);
                      setRoomType('');
                      setRoomNo('');
                      setPricingData(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
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
                  <Label htmlFor="accommodationType">Accommodation Type*</Label>
                  <Select
                    value={accommodationType}
                    onValueChange={(value) => {
                      setAccommodationType(value);
                      setRoomType('');
                      setSelectedDormitoryId('');
                      setRoomNo('');
                      setPricingData(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accommodation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROOM">Room</SelectItem>
                      <SelectItem value="BED">Bed (Dormitory)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Room Type/Dormitory and Room/Bed */}
              {selectedPropertyId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomType">
                      {accommodationType === 'ROOM'
                        ? 'Room Type*'
                        : 'Dormitory*'}
                    </Label>
                    <Select
                      value={
                        accommodationType === 'ROOM'
                          ? roomType
                          : selectedDormitoryId
                      }
                      onValueChange={(value) => {
                        if (accommodationType === 'ROOM') {
                          setRoomType(value);
                        } else {
                          setSelectedDormitoryId(value);
                        }
                        setRoomNo('');
                        setPricingData(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Select ${accommodationType === 'ROOM' ? 'room type' : 'dormitory'}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {accommodationType === 'ROOM'
                          ? roomTypes
                              .filter(
                                (rt) => rt.propertyId === selectedPropertyId,
                              )
                              .map((rt) => (
                                <SelectItem key={rt.id} value={rt.id}>
                                  {rt.name} - {formatCurrency(rt.basePrice)}
                                </SelectItem>
                              ))
                          : dormitories
                              .filter(
                                (d) => d.propertyId === selectedPropertyId,
                              )
                              .map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name} - {d.capacity} beds
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomNo">
                      {accommodationType === 'ROOM'
                        ? 'Room Number*'
                        : 'Bed Number*'}
                    </Label>
                    <Select
                      value={roomNo}
                      onValueChange={setRoomNo}
                      disabled={
                        accommodationType === 'ROOM'
                          ? !roomType
                          : !selectedDormitoryId
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Select ${accommodationType === 'ROOM' ? 'room' : 'bed'}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {accommodationType === 'ROOM' ? (
                          !roomType ? (
                            <SelectItem value="no-type" disabled>
                              Please select room type first
                            </SelectItem>
                          ) : availableRoomsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading available rooms...
                            </SelectItem>
                          ) : availableRooms.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              No available rooms for selected dates
                            </SelectItem>
                          ) : (
                            availableRooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.number}
                              </SelectItem>
                            ))
                          )
                        ) : !selectedDormitoryId ? (
                          <SelectItem value="no-dorm" disabled>
                            Please select dormitory first
                          </SelectItem>
                        ) : availableBedsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading available beds...
                          </SelectItem>
                        ) : availableBeds.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No available beds for selected dates
                          </SelectItem>
                        ) : (
                          availableBeds.map((bed) => (
                            <SelectItem key={bed.id} value={bed.id}>
                              {bed.number}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Row 3: Adults and Children */}
              {roomNo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adults">Adults*</Label>
                    <Input
                      id="adults"
                      type="number"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="children">Children</Label>
                    <Input
                      id="children"
                      type="number"
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guest Selection */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Guest Information
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Guest
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={addOldGuest}
                      className="cursor-pointer"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Select Existing Guest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={addNewGuest}
                      className="cursor-pointer"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create New Guest
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {selectedGuests.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <User className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No guests selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click &quot;Add Guest&quot; to select guests for this
                    booking
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {guest.email} {guest.phone && `• ${guest.phone}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGuest(guest.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {pricingLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Calculating price...
                  </p>
                </div>
              ) : pricingError ? (
                <div className="text-center py-8 text-destructive">
                  <p>{pricingError}</p>
                </div>
              ) : (
                <PricingBreakdown
                  pricingData={pricingData}
                  currency={
                    properties.find((p) => p.id === selectedPropertyId)
                      ?.currency || 'ETB'
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Advance Payment */}
          {pricingData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Advance Payment {mode === 'direct-checkin' && '*'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {mode === 'direct-checkin'
                    ? 'Full payment required for direct check-in'
                    : 'Optional advance payment. Set amount to 0 to skip.'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Row 1: Amount and Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advanceAmount">
                      Payment Amount*
                      <span className="text-xs text-muted-foreground ml-2">
                        (Max: {formatCurrency(pricingData.pricing.finalPrice)})
                      </span>
                    </Label>
                    <Input
                      id="advanceAmount"
                      type="number"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                      min={0}
                      max={pricingData.pricing.finalPrice}
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">
                      Payment Method{advanceAmount > 0 && '*'}
                    </Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      disabled={advanceAmount === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="MOBILE_MONEY">
                          Mobile Money
                        </SelectItem>
                        <SelectItem value="CRYPTO">Crypto</SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          Bank Transfer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Currency (read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={
                        properties.find((p) => p.id === selectedPropertyId)
                          ?.currency || 'ETB'
                      }
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                {/* Row 3: Optional fields (only show if amount > 0) */}
                {advanceAmount > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="externalTransactionId">
                        External Transaction ID (Optional)
                      </Label>
                      <Textarea
                        id="externalTransactionId"
                        value={externalTransactionId}
                        onChange={(e) =>
                          setExternalTransactionId(e.target.value)
                        }
                        placeholder="Reference from external payment system"
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentNotes">
                        Payment Notes (Optional)
                      </Label>
                      <Textarea
                        id="paymentNotes"
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        placeholder="Additional notes about this payment"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4 items-center">
          {pricingLoading && (
            <p className="text-sm text-muted-foreground">
              Please wait for pricing calculation to complete
            </p>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || pricingLoading || !pricingData}
            className="px-8 py-2"
            size="lg"
          >
            {isSaving
              ? 'Saving...'
              : mode === 'direct-checkin'
                ? 'Check In & Pay'
                : 'Save Reservation'}
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
        selectedGuestIds={selectedGuests.map((g) => g.id)}
      />

      {/* Create Guest Dialog */}
      <CreateGuestDialog
        open={createGuestDialogOpen}
        onOpenChange={setCreateGuestDialogOpen}
        onGuestCreated={handleGuestCreated}
      />
    </div>
  );
}
