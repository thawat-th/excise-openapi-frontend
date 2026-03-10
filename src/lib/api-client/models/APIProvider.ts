/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APIProvider = {
    id?: string;
    code?: string;
    name?: string;
    type?: APIProvider.type;
    website?: string;
    contact_email?: string;
    created_at?: string;
};
export namespace APIProvider {
    export enum type {
        GOVERNMENT = 'government',
        PRIVATE = 'private',
        NGO = 'ngo',
    }
}

