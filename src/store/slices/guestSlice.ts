import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { guestService } from '@/services/guest.service';
import {
  Guest,
  GuestDocument,
  CreateGuestData,
  UpdateGuestData,
  UpdateLoyaltyTierData,
  UploadDocumentData,
} from '@/types';

interface GuestState {
  guests: Guest[];
  currentGuest: Guest | null;
  guestDocuments: GuestDocument[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Search optimization
  searchCache: Record<string, Guest[]>;
  lastSearchTerm: string;
  isSearching: boolean;
}

const initialState: GuestState = {
  guests: [],
  currentGuest: null,
  guestDocuments: [],
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
};

// Async thunks
export const fetchGuests = createAsyncThunk(
  'guest/fetchGuests',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      loyaltyTier?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await guestService.getAll(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch guests';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createGuest = createAsyncThunk(
  'guest/createGuest',
  async (data: CreateGuestData, { rejectWithValue }) => {
    try {
      const response = await guestService.create(data);
      return response.data;
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
    { id, data }: { id: string; data: UpdateGuestData },
    { rejectWithValue },
  ) => {
    try {
      const response = await guestService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update guest';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteGuest = createAsyncThunk(
  'guest/deleteGuest',
  async (id: string, { rejectWithValue }) => {
    try {
      await guestService.delete(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete guest';
      return rejectWithValue(errorMessage);
    }
  },
);

export const searchGuests = createAsyncThunk(
  'guest/searchGuests',
  async (
    {
      query,
      params,
    }: { query: string; params?: { page?: number; limit?: number } },
    { rejectWithValue },
  ) => {
    try {
      const response = await guestService.search(query, params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search guests';
      return rejectWithValue(errorMessage);
    }
  },
);

export const getGuestByEmail = createAsyncThunk(
  'guest/getGuestByEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await guestService.getByEmail(email);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get guest by email';
      return rejectWithValue(errorMessage);
    }
  },
);

export const getGuestByPhone = createAsyncThunk(
  'guest/getGuestByPhone',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await guestService.getByPhone(phone);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get guest by phone';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateLoyaltyTier = createAsyncThunk(
  'guest/updateLoyaltyTier',
  async (
    { id, data }: { id: string; data: UpdateLoyaltyTierData },
    { rejectWithValue },
  ) => {
    try {
      const response = await guestService.updateLoyaltyTier(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update loyalty tier';
      return rejectWithValue(errorMessage);
    }
  },
);

export const uploadDocument = createAsyncThunk(
  'guest/uploadDocument',
  async (
    { id, data }: { id: string; data: UploadDocumentData },
    { rejectWithValue },
  ) => {
    try {
      const response = await guestService.uploadDocument(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload document';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchGuestDocuments = createAsyncThunk(
  'guest/fetchGuestDocuments',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await guestService.getDocuments(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch guest documents';
      return rejectWithValue(errorMessage);
    }
  },
);

const guestSlice = createSlice({
  name: 'guest',
  initialState,
  reducers: {
    setCurrentGuest: (state, action: PayloadAction<Guest>) => {
      state.currentGuest = action.payload;
    },
    clearCurrentGuest: (state) => {
      state.currentGuest = null;
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
      action: PayloadAction<{ term: string; results: Guest[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Guests
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        // Backend may return { success, data: Guest[] } or { success, data: { guests: Guest[], total, page, limit } }
        const payloadData = action.payload?.data as unknown;
        let items: Guest[] = [];
        let page: number | undefined;
        let limit: number | undefined;
        let total: number | undefined;
        let totalPages: number | undefined;

        if (Array.isArray(payloadData)) {
          items = payloadData as Guest[];
        } else if (payloadData && typeof payloadData === 'object') {
          const dataObj = payloadData as {
            guests?: Guest[];
            items?: Guest[];
            data?: Guest[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
          };
          items = (dataObj.guests ||
            dataObj.items ||
            dataObj.data ||
            []) as Guest[];
          page = dataObj.page;
          limit = dataObj.limit;
          total = dataObj.total;
          totalPages = dataObj.totalPages;
        }

        state.guests = items;

        // Cache search results for future use
        const searchTerm = action.meta.arg.search || '';
        if (searchTerm) {
          state.searchCache[searchTerm] = items;
          state.lastSearchTerm = searchTerm;
        }

        const metaFromTop = action.payload?.meta;
        state.pagination.page = metaFromTop?.page ?? page ?? 1;
        state.pagination.limit = metaFromTop?.limit ?? limit ?? 10;
        state.pagination.total = metaFromTop?.total ?? total ?? items.length;
        state.pagination.totalPages =
          metaFromTop?.totalPages ??
          totalPages ??
          Math.ceil(
            (state.pagination.total || 0) / (state.pagination.limit || 10),
          );
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Create Guest
      .addCase(createGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.guests.push(action.payload.data);
        }
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Guest
      .addCase(updateGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGuest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.guests.findIndex(
            (g) => g.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.guests[index] = action.payload.data!;
          }
          if (state.currentGuest?.id === action.payload.data?.id) {
            state.currentGuest = action.payload.data!;
          }
        }
      })
      .addCase(updateGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Guest
      .addCase(deleteGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = state.guests.filter((g) => g.id !== action.payload);
        if (state.currentGuest?.id === action.payload) {
          state.currentGuest = null;
        }
      })
      .addCase(deleteGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Guests
      .addCase(searchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(searchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Guest by Email
      .addCase(getGuestByEmail.fulfilled, (state, action) => {
        state.currentGuest = action.payload.data || null;
      })
      // Get Guest by Phone
      .addCase(getGuestByPhone.fulfilled, (state, action) => {
        state.currentGuest = action.payload.data || null;
      })
      // Update Loyalty Tier
      .addCase(updateLoyaltyTier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLoyaltyTier.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.guests.findIndex(
            (g) => g.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.guests[index] = action.payload.data!;
          }
          if (state.currentGuest?.id === action.payload.data?.id) {
            state.currentGuest = action.payload.data!;
          }
        }
      })
      .addCase(updateLoyaltyTier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.guestDocuments.push(action.payload.data);
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Guest Documents
      .addCase(fetchGuestDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuestDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.guestDocuments = action.payload.data || [];
      })
      .addCase(fetchGuestDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentGuest,
  clearCurrentGuest,
  setLoading,
  setError,
  setPagination,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = guestSlice.actions;

export default guestSlice.reducer;
