# Nerve Agent — AI Payment Framework & MCP

[Nerve](https://nerve.network) **Agent payment framework** and **Nerve RPC MCP** for developers and AI Agents: receive, pay, swap, and query balances. Decentralized protocol, locally generated and managed accounts, no gas fees, fast confirmation.

Also includes **PayBox** integration: accept payments from Ethereum, BSC, Polygon, TRON, NULS, NERVE — receive USDT on your Nerve address automatically.

- **GitHub**: [NerveNetwork](https://github.com/NerveNetwork)
- **Website**: [nerve.network](https://nerve.network)

---

## Repository Structure

| Path | Description |
|------|-------------|
| [agent-payment-framework/](agent-payment-framework/) | Payment framework docs: receiver / payer / PayBox / local accounts |
| [nerve rpc mcp/](nerve%20rpc%20mcp/) | Nerve RPC MCP server: exposes Nerve JSON-RPC / REST as MCP tools |
| [nerveswap sdk/](nerveswap%20sdk/) | NerveSwap JS SDK and Nerve public API reference |
| [.cursor/skills/nerve-agent-payment/](.cursor/skills/nerve-agent-payment/) | AI Skill: Nerve receive, pay, balance, address, NerveSwap |
| [.cursor/skills/paybox-payment/](.cursor/skills/paybox-payment/) | AI Skill: PayBox multi-chain collection via Nerve address |

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/NerveNetwork/nerve-agent.git
cd nerve-agent
```

### 2. Build and configure Nerve RPC MCP

```bash
cd "nerve rpc mcp"
npm install
npm run build
```

Add to your MCP client config (Cursor, Claude Desktop, etc.) — replace `<PATH_TO_NERVE_AGENT>`:

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

### 3. Install AI Skills

Skills are stored in `.opencode/skills/` (OpenCode-native) and `.cursor/skills/` (Cursor-compatible).

**Project level** (auto-loaded when you open this repo in OpenCode or Cursor):

```bash
git clone https://github.com/NerveNetwork/nerve-agent.git
# Skills are detected automatically in .opencode/skills/ and .cursor/skills/
```

**User-wide** (available in all your projects):

#### OpenCode / OpenClaw (native path)

```bash
mkdir -p ~/.config/opencode/skills/nerve-agent-payment
curl -o ~/.config/opencode/skills/nerve-agent-payment/SKILL.md \
  https://raw.githubusercontent.com/NerveNetwork/nerve-agent/main/.opencode/skills/nerve-agent-payment/SKILL.md

mkdir -p ~/.config/opencode/skills/paybox-payment
curl -o ~/.config/opencode/skills/paybox-payment/SKILL.md \
  https://raw.githubusercontent.com/NerveNetwork/nerve-agent/main/.opencode/skills/paybox-payment/SKILL.md
```

#### Cursor

```bash
mkdir -p ~/.cursor/skills/nerve-agent-payment
curl -o ~/.cursor/skills/nerve-agent-payment/SKILL.md \
  https://raw.githubusercontent.com/NerveNetwork/nerve-agent/main/.cursor/skills/nerve-agent-payment/SKILL.md

mkdir -p ~/.cursor/skills/paybox-payment
curl -o ~/.cursor/skills/paybox-payment/SKILL.md \
  https://raw.githubusercontent.com/NerveNetwork/nerve-agent/main/.cursor/skills/paybox-payment/SKILL.md
```

> After installing, restart your AI client. Skills auto-load when relevant tasks are detected.

Also add a `npx` MCP config (after publishing to npm):

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

---

## Skills Overview

### `nerve-agent-payment`

AI skill for Nerve blockchain payment integration.

**Triggers automatically when**: creating Nerve address, checking NVT balance, receiving crypto, paying on-chain, using NerveSwap, building Agent wallets.

**Covers**:
- Create / validate Nerve address (nerve-sdk-js, non-custodial)
- Query received amounts by asset (Nerve RPC MCP)
- Pay directly with address assets (NerveSwap SDK)
- Swap then pay (NerveSwap SDK)
- Local signing for Agent/server use
- MCP tools quick reference and setup

### `paybox-payment`

AI skill for PayBox multi-chain payment collection.

**Triggers automatically when**: accepting payments from multiple chains, integrating PayBox, handling cross-chain collection, verifying PayBox webhook callbacks, querying PayBox orders.

**Covers**:
- Prerequisites: Nabox ID registration, collection address, callback URL
- Payment page invocation (testnet + mainnet URLs)
- Webhook signature verification (ECDSA, Java + TypeScript examples)
- Query APIs: chains, assets, price, order status
- Integration checklist
- TypeScript API client example

---

## Capabilities Overview

- **Receiver (Nerve)**: Create address locally → share → query received currency and amount via MCP.
- **Payer (Nerve)**: Query assets via MCP → pay directly or swap via NerveSwap then pay.
- **PayBox Merchant**: Register Nabox ID → accept payments from 6+ chains → receive USDT on Nerve.
- **Protocol**: Decentralized; accounts generated and managed locally, keys never custodial.
- **Nerve**: Fast confirmation (~2s), no gas fees — suited for AI and high-frequency payments.

---

## Links

- [Nerve website](https://nerve.network)
- [NerveNetwork GitHub](https://github.com/NerveNetwork)
- [Agent payment framework](agent-payment-framework/README.md)
- [PayBox flow](agent-payment-framework/paybox-flow.md)
- [PayBox API docs](https://nabox.gitbook.io/nabox/paybox-open-api)
- [Nerve RPC MCP](nerve%20rpc%20mcp/README.md)
- [NerveSwap JS SDK](nerveswap%20sdk/NerveSwap%20JS%20SDK.md)

---

## Pushing to GitHub

```bash
git remote add origin https://github.com/NerveNetwork/nerve-agent.git
git branch -M main
git push -u origin main
```

Add **Topics**: `nerve`, `mcp`, `blockchain`, `agent`, `payment`, `nerveswap`, `paybox`, `cross-chain`.

---

## License

MIT
