import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
}

const readStoredAuth = (): AuthState => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token) {
    localStorage.removeItem('user');
    return { user: null, token: null };
  }

  if (!storedUser) {
    return { user: null, token };
  }

  try {
    const user = JSON.parse(storedUser) as User;
    if (
      typeof user.id !== 'string' ||
      typeof user.name !== 'string' ||
      !['user', 'admin'].includes(user.role)
    ) {
      throw new Error('Stored user data is invalid.');
    }

    return { user, token };
  } catch {
    localStorage.removeItem('user');
    return { user: null, token };
  }
};

const initialState: AuthState = readStoredAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const authSliceReducer = authSlice.reducer;

export default authSlice;