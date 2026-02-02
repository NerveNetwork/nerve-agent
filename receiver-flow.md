# Receiver flow (detailed)

## 1. Create address

- Use **nerve-sdk-js** to generate locally (non-custodial):
  - `nerve.mainnet()` or `nerve.testnet()`
  - `nerve.newAddress(chainId, password, prefix)` for a new address
  - or `nerve.importByKey(chainId, privateKey, password, prefix)` to import from private key
- Nerve mainnet chainId is usually `9`; prefix per official docs (e.g. TNVT/NVT).
- Store private key and mnemonic only locally or in Agent secure storage.

## 2. How to receive

- Share your **Nerve address** (e.g. `TNVT...`) with the payer.
- The payer sends any Nerve-supported asset to that address (including tokens obtained via NerveSwap).

## 3. Query received amount and currency (RPC only, no private key)

Via **Nerve RPC MCP**:

1. **All asset balances**  
   `nerve_get_balance_list(chainId, address)`  
   Returns balance, symbol, etc. per asset for that address (which currencies and how much).

2. **Single asset balance**  
   `nerve_get_account_balance(chainId, assetChainId, assetId, address)`  
   Use to confirm received amount for one currency (e.g. NVT).

3. **Address validation**  
   `nerve_validate_address(chainId, address)`  
   Ensure the address is valid before sharing.

4. **Chain and asset info**  
   `nerve_info` for chainId, default asset, etc.; asset key format is `chainId-assetId` (e.g. `9-1`).

## 4. Flow summary

```
Create address (local) → Share Nerve address → Payer sends → nerve_get_balance_list / nerve_get_account_balance to confirm
```
