---
title: Alkanes REST Endpoints
sidebar_label: Alkanes
sidebar_position: 2
description: REST endpoints for querying alkane tokens, contracts, and holdings.
---

# Alkanes REST Endpoints

Query alkane tokens, contracts, and holdings.

## get-alkanes

List all alkanes with pagination.

**Endpoint:** `POST /get-alkanes`

**Parameters:**

- `limit` (number, optional) - Maximum results (default: 50)
- `offset` (number, optional) - Pagination offset (default: 0)

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-alkanes \
  -H "Content-Type: application/json" \
  -d '{"limit": 50, "offset": 0}'
```

---

## get-alkane-details

Get detailed information about a specific alkane.

**Endpoint:** `POST /get-alkane-details`

**Parameters:**

- `alkaneId` (object) - The alkane ID with `block` and `tx` fields

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-alkane-details \
  -H "Content-Type: application/json" \
  -d '{"alkaneId": {"block": "4", "tx": "65522"}}'
```

---

## global-alkanes-search

Search for alkanes and pools by name or symbol.

**Endpoint:** `POST /global-alkanes-search`

**Parameters:**

- `searchQuery` (string) - Search query
- `limit` (number, optional) - Maximum results
- `offset` (number, optional) - Pagination offset

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/global-alkanes-search \
  -H "Content-Type: application/json" \
  -d '{"searchQuery": "diesel", "limit": 20}'
```

---

## get-alkanes-utxo

Get alkane UTXOs for an address.

**Endpoint:** `POST /get-alkanes-utxo`

**Parameters:**

- `address` (string) - Bitcoin address

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-alkanes-utxo \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p..."}'
```

---

## get-amm-utxos

Get AMM-related UTXOs for an address.

**Endpoint:** `POST /get-amm-utxos`

**Parameters:**

- `address` (string) - Bitcoin address

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-amm-utxos \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p..."}'
```

---

## get-address-outpoints

Get outpoints containing alkanes for an address.

**Endpoint:** `POST /get-address-outpoints`

**Parameters:**

- `address` (string) - Bitcoin address

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-outpoints \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p..."}'
```

---

## JavaScript Example

```javascript
class AlkanesClient {
  constructor(apiKey, network = 'mainnet') {
    this.baseUrl = `https://${network}.subfrost.io/v4/api`;
    this.apiKey = apiKey;
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
    const data = await response.json();
    if (data.statusCode !== 200) throw new Error(data.error);
    return data.data;
  }

  async getAllAlkanes(limit = 50, offset = 0) {
    return this.post('/get-alkanes', { limit, offset });
  }

  async getAlkaneDetails(block, tx) {
    return this.post('/get-alkane-details', {
      alkaneId: { block: String(block), tx: String(tx) }
    });
  }

  async searchAlkanes(query) {
    return this.post('/global-alkanes-search', { query });
  }
}

// Usage
const client = new AlkanesClient('your-api-key');

const alkanes = await client.getAllAlkanes(10, 0);
console.log('Alkanes:', alkanes);

const details = await client.getAlkaneDetails(4, 65522);
console.log('Details:', details);
```
