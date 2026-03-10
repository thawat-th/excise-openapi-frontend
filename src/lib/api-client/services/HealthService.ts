/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HealthService {
    /**
     * Kubernetes liveness probe
     * @returns any Service is alive
     * @throws ApiError
     */
    public static getLivenessProbe(): CancelablePromise<{
        status?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health/liveness',
        });
    }
    /**
     * Kubernetes readiness probe
     * @returns any Service is ready
     * @throws ApiError
     */
    public static getReadinessProbe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health/readiness',
            errors: {
                503: `Service not ready`,
            },
        });
    }
    /**
     * Comprehensive health check
     * @returns any Health status
     * @throws ApiError
     */
    public static getHealthCheck(): CancelablePromise<{
        status?: string;
        dependencies?: Record<string, any>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
        });
    }
    /**
     * Prometheus metrics
     * @returns string Prometheus metrics
     * @throws ApiError
     */
    public static getMetrics(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/metrics',
        });
    }
}
