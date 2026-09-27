---
title: Orderbook REST
sidebar_label: REST API
sidebar_position: 2
description: REST endpoints for orderbook markets, market snapshots, and single orders.
---

# Orderbook REST

> **⚠️ Beta.** Shapes may change. See the [overview](./overview)
> for the market model and order envelope.

All endpoints are under `https://mainnet.subfrost.io/v4/YOUR_API_KEY/orderbook`.
Reads are `GET` and accept any active API key.

## `GET /orderbook/markets`

List the active markets with open-order counts.

```bash
curl "https://mainnet.subfrost.io/v4/YOUR_API_KEY/orderbook/markets"
```

```json
{
  "markets": [
    { "source": "lending", "network": "mainnet",
      "market_key": "lending:mainnet:pair:2:0_32:0", "open_orders": 3 },
    { "source": "orbitals", "network": "mainnet",
      "market_key": "orbitals:mainnet:module:fire-pos", "open_orders": 12 }
  ]
}
```

## `GET /orderbook/snapshot?market=<topic>`

The current active book for a market topic. Returns non-terminal orders
(`open` / `matched` / `pending`).

```bash
curl "https://mainnet.subfrost.io/v4/YOUR_API_KEY/orderbook/snapshot?market=lending:mainnet:pair:2:0_32:0"
```

```json
{
  "market": "lending:mainnet:pair:2:0_32:0",
  "orders": [ /* array of normalized order envelopes */ ]
}
```

Use any topic scope: a whole book (`orbitals:mainnet:book:*`), a module, a
collection, a loan-token, or a pair.

## `GET /orderbook/order/{source}/{id}`

Fetch a single order by its source + id.

```bash
curl "https://mainnet.subfrost.io/v4/YOUR_API_KEY/orderbook/order/lending/clx123abc"
```

Returns the normalized order envelope, or `404` if unknown.

## Errors

| Status | Meaning |
|--------|---------|
| `401` | invalid / inactive API key |
| `404` | order not found |
