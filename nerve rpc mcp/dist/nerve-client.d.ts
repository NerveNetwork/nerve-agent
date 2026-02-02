/**
 * Nerve blockchain JSON-RPC & REST API client.
 * API docs: nerve-west.oss-us-west-1.aliyuncs.com (Postman JSON-RPC / RESTFUL)
 */
export declare function getBaseUrl(): string;
export declare function nerveJsonRpc<T = unknown>(method: string, params?: unknown[]): Promise<T>;
export declare function nerveRest<T = unknown>(path: string, options?: {
    method?: string;
    body?: unknown;
}): Promise<T>;
