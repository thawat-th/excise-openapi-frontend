/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIEndpoint } from '../models/APIEndpoint';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiEndpointsService {
    /**
     * Create API endpoint
     * Create a new endpoint specification (admin only)
     * @param requestBody
     * @returns any Endpoint created
     * @throws ApiError
     */
    public static createApiEndpoint(
        requestBody: {
            version_id: string;
            path: string;
            method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
            summary: string;
            description?: string;
            parameters?: Record<string, any>;
            request_body?: Record<string, any>;
            responses?: Record<string, any>;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APIEndpoint;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/endpoints',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * List API endpoints
     * Get all endpoints for a version
     * @param versionId
     * @returns any List of endpoints
     * @throws ApiError
     */
    public static listApiEndpoints(
        versionId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<APIEndpoint>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/endpoints',
            query: {
                'version_id': versionId,
            },
            errors: {
                400: `Missing version_id parameter`,
            },
        });
    }
    /**
     * Get API endpoint
     * Get a specific endpoint by ID
     * @param id
     * @returns any Endpoint details
     * @throws ApiError
     */
    public static getApiEndpoint(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIEndpoint;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/endpoints/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Endpoint not found`,
            },
        });
    }
    /**
     * Update API endpoint
     * Update an existing endpoint (admin only)
     * @param id
     * @param requestBody
     * @returns any Endpoint updated
     * @throws ApiError
     */
    public static updateApiEndpoint(
        id: string,
        requestBody: {
            summary?: string;
            description?: string;
            parameters?: Record<string, any>;
            request_body?: Record<string, any>;
            responses?: Record<string, any>;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APIEndpoint;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/api-catalog/endpoints/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Endpoint not found`,
            },
        });
    }
    /**
     * Delete API endpoint
     * Delete an endpoint (admin only)
     * @param id
     * @returns any Endpoint deleted
     * @throws ApiError
     */
    public static deleteApiEndpoint(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/api-catalog/endpoints/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Endpoint not found`,
            },
        });
    }
}
