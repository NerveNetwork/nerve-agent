/**
 * Nerve blockchain JSON-RPC & REST API client.
 * API docs: nerve-west.oss-us-west-1.aliyuncs.com (Postman JSON-RPC / RESTFUL)
 */
const DEFAULT_BASE = "https://api.nerve.network";
export function getBaseUrl() {
    return process.env.NERVE_API_BASE_URL ?? DEFAULT_BASE;
}
let rpcId = 0;
export async function nerveJsonRpc(method, params = []) {
    const base = getBaseUrl();
    const url = base.replace(/\/$/, "") + "/jsonrpc";
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method,
            params,
            id: ++rpcId,
        }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Nerve RPC HTTP ${res.status}: ${text}`);
    }
    const json = (await res.json());
    if (json.error)
        throw new Error(`Nerve RPC error: ${json.error.message}`);
    return json.result;
}
export async function nerveRest(path, options) {
    const base = getBaseUrl();
    const url = (base.replace(/\/$/, "") + "/" + path.replace(/^\//, "")).replace(/:null/, "");
    const method = options?.method ?? "GET";
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: method !== "GET" && options?.body != null
            ? JSON.stringify(options.body)
            : undefined,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Nerve REST ${res.status}: ${text}`);
    }
    const text = await res.text();
    if (!text)
        return undefined;
    return JSON.parse(text);
}
