/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APISubscription = {
    id?: string;
    service_id?: string;
    application_id?: string;
    status?: APISubscription.status;
    approved_at?: string | null;
    created_at?: string;
};
export namespace APISubscription {
    export enum status {
        PENDING = 'pending',
        APPROVED = 'approved',
        REJECTED = 'rejected',
        CANCELLED = 'cancelled',
    }
}

