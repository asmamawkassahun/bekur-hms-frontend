import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReservationStatus, DateRangeFilter } from '@/types';

interface Reservation {
  id: string;
  guestId: string;
  guestName: string;
  roomId?: string;
  roomNumber?: string;
  bedId?: string;
  bedNumber?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  totalAmount: number;
  paidAmount: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReservationFilters {
  status?: ReservationStatus;
  dateRange?: DateRangeFilter;
  guestName?: string;
  roomNumber?: string;
}

interface ReservationState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  filters: ReservationFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  currentReservation: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
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
      // This would be replaced with actual API call
      // const response = await reservationService.getAll(params);
      // return response.data;

      // Mock data for now
      const mockReservations: Reservation[] = [
        {
          id: '1',
          guestId: '1',
          guestName: 'John Doe',
          roomId: '1',
          roomNumber: '101',
          checkIn: '2024-01-15',
          checkOut: '2024-01-17',
          adults: 2,
          children: 0,
          status: 'CONFIRMED',
          totalAmount: 200,
          paidAmount: 100,
          specialRequests: 'Late check-in requested',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
        },
        {
          id: '2',
          guestId: '2',
          guestName: 'Jane Smith',
          roomId: '2',
          roomNumber: '102',
          checkIn: '2024-01-16',
          checkOut: '2024-01-18',
          adults: 1,
          children: 1,
          status: 'CHECKED_IN',
          totalAmount: 150,
          paidAmount: 150,
          createdAt: '2024-01-11T10:00:00Z',
          updatedAt: '2024-01-11T10:00:00Z',
        },
      ];

      return {
        data: mockReservations,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: mockReservations.length,
          totalPages: Math.ceil(mockReservations.length / (params.limit || 10)),
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch reservations';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createReservation = createAsyncThunk(
  'reservation/createReservation',
  async (reservationData: Partial<Reservation>, { rejectWithValue }) => {
    try {
      // This would be replaced with actual API call
      // const response = await reservationService.create(reservationData);
      // return response.data;

      // Mock response
      const newReservation: Reservation = {
        id: Date.now().toString(),
        ...reservationData,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Reservation;

      return newReservation;
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
    { id, data }: { id: string; data: Partial<Reservation> },
    { rejectWithValue },
  ) => {
    try {
      // This would be replaced with actual API call
      // const response = await reservationService.update(id, data);
      // return response.data;

      // Mock response
      const updatedReservation: Reservation = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
      } as Reservation;

      return updatedReservation;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update reservation';
      return rejectWithValue(errorMessage);
    }
  },
);

export const checkInReservation = createAsyncThunk(
  'reservation/checkIn',
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with actual API call
      // const response = await reservationService.checkIn(id);
      // return response.data;

      // Mock response
      return { id, status: 'CHECKED_IN' as ReservationStatus };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to check in reservation';
      return rejectWithValue(errorMessage);
    }
  },
);

export const checkOutReservation = createAsyncThunk(
  'reservation/checkOut',
  async (id: string, { rejectWithValue }) => {
    try {
      // This would be replaced with actual API call
      // const response = await reservationService.checkOut(id);
      // return response.data;

      // Mock response
      return { id, status: 'CHECKED_OUT' as ReservationStatus };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to check out reservation';
      return rejectWithValue(errorMessage);
    }
  },
);

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFilters: (state, action: PayloadAction<ReservationFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentReservation: (
      state,
      action: PayloadAction<Reservation | null>,
    ) => {
      state.currentReservation = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<{ page: number; limit: number }>,
    ) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.unshift(action.payload);
        state.error = null;
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update reservation
      .addCase(updateReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
        if (state.currentReservation?.id === action.payload.id) {
          state.currentReservation = action.payload;
        }
      })

      // Check in
      .addCase(checkInReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (index !== -1) {
          state.reservations[index].status = action.payload.status;
        }
        if (state.currentReservation?.id === action.payload.id) {
          state.currentReservation.status = action.payload.status;
        }
      })

      // Check out
      .addCase(checkOutReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(
          (r) => r.id === action.payload.id,
        );
        if (index !== -1) {
          state.reservations[index].status = action.payload.status;
        }
        if (state.currentReservation?.id === action.payload.id) {
          state.currentReservation.status = action.payload.status;
        }
      });
  },
});

export const {
  clearError,
  setLoading,
  setFilters,
  clearFilters,
  setCurrentReservation,
  setPagination,
} = reservationSlice.actions;
export default reservationSlice.reducer;
