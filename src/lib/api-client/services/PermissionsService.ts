/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PermissionCheck } from '../models/PermissionCheck';
import type { Relationship } from '../models/Relationship';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PermissionsService {
    /**
     * Check single permission
     * Check if a subject has a specific permission on an object.
     * Uses Ory Keto for authorization checks.
     *
     * @param requestBody
     * @returns any Permission check result
     * @throws ApiError
     */
    public static checkPermission(
        requestBody: PermissionCheck,
    ): CancelablePromise<{
        success?: boolean;
        allowed?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/permissions/check',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Batch check permissions
     * Check multiple permissions at once for efficiency.
     *
     * @param requestBody
     * @returns any Batch check results
     * @throws ApiError
     */
    public static batchCheckPermission(
        requestBody: {
            checks: Array<PermissionCheck>;
        },
    ): CancelablePromise<{
        success?: boolean;
        results?: Array<{
            allowed?: boolean;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/permissions/batch-check',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * List relationships
     * List permission relationships (for debugging/admin).
     *
     * @param namespace
     * @param object
     * @returns any List of relationships
     * @throws ApiError
     */
    public static listRelationships(
        namespace?: string,
        object?: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<Relationship>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/relationships',
            query: {
                'namespace': namespace,
                'object': object,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Create relationship
     * Create a new permission relationship.
     * Admin endpoint - usually managed automatically by services.
     *
     * @param requestBody
     * @returns any Relationship created
     * @throws ApiError
     */
    public static createRelationship(
        requestBody: Relationship,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/relationships',
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
     * Delete relationship
     * Delete a permission relationship.
     * Admin endpoint - usually managed automatically by services.
     *
     * @param requestBody
     * @returns any Relationship deleted
     * @throws ApiError
     */
    public static deleteRelationship(
        requestBody: Relationship,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/relationships',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get role members
     * Get list of all users with a specific role
     * @param role
     * @returns any List of members
     * @throws ApiError
     */
    public static getRoleMembers(
        role: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<string>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/roles/{role}/members',
            path: {
                'role': role,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Add role member
     * Assign a role to a user
     * @param role
     * @param requestBody
     * @returns any Role assigned
     * @throws ApiError
     */
    public static addRoleMember(
        role: string,
        requestBody: {
            user_id: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/roles/{role}/members',
            path: {
                'role': role,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * Remove role member
     * Remove a role from a user
     * @param role
     * @param userId
     * @returns any Role removed
     * @throws ApiError
     */
    public static removeRoleMember(
        role: string,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/roles/{role}/members/{user_id}',
            path: {
                'role': role,
                'user_id': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
}
