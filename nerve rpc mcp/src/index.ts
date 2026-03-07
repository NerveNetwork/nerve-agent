#!/usr/bin/env node
/**
 * Nerve RPC MCP Server
 * Exposes Nerve blockchain JSON-RPC & REST API as MCP tools for AI Agents.
 * API: https://api.nerve.network (JSON-RPC /jsonrpc, REST /api/*)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  nerveJsonRpc,
  nerveRest,
  getBaseUrl,
} from "./nerve-client.js";

const server = new McpServer({
  name: "nerve-rpc-mcp",
  version: "1.0.0",
});

const chainIdSchema = z.number().int().positive().describe("Nerve chain ID (e.g. 9 for mainnet)");
const addressSchema = z.string().describe("Nerve address");
const hashSchema = z.string().describe("Transaction or block hash");
const heightSchema = z.number().int().nonnegative().describe("Block height");

function textContent(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function jsonContent(obj: unknown) {
  return textContent(JSON.stringify(obj, null, 2));
}

// --- Chain & network ---
server.registerTool(
  "nerve_info",
  {
    description: "Get Nerve chain info (chainId, assetId, symbol, addressPrefix, consensus assets, etc.)",
    inputSchema: {},
  },
  async () => {
    const result = await nerveJsonRpc("info", []);
    return jsonContent(result);
  }
);

server.registerTool(
  "nerve_get_latest_height",
  {
    description: "Get the latest main chain block height for a chain",
    inputSchema: { chainId: chainIdSchema },
  },
  async ({ chainId }) => {
    const result = await nerveJsonRpc<number>("getLatestHeight", [chainId]);
    return textContent(String(result));
  }
);

server.registerTool(
  "nerve_get_best_block_header",
  {
    description: "Get the latest block header (hash, height, txCount, packingAddress, etc.)",
    inputSchema: { chainId: chainIdSchema },
  },
  async ({ chainId }) => {
    const result = await nerveJsonRpc("getBestBlockHeader", [chainId]);
    return jsonContent(result);
  }
);

// --- Account & balance ---
server.registerTool(
  "nerve_validate_address",
  {
    description: "Validate if a Nerve address is correct for the given chain",
    inputSchema: { chainId: chainIdSchema, address: addressSchema },
  },
  async ({ chainId, address }) => {
    const result = await nerveJsonRpc<boolean>("validateAddress", [chainId, address]);
    return jsonContent({ valid: result });
  }
);

server.registerTool(
  "nerve_get_account_balance",
  {
    description: "Query account balance for a specific asset (chainId, assetChainId, assetId, address)",
    inputSchema: {
      chainId: chainIdSchema,
      assetChainId: z.number().int().describe("Asset chain ID"),
      assetId: z.number().int().describe("Asset ID"),
      address: addressSchema,
    },
  },
  async ({ chainId, assetChainId, assetId, address }) => {
    const result = await nerveJsonRpc("getAccountBalance", [
      chainId,
      assetChainId,
      assetId,
      address,
    ]);
    return jsonContent(result);
  }
);

server.registerTool(
  "nerve_get_balance_list",
  {
    description: "Query balance list for an address and optional asset IDs",
    inputSchema: {
      chainId: chainIdSchema,
      address: addressSchema,
      assetIdList: z.array(z.number().int()).optional().describe("Optional list of asset IDs; omit for all"),
    },
  },
  async ({ chainId, address, assetIdList }) => {
    const result = await nerveJsonRpc("getBalanceList", [
      chainId,
      address,
      assetIdList ?? [],
    ]);
    return jsonContent(result);
  }
);

// --- Blocks ---
server.registerTool(
  "nerve_get_block_by_height",
  {
    description: "Get block (header + transactions) by block height",
    inputSchema: { chainId: chainIdSchema, height: heightSchema },
  },
  async ({ chainId, height }) => {
    const result = await nerveJsonRpc("getBlockByHeight", [chainId, height]);
    return jsonContent(result);
  }
);

server.registerTool(
  "nerve_get_block_by_hash",
  {
    description: "Get block (header + transactions) by block hash",
    inputSchema: { chainId: chainIdSchema, hash: hashSchema },
  },
  async ({ chainId, hash }) => {
    const result = await nerveJsonRpc("getBlockByHash", [chainId, hash]);
    return jsonContent(result);
  }
);

server.registerTool(
  "nerve_get_header_by_height",
  {
    description: "Get block header only by height",
    inputSchema: { chainId: chainIdSchema, height: heightSchema },
  },
  async ({ chainId, height }) => {
    const result = await nerveJsonRpc("getHeaderByHeight", [chainId, height]);
    return jsonContent(result);
  }
);

// --- Transactions ---
server.registerTool(
  "nerve_get_tx",
  {
    description: "Get transaction by transaction hash",
    inputSchema: { chainId: chainIdSchema, hash: hashSchema },
  },
  async ({ chainId, hash }) => {
    const result = await nerveJsonRpc("getTx", [chainId, hash]);
    return jsonContent(result);
  }
);

// --- Consensus / agents ---
server.registerTool(
  "nerve_get_agent_list",
  {
    description: "Get list of consensus nodes (agents) for the chain",
    inputSchema: { chainId: chainIdSchema },
  },
  async ({ chainId }) => {
    const result = await nerveJsonRpc("getAgentList", [chainId]);
    return jsonContent(result);
  }
);

server.registerTool(
  "nerve_get_deposit_list",
  {
    description: "Get delegation list for a consensus node (by agent creation tx hash)",
    inputSchema: {
      chainId: chainIdSchema,
      agentHash: hashSchema.describe("Create consensus node transaction hash"),
    },
  },
  async ({ chainId, agentHash }) => {
    const result = await nerveJsonRpc("getDepositList", [chainId, agentHash]);
    return jsonContent(result);
  }
);

// --- Generic JSON-RPC (for advanced / other methods) ---
server.registerTool(
  "nerve_jsonrpc",
  {
    description:
      "Call any Nerve JSON-RPC method by name with params array. Use for methods not covered by dedicated tools (e.g. getRandomSeedByCount, getProposalInfo, swap/farm APIs).",
    inputSchema: {
      method: z.string().describe("JSON-RPC method name (e.g. info, getTx, getSwapPairInfo)"),
      params: z.array(z.unknown()).default([]).describe("Array of positional parameters"),
    },
  },
  async ({ method, params }) => {
    const result = await nerveJsonRpc(method, params);
    return jsonContent(result);
  }
);

// --- REST fallback (e.g. /api/info, /api/block/height/:height) ---
server.registerTool(
  "nerve_rest",
  {
    description:
      "Call Nerve REST API by path. Method GET by default; pass body for POST. Base URL is from NERVE_API_BASE_URL (default https://api.nerve.network). Example paths: api/info, api/block/header/height/1000, api/tx/{hash}",
    inputSchema: {
      path: z.string().describe("REST path (e.g. api/info or api/block/height/123)"),
      method: z.enum(["GET", "POST", "PUT"]).optional().default("GET"),
      body: z.record(z.unknown()).optional().describe("JSON body for POST/PUT"),
    },
  },
  async ({ path, method, body }) => {
    const result = await nerveRest(path, { method, body });
    return jsonContent(result);
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`Nerve RPC MCP running (stdio), base URL: ${getBaseUrl()}\n`);
}

main().catch((err) => {
  process.stderr.write(String(err) + "\n");
  process.exit(1);
});
