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
