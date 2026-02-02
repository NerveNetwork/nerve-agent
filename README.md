# Nerve Agent Payment Framework

Enables mainstream LLMs and Agents to use Nerve as **native payment**: fast payments, no gas fees, decentralized, locally generated and managed accounts.

- **Nerve**: [nerve.network](https://nerve.network)
- **GitHub**: [NerveNetwork](https://github.com/NerveNetwork) · This repo: [nerve-agent](https://github.com/NerveNetwork/nerve-agent)

---

## 1. Core principles

- **Decentralized protocol**: Nerve is a public chain; no custodial service.
- **Locally generated and managed accounts**: Keys and addresses are created on-device, not on a central server.
- **Receiver**: Create address → share receive address → query received amount and currency (via Nerve RPC).
- **Payer**: Pay with assets on the payer address, or swap via NerveSwap then pay.
- **Nerve**: Suited for AI and high-frequency small payments — fast confirmation, no gas fees.

---

## 2. Receiver flow

### 2.1 Create address

- **Option A (recommended, no wallet)**: Use `nerve-sdk-js` to generate address and key locally.
  - Install: `npm i nerve-sdk-js`
  - Mainnet: `nerve.mainnet()`; testnet: `nerve.testnet()`
  - New address: `nerve.newAddress(chainId, password, prefix)`
  - Import from key: `nerve.importByKey(chainId, privateKey, password, prefix)`
  - Nerve mainnet chainId is usually `9`; prefix e.g. `TNVT` (test) / `NVT` (mainnet — check docs).
- **Option B (with EVM/wallet)**: Use NerveSwap SDK `nerveswap.getAccount({ provider, address, message })` to get `address.NERVE` and `pub` for signing.

**Security**: Keep the private key only locally (or in Agent secure storage); do not upload or custody.

### 2.2 How to receive

1. Share your **Nerve address** (e.g. `TNVTxxx...`) with the payer.
2. The payer sends assets to that address (native or NerveSwap-supported tokens).

### 2.3 Query received amount and currency

Use **Nerve RPC MCP** (read-only, no private key):

- **All assets for an address**: `nerve_get_balance_list(chainId, address)` — returns balance, symbol, etc. per asset.
- **Single asset balance**: `nerve_get_account_balance(chainId, assetChainId, assetId, address)` — to confirm amount received for one currency.
- **Validate address**: `nerve_validate_address(chainId, address)` to ensure the address is valid.

**Chain and assets**: Nerve mainnet chainId is typically `9`; assets are identified by `assetChainId + assetId` or asset key (e.g. `9-1` for NVT). Use `nerve_info` or chain docs for details.

---

## 3. Payer flow

### 3.1 Pay directly with address assets

- Query balance via **Nerve RPC MCP**: `nerve_get_balance_list(chainId, fromAddress)`.
- If you already have enough of the target asset:
  - Use **NerveSwap SDK**: `nerveswap.transfer.transfer({ provider, from, to, assetChainId, assetId, amount, remark, type, EVMAddress, pub })`.
  - Signing (provider / private key) must be done locally or in the Agent; see “Local signing and NerveSwap” below.

### 3.2 Pay after swapping via NerveSwap

When the payer does not have the target asset or has insufficient amount:

1. **Quote**: NerveSwap SDK `swap.getSwapInfo({ fromAssetKey, toAssetKey, amount, direction })` → get output amount, price impact, routes, fees.
2. **Execute swap**: `swap.swapTrade({ provider, from, fromAssetKey, toAssetKey, amount, slippage, remark, EVMAddress, pub })`.
3. **Then transfer**: Use `nerveswap.transfer.transfer(...)` to send the swapped asset to the receiver.

Asset key format is `chainId-assetId` (e.g. `9-1` for NVT).

### 3.3 Local signing and NerveSwap

NerveSwap SDK `transfer` and `swap` expect a “provider + EVMAddress + pub” (typically from a browser wallet). For Agent/server use:

- **Option 1**: Use `nerve-sdk-js` to build and sign the transaction locally, then broadcast via RPC `broadcastTx` (must match Nerve tx format).
- **Option 2**: Implement a “local Provider”: use `nerve-sdk-js` (or compatible lib) to export public key and sign, wrap it as the provider interface expected by the SDK, then call `nerveswap.transfer.transfer` / `swap.swapTrade`. Keep the private key only locally or in a secure module.

This lets the payer complete “query balance → swap (optional) → transfer” on a local account.

---

## 4. Protocol and account summary

| Item | Description |
|------|-------------|
| Decentralized | Nerve is a public chain; assets and txs are confirmed by consensus. |
| Account creation | Locally via nerve-sdk-js or wallet; key never leaves the device. |
| Account management | Key/mnemonic stored by user or Agent; no custodial service. |
| Receive | Share Nerve address; use RPC MCP to query balance and currency. |
| Pay | Pay from address assets directly or after NerveSwap; signing is local. |

---

## 5. MCP vs SDK

- **Nerve RPC MCP**: Read-only. Chain info, blocks, address validation, balances, tx queries. No private key needed for “create/validate address, query receive”.
- **NerveSwap SDK**: Transfer, swap, liquidity. Requires signing (provider + EVMAddress + pub) for pay and swap; can be combined with nerve-sdk-js for local signing.
- **nerve-sdk-js**: Address generation, import, local signing; used for decentralized, local account management.

---

## 6. Docs and repository

| Doc | Description |
|-----|-------------|
| [README.md](README.md) | Framework overview (this file) |
| [receiver-flow.md](receiver-flow.md) | Receiver flow details |
| [payer-flow.md](payer-flow.md) | Payer and swap flow |
| [nerve rpc mcp/](../nerve%20rpc%20mcp/README.md) | Nerve RPC MCP tools and config |
| [nerveswap sdk/NerveSwap JS SDK.md](../nerveswap%20sdk/NerveSwap%20JS%20SDK.md) | NerveSwap JS SDK |
| [nerveswap sdk/Nerve Public-Service API.md](../nerveswap%20sdk/Nerve%20Public-Service%20API.md) | Nerve public API reference |

AI Agent quick integration: **Cursor Skill** [.cursor/skills/nerve-agent-payment/SKILL.md](../.cursor/skills/nerve-agent-payment/SKILL.md).  
Repository: <https://github.com/NerveNetwork/nerve-agent>.
