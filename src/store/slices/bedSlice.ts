import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bedService } from '@/services/room.service';
import {
  Bed,
  CreateBedData,
  UpdateBedData,
  UpdateBedStatusData,
} from '@/types';

interface BedState {
  beds: Bed[];
  currentBed: Bed | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Search optimization
  searchCache: Record<string, Bed[]>;
  lastSearchTerm: string;
  isSearching: boolean;
  // Period-based availability
  availableBeds: Bed[];
  availableBedsLoading: boolean;
  availableBedsError: string | null;
}

const initialState: BedState = {
  beds: [],
  currentBed: null,
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
  // Period-based availability
  availableBeds: [],
  availableBedsLoading: false,
  availableBedsError: null,
};

// Async thunks
export const fetchBeds = createAsyncThunk(
  'bed/fetchBeds',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      dormitoryId?: string;
      status?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await bedService.getAll(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch beds';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createBed = createAsyncThunk(
  'bed/createBed',
  async (data: CreateBedData, { rejectWithValue }) => {
    try {
      const response = await bedService.create(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create bed';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBed = createAsyncThunk(
  'bed/updateBed',
  async (
    { id, data }: { id: string; data: UpdateBedData },
    { rejectWithValue },
  ) => {
    try {
      const response = await bedService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update bed';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBedStatus = createAsyncThunk(
  'bed/updateBedStatus',
  async (
    { id, data }: { id: string; data: UpdateBedStatusData },
    { rejectWithValue },
  ) => {
    try {
      const response = await bedService.updateStatus(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update bed status';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteBed = createAsyncThunk(
  'bed/deleteBed',
  async (id: string, { rejectWithValue }) => {
    try {
      await bedService.delete(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete bed';
      return rejectWithValue(errorMessage);
    }
  },
);

export const searchBeds = createAsyncThunk(
  'bed/searchBeds',
  async (
    {
      query,
      params,
    }: { query: string; params?: { page?: number; limit?: number } },
    { rejectWithValue },
  ) => {
    try {
      const response = await bedService.search(query, params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search beds';
      return rejectWithValue(errorMessage);
    }
  },
);

// Fetch available beds for a specific period
export const fetchAvailableBeds = createAsyncThunk(
  'bed/fetchAvailableBeds',
  async (
    params: {
      propertyId: string;
      checkIn: string;
      checkOut: string;
      dormitoryId: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await bedService.getAvailable(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch available beds';
      return rejectWithValue(errorMessage);
    }
  },
);

const bedSlice = createSlice({
  name: 'bed',
  initialState,
  reducers: {
    setCurrentBed: (state, action: PayloadAction<Bed>) => {
      state.currentBed = action.payload;
    },
    clearCurrentBed: (state) => {
      state.currentBed = null;
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
      action: PayloadAction<{ term: string; results: Bed[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Beds
      .addCase(fetchBeds.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchBeds.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        // Backend may return { success, data: Bed[] } or { success, data: { beds: Bed[], total, page, limit } }
        const payloadData = action.payload?.data as unknown;
        let items: Bed[] = [];
        let page: number | undefined;
        let limit: number | undefined;
        let total: number | undefined;
        let totalPages: number | undefined;

        if (Array.isArray(payloadData)) {
          items = payloadData as Bed[];
        } else if (payloadData && typeof payloadData === 'object') {
          const dataObj = payloadData as {
            beds?: Bed[];
            items?: Bed[];
            data?: Bed[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
          };
          items = (dataObj.beds ||
            dataObj.items ||
            dataObj.data ||
            []) as Bed[];
          page = dataObj.page;
          limit = dataObj.limit;
          total = dataObj.total;
          totalPages = dataObj.totalPages;
        }

        state.beds = items;

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
      .addCase(fetchBeds.rejected, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Create Bed
      .addCase(createBed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBed.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.beds.push(action.payload.data);
        }
      })
      .addCase(createBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Bed
      .addCase(updateBed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBed.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.beds.findIndex(
            (b) => b.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.beds[index] = action.payload.data!;
          }
          if (state.currentBed?.id === action.payload.data?.id) {
            state.currentBed = action.payload.data!;
          }
        }
      })
      .addCase(updateBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Bed Status
      .addCase(updateBedStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBedStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.beds.findIndex(
            (b) => b.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.beds[index] = action.payload.data!;
          }
          if (state.currentBed?.id === action.payload.data?.id) {
            state.currentBed = action.payload.data!;
          }
        }
      })
      .addCase(updateBedStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Bed
      .addCase(deleteBed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBed.fulfilled, (state, action) => {
        state.loading = false;
        state.beds = state.beds.filter((b) => b.id !== action.payload);
        if (state.currentBed?.id === action.payload) {
          state.currentBed = null;
        }
      })
      .addCase(deleteBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Beds
      .addCase(searchBeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBeds.fulfilled, (state, action) => {
        state.loading = false;
        state.beds = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(searchBeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Available Beds (period-based)
      .addCase(fetchAvailableBeds.pending, (state) => {
        state.availableBedsLoading = true;
        state.availableBedsError = null;
      })
      .addCase(fetchAvailableBeds.fulfilled, (state, action) => {
        state.availableBedsLoading = false;
        // Extract data from response (can be direct array or nested in data property)
        const payloadData = action.payload?.data || action.payload;
        state.availableBeds = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchAvailableBeds.rejected, (state, action) => {
        state.availableBedsLoading = false;
        state.availableBedsError = action.payload as string;
      });
  },
});

export const {
  setCurrentBed,
  clearCurrentBed,
  setLoading,
  setError,
  setPagination,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = bedSlice.actions;

export default bedSlice.reducer;
