/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Occupation } from '../models/Occupation';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OccupationsService {
    /**
     * Get all occupations
     * @param level
     * @param parentCode
     * @returns any List of occupations
     * @throws ApiError
     */
    public static getOccupations(
        level?: number,
        parentCode?: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<Occupation>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/occupations',
            query: {
                'level': level,
                'parent_code': parentCode,
            },
        });
    }
    /**
     * Get major occupation groups
     * @returns any List of major groups
     * @throws ApiError
     */
    public static getMajorGroups(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/occupations/major-groups',
        });
    }
    /**
     * Get occupation by code
     * @param code
     * @returns any Occupation details
     * @throws ApiError
     */
    public static getOccupationByCode(
        code: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/occupations/{code}',
            path: {
                'code': code,
            },
        });
    }
}
