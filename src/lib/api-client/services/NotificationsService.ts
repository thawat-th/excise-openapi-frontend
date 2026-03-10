/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Notification } from '../models/Notification';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * List user notifications
     * Get paginated list of notifications for authenticated user
     * @param read
     * @param type
     * @param page
     * @param limit
     * @returns any List of notifications
     * @throws ApiError
     */
    public static listNotifications(
        read?: boolean,
        type?: 'info' | 'warning' | 'error' | 'success',
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            items?: Array<Notification>;
            total?: number;
            page?: number;
            limit?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/notifications',
            query: {
                'read': read,
                'type': type,
                'page': page,
                'limit': limit,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get unread notification count
     * Get count of unread notifications for badge display
     * @returns any Unread count
     * @throws ApiError
     */
    public static getUnreadCount(): CancelablePromise<{
        success?: boolean;
        count?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/notifications/unread/count',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Stream notifications (SSE)
     * Server-Sent Events stream for real-time notifications.
     * Keep connection open to receive new notifications.
     *
     * @returns string SSE stream
     * @throws ApiError
     */
    public static streamNotifications(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/notifications/stream',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Mark notification as read
     * @param id
     * @returns any Notification marked as read
     * @throws ApiError
     */
    public static markAsRead(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/notifications/{id}/read',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Notification not found`,
            },
        });
    }
    /**
     * Mark all notifications as read
     * @returns any All notifications marked as read
     * @throws ApiError
     */
    public static markAllAsRead(): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/notifications/read-all',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Delete notification
     * @param id
     * @returns any Notification deleted
     * @throws ApiError
     */
    public static deleteNotification(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/notifications/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Notification not found`,
            },
        });
    }
}
