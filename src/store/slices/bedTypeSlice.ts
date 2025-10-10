import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bedTypeService } from '@/services/bed-type.service';
import { BedType, CreateBedTypeData, UpdateBedTypeData } from '@/types';

interface BedTypeState {
  bedTypes: BedType[];
  currentBedType: BedType | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Search optimization
  searchCache: Record<string, BedType[]>;
  lastSearchTerm: string;
  isSearching: boolean;
}

const initialState: BedTypeState = {
  bedTypes: [],
  currentBedType: null,
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
export const fetchBedTypes = createAsyncThunk(
  'bedType/fetchBedTypes',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await bedTypeService.getAll(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch bed types';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createBedType = createAsyncThunk(
  'bedType/createBedType',
  async (data: CreateBedTypeData, { rejectWithValue }) => {
    try {
      const response = await bedTypeService.create(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create bed type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateBedType = createAsyncThunk(
  'bedType/updateBedType',
  async (
    { id, data }: { id: string; data: UpdateBedTypeData },
    { rejectWithValue },
  ) => {
    try {
      const response = await bedTypeService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update bed type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteBedType = createAsyncThunk(
  'bedType/deleteBedType',
  async (id: string, { rejectWithValue }) => {
    try {
      await bedTypeService.delete(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete bed type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const searchBedTypes = createAsyncThunk(
  'bedType/searchBedTypes',
  async (
    {
      query,
      params,
    }: { query: string; params?: { page?: number; limit?: number } },
    { rejectWithValue },
  ) => {
    try {
      const response = await bedTypeService.search(query, params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search bed types';
      return rejectWithValue(errorMessage);
    }
  },
);

const bedTypeSlice = createSlice({
  name: 'bedType',
  initialState,
  reducers: {
    setCurrentBedType: (state, action: PayloadAction<BedType>) => {
      state.currentBedType = action.payload;
    },
    clearCurrentBedType: (state) => {
      state.currentBedType = null;
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
      action: PayloadAction<{ term: string; results: BedType[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bed Types
      .addCase(fetchBedTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchBedTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        // Backend may return { success, data: BedType[] } or { success, data: { bedTypes: BedType[], total, page, limit } }
        const payloadData = action.payload?.data as unknown;
        let items: BedType[] = [];
        let page: number | undefined;
        let limit: number | undefined;
        let total: number | undefined;
        let totalPages: number | undefined;

        if (Array.isArray(payloadData)) {
          items = payloadData as BedType[];
        } else if (payloadData && typeof payloadData === 'object') {
          const dataObj = payloadData as {
            bedTypes?: BedType[];
            items?: BedType[];
            data?: BedType[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
          };
          items = (dataObj.bedTypes ||
            dataObj.items ||
            dataObj.data ||
            []) as BedType[];
          page = dataObj.page;
          limit = dataObj.limit;
          total = dataObj.total;
          totalPages = dataObj.totalPages;
        }

        state.bedTypes = items;

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
      .addCase(fetchBedTypes.rejected, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Create Bed Type
      .addCase(createBedType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBedType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.bedTypes.push(action.payload.data);
        }
      })
      .addCase(createBedType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Bed Type
      .addCase(updateBedType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBedType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.bedTypes.findIndex(
            (bt) => bt.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.bedTypes[index] = action.payload.data!;
          }
          if (state.currentBedType?.id === action.payload.data?.id) {
            state.currentBedType = action.payload.data!;
          }
        }
      })
      .addCase(updateBedType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Bed Type
      .addCase(deleteBedType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBedType.fulfilled, (state, action) => {
        state.loading = false;
        state.bedTypes = state.bedTypes.filter(
          (bt) => bt.id !== action.payload,
        );
        if (state.currentBedType?.id === action.payload) {
          state.currentBedType = null;
        }
      })
      .addCase(deleteBedType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Bed Types
      .addCase(searchBedTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBedTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.bedTypes = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(searchBedTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentBedType,
  clearCurrentBedType,
  setLoading,
  setError,
  setPagination,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = bedTypeSlice.actions;

export default bedTypeSlice.reducer;
