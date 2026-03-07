---
name: nerve-agent-payment
description: >
  Use for ANY Nerve blockchain payment task: create Nerve address, validate address, check NVT/asset balance,
  receive crypto, pay on-chain, transfer tokens, swap via NerveSwap, query transaction, decentralized gas-free payment.
  Triggers: "Nerve payment", "Nerve address", "NVT", "receive crypto", "pay on-chain", "NerveSwap", "blockchain payment",
  "cross-chain swap", "Agent wallet", "no gas fee", "nerve-sdk-js", "nerve_get_balance_list".
license: MIT
compatibility: opencode
metadata:
  repo: https://github.com/NerveNetwork/nerve-agent
  category: blockchain-payment
  chain: nerve
---

# Nerve Agent Payment Integration

Nerve as **native payment layer** for AI Agents: no gas fees, fast confirmation (~2s), decentralized, locally managed accounts.

- **Nerve**: [nerve.network](https://nerve.network) · **Repo**: [NerveNetwork/nerve-agent](https://github.com/NerveNetwork/nerve-agent)

---

## Quick Decision — What Do You Need?

| Goal | Use |
|------|-----|
| Create / validate Nerve address | `nerve-sdk-js` (local) |
| Check received balance / which asset | `nerve_get_balance_list` (MCP) |
| Check one asset balance | `nerve_get_account_balance` (MCP) |
| Query chain info / tx | `nerve_info`, `nerve_get_tx` (MCP) |
| Transfer assets (pay) | NerveSwap SDK `transfer.transfer` |
| Swap then pay | NerveSwap SDK `swap.getSwapInfo` + `swap.swapTrade` + `transfer.transfer` |

---

## Prerequisites — Nerve RPC MCP

Add to your MCP client (Cursor, Claude Desktop, etc.) — replace `<PATH>` with your local `nerve-agent` dir:

```json
{
  "mcpServers": {
    "nerve-rpc": {
      "command": "node",
      "args": ["<PATH>/nerve rpc mcp/dist/index.js"],
      "env": { "NERVE_API_BASE_URL": "https://api.nerve.network" }
    }
  }
}
```

Or with npx (after npm publish): `"command": "npx", "args": ["-y", "nerve-rpc-mcp"]`

Build once: `cd "nerve rpc mcp" && npm install && npm run build`

---

## Receiver: Create Address → Receive → Confirm

### 1. Create Nerve address (local, non-custodial)

```bash
npm i nerve-sdk-js
```

```js
import nerve from 'nerve-sdk-js';

// Testnet
nerve.testnet();
const account = await nerve.newAddress(261, 'yourPassword', 'TNVT');
// account.address  → "TNVT..."
// account.pri      → private key (store securely, never expose)

// Mainnet
nerve.mainnet();
const acct = await nerve.newAddress(9, 'yourPassword', 'NVT');
```

Import from existing private key:
```js
const account = await nerve.importByKey(9, privateKey, 'yourPassword', 'NVT');
```

> **Security**: Private key and mnemonic stay on-device. Never upload or custody.

### 2. How to receive

Share your Nerve address (e.g. `TNVTdTSP...`) with the payer. They send any Nerve-supported asset to it.

### 3. Confirm received amount (MCP — no private key needed)

```
// All assets for an address (which currencies + how much)
nerve_get_balance_list(chainId=9, address="TNVTdTSP...")

// Confirm one specific asset (e.g. NVT: assetChainId=9, assetId=1)
nerve_get_account_balance(chainId=9, assetChainId=9, assetId=1, address="TNVTdTSP...")

// Validate address before use
nerve_validate_address(chainId=9, address="TNVTdTSP...")

// Chain info (chainId, default asset, decimals, etc.)
nerve_info
```

> Asset key format: `chainId-assetId` (e.g. `9-1` = NVT on mainnet). On-chain amounts are in smallest units (8 decimals → 1 NVT = 100_000_000).

---

## Payer: Query → Direct Pay or Swap + Pay

### 1. Query payer's assets

```
nerve_get_balance_list(chainId=9, address="<payer address>")
```

Returns all assets and balances. Check if target asset exists and amount is sufficient.

### 2. Pay directly (have enough target asset)

```bash
npm i @nerve-finance/nerveswap-web3
```

```js
import { nerveswap } from '@nerve-finance/nerveswap-web3';

await nerveswap.transfer.transfer({
  provider,          // wallet provider (or local Provider via nerve-sdk-js)
  from: 'TNVT...',  // payer address
  to: 'TNVT...',    // receiver address
  assetChainId: 9,
  assetId: 1,        // NVT
  amount: '100000000', // 1 NVT in smallest unit (8 decimals)
  remark: 'payment',
  type: 1,
  EVMAddress: '0x...',
  pub: '<hex public key>',
});
```

### 3. Swap then pay (don't have target asset)

```js
// Step 1: Get quote
const info = await nerveswap.swap.getSwapInfo({
  fromAssetKey: '9-2',  // from asset (chainId-assetId)
  toAssetKey: '9-1',    // to NVT
  amount: '100000000',
  direction: 'from',    // 'from' = given from-amount, compute to-amount
});
// info.amountOut, info.priceImpact, info.routes, info.fee

// Step 2: Execute swap
await nerveswap.swap.swapTrade({
  provider, from, fromAssetKey: '9-2', toAssetKey: '9-1',
  amount: '100000000', slippage: 0.5, remark: 'swap',
  EVMAddress: '0x...', pub: '<hex pub>',
});

// Step 3: Transfer to receiver
await nerveswap.transfer.transfer({ provider, from, to, ... });
```

### 4. Local signing (no browser wallet)

For Agent / server use, wrap `nerve-sdk-js` as a local provider:
- **Option A**: Build + sign tx via `nerve-sdk-js`, broadcast with `nerve_jsonrpc("broadcastTx", [...])`.
- **Option B**: Implement Provider interface using `nerve-sdk-js`'s `exportKeyInfo` and sign method; pass to `transfer.transfer` / `swap.swapTrade`. Keep the private key only locally or in a secure module.

---

## MCP Tools Quick Reference

| Tool | Description |
|------|-------------|
| `nerve_info` | Chain info: chainId, default asset, decimals, address prefix |
| `nerve_validate_address` | Check if address is valid |
| `nerve_get_balance_list` | All asset balances for an address |
| `nerve_get_account_balance` | Single asset balance |
| `nerve_get_tx` | Transaction detail by hash |
| `nerve_get_latest_height` | Latest block height |
| `nerve_jsonrpc` | Call any Nerve JSON-RPC method (advanced) |
| `nerve_rest` | Call any Nerve REST endpoint |

---

## Amounts and Precision

- **NVT** (mainnet): 8 decimals → 1 NVT = `100_000_000` (smallest unit)
- **Other assets**: check `decimals` field in balance/info response
- Always use smallest units when calling SDK/RPC; divide by `10^decimals` for display

---

## Chain IDs

| Network | chainId | Address prefix |
|---------|---------|----------------|
| Mainnet | 9       | NVT            |
| Testnet | 261     | TNVT           |

---

## Further Reading

- Full payment framework: [agent-payment-framework/README.md](https://github.com/NerveNetwork/nerve-agent/blob/main/agent-payment-framework/README.md)
- Receiver flow detail: [receiver-flow.md](https://github.com/NerveNetwork/nerve-agent/blob/main/agent-payment-framework/receiver-flow.md)
- Payer and swap flow: [payer-flow.md](https://github.com/NerveNetwork/nerve-agent/blob/main/agent-payment-framework/payer-flow.md)
- NerveSwap JS SDK: [NerveSwap JS SDK.md](https://github.com/NerveNetwork/nerve-agent/blob/main/nerveswap%20sdk/NerveSwap%20JS%20SDK.md)
- Nerve Public API: [Nerve Public-Service API.md](https://github.com/NerveNetwork/nerve-agent/blob/main/nerveswap%20sdk/Nerve%20Public-Service%20API.md)
