/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendOTPRequest } from '../models/SendOTPRequest';
import type { VerifyOTPRequest } from '../models/VerifyOTPRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OtpService {
    /**
     * Send OTP to email
     * Sends a 6-digit OTP code to the specified email address.
     * Rate limited to 3 requests per email per 5 minutes.
     * OTP expires after 10 minutes.
     *
     * @param requestBody
     * @returns any OTP sent successfully
     * @throws ApiError
     */
    public static sendOtp(
        requestBody: SendOTPRequest,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        expires_at?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/otp/send',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid email or purpose`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Verify OTP code
     * Verifies the OTP code sent to the email address.
     * OTP codes expire after 10 minutes.
     * Maximum 5 verification attempts allowed.
     *
     * @param requestBody
     * @returns any OTP verified successfully
     * @throws ApiError
     */
    public static verifyOtp(
        requestBody: VerifyOTPRequest,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        valid?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/otp/verify',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid OTP`,
            },
        });
    }
}
