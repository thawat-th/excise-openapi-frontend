/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIProvider } from '../models/APIProvider';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiProvidersService {
    /**
     * List API providers
     * @param type
     * @returns any List of providers
     * @throws ApiError
     */
    public static listProviders(
        type?: 'government' | 'private' | 'ngo',
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<APIProvider>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/providers',
            query: {
                'type': type,
            },
        });
    }
    /**
     * Create API provider
     * @param requestBody
     * @returns any Provider created
     * @throws ApiError
     */
    public static createProvider(
        requestBody: {
            code: string;
            name: string;
            type: 'government' | 'private' | 'ngo';
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/providers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Update API provider
     * Update provider details (admin only)
     * @param id
     * @param requestBody
     * @returns any Provider updated
     * @throws ApiError
     */
    public static updateProvider(
        id: string,
        requestBody: {
            name?: string;
            website?: string;
            contact_email?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APIProvider;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/api-catalog/providers/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Provider not found`,
            },
        });
    }
    /**
     * Delete API provider
     * Delete a provider (admin only)
     * @param id
     * @returns any Provider deleted
     * @throws ApiError
     */
    public static deleteProvider(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/api-catalog/providers/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Provider not found`,
            },
        });
    }
    /**
     * Get provider by code
     * Get provider by unique code identifier
     * @param code
     * @returns any Provider details
     * @throws ApiError
     */
    public static getProviderByCode(
        code: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIProvider;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/providers/code/{code}',
            path: {
                'code': code,
            },
            errors: {
                404: `Provider not found`,
            },
        });
    }
}
