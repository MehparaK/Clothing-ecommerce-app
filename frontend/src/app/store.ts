import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../features/api/baseApi';
import { authSliceReducer } from '../features/auth/authSlice';
import { cartSliceReducer } from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    cart: cartSliceReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;