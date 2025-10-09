import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { staffService } from '@/services/staff.service';
import type { Staff, CreateStaffData, UpdateStaffData, AssignRolesData } from '@/types/staff.types';

interface StaffState {
  staff: Staff[];
  current: Staff | null;
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const initialState: StaffState = {
  staff: [], current: null, loading: false, error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

export const fetchStaff = createAsyncThunk(
  'staff/fetchStaff',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try { const res = await staffService.getAll(params); return res.data; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch staff'); }
  },
);

export const createStaff = createAsyncThunk(
  'staff/createStaff',
  async (data: CreateStaffData, { rejectWithValue }) => {
    try { const res = await staffService.create(data); return res.data; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to create staff'); }
  },
);

export const updateStaff = createAsyncThunk(
  'staff/updateStaff',
  async ({ id, data }: { id: string; data: UpdateStaffData }, { rejectWithValue }) => {
    try { const res = await staffService.update(id, data); return res.data; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to update staff'); }
  },
);

export const assignStaffRoles = createAsyncThunk(
  'staff/assignRoles',
  async ({ id, data }: { id: string; data: AssignRolesData }, { rejectWithValue }) => {
    try { const res = await staffService.assignRoles(id, data); return res.data; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to assign roles'); }
  },
);

const staffSlice = createSlice({
  name: 'staff', initialState, reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false; state.staff = action.payload.data || [];
        if (action.payload.meta) { state.pagination = { page: action.payload.meta.page || 1, limit: action.payload.meta.limit || 10, total: action.payload.meta.total || 0, totalPages: action.payload.meta.totalPages || 0 }; }
      })
      .addCase(fetchStaff.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createStaff.fulfilled, (state, action) => { if (action.payload.data) state.staff.unshift(action.payload.data); })
      .addCase(updateStaff.fulfilled, (state, action) => { if (action.payload.data) { const idx = state.staff.findIndex((s) => s.id === action.payload.data?.id); if (idx !== -1) state.staff[idx] = action.payload.data!; } })
      .addCase(assignStaffRoles.fulfilled, (state, action) => { if (action.payload.data) { const idx = state.staff.findIndex((s) => s.id === action.payload.data?.id); if (idx !== -1) state.staff[idx] = action.payload.data!; } });
  },
});

export default staffSlice.reducer;


