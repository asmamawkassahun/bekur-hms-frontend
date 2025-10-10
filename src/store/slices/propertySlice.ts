import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { propertyService } from '@/services/property.service';
import {
  Property,
  PropertyStats,
  CreatePropertyData,
  UpdatePropertyData,
} from '@/types';

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  propertyStats: PropertyStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Search optimization
  searchCache: Record<string, Property[]>;
  lastSearchTerm: string;
  isSearching: boolean;
}

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  propertyStats: null,
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
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (
    params: { page?: number; limit?: number; search?: string } = {},
    { rejectWithValue },
  ) => {
    try {
      console.log('📦 fetchProperties params:', params);
      const response = await propertyService.getAll(params);
      console.log('📦 fetchProperties response.data:', response.data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch properties';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (data: CreatePropertyData, { rejectWithValue }) => {
    try {
      console.log('🏗️ createProperty request payload:', data);
      const response = await propertyService.create(data);
      console.log('🏗️ Here is the createProperty response: ', response);
      console.log('🏗️ createProperty response.data:', response.data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create property';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async (
    { id, data }: { id: string; data: UpdatePropertyData },
    { rejectWithValue },
  ) => {
    try {
      const response = await propertyService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update property';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id: string, { rejectWithValue }) => {
    try {
      await propertyService.delete(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete property';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchPropertyStats = createAsyncThunk(
  'property/fetchPropertyStats',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await propertyService.getStats(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch property stats';
      return rejectWithValue(errorMessage);
    }
  },
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setCurrentProperty: (state, action: PayloadAction<Property>) => {
      state.currentProperty = action.payload;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
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
      action: PayloadAction<{ term: string; results: Property[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        console.log('📦 fetchProperties.fulfilled payload:', action.payload);
        const apiData = action.payload?.data as
          | Property[]
          | {
              items?: Property[];
              meta?: {
                page?: number;
                limit?: number;
                total?: number;
                totalPages?: number;
              };
            }
          | undefined;

        const items = Array.isArray(apiData) ? apiData : apiData?.items || [];

        // Update properties
        state.properties = items;

        // Cache search results for future use
        const searchTerm = action.meta.arg.search || '';
        if (searchTerm) {
          state.searchCache[searchTerm] = items;
          state.lastSearchTerm = searchTerm;
        }

        const meta =
          action.payload?.meta ||
          (!Array.isArray(apiData) ? apiData?.meta : undefined);
        console.log('📦 Parsed items length:', items.length, 'meta:', meta);
        if (meta) {
          state.pagination.page = meta.page || 1;
          state.pagination.limit = meta.limit || 10;
          state.pagination.total = meta.total || 0;
          state.pagination.totalPages = meta.totalPages || 0;
        } else {
          // Fallback defaults when meta is missing
          state.pagination.page = 1;
          state.pagination.limit = items.length;
          state.pagination.total = items.length;
          state.pagination.totalPages = 1;
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Property
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        console.log('🏗️ createProperty.fulfilled payload:', action.payload);
        if (action.payload.data) {
          state.properties.push(action.payload.data);
        }
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.properties.findIndex(
            (p) => p.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.properties[index] = action.payload.data!;
          }
          if (state.currentProperty?.id === action.payload.data?.id) {
            state.currentProperty = action.payload.data!;
          }
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = state.properties.filter(
          (p) => p.id !== action.payload,
        );
        if (state.currentProperty?.id === action.payload) {
          state.currentProperty = null;
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Property Stats
      .addCase(fetchPropertyStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyStats = action.payload.data || null;
      })
      .addCase(fetchPropertyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentProperty,
  clearCurrentProperty,
  setLoading,
  setError,
  setPagination,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = propertySlice.actions;

export default propertySlice.reducer;
