import { baseApi } from './baseApi';
import type { Notification, NotificationResponse, UnreadCountResponse } from '../../types/types';

export interface MarkAsReadRequest {
  notificationId: string;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user notifications with pagination
    getNotifications: builder.query<NotificationResponse, { page?: number; limit?: number; unreadOnly?: boolean }>({
      query: (params) => ({
        url: '/notifications',
        method: 'GET',
        params,
      }),
      providesTags: ['Notification'],
    }),

    // Get unread notification count
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<
      { success: boolean; data: Notification; message: string },
      MarkAsReadRequest
    >({
      query: (data) => ({
        url: `/notifications/${data.notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Delete notification
    deleteNotification: builder.mutation<
      { success: boolean; message: string },
      { notificationId: string }
    >({
      query: (data) => ({
        url: `/notifications/${data.notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi; 