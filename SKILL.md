---
name: nerve-agent-payment
description: Integrates AI Agents with Nerve network for payments—create/validate addresses, check balances and assets, receive and pay. Uses Nerve RPC MCP for read-only queries and refers to NerveSwap SDK for transfers and swaps. Use when the user or agent needs Nerve payment, receiving, paying, balance check, Nerve address, or NerveSwap.
---

# Nerve Agent payment integration

Use Nerve as **native payment** in AI Agents: no gas, fast confirmation, decentralized, locally managed accounts.

- **Nerve**: [nerve.network](https://nerve.network) · **GitHub**: [NerveNetwork](https://github.com/NerveNetwork) · **Repo**: [nerve-agent](https://github.com/NerveNetwork/nerve-agent)

## When to use this Skill

- User or Agent needs: receive, pay, check balance, create/validate Nerve address, NerveSwap.
- Add “economic” capability to the Agent using Nerve (no gas, suited for high-frequency small payments).

## Prerequisites

- **Nerve RPC MCP** is configured and available (tools: `nerve_info`, `nerve_get_balance_list`, `nerve_get_account_balance`, `nerve_validate_address`, `nerve_get_tx`, etc.).
- Nerve mainnet chainId is usually **9**; assets use assetChainId + assetId or key `chainId-assetId` (e.g. `9-1`).

## Receiver: create address, receive, query amount and currency

### 1. Create address

- **Local (recommended)**: Use `nerve-sdk-js` (`nerve.newAddress(chainId, password, prefix)` or `nerve.importByKey(...)`). Mainnet chainId is usually 9; see official docs for prefix.
- **With EVM wallet**: Use NerveSwap SDK `getAccount({ provider, address, message })` to get `address.NERVE` and `pub`.
- Keep the private key only locally or in Agent secure storage; no custody.

### 2. How to receive

- Share your **Nerve address** (e.g. `TNVT...`) with the payer; they send to that address.

### 3. Query received amount and currency (MCP only, no private key)

| Need | MCP tool | Example params |
|------|----------|----------------|
| All asset balances for address | `nerve_get_balance_list` | chainId=9, address=receive address |
| Single asset balance | `nerve_get_account_balance` | chainId, assetChainId, assetId, address |
| Validate address | `nerve_validate_address` | chainId=9, address |
| Chain/asset info | `nerve_info` | no params |

Use `nerve_get_balance_list` to see which currencies and amounts were received; use `nerve_get_account_balance` to confirm one currency.

## Payer: query balance, pay directly, pay after swap

### 1. Query payer address assets

- Call **nerve_get_balance_list**(chainId, fromAddress) to get all assets and balances (symbol, balance, etc.).

### 2. Pay directly (when you have enough of the target asset)

- Use **NerveSwap SDK**: `nerveswap.transfer.transfer({ provider, from, to, assetChainId, assetId, amount, remark, type, EVMAddress, pub })`.
- Signing (provider + EVMAddress + pub) must be done locally/in the Agent; can be combined with nerve-sdk-js for local signing.

### 3. Pay after NerveSwap

- **Quote**: `swap.getSwapInfo({ fromAssetKey, toAssetKey, amount, direction })` (key format `chainId-assetId`).
- **Swap**: `swap.swapTrade({ provider, from, fromAssetKey, toAssetKey, amount, slippage, remark, EVMAddress, pub })`.
- **Transfer**: `nerveswap.transfer.transfer(...)` to send the swapped asset to the receiver.

All signing is done locally; the private key never leaves the device.

## Protocol and accounts

- **Decentralized**: Nerve is a public chain; assets and txs are confirmed on-chain.
- **Accounts**: Generated and managed locally (nerve-sdk-js or wallet); no custodial service.
- **Receive**: Share Nerve address and use RPC MCP to query balance and currency.
- **Pay**: Pay from address assets directly or after NerveSwap; signing is local.

## MCP tools quick reference

| Tool | Use |
|------|-----|
| nerve_info | Chain info, default asset, chainId |
| nerve_validate_address | Validate Nerve address |
| nerve_get_balance_list | All asset balances for an address (receive/pay) |
| nerve_get_account_balance | Single asset balance for an address |
| nerve_get_tx | Transaction by hash |
| nerve_jsonrpc | Call any Nerve JSON-RPC method |

## Amounts and precision

- On-chain amounts are usually in **smallest units** (e.g. 8 decimals ⇒ 1 NVT = 10^8). Use smallest units when calling RPC/SDK; divide by 10^decimals when showing to users.

## Further reading

- Full payment framework: [agent-payment-framework/README.md](https://github.com/NerveNetwork/nerve-agent/blob/main/agent-payment-framework/README.md)
- Receiver flow: [receiver-flow.md](https://github.com/NerveNetwork/nerve-agent/blob/main/agent-payment-framework/receiver-flow.md)
- Payer and swap flow: [payer-flow.md](https://github.com/NerveNetwork/nerve-agent/blob/main/agent-payment-framework/payer-flow.md)
- Nerve RPC MCP tools: [nerve rpc mcp/README.md](https://github.com/NerveNetwork/nerve-agent/blob/main/nerve%20rpc%20mcp/README.md)
- NerveSwap API: [NerveSwap JS SDK.md](https://github.com/NerveNetwork/nerve-agent/blob/main/nerveswap%20sdk/NerveSwap%20JS%20SDK.md)
