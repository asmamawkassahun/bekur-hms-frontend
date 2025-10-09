import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsService } from '@/services/settings.service';
import type { Settings, UpdateSettingsData } from '@/types/settings.types';

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = { settings: null, loading: false, error: null };

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try { const res = await settingsService.get(); return res.data; }
  catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to load settings'); }
});

export const updateSettings = createAsyncThunk('settings/update', async (data: UpdateSettingsData, { rejectWithValue }) => {
  try { const res = await settingsService.update(data); return res.data; }
  catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to save settings'); }
});

const settingsSlice = createSlice({
  name: 'settings', initialState, reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSettings.fulfilled, (state, action) => { state.loading = false; state.settings = action.payload.data || null; })
      .addCase(fetchSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateSettings.fulfilled, (state, action) => { state.settings = action.payload.data || state.settings; })
      .addCase(updateSettings.rejected, (state, action) => { state.error = action.payload as string; });
  },
});

export default settingsSlice.reducer;


