import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
  idType?: 'PASSPORT' | 'ID_CARD' | 'DRIVER_LICENSE';
  idNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GuestFilters {
  search?: string;
  nationality?: string;
  isActive?: boolean;
}

interface GuestState {
  guests: Guest[];
  currentGuest: Guest | null;
  filters: GuestFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: GuestState = {
  guests: [],
  currentGuest: null,
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
export const fetchGuests = createAsyncThunk(
  'guest/fetchGuests',
  async (
    params: { page?: number; limit?: number; filters?: GuestFilters } = {},
    { rejectWithValue },
  ) => {
    try {
      // This would be replaced with actual API call
      // const response = await guestService.getAll(params);
      // return response.data;

      // Mock data for now
      const mockGuests: Guest[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          dateOfBirth: '1990-01-15',
          nationality: 'US',
          idType: 'PASSPORT',
          idNumber: 'A1234567',
          address: '123 Main St',
          city: 'New York',
          country: 'USA',
          isActive: true,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-0124',
          dateOfBirth: '1985-05-20',
          nationality: 'CA',
          idType: 'ID_CARD',
          idNumber: 'B7654321',
          address: '456 Oak Ave',
          city: 'Toronto',
          country: 'Canada',
          isActive: true,
          createdAt: '2024-01-11T10:00:00Z',
          updatedAt: '2024-01-11T10:00:00Z',
        },
      ];

      return {
        data: mockGuests,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: mockGuests.length,
          totalPages: Math.ceil(mockGuests.length / (params.limit || 10)),
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch guests';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createGuest = createAsyncThunk(
  'guest/createGuest',
  async (guestData: Partial<Guest>, { rejectWithValue }) => {
    try {
      // This would be replaced with actual API call
      // const response = await guestService.create(guestData);
      // return response.data;

      // Mock response
      const newGuest: Guest = {
        id: Date.now().toString(),
        firstName: guestData.firstName || '',
        lastName: guestData.lastName || '',
        email: guestData.email || '',
        phone: guestData.phone || '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...guestData,
      } as Guest;

      return newGuest;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create guest';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateGuest = createAsyncThunk(
  'guest/updateGuest',
  async (
    { id, data }: { id: string; data: Partial<Guest> },
    { rejectWithValue },
  ) => {
    try {
      // This would be replaced with actual API call
      // const response = await guestService.update(id, data);
      // return response.data;

      // Mock response
      const updatedGuest: Guest = {
        id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        isActive: data.isActive ?? true,
        updatedAt: new Date().toISOString(),
        ...data,
      } as Guest;

      return updatedGuest;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update guest';
      return rejectWithValue(errorMessage);
    }
  },
);

export const searchGuests = createAsyncThunk(
  'guest/searchGuests',
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      // This would be replaced with actual API call
      // const response = await guestService.search(searchTerm);
      // return response.data;

      // Mock search - in real app this would be server-side
      const mockGuests: Guest[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          isActive: true,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
        },
      ];

      return mockGuests.filter(
        (guest) =>
          guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search guests';
      return rejectWithValue(errorMessage);
    }
  },
);

const guestSlice = createSlice({
  name: 'guest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFilters: (state, action: PayloadAction<GuestFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentGuest: (state, action: PayloadAction<Guest | null>) => {
      state.currentGuest = action.payload;
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
      // Fetch guests
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create guest
      .addCase(createGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.guests.unshift(action.payload);
        state.error = null;
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update guest
      .addCase(updateGuest.fulfilled, (state, action) => {
        const index = state.guests.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.guests[index] = action.payload;
        }
        if (state.currentGuest?.id === action.payload.id) {
          state.currentGuest = action.payload;
        }
      })

      // Search guests
      .addCase(searchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = action.payload;
        state.error = null;
      })
      .addCase(searchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setLoading,
  setFilters,
  clearFilters,
  setCurrentGuest,
  setPagination,
} = guestSlice.actions;
export default guestSlice.reducer;
