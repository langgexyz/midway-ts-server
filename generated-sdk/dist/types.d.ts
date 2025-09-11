import { HttpBuilder, HttpMethod } from 'ts-sdk-client';
export interface ApiConfig {
    uri: string;
    headers: Record<string, string>;
}
export type ApiOption = (config: ApiConfig) => void;
export declare const withUri: (uri: string) => ApiOption;
export declare const withHeaders: (headers: Record<string, string>) => ApiOption;
export declare const withHeader: (key: string, value: string) => ApiOption;
export declare const combineOptions: (...options: ApiOption[]) => ApiOption;
export interface UnknownRequest {
    name?: string;
    email?: string;
    age?: number;
}
export interface UnknownResponse {
    success?: boolean;
    message?: string;
    data?: unknown;
}
export declare abstract class APIClient {
    protected httpBuilder: HttpBuilder;
    constructor(httpBuilder: HttpBuilder);
    /**
     * 通用参数验证方法
     * @protected
     */
    protected validateRequest<T = unknown>(request: T): void;
    /**
     * 通用请求处理方法
     * @protected
     */
    protected executeRequest<TRequest = unknown, TResponse = unknown>(method: HttpMethod, path: string, request?: TRequest, options?: ApiOption[]): Promise<TResponse>;
}
