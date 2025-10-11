import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { rateManagementService } from '@/services/rate-management.service';
import type {
  PricingRule,
  CreatePricingRuleData,
  UpdatePricingRuleData,
  PricingQuery,
} from '@/types';

interface RateManagementState {
  rules: PricingRule[];
  currentRule: PricingRule | null;
  calculation: null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchCache: Record<string, PricingRule[]>;
  lastSearchTerm: string;
  isSearching: boolean;
}

const initialState: RateManagementState = {
  rules: [],
  currentRule: null,
  calculation: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  searchCache: {},
  lastSearchTerm: '',
  isSearching: false,
};

export const fetchPricingRules = createAsyncThunk(
  'rateManagement/fetchPricingRules',
  async (params: PricingQuery = {}, { rejectWithValue }) => {
    try {
      const response = await rateManagementService.getRules(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch rules';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createPricingRule = createAsyncThunk(
  'rateManagement/createPricingRule',
  async (data: CreatePricingRuleData, { rejectWithValue }) => {
    try {
      const response = await rateManagementService.createRule(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create rule';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updatePricingRule = createAsyncThunk(
  'rateManagement/updatePricingRule',
  async (
    { id, data }: { id: string; data: UpdatePricingRuleData },
    { rejectWithValue },
  ) => {
    try {
      const response = await rateManagementService.updateRule(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update rule';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deletePricingRule = createAsyncThunk(
  'rateManagement/deletePricingRule',
  async (id: string, { rejectWithValue }) => {
    try {
      await rateManagementService.deleteRule(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete rule';
      return rejectWithValue(errorMessage);
    }
  },
);

// calculatePrice removed

const rateManagementSlice = createSlice({
  name: 'rateManagement',
  initialState,
  reducers: {
    setCurrentRule: (state, action: PayloadAction<PricingRule | null>) => {
      state.currentRule = action.payload;
    },
    // clearCalculation removed
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    updateSearchCache: (
      state,
      action: PayloadAction<{ term: string; results: PricingRule[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPricingRules.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchPricingRules.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        const apiData = action.payload?.data as
          | PricingRule[]
          | {
              items?: PricingRule[];
              meta?: {
                page?: number;
                limit?: number;
                total?: number;
                totalPages?: number;
              };
            }
          | undefined;

        const rawItems = Array.isArray(apiData) ? apiData : apiData?.items || [];
        const items = rawItems.filter((r: any) => !r?.deletedAt);
        state.rules = items as any;

        const searchTerm = (action.meta.arg.search as string) || '';
        if (searchTerm) {
          state.searchCache[searchTerm] = items;
          state.lastSearchTerm = searchTerm;
        }

        const meta =
          action.payload?.meta || (!Array.isArray(apiData) ? apiData?.meta : undefined);
        if (meta) {
          state.pagination.page = meta.page || 1;
          state.pagination.limit = meta.limit || 10;
          state.pagination.total = meta.total || 0;
          state.pagination.totalPages = meta.totalPages || 0;
        } else {
          state.pagination.page = 1;
          state.pagination.limit = items.length;
          state.pagination.total = items.length;
          state.pagination.totalPages = 1;
        }
      })
      .addCase(fetchPricingRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPricingRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPricingRule.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.rules.push(action.payload.data);
        }
      })
      .addCase(createPricingRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePricingRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePricingRule.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          const idx = state.rules.findIndex((r) => r.id === action.payload.data?.id);
          if (idx !== -1) state.rules[idx] = action.payload.data!;
          if (state.currentRule?.id === action.payload.data?.id) {
            state.currentRule = action.payload.data!;
          }
        }
      })
      .addCase(updatePricingRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePricingRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePricingRule.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = state.rules.filter((r) => r.id !== action.payload);
        if (state.currentRule?.id === action.payload) {
          state.currentRule = null;
        }
      })
      .addCase(deletePricingRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // calculatePrice handlers removed
  },
});

export const {
  setCurrentRule,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = rateManagementSlice.actions;

export default rateManagementSlice.reducer;



