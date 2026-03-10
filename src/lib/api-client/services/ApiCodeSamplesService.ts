/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APICodeSample } from '../models/APICodeSample';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiCodeSamplesService {
    /**
     * Create code sample
     * Create a new code sample for an API service (admin only)
     * @param requestBody
     * @returns any Code sample created
     * @throws ApiError
     */
    public static createCodeSample(
        requestBody: {
            service_id: string;
            language: 'javascript' | 'python' | 'go' | 'java' | 'php' | 'ruby' | 'curl';
            title: string;
            code: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APICodeSample;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/api-catalog/code-samples',
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
     * List code samples
     * Get all code samples for a service
     * @param serviceId
     * @param language
     * @returns any List of code samples
     * @throws ApiError
     */
    public static listCodeSamples(
        serviceId: string,
        language?: 'javascript' | 'python' | 'go' | 'java' | 'php' | 'ruby' | 'curl',
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<APICodeSample>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/code-samples',
            query: {
                'service_id': serviceId,
                'language': language,
            },
            errors: {
                400: `Missing service_id parameter`,
            },
        });
    }
    /**
     * Get code sample
     * Get a specific code sample by ID
     * @param id
     * @returns any Code sample details
     * @throws ApiError
     */
    public static getCodeSample(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APICodeSample;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/code-samples/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Code sample not found`,
            },
        });
    }
    /**
     * Update code sample
     * Update an existing code sample (admin only)
     * @param id
     * @param requestBody
     * @returns any Code sample updated
     * @throws ApiError
     */
    public static updateCodeSample(
        id: string,
        requestBody: {
            title?: string;
            code?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APICodeSample;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/api-catalog/code-samples/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Code sample not found`,
            },
        });
    }
    /**
     * Delete code sample
     * Delete a code sample (admin only)
     * @param id
     * @returns any Code sample deleted
     * @throws ApiError
     */
    public static deleteCodeSample(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/api-catalog/code-samples/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Code sample not found`,
            },
        });
    }
}
