/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIDocumentationPage } from '../models/APIDocumentationPage';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiDocumentationService {
    /**
     * Create documentation page
     * Create a new documentation page for an API service (admin only)
     * @param requestBody
     * @returns any Documentation page created
     * @throws ApiError
     */
    public static createDocumentationPage(
        requestBody: {
            service_id: string;
            version_id?: string | null;
            title: string;
            slug: string;
            content: string;
            order?: number;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APIDocumentationPage;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/documentation',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                409: `Slug already exists`,
            },
        });
    }
    /**
     * List documentation pages
     * Get all documentation pages for a service
     * @param serviceId
     * @param versionId
     * @returns any List of documentation pages
     * @throws ApiError
     */
    public static listDocumentationPages(
        serviceId: string,
        versionId?: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<APIDocumentationPage>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/documentation',
            query: {
                'service_id': serviceId,
                'version_id': versionId,
            },
            errors: {
                400: `Missing service_id parameter`,
            },
        });
    }
    /**
     * Get documentation page
     * Get a specific documentation page by ID
     * @param id
     * @returns any Documentation page details
     * @throws ApiError
     */
    public static getDocumentationPage(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIDocumentationPage;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/documentation/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Page not found`,
            },
        });
    }
    /**
     * Update documentation page
     * Update an existing documentation page (admin only)
     * @param id
     * @param requestBody
     * @returns any Page updated
     * @throws ApiError
     */
    public static updateDocumentationPage(
        id: string,
        requestBody: {
            title?: string;
            content?: string;
            order?: number;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APIDocumentationPage;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/api-catalog/documentation/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Page not found`,
            },
        });
    }
    /**
     * Delete documentation page
     * Delete a documentation page (admin only)
     * @param id
     * @returns any Page deleted
     * @throws ApiError
     */
    public static deleteDocumentationPage(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/api-catalog/documentation/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Page not found`,
            },
        });
    }
    /**
     * Publish documentation page
     * Change page status to published (admin only)
     * @param id
     * @returns any Page published
     * @throws ApiError
     */
    public static publishDocumentationPage(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIDocumentationPage;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/documentation/{id}/publish',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Page not found`,
            },
        });
    }
    /**
     * Unpublish documentation page
     * Change page status to draft (admin only)
     * @param id
     * @returns any Page unpublished
     * @throws ApiError
     */
    public static unpublishDocumentationPage(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APIDocumentationPage;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/documentation/{id}/unpublish',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Page not found`,
            },
        });
    }
}
