import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  bookingTypeService,
  BookingType,
  CreateBookingTypeData,
  UpdateBookingTypeData,
} from '@/services/booking.service';

interface BookingTypeState {
  bookingTypes: BookingType[];
  currentBookingType: BookingType | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BookingTypeState = {
  bookingTypes: [],
  currentBookingType: null,
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
export const fetchBookingTypes = createAsyncThunk(
  'bookingType/fetchBookingTypes',
  async (
    params: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await bookingTypeService.getAll(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch booking types';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchBookingType = createAsyncThunk(
  'bookingType/fetchBookingType',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingTypeService.getById(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch booking type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createBookingType = createAsyncThunk(
  'bookingType/createBookingType',
  async (data: CreateBookingTypeData, { rejectWithValue }) => {
    try {
      const response = await bookingTypeService.create(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create booking type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBookingType = createAsyncThunk(
  'bookingType/updateBookingType',
  async (
    { id, data }: { id: string; data: UpdateBookingTypeData },
    { rejectWithValue },
  ) => {
    try {
      const response = await bookingTypeService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update booking type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteBookingType = createAsyncThunk(
  'bookingType/deleteBookingType',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingTypeService.delete(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete booking type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const toggleBookingTypeStatus = createAsyncThunk(
  'bookingType/toggleBookingTypeStatus',
  async (
    { id, activate }: { id: string; activate: boolean },
    { rejectWithValue },
  ) => {
    try {
      const response = activate
        ? await bookingTypeService.activate(id)
        : await bookingTypeService.deactivate(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to toggle booking type status';
      return rejectWithValue(errorMessage);
    }
  },
);

// Slice
const bookingTypeSlice = createSlice({
  name: 'bookingType',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBookingType: (
      state,
      action: PayloadAction<BookingType | null>,
    ) => {
      state.currentBookingType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all booking types
      .addCase(fetchBookingTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingTypes = action.payload.data || [];
        state.pagination = {
          page: action.payload.meta?.page ?? 1,
          limit: action.payload.meta?.limit ?? 10,
          total: action.payload.meta?.total ?? 0,
          totalPages: action.payload.meta?.totalPages ?? 0,
        };
      })
      .addCase(fetchBookingTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single booking type
      .addCase(fetchBookingType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingType.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBookingType = action.payload.data ?? null;
      })
      .addCase(fetchBookingType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create booking type
      .addCase(createBookingType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBookingType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.bookingTypes.unshift(action.payload.data);
        }
      })
      .addCase(createBookingType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update booking type
      .addCase(updateBookingType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.bookingTypes.findIndex(
            (bt) => bt.id === action.payload.data!.id,
          );
          if (index !== -1) {
            state.bookingTypes[index] = action.payload.data;
          }
        }
      })
      .addCase(updateBookingType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete booking type
      .addCase(deleteBookingType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBookingType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.bookingTypes = state.bookingTypes.filter(
            (bt) => bt.id !== action.payload.data!.id,
          );
        }
      })
      .addCase(deleteBookingType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle status
      .addCase(toggleBookingTypeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBookingTypeStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.bookingTypes.findIndex(
            (bt) => bt.id === action.payload.data!.id,
          );
          if (index !== -1) {
            state.bookingTypes[index] = action.payload.data;
          }
        }
      })
      .addCase(toggleBookingTypeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentBookingType } = bookingTypeSlice.actions;
export default bookingTypeSlice.reducer;
