import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nightAuditService } from '@/services/night-audit.service';
import type {
  NightAudit,
  NightAuditQueryParams,
  PropertySettings,
  RunNightAuditPayload,
  ApproveNightAuditPayload,
} from '@/types/night-audit.types';

interface NightAuditState {
  items: NightAudit[];
  current: NightAudit | null;
  settings: PropertySettings | null;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: NightAuditQueryParams;
}

const initialState: NightAuditState = {
  items: [],
  current: null,
  settings: null,
  loading: {},
  error: {},
  meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  filters: { page: 1, limit: 10, sortBy: 'businessDate', sortOrder: 'desc' },
};

export const fetchNightAudits = createAsyncThunk(
  'nightAudit/fetchNightAudits',
  async (params: NightAuditQueryParams | undefined, { rejectWithValue }) => {
    try {
      const response = await nightAuditService.list(params);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load night audits';
      return rejectWithValue(message);
    }
  },
);

export const fetchNightAuditById = createAsyncThunk(
  'nightAudit/fetchNightAuditById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await nightAuditService.getOne(id);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load night audit';
      return rejectWithValue(message);
    }
  },
);

export const fetchByBusinessDate = createAsyncThunk(
  'nightAudit/fetchByBusinessDate',
  async (
    args: { propertyId: string; businessDate: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await nightAuditService.getByDate(
        args.propertyId,
        args.businessDate,
      );
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load night audit';
      return rejectWithValue(message);
    }
  },
);

export const runNightAudit = createAsyncThunk(
  'nightAudit/runNightAudit',
  async (data: RunNightAuditPayload, { rejectWithValue }) => {
    try {
      const response = await nightAuditService.run(data);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to run night audit';
      return rejectWithValue(message);
    }
  },
);

export const approveNightAudit = createAsyncThunk(
  'nightAudit/approveNightAudit',
  async (
    args: { id: string; data: ApproveNightAuditPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await nightAuditService.approve(args.id, args.data);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to approve night audit';
      return rejectWithValue(message);
    }
  },
);

export const reopenNightAudit = createAsyncThunk(
  'nightAudit/reopenNightAudit',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await nightAuditService.reopen(id);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reopen night audit';
      return rejectWithValue(message);
    }
  },
);

export const deleteNightAudit = createAsyncThunk(
  'nightAudit/deleteNightAudit',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await nightAuditService.remove(id);
      return { id, response: response.data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete night audit';
      return rejectWithValue(message);
    }
  },
);

export const fetchSettings = createAsyncThunk(
  'nightAudit/fetchSettings',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const response = await nightAuditService.getSettings(propertyId);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load settings';
      return rejectWithValue(message);
    }
  },
);

export const updateSettings = createAsyncThunk(
  'nightAudit/updateSettings',
  async (
    args: { propertyId: string; data: Partial<PropertySettings> },
    { rejectWithValue },
  ) => {
    try {
      const response = await nightAuditService.updateSettings(
        args.propertyId,
        args.data,
      );
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      return rejectWithValue(message);
    }
  },
);

