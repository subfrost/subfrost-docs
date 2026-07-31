---
title: History REST Endpoints
sidebar_label: History
sidebar_position: 5
description: REST endpoints for AMM transaction history, including swaps, mints, burns, and wraps.
---

# History REST Endpoints

Query transaction history for AMM operations including swaps, mints, burns, and wraps.

## get-pool-swap-history

Get swap transaction history for a specific pool.

**Endpoint:** `POST /get-pool-swap-history`

**Parameters:**

- `poolId` (object) - Pool ID with `block` and `tx` fields
- `count` (number, optional) - Limit results (default: 50)
- `offset` (number, optional) - Pagination offset

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-pool-swap-history \
  -H "Content-Type: application/json" \
  -d '{"poolId": {"block": "4", "tx": "1"}, "count": 50}'
```

---

## get-token-swap-history

Get swap history for a specific token across all pools.

**Endpoint:** `POST /get-token-swap-history`

**Parameters:**

- `alkaneId` (object) - Token ID with `block` and `tx` fields
- `count` (number, optional) - Limit results (default: 50)

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-token-swap-history \
  -H "Content-Type: application/json" \
  -d '{"alkaneId": {"block": "4", "tx": "65522"}, "count": 50}'
```

---

## get-pool-mint-history

Get liquidity add (mint) history for a pool.

**Endpoint:** `POST /get-pool-mint-history`

**Parameters:**

- `poolId` (object) - Pool ID with `block` and `tx` fields
- `count` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-pool-mint-history \
  -H "Content-Type: application/json" \
  -d '{"poolId": {"block": "4", "tx": "1"}, "count": 50}'
```

---

## get-pool-burn-history

Get liquidity remove (burn) history for a pool.

**Endpoint:** `POST /get-pool-burn-history`

**Parameters:**

- `poolId` (object) - Pool ID with `block` and `tx` fields
- `count` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-pool-burn-history \
  -H "Content-Type: application/json" \
  -d '{"poolId": {"block": "4", "tx": "1"}, "count": 50}'
```

---

## get-pool-creation-history

Get pool creation history.

**Endpoint:** `POST /get-pool-creation-history`

**Parameters:**

- `factoryId` (object) - Factory ID with `block` and `tx` fields
- `count` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-pool-creation-history \
  -H "Content-Type: application/json" \
  -d '{"factoryId": {"block": "4", "tx": "65522"}, "count": 50}'
```

---

## get-all-wrap-history

Get all BTC wrap transactions.

**Endpoint:** `POST /get-all-wrap-history`

**Parameters:**

- `count` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-all-wrap-history \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

---

## get-all-unwrap-history

Get all BTC unwrap transactions.

**Endpoint:** `POST /get-all-unwrap-history`

**Parameters:**

- `count` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-all-unwrap-history \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

---

## get-address-wrap-history

Get wrap history for a specific address.

**Endpoint:** `POST /get-address-wrap-history`

**Parameters:**

- `address` (string) - Bitcoin address
- `count` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-wrap-history \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "count": 50}'
```

---

## get-total-unwrap-amount

Get the total amount of BTC that has been unwrapped.

**Endpoint:** `POST /get-total-unwrap-amount`

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-total-unwrap-amount \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## get-address-unwrap-history

Get unwrap history for a specific address.

**Endpoint:** `POST /get-address-unwrap-history`

**Parameters:**

- `address` (string) - Bitcoin address
- `limit` (number, optional) - Limit results
- `page` (number, optional) - Page number

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-unwrap-history \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "limit": 50}'
```

---

## get-address-swap-history-for-pool

Get swap history for an address in a specific pool.

**Endpoint:** `POST /get-address-swap-history-for-pool`

**Parameters:**

- `address` (string) - Bitcoin address
- `poolId` (object) - Pool ID with `block` and `tx` fields
- `limit` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-swap-history-for-pool \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "poolId": {"block": "4", "tx": "1"}, "limit": 50}'
```

---

## get-address-swap-history-for-token

Get swap history for an address involving a specific token.

**Endpoint:** `POST /get-address-swap-history-for-token`

**Parameters:**

- `address` (string) - Bitcoin address
- `tokenId` (object) - Token ID with `block` and `tx` fields
- `limit` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-swap-history-for-token \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "tokenId": {"block": "4", "tx": "65522"}, "limit": 50}'
```

---

## get-address-pool-creation-history

Get pool creation history for an address.

**Endpoint:** `POST /get-address-pool-creation-history`

**Parameters:**

- `address` (string) - Bitcoin address
- `limit` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-pool-creation-history \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "limit": 50}'
```

---

## get-address-pool-mint-history

Get liquidity add (mint) history for an address.

**Endpoint:** `POST /get-address-pool-mint-history`

**Parameters:**

- `address` (string) - Bitcoin address
- `limit` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-pool-mint-history \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "limit": 50}'
```

---

## get-address-pool-burn-history

Get liquidity remove (burn) history for an address.

**Endpoint:** `POST /get-address-pool-burn-history`

**Parameters:**

- `address` (string) - Bitcoin address
- `limit` (number, optional) - Limit results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-pool-burn-history \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "limit": 50}'
```

---

## get-all-amm-tx-history

Get all AMM transactions (swaps, mints, burns, etc.).

**Endpoint:** `POST /get-all-amm-tx-history`

**Parameters:**

- `count` (number, optional) - Limit results
- `transactionType` (string, optional) - Filter by type: swap, mint, burn, creation, wrap, unwrap

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-all-amm-tx-history \
  -H "Content-Type: application/json" \
  -d '{"count": 50, "transactionType": "swap"}'
```

---

## get-all-address-amm-tx-history

Get all AMM transactions for a specific address.

**Endpoint:** `POST /get-all-address-amm-tx-history`

**Parameters:**

- `address` (string) - Bitcoin address
- `count` (number, optional) - Limit results
- `transactionType` (string, optional) - Filter by type

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-all-address-amm-tx-history \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "count": 50}'
```

---

## JavaScript Example

```javascript
class HistoryClient {
  constructor(apiKey, network = 'mainnet') {
    this.baseUrl = `https://${network}.subfrost.io/v4/api`;
    this.apiKey = apiKey;
  }

  async post(endpoint, body) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-subfrost-api-key': this.apiKey
      },
      body: JSON.stringify(body)
    });
    return (await response.json()).data;
  }

  async getPoolSwaps(poolBlock, poolTx, limit = 50) {
    return this.post('/get-pool-swap-history', {
      poolId: { block: String(poolBlock), tx: String(poolTx) },
      count: limit
    });
  }

  async getAddressHistory(address, limit = 100) {
    return this.post('/get-all-address-amm-tx-history', {
      address,
      count: limit
    });
  }

  async getTotalUnwrapped() {
    return this.post('/get-total-unwrap-amount', {});
  }
}

// Usage
const history = new HistoryClient('your-api-key');

const { swaps } = await history.getPoolSwaps(4, 1, 20);
console.log(`Last 20 swaps:`, swaps);

const { transactions } = await history.getAddressHistory('bc1p...', 100);
console.log(`User transactions:`, transactions);
```
