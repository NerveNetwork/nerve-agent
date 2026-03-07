# PayBox Multi-Chain Collection Flow

Accept payments from **Ethereum, BSC, Polygon, TRON, NULS, NERVE** — receive USDT on your Nerve address automatically via PayBox cross-chain exchange.

- **PayBox docs**: [nabox.gitbook.io/nabox/paybox-open-api](https://nabox.gitbook.io/nabox/paybox-open-api)
- **Java demo**: [paybox-demo.tgz](https://oit.oss-cn-hangzhou.aliyuncs.com/paybox-demo.tgz)

---

## 1. How PayBox Works

```
User (any chain) ──pays──► PayBox ──SwapBox cross-chain exchange──► Merchant Nerve address (USDT)
```

1. Merchant registers a Nabox ID → linked Nerve address becomes the **collection address**
2. Merchant creates an order and redirects user to PayBox payment page
3. User pays with any supported on-chain asset
4. PayBox swaps to USDT via SwapBox and deposits to merchant's Nerve address
5. PayBox notifies merchant's callback URL; merchant verifies and fulfills

No slippage risk for the merchant. No need to handle multiple chains.

---

## 2. Setup (one-time)

### 2.1 Register Nabox ID

| | Testnet | Mainnet |
|--|---------|---------|
| Registration | https://beta.id.nabox.io | https://id.nabox.io |

Your Nerve address linked to Nabox ID is the **collection address** where USDT arrives.

Create a Nerve address if needed — see [receiver-flow.md](receiver-flow.md) or use the `nerve-agent-payment` skill.

### 2.2 Configure Callback URL

During Nabox ID setup, provide a publicly reachable HTTPS URL for PayBox to POST payment notifications.

### 2.3 Get API Base URL

The PayBox query API base URL is provided in your Nabox merchant dashboard (shown as `%URL%` in the public docs).

---

## 3. Payment Page Invocation

Redirect or link the user to the PayBox payment page:

| Environment | URL |
|-------------|-----|
| Testnet     | `https://dev.web.paybox.id.nabox.io/pay` |
| Mainnet     | `https://paybox.id.nabox.io/pay` |

Pass order parameters as query string (exact parameters confirmed from your Nabox dashboard):
- `outerOrderNo` — your unique business order number
- `amount` — USDT amount to collect
- Additional merchant/session params as specified by Nabox

---

## 4. Callback Notification

### 4.1 Payload

PayBox POSTs JSON to your callback URL on:
- Payment chain tx confirmed (once, regardless of outcome)
- USDT received at collection address (retried until `SUCCESS` returned)

```json
{
  "outerOrderNo": "A10001231023154807",
  "orderNo": "A10001230925165043",
  "fromTxHash": "dec04090...",
  "fromAmount": { "symbol": "NVT", "amount": "63.20", "cent": "6320416992", "decimal": 8 },
  "fromAddress": "TNVTdTSP...",
  "fromChain": "NERVE",
  "toAmount": { "symbol": "USDTN", "amount": "0.198", "cent": "198000000000000000", "decimal": 18 },
  "payeeFee": { "symbol": "USDTN", "amount": "0.00786913", "cent": "7869133898641243", "decimal": 18 },
  "toTxHash": "b9a6930b...",
  "toAddress": "TNVTdTSP...",
  "fromTimestamp": 1695631846,
  "toTimestamp": 1695631887,
  "txState": "Confirm",
  "sign": "304402...",
  "sendTime": 1699004550
}
```

### 4.2 Order Status (TxState)

| State          | Meaning                              |
|----------------|--------------------------------------|
| `Unsent`       | Order created, user hasn't paid yet  |
| `Panding`      | Payment chain confirming             |
| `SourceConfirm`| Payment chain tx confirmed           |
| `Confirm`      | USDT sent to your collection address |
| `Fail`         | Transaction failed                   |

Fulfill the order only on `Confirm`.

### 4.3 Signature Verification

**Algorithm**: ECDSA secp256k1  
**Signed content**: `{outerOrderNo}{sendTime}` (UTF-8 string → bytes, no extra hashing by caller)  
**Signature format**: DER-encoded hex  

| Environment | Verification Public Key |
|-------------|------------------------|
| Testnet | `02a6b09b370bf0588e67547f1a5c375cf2d78c5af89a0ced775365ffecb517d8df` |
| Mainnet | `02b4bcc1ecbe8785fba3d592fea4dc74e9071fa7399a72cd43993046682c877261` |

**Java** (using `nerve-sdk4j` or `bitcoinj-core`):

```java
byte[] pubKey = HexUtil.decode("<pubkey hex>");
String key    = outerOrderNo + sendTime;   // e.g. "A10001231023154807" + 1699004550
byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
byte[] sign   = HexUtil.decode(req.getSign());
boolean valid = ECKey.verify(keyBytes, sign, pubKey);
```

### 4.4 Response

Return `SUCCESS` (HTTP 200, plain text body) to stop retries.  
Return `FAIL` to trigger retry. Always HTTP 200 — never 4xx/5xx.

---

## 5. Query APIs

Use your API base URL (from Nabox dashboard) for all queries.

### 5.1 Get Supported Chains

```
GET {PAYBOX_API_BASE}/chains
```

Returns list of `{ chain, logo }` objects. Current chains: Ethereum, BSC, Polygon, TRON, NULS, NERVE.

### 5.2 Get Assets for a Chain

```
GET {PAYBOX_API_BASE}/{chain}/assets
```

Returns list of `{ assetId, symbol, logo }`. Use `assetId` for price calculation.

### 5.3 Calculate Exchange Price

```
GET {PAYBOX_API_BASE}/asset/price?chain={chain}&assetId={assetId}&quantity={usdtAmount}
```

Returns `{ fromPayAmount: Coin, fee: Coin }` — how much of the payment asset the user needs to pay for `quantity` USDT.

Example: How much NVT to pay for 10 USDT?
```
GET .../asset/price?chain=NERVE&assetId=93059&quantity=10
→ { fromPayAmount: { symbol:"NVT", amount:"68.57", decimal:8 }, fee: { ... } }
```

### 5.4 Query Order Status

```
GET {PAYBOX_API_BASE}/order/{collectionAddress}/{outerOrderNo}
```

Returns full order details including `txState`, amounts, chain info, tx hashes, and timestamps.

---

## 6. Flow Summary

```
Register Nabox ID → note collection address
                 → configure callback URL
                 → obtain API base URL

Per payment:
  Generate outerOrderNo (unique)
  ──► Redirect user to PayBox payment page
  ◄── User completes payment
  ◄── PayBox POSTs callback (verify signature → mark paid → return SUCCESS)
  (Optional) Poll GET /order/{address}/{outerOrderNo} for reconciliation
```

---

## 7. Related Docs

| Doc | Description |
|-----|-------------|
| [README.md](README.md) | Nerve Agent Payment Framework overview |
| [receiver-flow.md](receiver-flow.md) | Create Nerve address, receive, query balance |
| [payer-flow.md](payer-flow.md) | Pay directly or after NerveSwap |
| [.cursor/skills/paybox-payment/SKILL.md](../.cursor/skills/paybox-payment/SKILL.md) | AI Agent skill for PayBox integration |
| [.cursor/skills/nerve-agent-payment/SKILL.md](../.cursor/skills/nerve-agent-payment/SKILL.md) | AI Agent skill for Nerve payment |
