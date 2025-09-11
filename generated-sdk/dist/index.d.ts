export * from './types';
export { CommonApi } from './common.api';
import { HttpBuilder } from 'ts-sdk-client';
import { CommonApi } from './common.api';
export declare class UnifiedApiClient {
    private httpBuilder;
    readonly common: CommonApi;
    constructor(httpBuilder: HttpBuilder);
}
