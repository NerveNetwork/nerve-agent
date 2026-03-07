# Publishing Nerve RPC MCP

This MCP server is part of [NerveNetwork/nerve-agent](https://github.com/NerveNetwork/nerve-agent).

## 1. Source repository

- **GitHub**: [https://github.com/NerveNetwork/nerve-agent](https://github.com/NerveNetwork/nerve-agent)
- Clone: `git clone https://github.com/NerveNetwork/nerve-agent.git`
- MCP lives in: `nerve-agent/nerve rpc mcp/`

## 2. Publish to npm (optional, for `npx` usage)

From the `nerve rpc mcp/` directory:

```bash
npm login
npm run build
npm publish --access public
```

Users can then add the server with:

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

## 3. Publish to the MCP Registry (official marketplace)

The [MCP Registry](https://modelcontextprotocol.io/registry/about) lets developers discover your server from Cursor, Claude Desktop, and other clients.

### Prerequisites

- Node.js, npm account, GitHub account
- `package.json` must include `mcpName`: `io.github.NerveNetwork/nerve-rpc` and `repository.url`: `https://github.com/NerveNetwork/nerve-agent.git`

### Steps

1. **Install mcp-publisher**

   Download from [MCP Registry releases](https://github.com/modelcontextprotocol/registry/releases/latest) or:

   ```bash
   curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz
   sudo mv mcp-publisher /usr/local/bin/
   ```

2. **Create server.json**

   In the **nerve rpc mcp/** project root (or the nerve-agent repo root, depending on where you run mcp-publisher):

   ```bash
   mcp-publisher init
   ```

   Then edit `server.json`:

   - Set `name` to the same value as `mcpName` in `package.json`: `io.github.NerveNetwork/nerve-rpc`.
   - Set `description` and `version` as needed.
   - In `packages[0]`, set `identifier` to your npm package name (e.g. `nerve-rpc-mcp`), `version` to match `package.json`.
   - Keep `transport.type` as `stdio`.
   - Optional: add `environmentVariables` for `NERVE_API_BASE_URL` (not required, default is used).

   Example for NerveNetwork:

   ```json
   {
     "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
     "name": "io.github.NerveNetwork/nerve-rpc",
     "description": "MCP server for Nerve blockchain JSON-RPC & REST API for AI Agents",
     "repository": { "url": "https://github.com/NerveNetwork/nerve-agent", "source": "github" },
     "version": "1.0.0",
     "packages": [{
       "registryType": "npm",
       "identifier": "nerve-rpc-mcp",
       "version": "1.0.0",
       "transport": { "type": "stdio" }
     }]
   }
   ```

3. **Publish to npm first** (registry only stores metadata; the binary comes from npm):

   From `nerve rpc mcp/`:

   ```bash
   npm publish --access public
   ```

4. **Log in to the MCP Registry**

   ```bash
   mcp-publisher login github
   ```

   Follow the browser flow and device code prompt.

5. **Publish to the registry**

   ```bash
   mcp-publisher publish
   ```

6. **Verify**

   Search: <https://prod.registry.modelcontextprotocol.io/> or:

   ```bash
   curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=nerve"
   ```

Full details: [Quickstart: Publish an MCP Server to the MCP Registry](https://modelcontextprotocol.io/registry/quickstart).
