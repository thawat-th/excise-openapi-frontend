/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrganizationProfile = {
    id?: string;
    identity_id?: string;
    name?: string;
    tax_id?: string;
    email?: string;
    phone?: string;
    address?: string;
    province_code?: string;
    district_code?: string;
    subdistrict_code?: string;
    postal_code?: string;
    status?: OrganizationProfile.status;
    created_at?: string;
    updated_at?: string;
};
export namespace OrganizationProfile {
    export enum status {
        ACTIVE = 'active',
        SUSPENDED = 'suspended',
        DELETED = 'deleted',
    }
}

