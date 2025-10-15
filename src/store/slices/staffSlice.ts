import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { staffService } from '@/services/staff.service';
import type { Staff, CreateStaffData, UpdateStaffData, AssignRolesData, CreateUserData } from '@/types/staff.types';

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

export const createUser = createAsyncThunk(
  'staff/createUser',
  async (data: CreateUserData, { rejectWithValue }) => {
    try { const res = await staffService.createUser(data); return res.data; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to create user'); }
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

export const assignStaffRole = createAsyncThunk(
  'staff/assignRole',
  async ({ id, data }: { id: string; data: AssignRolesData }, { rejectWithValue }) => {
    try { const res = await staffService.assignRole(id, data); return res.data; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to assign role'); }
  },
);

export const removeStaffRole = createAsyncThunk(
  'staff/removeRole',
  async ({ id, roleId }: { id: string; roleId: string }, { rejectWithValue }) => {
    try { const res = await staffService.removeRole(id, roleId); return res.data; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to remove role'); }
  },
);

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async (id: string, { rejectWithValue }) => {
    try { const res = await staffService.delete(id); return { id, message: res.data.message }; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to delete staff'); }
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
      .addCase(createUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createUser.fulfilled, (state) => { state.loading = false; })
      .addCase(createUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createStaff.fulfilled, (state, action) => { if (action.payload.data) state.staff.unshift(action.payload.data); })
      .addCase(updateStaff.fulfilled, (state, action) => { if (action.payload.data) { const idx = state.staff.findIndex((s) => s.id === action.payload.data?.id); if (idx !== -1) state.staff[idx] = action.payload.data!; } })
      .addCase(assignStaffRole.fulfilled, (state, action) => { if (action.payload.data) { const idx = state.staff.findIndex((s) => s.id === action.payload.data?.id); if (idx !== -1) state.staff[idx] = action.payload.data!; } })
      .addCase(removeStaffRole.fulfilled, (state, action) => { if (action.payload.data) { const idx = state.staff.findIndex((s) => s.id === action.payload.data?.id); if (idx !== -1) state.staff[idx] = action.payload.data!; } })
      .addCase(deleteStaff.fulfilled, (state, action) => { state.staff = state.staff.filter((s) => s.id !== action.payload.id); });
  },
});

export default staffSlice.reducer;


