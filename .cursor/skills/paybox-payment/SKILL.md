---
name: paybox-payment
description: >
  Use for PayBox multi-chain payment collection integration: let users pay from Ethereum, BSC, Polygon, TRON, NULS,
  NERVE and automatically receive USDT on your Nerve address. Covers PayBox setup, payment page invocation, webhook
  callback signature verification, and order query APIs.
  Triggers: "PayBox", "multi-chain collect", "cross-chain payment", "Nabox payment", "receive from any chain",
  "paybox-payment", "merchant collection", "collect USDT", "cross-chain receive", "Nabox ID".
---

# PayBox Multi-Chain Payment Collection

PayBox lets merchants accept payment from **any supported blockchain** — users pay with their on-chain assets (ETH, BNB, MATIC, TRX, NULS, NVT, etc.), PayBox cross-chain swaps via SwapBox, and you receive **USDT on your Nerve address**. No slippage worry for the merchant.

- **Docs**: [nabox.gitbook.io/nabox/paybox-open-api](https://nabox.gitbook.io/nabox/paybox-open-api)
- **Related skill**: `nerve-agent-payment` — for creating and managing the Nerve collection address

---

## Supported Payment Chains

Users can pay from: **Ethereum**, **BSC**, **Polygon**, **TRON**, **NULS**, **NERVE** (more may be added).

---

## Prerequisites — One-Time Setup

### 1. Register Nabox ID (get your collection address)

| Environment | URL |
|-------------|-----|
| Testnet     | https://beta.id.nabox.io |
| Mainnet     | https://id.nabox.io |

Your Nerve address linked to the Nabox ID is your **collection address** — the address where USDT lands after PayBox cross-chain exchange.

To create a Nerve address: use `nerve-sdk-js` (see `nerve-agent-payment` skill) or the Nabox wallet.

### 2. Configure callback URL

Provide your callback (webhook) URL to PayBox/Nabox during registration. PayBox POSTs payment notifications to this URL.

### 3. Create a PayBox cashier (via Nabox dashboard)

After registration you can generate a payment QR code or cashier link for your business.

---

## Integration Setup Checklist

- [ ] Nabox ID registered (testnet + mainnet)
- [ ] Nerve collection address noted from Nabox ID
- [ ] Callback URL configured in Nabox dashboard
- [ ] PayBox API base URL obtained from Nabox dashboard (shown as `%URL%` in docs — confirm from dashboard)
- [ ] Webhook endpoint implemented and deployed (reachable from internet)
- [ ] Signature verification logic tested against testnet callbacks

---

## Business Flow

```
1. Your app creates unique order number (outerOrderNo)
2. Redirect / link user to PayBox payment page with order params
3. User chooses payment chain + asset on PayBox UI and completes transaction
4. PayBox cross-chain swaps to USDT → deposits to your Nerve collection address
5. PayBox POSTs callback to your webhook URL (twice: chain confirm + arrival)
6. Your webhook verifies ECDSA signature → marks order as paid → returns "SUCCESS"
7. (Optional) Poll order status via Query API for reconciliation
```

---

## 1. Payment Page Invocation

Open or redirect to the PayBox payment page with your order parameters.

| Environment | Payment Page URL |
|-------------|-----------------|
| Testnet     | `https://dev.web.paybox.id.nabox.io/pay` |
| Mainnet     | `https://paybox.id.nabox.io/pay` |

**Page parameters** (passed as query string or as configured by Nabox):

> The official docs mark page parameters as `[Specify the required page parameters here]` — get the exact parameter list from your Nabox dashboard or Nabox support. Based on the business flow, expect:
> - `outerOrderNo` — your unique business order number
> - `amount` — USDT amount to collect
> - `chain` — preferred payment chain (optional, let user choose)
> - Additional merchant identity params as provided by Nabox

Example (inferred pattern):
```
https://paybox.id.nabox.io/pay?outerOrderNo=ORDER123&amount=10&chain=BSC
```

---

## 2. Webhook Callback — Receive Payment Notifications

PayBox POSTs to your callback URL when:
- Payment chain transaction is **confirmed** (once, regardless of success)
- USDT **arrives at your collection address** (retried until `SUCCESS` returned)

**Request**: `POST application/json`

### Callback payload

```typescript
interface PayBoxCallback {
  outerOrderNo: string;      // Your business order number
  orderNo: string;           // PayBox internal order number
  fromTxHash: string;        // Payment chain tx hash
  fromAmount: Coin;          // Asset user paid
  fromAddress: string;       // User's payment address
  fromChain: string;         // Payment chain (e.g. "BSC", "TRON")
  toAmount: Coin;            // USDT amount received
  payeeFee: Coin;            // Merchant fee deducted
  toTxHash: string;          // Tx hash on collection chain
  toAddress: string;         // Your Nerve collection address
  fromTimestamp: number;     // Payment time (unix seconds)
  toTimestamp: number;       // Arrival time (unix seconds)
  txState: TxState;          // Transaction status
  sign: string;              // ECDSA DER signature (hex)
  sendTime: number;          // Notification send time (unix seconds)
}

interface Coin {
  symbol: string;   // e.g. "USDTN"
  amount: string;   // decimal string e.g. "10.5"
  cent: string;     // smallest unit e.g. "10500000000000000000"
  decimal: number;  // decimal places e.g. 18
}

type TxState = "Unsent" | "Panding" | "SourceConfirm" | "Confirm" | "Fail";
```

### Order status meanings

| TxState        | Meaning                              |
|----------------|--------------------------------------|
| `Unsent`       | Order created, not yet paid          |
| `Panding`      | Payment chain confirming             |
| `SourceConfirm`| Payment chain tx confirmed           |
| `Confirm`      | USDT sent to your collection address |
| `Fail`         | Transaction failed                   |

### Signature verification

PayBox signs callbacks with ECDSA. Verify to prevent spoofing.

**Signed content**: `outerOrderNo + sendTime` (string concatenation, UTF-8 bytes)

**Algorithm**: ECDSA secp256k1 (DER-encoded signature)

**Public keys**:
| Environment | Public Key |
|-------------|-----------|
| Testnet | `02a6b09b370bf0588e67547f1a5c375cf2d78c5af89a0ced775365ffecb517d8df` |
| Mainnet | `02b4bcc1ecbe8785fba3d592fea4dc74e9071fa7399a72cd43993046682c877261` |

#### Java (recommended — matches official example exactly)

```xml
<!-- pom.xml -->
<dependency>
  <groupId>network.nerve</groupId>
  <artifactId>nerve-sdk4j</artifactId>
  <version>1.2.5</version>
</dependency>
```

```java
import io.nuls.core.crypto.ECKey;
import io.nuls.core.parse.HexUtil;
import java.nio.charset.StandardCharsets;

boolean verifySignature(String outerOrderNo, long sendTime, String sign, boolean isTestnet) {
    String pubKeyHex = isTestnet
        ? "02a6b09b370bf0588e67547f1a5c375cf2d78c5af89a0ced775365ffecb517d8df"
        : "02b4bcc1ecbe8785fba3d592fea4dc74e9071fa7399a72cd43993046682c877261";
    byte[] pubKey  = HexUtil.decode(pubKeyHex);
    byte[] key     = (outerOrderNo + sendTime).getBytes(StandardCharsets.UTF_8);
    byte[] signBytes = HexUtil.decode(sign);
    return ECKey.verify(key, signBytes, pubKey);
}
```

#### Node.js / TypeScript

```bash
npm i secp256k1 @noble/hashes
```

```typescript
import * as secp256k1 from 'secp256k1';

// PayBox uses raw-bytes ECDSA (bitcoinj ECKey.verify passes raw bytes to signer)
// Signature is DER-encoded; convert to r,s format for secp256k1 npm package
// IMPORTANT: test against actual testnet callbacks to confirm hash scheme

function verifyPayBoxSignature(
  outerOrderNo: string,
  sendTime: number,
  sign: string,
  isTestnet = true,
): boolean {
  const pubKeyHex = isTestnet
    ? '02a6b09b370bf0588e67547f1a5c375cf2d78c5af89a0ced775365ffecb517d8df'
    : '02b4bcc1ecbe8785fba3d592fea4dc74e9071fa7399a72cd43993046682c877261';
  try {
    const pubKey  = Buffer.from(pubKeyHex, 'hex');
    const message = Buffer.from(`${outerOrderNo}${sendTime}`, 'utf8');
    const sigDER  = Buffer.from(sign, 'hex');
    // Convert DER → compact 64-byte signature for secp256k1 library
    const sigCompact = secp256k1.signatureImport(sigDER);
    return secp256k1.ecdsaVerify(sigCompact, message, pubKey);
  } catch {
    return false;
  }
}
```

> If verification fails, also try SHA256(message) as the hash — bitcoinj's ECKey may pre-hash internally depending on the version used. Validate against the [Java demo](https://oit.oss-cn-hangzhou.aliyuncs.com/paybox-demo.tgz).

### Webhook handler example (Express.js)

```typescript
import express from 'express';
const app = express();
app.use(express.json());

app.post('/paybox/callback', (req, res) => {
  const { outerOrderNo, sendTime, sign, txState, toAmount } = req.body;

  // 1. Verify signature
  const valid = verifyPayBoxSignature(outerOrderNo, sendTime, sign, IS_TESTNET);
  if (!valid) {
    return res.status(200).send('FAIL');  // PayBox expects 200 always
  }

  // 2. Handle by state
  if (txState === 'Confirm') {
    // Payment complete — mark order paid
    await markOrderPaid(outerOrderNo, toAmount.amount);
  }

  // 3. Return SUCCESS so PayBox stops retrying
  res.status(200).send('SUCCESS');
});
```

> **Critical**: Always return HTTP 200. Return `SUCCESS` to stop retries; return `FAIL` to trigger retry.

---

## 3. Query APIs

Use to display payment status, reconcile orders, or build payment UIs.

> **API base URL**: Shown as `%URL%` in official docs — obtain the actual URL from your Nabox merchant dashboard.

### 3.1 Get Supported Chains

```
GET {PAYBOX_API_BASE}/chains
```

Response:
```json
{
  "code": 0,
  "data": [
    { "chain": "Ethereum", "logo": "https://files.nabox.io/icon/Ethereum.png" },
    { "chain": "BSC",      "logo": "https://files.nabox.io/icon/BSC.png" },
    { "chain": "Polygon",  "logo": "https://files.nabox.io/icon/Polygon.png" },
    { "chain": "TRON",     "logo": "https://files.nabox.io/icon/tron.png" },
    { "chain": "NULS",     "logo": "https://files.nabox.io/icon/Nuls.png" },
    { "chain": "NERVE",    "logo": "https://files.nabox.io/icon/NERVE.png" }
  ]
}
```

### 3.2 Get Supported Assets for a Chain

```
GET {PAYBOX_API_BASE}/{chain}/assets
```

Example: `GET .../NERVE/assets`

Response:
```json
{
  "code": 0,
  "data": [
    { "assetId": "93043", "symbol": "NULS",  "logo": "..." },
    { "assetId": "93059", "symbol": "NVT",   "logo": "..." }
  ]
}
```

### 3.3 Calculate Exchange Price

```
GET {PAYBOX_API_BASE}/asset/price?chain={chain}&assetId={assetId}&quantity={usdtAmount}
```

- `chain`: payment chain name (from /chains)
- `assetId`: asset ID (from /{chain}/assets)
- `quantity`: USDT amount merchant wants to receive (default: 1)

Response:
```json
{
  "code": 0,
  "data": {
    "fromPayAmount": { "symbol": "NVT", "amount": "68.57", "cent": "6857450743", "decimal": 8 },
    "fee":           { "symbol": "NVT", "amount": "0",     "cent": "0",          "decimal": 8 }
  }
}
```

Use to show users how much they need to pay for a given USDT amount.

### 3.4 Query Order by Business Order Number

```
GET {PAYBOX_API_BASE}/order/{collectionAddress}/{outerOrderNo}
```

- `collectionAddress`: your Nerve collection address
- `outerOrderNo`: your business order number

Response includes full order details: `txState`, `fromAmount`, `toAmount`, `payeeFee`, timestamps, tx hashes.

---

## 4. Complete TypeScript API Client

```typescript
const PAYBOX_API = process.env.PAYBOX_API_BASE!; // from Nabox dashboard

async function payboxGet<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYBOX_API}${path}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`PayBox API error: ${json.msg}`);
  return json.data;
}

// Usage
const chains     = await payboxGet<Chain[]>('/chains');
const assets     = await payboxGet<Asset[]>(`/NERVE/assets`);
const price      = await payboxGet<PriceData>('/asset/price?chain=BSC&assetId=93043&quantity=10');
const order      = await payboxGet<Order>(`/order/${COLLECTION_ADDRESS}/${outerOrderNo}`);
```

---

## 5. Testnet vs Mainnet Reference

| | Testnet | Mainnet |
|--|---------|---------|
| Nabox ID | https://beta.id.nabox.io | https://id.nabox.io |
| Payment page | https://dev.web.paybox.id.nabox.io/pay | https://paybox.id.nabox.io/pay |
| Callback pubkey | `02a6b09b...d8df` | `02b4bcc1...7261` |
| API base URL | From Nabox dashboard (testnet) | From Nabox dashboard (mainnet) |
| Nerve chainId | 261 (TNVT prefix) | 9 (NVT prefix) |

---

## 6. Integration Checklist (pre-launch)

- [ ] Testnet integration working end-to-end
- [ ] Webhook signature verified against real testnet callback
- [ ] `SUCCESS` / `FAIL` response logic correct (idempotency on retry)
- [ ] `outerOrderNo` uniqueness enforced in your system
- [ ] Order status tracked: `Unsent` → `Panding` → `SourceConfirm` → `Confirm`
- [ ] `Confirm` state triggers fulfillment in your app
- [ ] `Fail` state handled (show user retry option)
- [ ] Reconciliation: poll `/order` for any missed callbacks

---

## Further Reading

- PayBox docs: [nabox.gitbook.io/nabox/paybox-open-api](https://nabox.gitbook.io/nabox/paybox-open-api)
- Java demo: [oit.oss-cn-hangzhou.aliyuncs.com/paybox-demo.tgz](https://oit.oss-cn-hangzhou.aliyuncs.com/paybox-demo.tgz)
- Create Nerve address: see `nerve-agent-payment` skill
- Nerve RPC MCP: [nerve rpc mcp/README.md](https://github.com/NerveNetwork/nerve-agent/blob/main/nerve%20rpc%20mcp/README.md)
