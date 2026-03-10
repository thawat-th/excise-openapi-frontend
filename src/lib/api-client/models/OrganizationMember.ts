/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrganizationMember = {
    id?: string;
    organization_id?: string;
    person_id?: string;
    email?: string;
    role?: OrganizationMember.role;
    status?: OrganizationMember.status;
    invited_by?: string | null;
    joined_at?: string | null;
    created_at?: string;
    updated_at?: string;
};
export namespace OrganizationMember {
    export enum role {
        OWNER = 'owner',
        ADMIN = 'admin',
        DEVELOPER = 'developer',
        VIEWER = 'viewer',
    }
    export enum status {
        PENDING = 'pending',
        ACTIVE = 'active',
        SUSPENDED = 'suspended',
        REVOKED = 'revoked',
    }
}

