---
title: Orderbook (Beta)
sidebar_label: Overview
sidebar_position: 1
description: A live read and stream API over the off-chain PSBT order books for orbitals and lending.
---

# Orderbook (Beta)

> **⚠️ Beta: new features in progress.** The Orderbook API is under active
> development. Endpoints, payload shapes, market identifiers, and semantics may
> change without notice. Treat it as preview; don't build production-critical
> flows on it yet.

The Subfrost **Orderbook API** is a live read + stream surface over the
off-chain **PSBT order books** that settle on Bitcoin via alkanes. It gives you
real-time snapshots (REST) and a firehose (WebSocket) of open orders across two
sources:

- **orbitals**: orbital NFT ↔ DIESEL listings and offers (module / collection markets)
- **lending**: pre-signed loan-offer PSBTs, creditor/debitor (asset-pair markets)

Subfrost is the source of truth for the underlying orders; this API is a
low-latency, read-optimized replica, so a delta you receive on the WebSocket is
always durably queryable via REST.

## Base URL

Every orderbook endpoint lives under your API key:

```
https://mainnet.subfrost.io/v4/YOUR_API_KEY/orderbook
```

Authentication is the same as the rest of the platform: the API key is a path
segment (see [Authentication](../getting-started/authentication)). Reads accept any active
key; the CDC ingest endpoint requires an admin key.

## Market model

Markets are addressed by a single flat **topic** string:

```
<source>:<network>:<scope>:<key>
```

| Scope | Meaning | Example topic |
|-------|---------|---------------|
| `book` | the whole book for a source | `orbitals:mainnet:book:*` |
| `module` | an orbitals module | `orbitals:mainnet:module:fire-pos` |
| `collection` | an orbitals collection (alkane id) | `orbitals:mainnet:collection:2:100` |
| `loan-token` | all lending offers lending a token | `lending:mainnet:loan-token:2:0` |
| `pair` | a directional lending pair `(loan_collateral)` | `lending:mainnet:pair:2:0_32:0` |

> Pair topics are **directional** (`loanId_collateralId`) and are **not**
> sorted. Colons inside the `key` (alkane ids like `2:0`) are part of the topic;
> treat the whole topic as an opaque string.

Every order carries the full set of topics it belongs to, so a single
subscription (e.g. a pair) receives exactly the orders in that market, and the
whole-book topic receives everything.

## The order envelope

All orders (orbitals and lending, listings and offers) are normalized into one
shape:

```json
{
  "source": "lending",
  "id": "clx…",
  "network": "mainnet",
  "kind": "offer",
  "marketKey": "lending:mainnet:pair:2:0_32:0",
  "topics": ["lending:mainnet:book:*", "lending:mainnet:loan-token:2:0", "lending:mainnet:pair:2:0_32:0"],
  "side": "creditor",
  "makerAddress": "bc1q…",
  "status": "open",
  "price": "1200",
  "priceUnit": "apr-bp",
  "assets": [
    { "role": "loan", "tokenId": "2:0", "amountRaw": "1000000" },
    { "role": "collateral", "tokenId": "32:0", "amountRaw": "5" }
  ],
  "psbt": "cHNidP8B…",
  "createdAt": 1784592000000000,
  "updatedAt": 1784592000000000,
  "ext": { "aprBp": "1200", "durationBlocks": "144" }
}
```

| Field | Notes |
|-------|-------|
| `source` | `orbitals` \| `lending` |
| `kind` | `listing` \| `offer` |
| `side` | `sell`/`buy` (orbitals) or `creditor`/`debitor` (lending) |
| `status` | normalized: `open` · `matched` · `pending` · `filled` · `taken` · `cancelled` · `expired` · `removed` |
| `price` / `priceUnit` | orbitals: `DIESEL`; lending: `apr-bp`. String-encoded (may exceed 2⁵³). |
| `assets[]` | `{ role?, tokenId, amountRaw? }`: the token legs of the order |
| `psbt` | base64 PSBT for offers (the signable/settleable transaction) |
| `createdAt` / `updatedAt` | epoch **microseconds** |
| `ext` | source-specific fields (raw status, module data, apr/duration, …) |

Next: [REST endpoints](./rest) · [WebSocket firehose](./websocket).
