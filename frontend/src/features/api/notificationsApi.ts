import { baseApi } from './baseApi';
import type { ProductNotification } from '../../types';

export interface NotificationsResponse {
  notifications: ProductNotification[];
  unreadCount: number;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
