/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APIDocumentationPage = {
    id?: string;
    service_id?: string;
    version_id?: string | null;
    title?: string;
    slug?: string;
    content?: string;
    order?: number;
    status?: APIDocumentationPage.status;
    created_at?: string;
};
export namespace APIDocumentationPage {
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
    }
}

