import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/types';

interface UIState {
  sidebarOpen: boolean;
  notifications: Notification[];
  modals: Record<string, boolean>;
  theme: {
    mode: 'light' | 'dark';
    primaryColor: string;
  };
  loading: Record<string, boolean>;
}

const initialState: UIState = {
  sidebarOpen: true,
  notifications: [],
  modals: {},
  theme: {
    mode: 'light',
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#0070f3',
  },
  loading: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>,
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      state.modals = {};
    },
    setTheme: (
      state,
      action: PayloadAction<{ mode?: 'light' | 'dark'; primaryColor?: string }>,
    ) => {
      if (action.payload.mode) {
        state.theme.mode = action.payload.mode;
      }
      if (action.payload.primaryColor) {
        state.theme.primaryColor = action.payload.primaryColor;
      }
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>,
    ) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setTheme,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
