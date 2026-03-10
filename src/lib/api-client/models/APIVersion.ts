/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APIVersion = {
    id?: string;
    service_id?: string;
    version?: string;
    changelog?: string;
    status?: APIVersion.status;
    is_default?: boolean;
    created_at?: string;
};
export namespace APIVersion {
    export enum status {
        DRAFT = 'draft',
        ACTIVE = 'active',
        DEPRECATED = 'deprecated',
    }
}

