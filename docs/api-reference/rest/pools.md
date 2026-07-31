---
title: Pools & AMM REST Endpoints
sidebar_label: Pools & AMM
sidebar_position: 3
description: REST endpoints for querying and interacting with alkanes AMM liquidity pools.
---

# Pools & AMM REST Endpoints

Query and interact with alkanes AMM liquidity pools.

## get-pools

List all liquidity pools for a factory.

**Endpoint:** `POST /get-pools`

**Parameters:**

- `factoryId` (object) - Factory ID with `block` and `tx` fields

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-pools \
  -H "Content-Type: application/json" \
  -d '{"factoryId": {"block": "4", "tx": "65522"}}'
```

---

## get-all-pools-details

Get detailed information for all pools.

**Endpoint:** `POST /get-all-pools-details`

**Parameters:**

- `factoryId` (object) - Factory ID with `block` and `tx` fields

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-all-pools-details \
  -H "Content-Type: application/json" \
  -d '{"factoryId": {"block": "4", "tx": "65522"}}'
```

---

## get-pool-details

Get detailed information about a specific pool.

**Endpoint:** `POST /get-pool-details`

**Parameters:**

- `factoryId` (object) - Factory ID with `block` and `tx` fields
- `poolId` (object) - Pool ID with `block` and `tx` fields

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-pool-details \
  -H "Content-Type: application/json" \
  -d '{"factoryId": {"block": "4", "tx": "65522"}, "poolId": {"block": "4", "tx": "1"}}'
```

---

## get-all-token-pairs

Get all available token pairs.

**Endpoint:** `POST /get-all-token-pairs`

**Parameters:**

- `factoryId` (object) - Factory ID with `block` and `tx` fields

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-all-token-pairs \
  -H "Content-Type: application/json" \
  -d '{"factoryId": {"block": "4", "tx": "65522"}}'
```

---

## get-token-pairs

Get pairs containing a specific token.

**Endpoint:** `POST /get-token-pairs`

**Parameters:**

- `factoryId` (object) - Factory ID with `block` and `tx` fields
- `alkaneId` (object) - Token ID with `block` and `tx` fields

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-token-pairs \
  -H "Content-Type: application/json" \
  -d '{"factoryId": {"block": "4", "tx": "65522"}, "alkaneId": {"block": "4", "tx": "65522"}}'
```

---

## address-positions

Get liquidity positions for an address.

**Endpoint:** `POST /address-positions`

**Parameters:**

- `factoryId` (object) - Factory ID with `block` and `tx` fields
- `address` (string) - Bitcoin address

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/address-positions \
  -H "Content-Type: application/json" \
  -d '{"factoryId": {"block": "4", "tx": "65522"}, "address": "bc1p..."}'
```

---

## get-alkane-swap-pair-details

Get swap pair details for a specific alkane token.

**Endpoint:** `POST /get-alkane-swap-pair-details`

**Parameters:**

- `tokenId` (object) - Token ID with `block` and `tx` fields
- `factoryId` (object) - Factory ID with `block` and `tx` fields
- `page` (number, optional) - Page number
- `limit` (number, optional) - Maximum results

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-alkane-swap-pair-details \
  -H "Content-Type: application/json" \
  -d '{"tokenId": {"block": "4", "tx": "65522"}, "factoryId": {"block": "4", "tx": "65522"}, "limit": 20}'
```

---

## JavaScript Example

```javascript
class AMMClient {
  constructor(apiKey, network = 'mainnet') {
    this.baseUrl = `https://${network}.subfrost.io/v4/api`;
    this.apiKey = apiKey;
    this.factoryId = { block: "4", tx: "65522" };
  }

  async post(endpoint, body = {}) {
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

  async getAllPools() {
    return this.post('/get-all-pools-details', {
      factoryId: this.factoryId
    });
  }

  async getPoolDetails(poolBlock, poolTx) {
    return this.post('/get-pool-details', {
      factoryId: this.factoryId,
      poolId: { block: String(poolBlock), tx: String(poolTx) }
    });
  }

  async getPositions(address) {
    return this.post('/address-positions', {
      factoryId: this.factoryId,
      address
    });
  }
}

// Usage
const amm = new AMMClient('your-api-key');

const { pools } = await amm.getAllPools();
console.log(`Found ${pools.length} pools`);

const positions = await amm.getPositions('bc1p...');
console.log('LP positions:', positions);
```
