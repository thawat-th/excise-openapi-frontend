/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationMember } from '../models/OrganizationMember';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MembersService {
    /**
     * List organization members
     * Get paginated list of organization members with optional filters.
     * Requires permission: organization.members.list
     *
     * @param orgId
     * @param status
     * @param role
     * @param page
     * @param limit
     * @returns any List of members
     * @throws ApiError
     */
    public static listMembers(
        orgId: string,
        status?: 'pending' | 'active' | 'suspended' | 'revoked',
        role?: 'owner' | 'admin' | 'developer' | 'viewer',
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            items?: Array<OrganizationMember>;
            total?: number;
            page?: number;
            limit?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{org_id}/members',
            path: {
                'org_id': orgId,
            },
            query: {
                'status': status,
                'role': role,
                'page': page,
                'limit': limit,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Insufficient permissions`,
                404: `Organization not found`,
            },
        });
    }
    /**
     * Add member to organization
     * Invite a member to the organization (creates pending invitation).
     * Requires permission: organization.members.add
     *
     * @param orgId
     * @param requestBody
     * @returns any Member invitation created
     * @throws ApiError
     */
    public static addMember(
        orgId: string,
        requestBody: {
            email: string;
            role: 'admin' | 'developer' | 'viewer';
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: OrganizationMember;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/organizations/{org_id}/members',
            path: {
                'org_id': orgId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                403: `Forbidden - Insufficient permissions`,
                409: `Member already exists`,
            },
        });
    }
    /**
     * Get member details
     * Get detailed information about a specific member.
     * Requires permission: organization.members.view
     *
     * @param orgId
     * @param memberId
     * @returns any Member details
     * @throws ApiError
     */
    public static getMember(
        orgId: string,
        memberId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: OrganizationMember;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/organizations/{org_id}/members/{member_id}',
            path: {
                'org_id': orgId,
                'member_id': memberId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Member not found`,
            },
        });
    }
    /**
     * Update member role
     * Update a member's role within the organization.
     * Requires permission: organization.members.update
     * Cannot change owner role. Cannot remove last owner.
     *
     * @param orgId
     * @param memberId
     * @param requestBody
     * @returns any Member role updated
     * @throws ApiError
     */
    public static updateMemberRole(
        orgId: string,
        memberId: string,
        requestBody: {
            role: 'admin' | 'developer' | 'viewer';
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: OrganizationMember;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/organizations/{org_id}/members/{member_id}',
            path: {
                'org_id': orgId,
                'member_id': memberId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid role or cannot modify owner`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Member not found`,
            },
        });
    }
    /**
     * Remove member from organization
     * Remove a member from the organization (sets status to 'revoked').
     * Requires permission: organization.members.remove
     * Cannot remove last owner. Cannot remove self if owner.
     *
     * @param orgId
     * @param memberId
     * @returns any Member removed successfully
     * @throws ApiError
     */
    public static removeMember(
        orgId: string,
        memberId: string,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/organizations/{org_id}/members/{member_id}',
            path: {
                'org_id': orgId,
                'member_id': memberId,
            },
            errors: {
                400: `Cannot remove last owner or self`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Member not found`,
            },
        });
    }
}
