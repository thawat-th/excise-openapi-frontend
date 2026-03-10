/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationProfile } from '../models/OrganizationProfile';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfilesService {
    /**
     * Get my individual profile
     * @returns any Individual profile
     * @throws ApiError
     */
    public static getMyIndividualProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profiles/individual/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Update my individual profile
     * @returns any Profile updated
     * @throws ApiError
     */
    public static updateMyIndividualProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/profiles/individual/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Create organization profile
     * Create a new organization profile (called during registration).
     * Internal endpoint - usually called by registration service.
     *
     * @param requestBody
     * @returns any Organization profile created
     * @throws ApiError
     */
    public static createOrganizationProfile(
        requestBody: {
            identity_id: string;
            name: string;
            tax_id: string;
            email: string;
            phone?: string;
            address?: string;
            province_code?: string;
            district_code?: string;
            subdistrict_code?: string;
            postal_code?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: OrganizationProfile;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/profiles/organization',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                409: `Organization already exists`,
            },
        });
    }
    /**
     * Get my organizations
     * Get list of organizations where the authenticated user is a member.
     *
     * @returns any List of organizations
     * @throws ApiError
     */
    public static getMyOrganizations(): CancelablePromise<{
        success?: boolean;
        data?: Array<OrganizationProfile>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profiles/organizations',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get organization profile
     * Get organization profile by ID (must be a member)
     * @param id
     * @returns any Organization profile
     * @throws ApiError
     */
    public static getOrganizationProfile(
        id: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: OrganizationProfile;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Not a member`,
                404: `Organization not found`,
            },
        });
    }
    /**
     * Update organization profile
     * Update organization profile information.
     * Requires permission: organization.profile.update
     *
     * @param id
     * @param requestBody
     * @returns any Organization profile updated
     * @throws ApiError
     */
    public static updateOrganizationProfile(
        id: string,
        requestBody: {
            name?: string;
            phone?: string;
            address?: string;
            province_code?: string;
            district_code?: string;
            subdistrict_code?: string;
            postal_code?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: OrganizationProfile;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/organizations/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Organization not found`,
            },
        });
    }
}
