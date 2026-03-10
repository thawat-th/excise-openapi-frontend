/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIService } from '../models/APIService';
import type { APISubscription } from '../models/APISubscription';
import type { APIVersion } from '../models/APIVersion';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiCatalogService {
    /**
     * List API services
     * Get paginated list of API services with optional filters.
     * Default: page=1, limit=20, status=published
     *
     * @param status Filter by service status
     * @param providerId Filter by provider UUID
     * @param categoryId Filter by category UUID
     * @param page Page number (1-indexed)
     * @param limit Items per page
     * @returns any List of API services
     * @throws ApiError
     */
    public static listApiServices(
        status?: 'draft' | 'published' | 'deprecated',
        providerId?: string,
        categoryId?: string,
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            items?: Array<APIService>;
            total?: number;
            page?: number;
            limit?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/services',
            query: {
                'status': status,
                'provider_id': providerId,
                'category_id': categoryId,
                'page': page,
                'limit': limit,
            },
        });
    }
    /**
     * Create API service
     * @param requestBody
     * @returns any API service created
     * @throws ApiError
     */
    public static createApiService(
        requestBody: {
            name: string;
            slug: string;
            description?: string;
            provider_id: string;
            category_id: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/services',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                409: `Slug already exists`,
            },
        });
    }
    /**
     * Get API service by ID
     * @param id
     * @returns any API service details
     * @throws ApiError
     */
    public static getApiService(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIService;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/services/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update API service
     * Update an existing API service (admin only)
     * @param id
     * @param requestBody
     * @returns any Service updated
     * @throws ApiError
     */
    public static updateApiService(
        id: string,
        requestBody: {
            name?: string;
            description?: string;
            category_id?: string;
            base_url?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APIService;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/api-catalog/services/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Service not found`,
            },
        });
    }
    /**
     * Delete API service
     * Soft delete an API service (admin only)
     * @param id
     * @returns any Service deleted
     * @throws ApiError
     */
    public static deleteApiService(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/api-catalog/services/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Service not found`,
            },
        });
    }
    /**
     * Get API service by slug
     * Get service by human-readable slug identifier
     * @param slug
     * @returns any Service details
     * @throws ApiError
     */
    public static getApiServiceBySlug(
        slug: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIService;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/services/slug/{slug}',
            path: {
                'slug': slug,
            },
            errors: {
                404: `Service not found`,
            },
        });
    }
    /**
     * Search API services
     * Full-text search across services
     * @param q
     * @param page
     * @param limit
     * @returns any Search results
     * @throws ApiError
     */
    public static searchApiServices(
        q: string,
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            items?: Array<APIService>;
            total?: number;
            page?: number;
            limit?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/services/search',
            query: {
                'q': q,
                'page': page,
                'limit': limit,
            },
            errors: {
                400: `Invalid search query`,
            },
        });
    }
    /**
     * Publish API service
     * Change service status from draft to published (admin only)
     * @param id
     * @returns any Service published
     * @throws ApiError
     */
    public static publishApiService(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIService;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/services/{id}/publish',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Service not found`,
            },
        });
    }
    /**
     * Deprecate API service
     * Mark service as deprecated (admin only)
     * @param id
     * @returns any Service deprecated
     * @throws ApiError
     */
    public static deprecateApiService(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIService;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/services/{id}/deprecate',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Service not found`,
            },
        });
    }
    /**
     * Create API version
     * Create a new version for an existing service
     * @param requestBody
     * @returns any Version created
     * @throws ApiError
     */
    public static createApiVersion(
        requestBody: {
            service_id: string;
            version: string;
            changelog?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APIVersion;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/versions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                409: `Version already exists`,
            },
        });
    }
    /**
     * List service versions
     * Get all versions for a specific service
     * @param serviceId
     * @returns any List of versions
     * @throws ApiError
     */
    public static getApiVersionsByServiceId(
        serviceId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<APIVersion>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/services/{service_id}/versions',
            path: {
                'service_id': serviceId,
            },
            errors: {
                404: `Service not found`,
            },
        });
    }
    /**
     * Set default version
     * Set a version as the default for this service
     * @param serviceId
     * @param versionId
     * @returns any Default version set
     * @throws ApiError
     */
    public static setDefaultVersion(
        serviceId: string,
        versionId: string,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/services/{service_id}/versions/{version_id}/set-default',
            path: {
                'service_id': serviceId,
                'version_id': versionId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Version not found`,
            },
        });
    }
    /**
     * Subscribe to API
     * Request access to an API service
     * @param requestBody
     * @returns any Subscription created
     * @throws ApiError
     */
    public static subscribeToApi(
        requestBody: {
            service_id: string;
            application_id: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APISubscription;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/subscriptions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                409: `Subscription already exists`,
            },
        });
    }
    /**
     * Approve API access
     * Approve a pending API subscription (admin only)
     * @param id
     * @returns any Subscription approved
     * @throws ApiError
     */
    public static approveApiAccess(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APISubscription;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/subscriptions/{id}/approve',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Subscription not found`,
            },
        });
    }
    /**
     * Cancel subscription
     * Cancel an API subscription
     * @param id
     * @returns any Subscription cancelled
     * @throws ApiError
     */
    public static cancelSubscription(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/subscriptions/{id}/cancel',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Subscription not found`,
            },
        });
    }
    /**
     * Get application subscriptions
     * Get all API subscriptions for a specific application
     * @param applicationId
     * @returns any List of subscriptions
     * @throws ApiError
     */
    public static getApplicationSubscriptions(
        applicationId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<APISubscription>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/applications/{application_id}/subscriptions',
            path: {
                'application_id': applicationId,
            },
            errors: {
                401: `Unauthorized`,
                404: `Application not found`,
            },
        });
    }
}
