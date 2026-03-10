/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APICodeSample = {
    id?: string;
    service_id?: string;
    language?: APICodeSample.language;
    title?: string;
    code?: string;
    created_at?: string;
};
export namespace APICodeSample {
    export enum language {
        JAVASCRIPT = 'javascript',
        PYTHON = 'python',
        GO = 'go',
        JAVA = 'java',
        PHP = 'php',
        RUBY = 'ruby',
        CURL = 'curl',
    }
}

