/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { District } from '../models/District';
import type { Province } from '../models/Province';
import type { Subdistrict } from '../models/Subdistrict';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GeographicService {
    /**
     * Get all provinces
     * Returns all 77 Thai provinces with Thai and English names
     * @returns any List of provinces
     * @throws ApiError
     */
    public static getProvinces(): CancelablePromise<{
        success?: boolean;
        data?: Array<Province>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/geo/provinces',
        });
    }
    /**
     * Get districts by province
     * @param code
     * @returns any List of districts
     * @throws ApiError
     */
    public static getDistrictsByProvince(
        code: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<District>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/geo/provinces/{code}/districts',
            path: {
                'code': code,
            },
        });
    }
    /**
     * Get subdistricts by district
     * @param code
     * @returns any List of subdistricts
     * @throws ApiError
     */
    public static getSubdistrictsByDistrict(
        code: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<Subdistrict>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/geo/districts/{code}/subdistricts',
            path: {
                'code': code,
            },
        });
    }
    /**
     * Search by postal code
     * @param postalCode
     * @returns any Location details
     * @throws ApiError
     */
    public static searchByPostalCode(
        postalCode: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/geo/search',
            query: {
                'postal_code': postalCode,
            },
        });
    }
}
