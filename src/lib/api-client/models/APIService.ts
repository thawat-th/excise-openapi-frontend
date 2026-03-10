/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APIService = {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    provider_id?: string;
    category_id?: string;
    status?: APIService.status;
    base_url?: string;
    created_at?: string;
    updated_at?: string;
};
export namespace APIService {
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
        DEPRECATED = 'deprecated',
    }
}

