/**
 * Notification types matching the backend API
 */

export interface Notification {
  id: string;
  recipient_email: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  is_read: boolean;
  actor_email?: string;
  actor_name?: string;
  target_type?: string;
  target_id?: string;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface NotificationListResponse {
  success: boolean;
  data?: {
    notifications: Notification[];
    total: number;
    page: number;
    page_size: number;
  };
  error?: string;
}

export interface NotificationCountResponse {
  success: boolean;
  data?: {
    count: number;
  };
  error?: string;
}

export interface NotificationActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface NotificationListParams {
  unread_only?: boolean;
  page?: number;
  page_size?: number;
}

// SSE Event types
export type NotificationSSEEvent =
  | { event: 'connected'; data: { message: string } }
  | { event: 'unread_count'; data: { count: number } }
  | { event: 'heartbeat'; data: { timestamp: string } }
  | { event: 'notification'; data: Notification };
