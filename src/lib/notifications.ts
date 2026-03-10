/**
 * Client-side notification API utilities
 */

import type {
  Notification,
  NotificationListResponse,
  NotificationCountResponse,
  NotificationActionResponse,
  NotificationListParams,
  NotificationSSEEvent,
} from '@/types/notification';

/**
 * Fetch notifications list
 */
export async function fetchNotifications(
  params?: NotificationListParams
): Promise<NotificationListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.unread_only) {
    searchParams.append('unread_only', 'true');
  }
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.page_size) {
    searchParams.append('page_size', params.page_size.toString());
  }

  const queryString = searchParams.toString();
  const url = `/api/notifications${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  return response.json();
}

/**
 * Fetch unread notification count
 */
export async function fetchUnreadCount(): Promise<NotificationCountResponse> {
  const response = await fetch('/api/notifications/unread/count', {
    method: 'GET',
    credentials: 'include',
  });

  return response.json();
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  id: string
): Promise<NotificationActionResponse> {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: 'PUT',
    credentials: 'include',
  });

  return response.json();
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<NotificationActionResponse> {
  const response = await fetch('/api/notifications/read-all', {
    method: 'PUT',
    credentials: 'include',
  });

  return response.json();
}

/**
 * Delete notification
 */
export async function deleteNotification(
  id: string
): Promise<NotificationActionResponse> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return response.json();
}

/**
 * Create SSE connection for real-time notifications
 *
 * @param onEvent - Callback for SSE events
 * @param onError - Callback for errors
 * @returns Cleanup function to close the connection
 */
export function subscribeToNotifications(
  onEvent: (event: NotificationSSEEvent) => void,
  onError?: (error: Event) => void
): () => void {
  // Use Next.js API route proxy for SSE with proper authentication
  // The proxy handles extracting the session cookie and forwarding to backend
  const eventSource = new EventSource('/api/notifications/stream', {
    withCredentials: true,
  });

  // Handle different event types
  eventSource.addEventListener('connected', (e) => {
    const data = JSON.parse(e.data);
    onEvent({ event: 'connected', data });
  });

  eventSource.addEventListener('unread_count', (e) => {
    const data = JSON.parse(e.data);
    onEvent({ event: 'unread_count', data });
  });

  eventSource.addEventListener('heartbeat', (e) => {
    const data = JSON.parse(e.data);
    onEvent({ event: 'heartbeat', data });
  });

  eventSource.addEventListener('notification', (e) => {
    const data = JSON.parse(e.data);
    onEvent({ event: 'notification', data });
  });

  // Handle errors
  eventSource.onerror = (error) => {
    console.error('[SSE] Connection error:', error);
    if (onError) {
      onError(error);
    }
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}
