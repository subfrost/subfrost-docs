---
title: REST API Overview
sidebar_label: Overview
sidebar_position: 1
description: High-level REST endpoints for alkanes, AMM pools, and blockchain data on the SUBFROST API.
---

# REST API Overview

The Subfrost REST API provides high-level endpoints for alkanes, AMM pools, and blockchain data. These endpoints are part of the alkanes-data-api service.

## Base URLs

Choose the network for your application:

- **Mainnet:** `https://mainnet.subfrost.io/v4/api`
- **Signet:** `https://signet.subfrost.io/v4/api`
- **Regtest:** `https://regtest.subfrost.io/v4/api`

**OPI (BRC-20 Indexer) Base URL:**

- `https://mainnet.subfrost.io/v4/opi`

With API key authentication:

- `https://mainnet.subfrost.io/v4/{api_key}` (Standard API)
- `https://mainnet.subfrost.io/v4/{api_key}/opi` (OPI API)

## Authentication

REST endpoints can be accessed via:

1. **Public endpoint** - `/v4/api/{route}` (with CORS from registered domain)
2. **API key in path** - `/v4/{api_key}/{route}`
3. **API key header** - `/v4/api/{route}` with `x-subfrost-api-key` header

## Request Format

All endpoints accept POST requests with JSON bodies:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-bitcoin-price \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or with API key:

```bash
curl -X POST https://mainnet.subfrost.io/v4/YOUR_API_KEY/get-bitcoin-price \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Response Format

All responses follow this structure:

```json
{
  "statusCode": 200,
  "data": { /* response data */ }
}
```

Error responses:

```json
{
  "statusCode": 400,
  "error": "Invalid request parameters"
}
```

## Endpoint Categories

### Alkanes

Query alkane tokens and contracts.

- **`POST /get-alkanes`** - List all alkanes
- **`POST /get-alkanes-by-address`** - Alkanes for an address
- **`POST /get-alkane-details`** - Specific alkane info
- **`POST /get-alkanes-utxo`** - Alkane UTXOs
- **`POST /global-alkanes-search`** - Search alkanes

### Pools & AMM

Liquidity pools and AMM operations.

- **`POST /get-pools`** - List all pools
- **`POST /get-pool-details`** - Pool details
- **`POST /get-all-pools-details`** - All pool details
- **`POST /address-positions`** - Liquidity positions
- **`POST /get-all-token-pairs`** - All token pairs
- **`POST /get-token-pairs`** - Pairs for a token

### Bitcoin/UTXOs

Bitcoin balance and UTXO queries.

- **`POST /get-address-balance`** - Address balance
- **`POST /get-taproot-balance`** - Taproot balance
- **`POST /get-address-utxos`** - Address UTXOs
- **`POST /get-account-utxos`** - Account UTXOs

### History

Transaction history for AMM operations.

- **`POST /get-pool-swap-history`** - Pool swap history
- **`POST /get-token-swap-history`** - Token swap history
- **`POST /get-pool-mint-history`** - Liquidity adds
- **`POST /get-pool-burn-history`** - Liquidity removes
- **`POST /get-address-swap-history-for-pool`** - Address swaps

### Bitcoin Price

Real-time BTC price from Uniswap V3 WBTC/USDC pool.

- **`POST /get-bitcoin-price`** - Current BTC price in USD
- **`POST /get-bitcoin-market-chart`** - Historical price data
- **`POST /get-bitcoin-market-weekly`** - 52-week high/low
- **`POST /get-bitcoin-markets`** - Market summary

### OPI (BRC-20)

Standard OPI endpoints for BRC-20 indexing (via `/v4/opi` base).

- **`GET /v1/brc20/balance`** - Get balance
- **`GET /v1/brc20/history`** - Get history
- **`GET /v1/brc20/token_summary`** - Token info

## Health Check

```bash
GET https://mainnet.subfrost.io/v4/api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": 1699123456
}
```

## Example request

Get Bitcoin price:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-bitcoin-price \
  -H "Content-Type: application/json" \
  -d '{}'
```

Get 52-week high/low and current price:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-bitcoin-market-weekly \
  -H "Content-Type: application/json" \
  -d '{}'
```

## JavaScript Example

```javascript
const API_BASE = 'https://mainnet.subfrost.io/v4/api';

async function getAlkanesByAddress(address) {
  const response = await fetch(`${API_BASE}/get-alkanes-by-address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });

  const data = await response.json();

  if (data.statusCode !== 200) {
    throw new Error(data.error);
  }

  return data.data;
}

const alkanes = await getAlkanesByAddress('bc1p...');
console.log('Alkane holdings:', alkanes);
```

## Next Steps

- [Alkanes Endpoints](./alkanes): Token queries
- [Pools & AMM](./pools): Liquidity operations
- [Bitcoin Data](./bitcoin): Balance and UTXOs
- [History](./history): Transaction history
