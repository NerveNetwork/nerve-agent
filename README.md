# Nerve Agent — AI Payment Framework & MCP

[Nerve](https://nerve.network) **Agent payment framework** and **Nerve RPC MCP** for developers and AI Agents: receive, pay, swap, and query balances. Decentralized protocol, locally generated and managed accounts, no gas fees, fast confirmation.

- **GitHub**: [NerveNetwork](https://github.com/NerveNetwork)
- **Website**: [nerve.network](https://nerve.network)

---

## Repository structure

| Path | Description |
|------|-------------|
| [agent-payment-framework/](agent-payment-framework/) | Agent payment framework docs: receiver / payer / decentralized / local accounts |
| [nerve rpc mcp/](nerve%20rpc%20mcp/) | Nerve RPC MCP server: exposes Nerve JSON-RPC / REST as MCP tools |
| [nerveswap sdk/](nerveswap%20sdk/) | NerveSwap JS SDK and Nerve public API reference |
| [.cursor/skills/nerve-agent-payment/](.cursor/skills/nerve-agent-payment/) | Cursor Skill: AI Agent quick integration with Nerve payments |

---

## Quick start

### 1. Clone the repository

```bash
git clone https://github.com/NerveNetwork/nerve-agent.git
cd nerve-agent
```

### 2. Configure Nerve RPC MCP (for AI Agent chain queries)

```bash
cd "nerve rpc mcp"
npm install
npm run build
```

In your MCP client (Cursor, Claude Desktop, etc.), set the path (replace `<PATH_TO_NERVE_AGENT>` with your local `nerve-agent` directory):

```json
{
  "mcpServers": {
    "nerve-rpc": {
      "command": "node",
      "args": ["<PATH_TO_NERVE_AGENT>/nerve rpc mcp/dist/index.js"],
      "env": {
        "NERVE_API_BASE_URL": "https://api.nerve.network"
      }
    }
  }
}
```

### 3. Use the payment framework and Skill

- **Developers**: Read [agent-payment-framework/README.md](agent-payment-framework/README.md) for receive/pay flows, local accounts, and NerveSwap.
- **AI Agents**: Enable the project Skill `.cursor/skills/nerve-agent-payment/` in Cursor to use MCP tools and SDK for Nerve payment, receive, pay, and balance flows.

---

## Capabilities overview

- **Receiver**: Create Nerve address locally (e.g. `nerve-sdk-js`) → share address → query received amount and currency via MCP `nerve_get_balance_list` / `nerve_get_account_balance`.
- **Payer**: Query address assets via MCP → pay directly or swap via NerveSwap then pay (requires NerveSwap SDK + local/wallet signing).
- **Protocol**: Decentralized chain; accounts generated and managed locally, keys not custodial.
- **Nerve**: Suited for AI and high-frequency small payments — fast confirmation, no gas fees.

---

## Links

- [Nerve website](https://nerve.network)
- [NerveNetwork GitHub](https://github.com/NerveNetwork)
- [Nerve RPC MCP tools](nerve%20rpc%20mcp/README.md#mcp-tools)
- [Agent payment framework](agent-payment-framework/README.md)
- [MCP Registry](https://modelcontextprotocol.io/registry/about) (optional: publish Nerve RPC MCP)

---

## License

MIT
