import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  bookingSourceService,
  BookingSource,
  CreateBookingSourceData,
  UpdateBookingSourceData,
} from '@/services/booking.service';

interface BookingSourceState {
  bookingSources: BookingSource[];
  currentBookingSource: BookingSource | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BookingSourceState = {
  bookingSources: [],
  currentBookingSource: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchBookingSources = createAsyncThunk(
  'bookingSource/fetchBookingSources',
  async (
    params: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      bookingTypeId?: string;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await bookingSourceService.getAll(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch booking sources';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchBookingSource = createAsyncThunk(
  'bookingSource/fetchBookingSource',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingSourceService.getById(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch booking source';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createBookingSource = createAsyncThunk(
  'bookingSource/createBookingSource',
  async (data: CreateBookingSourceData, { rejectWithValue }) => {
    try {
      const response = await bookingSourceService.create(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create booking source';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBookingSource = createAsyncThunk(
  'bookingSource/updateBookingSource',
  async (
    { id, data }: { id: string; data: UpdateBookingSourceData },
    { rejectWithValue },
  ) => {
    try {
      const response = await bookingSourceService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update booking source';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteBookingSource = createAsyncThunk(
  'bookingSource/deleteBookingSource',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingSourceService.delete(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete booking source';
      return rejectWithValue(errorMessage);
    }
  },
);

export const toggleBookingSourceStatus = createAsyncThunk(
  'bookingSource/toggleBookingSourceStatus',
  async (
    { id, activate }: { id: string; activate: boolean },
    { rejectWithValue },
  ) => {
    try {
      const response = activate
        ? await bookingSourceService.activate(id)
        : await bookingSourceService.deactivate(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to toggle booking source status';
      return rejectWithValue(errorMessage);
    }
  },
);

export const calculateCommission = createAsyncThunk(
  'bookingSource/calculateCommission',
  async (
    data: { amount: number; commissionRate: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await bookingSourceService.calculateCommission(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to calculate commission';
      return rejectWithValue(errorMessage);
    }
  },
);

// Slice
const bookingSourceSlice = createSlice({
  name: 'bookingSource',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBookingSource: (
      state,
      action: PayloadAction<BookingSource | null>,
    ) => {
      state.currentBookingSource = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all booking sources
      .addCase(fetchBookingSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingSources.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingSources = action.payload.data || [];
        state.pagination = {
          page: action.payload.meta?.page ?? 1,
          limit: action.payload.meta?.limit ?? 10,
          total: action.payload.meta?.total ?? 0,
          totalPages: action.payload.meta?.totalPages ?? 0,
        };
      })
      .addCase(fetchBookingSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single booking source
      .addCase(fetchBookingSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingSource.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBookingSource = action.payload.data ?? null;
      })
      .addCase(fetchBookingSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create booking source
      .addCase(createBookingSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBookingSource.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.bookingSources.unshift(action.payload.data);
        }
      })
      .addCase(createBookingSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update booking source
      .addCase(updateBookingSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingSource.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.bookingSources.findIndex(
            (bs) => bs.id === action.payload.data!.id,
          );
          if (index !== -1) {
            state.bookingSources[index] = action.payload.data;
          }
        }
      })
      .addCase(updateBookingSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete booking source
      .addCase(deleteBookingSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBookingSource.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.bookingSources = state.bookingSources.filter(
            (bs) => bs.id !== action.payload.data!.id,
          );
        }
      })
      .addCase(deleteBookingSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle status
      .addCase(toggleBookingSourceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBookingSourceStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.bookingSources.findIndex(
            (bs) => bs.id === action.payload.data!.id,
          );
          if (index !== -1) {
            state.bookingSources[index] = action.payload.data;
          }
        }
      })
      .addCase(toggleBookingSourceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentBookingSource } =
  bookingSourceSlice.actions;
export default bookingSourceSlice.reducer;