const nightAuditSlice = createSlice({
  name: 'nightAudit',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<NightAuditQueryParams>>) => {
      state.filters = { ...state.filters, ...action.payload } as NightAuditQueryParams;
    },
    setCurrent: (state, action: PayloadAction<NightAudit | null>) => {
      state.current = action.payload;
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>,
    ) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    setError: (
      state,
      action: PayloadAction<{ key: string; error: string | null }>,
    ) => {
      state.error[action.payload.key] = action.payload.error;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNightAudits.pending, (state) => {
        state.loading['list'] = true;
        state.error['list'] = null;
      })
      .addCase(fetchNightAudits.fulfilled, (state, action) => {
        state.loading['list'] = false;
        state.items = action.payload.data || [];
        if (action.payload.meta) {
          state.meta.page = action.payload.meta.page || 1;
          state.meta.limit = action.payload.meta.limit || 10;
          state.meta.total = action.payload.meta.total || 0;
          state.meta.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(fetchNightAudits.rejected, (state, action) => {
        state.loading['list'] = false;
        state.error['list'] = action.payload as string;
      })

      .addCase(fetchNightAuditById.pending, (state) => {
        state.loading['detail'] = true;
        state.error['detail'] = null;
      })
      .addCase(fetchNightAuditById.fulfilled, (state, action) => {
        state.loading['detail'] = false;
        state.current = action.payload.data || null;
      })
      .addCase(fetchNightAuditById.rejected, (state, action) => {
        state.loading['detail'] = false;
        state.error['detail'] = action.payload as string;
      })

      .addCase(fetchByBusinessDate.pending, (state) => {
        state.loading['byDate'] = true;
        state.error['byDate'] = null;
      })
      .addCase(fetchByBusinessDate.fulfilled, (state, action) => {
        state.loading['byDate'] = false;
        state.current = action.payload.data || null;
      })
      .addCase(fetchByBusinessDate.rejected, (state, action) => {
        state.loading['byDate'] = false;
        state.error['byDate'] = action.payload as string;
      })

      .addCase(runNightAudit.pending, (state) => {
        state.loading['run'] = true;
        state.error['run'] = null;
      })
      .addCase(runNightAudit.fulfilled, (state, action) => {
        state.loading['run'] = false;
        if (action.payload.data) {
          // Insert or update in list
          const idx = state.items.findIndex((a) => a.id === action.payload.data!.id);
          if (idx >= 0) state.items[idx] = action.payload.data!;
          else state.items.unshift(action.payload.data!);
          // set current to the newly run audit
          state.current = action.payload.data!;
        }
      })
      .addCase(runNightAudit.rejected, (state, action) => {
        state.loading['run'] = false;
        state.error['run'] = action.payload as string;
      })

      .addCase(approveNightAudit.pending, (state) => {
        state.loading['approve'] = true;
        state.error['approve'] = null;
      })
      .addCase(approveNightAudit.fulfilled, (state, action) => {
        state.loading['approve'] = false;
        if (action.payload.data) {
          const updated = action.payload.data;
          const idx = state.items.findIndex((a) => a.id === updated.id);
          if (idx >= 0) state.items[idx] = updated;
          if (state.current?.id === updated.id) state.current = updated;
        }
      })
      .addCase(approveNightAudit.rejected, (state, action) => {
        state.loading['approve'] = false;
        state.error['approve'] = action.payload as string;
      })

      .addCase(reopenNightAudit.pending, (state) => {
        state.loading['reopen'] = true;
        state.error['reopen'] = null;
      })
      .addCase(reopenNightAudit.fulfilled, (state, action) => {
        state.loading['reopen'] = false;
        if (action.payload.data) {
          const updated = action.payload.data;
          const idx = state.items.findIndex((a) => a.id === updated.id);
          if (idx >= 0) state.items[idx] = updated;
          if (state.current?.id === updated.id) state.current = updated;
        }
      })
      .addCase(reopenNightAudit.rejected, (state, action) => {
        state.loading['reopen'] = false;
        state.error['reopen'] = action.payload as string;
      })

      .addCase(deleteNightAudit.pending, (state) => {
        state.loading['delete'] = true;
        state.error['delete'] = null;
      })
      .addCase(deleteNightAudit.fulfilled, (state, action) => {
        state.loading['delete'] = false;
        state.items = state.items.filter((a) => a.id !== action.payload.id);
        if (state.current?.id === action.payload.id) state.current = null;
      })
      .addCase(deleteNightAudit.rejected, (state, action) => {
        state.loading['delete'] = false;
        state.error['delete'] = action.payload as string;
      })

      .addCase(fetchSettings.pending, (state) => {
        state.loading['settings'] = true;
        state.error['settings'] = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading['settings'] = false;
        state.settings = action.payload.data || null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading['settings'] = false;
        state.error['settings'] = action.payload as string;
      })

      .addCase(updateSettings.pending, (state) => {
        state.loading['updateSettings'] = true;
        state.error['updateSettings'] = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading['updateSettings'] = false;
        state.settings = action.payload.data || null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading['updateSettings'] = false;
        state.error['updateSettings'] = action.payload as string;
      });
  },
});

export const { setFilters, setCurrent, setLoading, setError } = nightAuditSlice.actions;
export default nightAuditSlice.reducer;


