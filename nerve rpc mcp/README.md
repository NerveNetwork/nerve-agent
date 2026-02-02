# Nerve RPC MCP

**MCP (Model Context Protocol) server for the [Nerve](https://nerve.network) blockchain** — exposes Nerve JSON-RPC and REST API as tools so AI Agents (Claude, Cursor, etc.) can query chain info, balances, blocks, transactions, and consensus in a standard way.

- **NerveNetwork**: [GitHub](https://github.com/NerveNetwork)
- **API reference**: [Nerve JSON-RPC](https://nerve-west.oss-us-west-1.aliyuncs.com/nerve-api_Postman_JSONRPC.json) · [Nerve REST](https://nerve-west.oss-us-west-1.aliyuncs.com/nerve-api_Postman_RESTFUL.json)
- **Default RPC base**: `https://api.nerve.network` (override with `NERVE_API_BASE_URL`)

## Quick start

From the [nerve-agent](https://github.com/NerveNetwork/nerve-agent) repo:

```bash
git clone https://github.com/NerveNetwork/nerve-agent.git
cd nerve-agent/"nerve rpc mcp"
npm install
npm run build
```

## MCP tools

| Tool | Description |
|------|-------------|
| `nerve_info` | Chain info (chainId, assetId, symbol, addressPrefix, consensus assets) |
| `nerve_get_latest_height` | Latest main chain block height |
| `nerve_get_best_block_header` | Latest block header |
| `nerve_validate_address` | Validate Nerve address for a chain |
| `nerve_get_account_balance` | Balance for one asset (chainId, assetChainId, assetId, address) |
| `nerve_get_balance_list` | Balance list for address (optional asset IDs) |
| `nerve_get_block_by_height` | Block by height (header + txs) |
| `nerve_get_block_by_hash` | Block by hash |
| `nerve_get_header_by_height` | Block header by height |
| `nerve_get_tx` | Transaction by hash |
| `nerve_get_agent_list` | Consensus nodes (agents) |
| `nerve_get_deposit_list` | Delegation list for a node (by agent tx hash) |
| `nerve_jsonrpc` | Call any Nerve JSON-RPC method (method name + params array) |
| `nerve_rest` | Call Nerve REST path (e.g. `api/info`, `api/block/height/123`) |

Chain ID: Nerve mainnet is typically `9`; pass the appropriate `chainId` where required.

## Configure in your MCP client

### Cursor

Add to Cursor MCP settings (e.g. **Settings → MCP** or project `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "nerve-rpc": {
      "command": "node",
      "args": ["/path/to/nerve-agent/nerve rpc mcp/dist/index.js"],
      "env": {
        "NERVE_API_BASE_URL": "https://api.nerve.network"
      }
    }
  }
}
```

Replace `/path/to/nerve-agent` with your local clone path (e.g. `~/repos/nerve-agent`). Omit `NERVE_API_BASE_URL` to use the default.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the equivalent config on your OS:

```json
{
  "mcpServers": {
    "nerve-rpc": {
      "command": "node",
      "args": ["/path/to/nerve-agent/nerve rpc mcp/dist/index.js"]
    }
  }
}
```

Replace `/path/to/nerve-agent` with your local clone path. Then restart Claude Desktop.

### npx (no clone)

If the package is published to npm:

```json
{
  "mcpServers": {
    "nerve-rpc": {
      "command": "npx",
      "args": ["-y", "nerve-rpc-mcp"]
    }
  }
}
```

## Environment

| Variable | Description |
|----------|-------------|
| `NERVE_API_BASE_URL` | RPC base URL (default: `https://api.nerve.network`) |

## Source and publish

This MCP server is part of [NerveNetwork/nerve-agent](https://github.com/NerveNetwork/nerve-agent). To contribute:

1. Clone and open the repo: `git clone https://github.com/NerveNetwork/nerve-agent.git`
2. Make changes under `nerve rpc mcp/`, then build: `cd "nerve rpc mcp" && npm run build`
3. Add **Topics** on the repo (e.g. `nerve`, `mcp`, `blockchain`, `modelcontextprotocol`, `ai`).

Optionally publish the MCP to **npm** (from `nerve rpc mcp/`) so users can run with `npx`:

   ```bash
   npm login
   npm publish --access public
   ```

## Publish to the MCP Registry (official marketplace)

The [MCP Registry](https://modelcontextprotocol.io/registry/about) is the official place to list MCP servers so developers and AI clients can discover yours.

**Step-by-step:** see **[PUBLISHING.md](./PUBLISHING.md)** for NerveNetwork repo URLs, npm, and MCP Registry (including `mcp-publisher` and `server.json`).

Summary:

1. **Publish to npm** (registry stores metadata; the package is served from npm).
2. **Install** [mcp-publisher](https://github.com/modelcontextprotocol/registry/releases) and run `mcp-publisher init` to create `server.json`.
3. **Edit** `server.json` so `name` matches `mcpName` in `package.json` (e.g. `io.github.NerveNetwork/nerve-rpc`).
4. **Authenticate**: `mcp-publisher login github`, then **publish**: `mcp-publisher publish`.

After that, users can discover “Nerve RPC MCP” from [prod.registry.modelcontextprotocol.io](https://prod.registry.modelcontextprotocol.io/) and add it in Cursor, Claude Desktop, or other MCP clients.

## License

MIT
