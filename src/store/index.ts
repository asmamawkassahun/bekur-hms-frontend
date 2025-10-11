import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import reservationReducer from './slices/reservationSlice';
import paymentReducer from './slices/paymentSlice';
import guestReducer from './slices/guestSlice';
import reportReducer from './slices/reportSlice';
import staffReducer from './slices/staffSlice';
import settingsReducer from './slices/settingsSlice';
import invoiceReducer from './slices/invoiceSlice';
import roomReducer from './slices/roomSlice';
import dormitoryReducer from './slices/dormitorySlice';
import bedReducer from './slices/bedSlice';
import roomTypeReducer from './slices/roomTypeSlice';
import bedTypeReducer from './slices/bedTypeSlice';
import rateManagementReducer from './slices/rateManagementSlice';
import uiReducer from './slices/uiSlice';
import nightAuditReducer from './slices/nightAuditSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    reservation: reservationReducer,
    guest: guestReducer,
    invoice: invoiceReducer,
    payment: paymentReducer,
    reports: reportReducer,
    staff: staffReducer,
    settings: settingsReducer,
    room: roomReducer,
    dormitory: dormitoryReducer,
    bed: bedReducer,
    roomType: roomTypeReducer,
    bedType: bedTypeReducer,
    rateManagement: rateManagementReducer,
    nightAudit: nightAuditReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.refreshToken'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Expose store globally for axios interceptor
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store;
}
