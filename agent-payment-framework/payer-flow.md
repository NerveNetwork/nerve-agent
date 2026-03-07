# Payer flow (including NerveSwap)

## 1. Query payer address assets

Use **Nerve RPC MCP**:

- `nerve_get_balance_list(chainId, fromAddress)`  
  Returns all assets and balances (symbol, balance, etc.) for that address.

## 2. Pay directly (when you have enough of the target asset)

If the balance already includes the target asset and amount ≥ amount to pay:

- Use **NerveSwap SDK**:  
  `nerveswap.transfer.transfer({ provider, from, to, assetChainId, assetId, amount, remark, type, EVMAddress, pub })`
- Required: from (payer Nerve address), to (receiver Nerve address), assetChainId/assetId (asset), amount (smallest unit; e.g. 8 decimals ⇒ 1 NVT = 10^8), EVMAddress and pub (for signing).
- Signing must be done locally or in the Agent (see README “Local signing and NerveSwap”).

## 3. Pay after swapping via NerveSwap

When you don’t have the target asset or have insufficient amount:

1. **Quote**  
   `swap.getSwapInfo({ fromAssetKey, toAssetKey, amount, direction })`  
   - fromAssetKey / toAssetKey format: `chainId-assetId` (e.g. `9-1`)  
   - direction: `from` = “given from-asset amount, compute to-asset amount”; `to` = opposite.  
   Returns estimated output, price impact, routes, fees.

2. **Execute swap**  
   `swap.swapTrade({ provider, from, fromAssetKey, toAssetKey, amount, slippage, remark, EVMAddress, pub })`  
   Use the same signing approach as for transfer.

3. **Transfer to receiver**  
   Use `nerveswap.transfer.transfer(...)` to send the swapped asset to the `to` address.

## 4. Asset key and RPC params

- On Nerve, assets are identified by chainId + assetId; in NerveSwap they are often written as key: `chainId-assetId` (e.g. `9-1`).
- RPC single-asset balance: `nerve_get_account_balance(chainId, assetChainId, assetId, address)`; chainId is the chain ID (Nerve mainnet usually 9), assetChainId/assetId are the asset’s chain ID and asset ID.

## 5. Flow summary

```
nerve_get_balance_list → have target asset and enough? → transfer.transfer (direct pay)
                        → else → getSwapInfo (quote) → swapTrade (swap) → transfer.transfer (pay)
```

All signing (transfer, swapTrade) is done locally or in the Agent secure module; the private key never leaves the device.
