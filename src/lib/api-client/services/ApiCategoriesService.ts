/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APICategory } from '../models/APICategory';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiCategoriesService {
    /**
     * List API categories
     * @param level
     * @returns any List of categories
     * @throws ApiError
     */
    public static listCategories(
        level?: number,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<APICategory>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/categories',
            query: {
                'level': level,
            },
        });
    }
    /**
     * Get category tree
     * @returns any Hierarchical category tree
     * @throws ApiError
     */
    public static getCategoryTree(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/categories/tree',
        });
    }
    /**
     * Update API category
     * Update category details (admin only)
     * @param id
     * @param requestBody
     * @returns any Category updated
     * @throws ApiError
     */
    public static updateCategory(
        id: string,
        requestBody: {
            name?: string;
            description?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: APICategory;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/api-catalog/categories/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Category not found`,
            },
        });
    }
    /**
     * Delete API category
     * Delete a category (admin only)
     * @param id
     * @returns any Category deleted
     * @throws ApiError
     */
    public static deleteCategory(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/api-catalog/categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Category not found`,
            },
        });
    }
    /**
     * Get category by code
     * Get category by unique code identifier
     * @param code
     * @returns any Category details
     * @throws ApiError
     */
    public static getCategoryByCode(
        code: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: APICategory;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/categories/code/{code}',
            path: {
                'code': code,
            },
            errors: {
                404: `Category not found`,
            },
        });
    }
    /**
     * Get category children
     * Get direct child categories
     * @param id
     * @returns any List of child categories
     * @throws ApiError
     */
    public static getCategoryChildren(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<APICategory>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/api-catalog/categories/{id}/children',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
            },
        });
    }
}
