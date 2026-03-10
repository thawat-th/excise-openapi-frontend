/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Notification = {
    id?: string;
    user_id?: string;
    type?: Notification.type;
    title?: string;
    message?: string;
    link?: string | null;
    read?: boolean;
    created_at?: string;
};
export namespace Notification {
    export enum type {
        INFO = 'info',
        WARNING = 'warning',
        ERROR = 'error',
        SUCCESS = 'success',
    }
}

