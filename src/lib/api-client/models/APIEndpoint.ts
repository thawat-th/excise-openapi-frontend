/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APIEndpoint = {
    id?: string;
    version_id?: string;
    path?: string;
    method?: APIEndpoint.method;
    summary?: string;
    description?: string;
    parameters?: Record<string, any>;
    request_body?: Record<string, any>;
    responses?: Record<string, any>;
    created_at?: string;
};
export namespace APIEndpoint {
    export enum method {
        GET = 'GET',
        POST = 'POST',
        PUT = 'PUT',
        PATCH = 'PATCH',
        DELETE = 'DELETE',
    }
}

