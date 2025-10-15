import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reservationService } from '@/services/reservation.service';
import {
  Reservation,
  CreateReservationData,
  UpdateReservationData,
  CheckInData,
  CheckOutData,
  ReservationFilters,
  BookingType,
  BookingSource,
  PaymentDetailsData,
  CalculatePriceData,
} from '@/types';

interface ReservationState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Search optimization
  searchCache: Record<string, Reservation[]>;
  lastSearchTerm: string;
  isSearching: boolean;
  // Booking Types
  bookingTypes: BookingType[];
  bookingTypesLoading: boolean;
  bookingTypesError: string | null;
  // Booking Sources
  bookingSources: BookingSource[];
  bookingSourcesLoading: boolean;
  bookingSourcesError: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  currentReservation: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  // Search optimization
  searchCache: {},
  lastSearchTerm: '',
  isSearching: false,
  // Booking Types
  bookingTypes: [],
  bookingTypesLoading: false,
  bookingTypesError: null,
  // Booking Sources
  bookingSources: [],
  bookingSourcesLoading: false,
  bookingSourcesError: null,
};

// Async thunks
export const fetchReservations = createAsyncThunk(
  'reservation/fetchReservations',
  async (
    params: {
      page?: number;
      limit?: number;
      filters?: ReservationFilters;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      // Flatten filters to top-level query params
      const { filters, ...rest } = params;
      const flatParams = {
        ...rest,
        ...(filters || {}),
      };
      const response = await reservationService.getAll(flatParams);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch reservations';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createReservation = createAsyncThunk(
  'reservation/createReservation',
  async (data: CreateReservationData, { rejectWithValue }) => {
    try {
      const response = await reservationService.create(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create reservation';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateReservation = createAsyncThunk(
  'reservation/updateReservation',
  async (
    { id, data }: { id: string; data: UpdateReservationData },
    { rejectWithValue },
  ) => {
    try {
      const response = await reservationService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update reservation';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteReservation = createAsyncThunk(
  'reservation/deleteReservation',
  async (id: string, { rejectWithValue }) => {
    try {
      await reservationService.delete(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete reservation';
      return rejectWithValue(errorMessage);
    }
  },
);

export const confirmReservation = createAsyncThunk(
  'reservation/confirmReservation',
  async (reservationId: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.confirm(reservationId);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to confirm reservation';
      return rejectWithValue(errorMessage);
    }
  },
);

export const checkInGuest = createAsyncThunk(
  'reservation/checkInGuest',
  async (data: CheckInData, { rejectWithValue }) => {
    try {
      const response = await reservationService.checkIn(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to check in guest';
      return rejectWithValue(errorMessage);
    }
  },
);

export const checkOutGuest = createAsyncThunk(
  'reservation/checkOutGuest',
  async (data: CheckOutData, { rejectWithValue }) => {
    try {
      const response = await reservationService.checkOut(data);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = 'Failed to check out guest';

      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);

export const cancelReservation = createAsyncThunk(
  'reservation/cancelReservation',
  async (
    { id, reason }: { id: string; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await reservationService.cancel(id, reason);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = 'Failed to cancel reservation';

      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);

export const getAvailability = createAsyncThunk(
  'reservation/getAvailability',
  async (
    params: {
      propertyId: string;
      checkIn: string;
      checkOut: string;
      roomType?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await reservationService.getAvailability(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get availability';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchBookingTypes = createAsyncThunk(
  'reservation/fetchBookingTypes',
  async (
    params: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      name?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await reservationService.getAllBookingTypes(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch booking types';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchBookingSources = createAsyncThunk(
  'reservation/fetchBookingSources',
  async (
    params: {
      page?: number;
      limit?: number;
      sourceType?: string;
      isActive?: boolean;
      name?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await reservationService.getAllBookingSources(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch booking sources';
      return rejectWithValue(errorMessage);
    }
  },
);

export const addPaymentDetails = createAsyncThunk(
  'reservation/addPaymentDetails',
  async (data: PaymentDetailsData, { rejectWithValue }) => {
    try {
      const response = await reservationService.addPaymentDetails(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add payment details';
      return rejectWithValue(errorMessage);
    }
  },
);

export const calculatePrice = createAsyncThunk(
  'reservation/calculatePrice',
  async (data: CalculatePriceData, { rejectWithValue }) => {
    try {
      const res = await reservationService.calculate(data);
      return res.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to calculate price';
      return rejectWithValue(errorMessage);
    }
  },
);

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    setCurrentReservation: (state, action: PayloadAction<Reservation>) => {
      state.currentReservation = action.payload;
    },
    clearCurrentReservation: (state) => {
      state.currentReservation = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<{ page: number; limit: number }>,
    ) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
    },
    // Optimistic search updates
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    updateSearchCache: (
      state,
      action: PayloadAction<{ term: string; results: Reservation[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.reservations = action.payload.data || [];

        // Cache search results for future use
        const searchTerm = action.meta.arg.filters?.guestName || '';
        if (searchTerm) {
          state.searchCache[searchTerm] = action.payload.data || [];
          state.lastSearchTerm = searchTerm;
        }

        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Create Reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.reservations.push(action.payload.data);
        }
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Reservation
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.reservations.findIndex(
            (r) => r.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.reservations[index] = action.payload.data!;
          }
          if (state.currentReservation?.id === action.payload.data?.id) {
            state.currentReservation = action.payload.data!;
          }
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Reservation
      .addCase(deleteReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = state.reservations.filter(
          (r) => r.id !== action.payload,
        );
        if (state.currentReservation?.id === action.payload) {
          state.currentReservation = null;
        }
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm Reservation
      .addCase(confirmReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.reservations.findIndex(
            (r) => r.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.reservations[index] = action.payload.data!;
          }
          if (state.currentReservation?.id === action.payload.data?.id) {
            state.currentReservation = action.payload.data!;
          }
        }
      })
      .addCase(confirmReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check In Guest
      .addCase(checkInGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInGuest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.reservations.findIndex(
            (r) => r.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.reservations[index] = action.payload.data!;
          }
          if (state.currentReservation?.id === action.payload.data?.id) {
            state.currentReservation = action.payload.data!;
          }
        }
      })
      .addCase(checkInGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check Out Guest
      .addCase(checkOutGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOutGuest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.reservations.findIndex(
            (r) => r.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.reservations[index] = action.payload.data!;
          }
          if (state.currentReservation?.id === action.payload.data?.id) {
            state.currentReservation = action.payload.data!;
          }
        }
      })
      .addCase(checkOutGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel Reservation
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.reservations.findIndex(
            (r) => r.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.reservations[index] = action.payload.data!;
          }
          if (state.currentReservation?.id === action.payload.data?.id) {
            state.currentReservation = action.payload.data!;
          }
        }
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Booking Types
      .addCase(fetchBookingTypes.pending, (state) => {
        state.bookingTypesLoading = true;
        state.bookingTypesError = null;
      })
      .addCase(fetchBookingTypes.fulfilled, (state, action) => {
        state.bookingTypesLoading = false;
        state.bookingTypes = action.payload.data || [];
      })
      .addCase(fetchBookingTypes.rejected, (state, action) => {
        state.bookingTypesLoading = false;
        state.bookingTypesError = action.payload as string;
      })
      // Fetch Booking Sources
      .addCase(fetchBookingSources.pending, (state) => {
        state.bookingSourcesLoading = true;
        state.bookingSourcesError = null;
      })
      .addCase(fetchBookingSources.fulfilled, (state, action) => {
        state.bookingSourcesLoading = false;
        state.bookingSources = action.payload.data || [];
      })
      .addCase(fetchBookingSources.rejected, (state, action) => {
        state.bookingSourcesLoading = false;
        state.bookingSourcesError = action.payload as string;
      })
      // Add Payment Details
      .addCase(addPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.reservations.findIndex(
            (r) => r.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.reservations[index] = action.payload.data!;
          }
          if (state.currentReservation?.id === action.payload.data?.id) {
            state.currentReservation = action.payload.data!;
          }
        }
      })
      .addCase(addPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentReservation,
  clearCurrentReservation,
  setLoading,
  setError,
  setPagination,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = reservationSlice.actions;

export default reservationSlice.reducer;
