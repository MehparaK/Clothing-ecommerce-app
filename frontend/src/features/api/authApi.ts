import { baseApi } from './baseApi';

interface AuthApiUser {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  termsAccepted: boolean;
  role: 'user' | 'admin';
}

interface AuthApiResponse extends AuthApiUser {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<AuthApiUser, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    login: builder.mutation<AuthApiResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthApiResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    updateProfile: builder.mutation<AuthApiUser, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
} = authApi;