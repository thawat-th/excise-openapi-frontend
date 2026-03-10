/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SendOTPRequest = {
    email: string;
    purpose: SendOTPRequest.purpose;
};
export namespace SendOTPRequest {
    export enum purpose {
        REGISTRATION = 'registration',
        PASSWORD_RESET = 'password_reset',
        EMAIL_VERIFICATION = 'email_verification',
    }
}

