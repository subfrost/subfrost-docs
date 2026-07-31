---
title: DataAPI Commands
sidebar_label: DataAPI Commands
sidebar_position: 8
description: High-level queries for Alkanes tokens, AMM pools, balances, and market data via alkanes-cli.
---

# DataAPI Commands

The `dataapi` namespace provides high-level queries for Alkanes tokens, AMM pools, balances, and market data via the SUBFROST Data API.

## Example commands

Get the current Bitcoin price:

```bash
$ alkanes-cli -p mainnet dataapi get-bitcoin-price
```

Get all liquidity pools from the AMM factory:

```bash
$ alkanes-cli -p mainnet dataapi get-pools
```

Get the number of unique holders for an alkane token:

```bash
$ alkanes-cli -p mainnet dataapi get-holder-count 2:0
```

## Commands Overview

**Alkanes Queries:**

- **`get-alkanes`**: Get all alkanes tokens
- **`get-alkanes-by-address`**: Get alkanes for an address
- **`get-alkane-details`**: Get details for a specific alkane

**Pool & AMM:**

- **`get-pools`**: Get all liquidity pools
- **`get-pool-by-id`**: Get pool details by ID
- **`get-pool-history`**: Get historical pool data
- **`get-swap-history`**: Get swap history

**Balances:**

- **`get-address-balances`**: Get alkane balances for an address (with UTXO tracking)
- **`get-outpoint-balances`**: Get alkane balances for a specific outpoint
- **`get-holders`**: Get holders of an alkane token
- **`get-holder-count`**: Get holder count for an alkane

**Market Data:**

- **`get-bitcoin-price`**: Get current Bitcoin price
- **`get-market-chart`**: Get Bitcoin market chart

**Indexer Status:**

- **`get-block-height`**: Get latest processed block height
- **`get-block-hash`**: Get latest processed block hash
- **`get-indexer-position`**: Get indexer position (height + hash)
- **`health`**: Health check

## Configuration

The Data API uses a separate endpoint from JSON-RPC:

```bash
# Using the data API endpoint
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-alkanes
```

Or with your API key for higher rate limits:

```bash
--data-api https://mainnet.subfrost.io/v4/YOUR_API_KEY
```

## dataapi get-alkanes

Get all alkanes tokens indexed by the system.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-alkanes
```

**Example Output:**

```
Alkanes Tokens
═══════════════════════════════════

1. 2:0

2. 32:0

3. 4:65522
...

Total: 25
```

## dataapi get-alkanes-by-address

Get alkanes tokens held by a specific address.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-alkanes-by-address bc1p...
```

**Arguments:**

- `<ADDRESS>`: Bitcoin address to query

## dataapi get-alkane-details

Get detailed information about a specific alkane token.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-alkane-details 2:0
```

**Arguments:**

- `<ALKANE_ID>`: Alkane ID (format: `block:tx`)

## dataapi get-pools

Get all liquidity pools from the AMM factory.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-pools
```

Uses factory 4:65522 by default.

**Example Output:**

```
Liquidity Pools
═══════════════════════════════════

1. DIESEL / frBTC LP
   Pool ID: 2:3
   Pair: 2:0 -> 32:0
   Reserves: 300000000 x 50000
   LP Supply: 3872983
   Creator: bc1p...

Total: 1 pools
```

## dataapi get-pool-by-id

Get details for a specific liquidity pool.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-pool-by-id 2:3
```

**Arguments:**

- `<POOL_ID>`: Pool ID (format: `block:tx`)

## dataapi get-pool-history

Get historical data for a liquidity pool.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-pool-history 2:3
```

**Arguments:**

- `<POOL_ID>`: Pool ID

## dataapi get-swap-history

Get swap history for the AMM.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-swap-history
```

## dataapi get-address-balances

Get alkane balances for an address with UTXO tracking.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-address-balances bc1p...
```

**Arguments:**

- `<ADDRESS>`: Bitcoin address to query

Returns balances broken down by UTXO for accurate tracking.

## dataapi get-outpoint-balances

Get alkane balances for a specific transaction output.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-outpoint-balances <TXID>:<VOUT>
```

**Arguments:**

- `<OUTPOINT>`: Transaction outpoint (format: `txid:vout`)

## dataapi get-holders

Get all holders of a specific alkane token.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-holders 2:0
```

**Arguments:**

- `<ALKANE_ID>`: Alkane ID

## dataapi get-holder-count

Get the number of unique holders for an alkane token.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-holder-count 2:0
```

**Arguments:**

- `<ALKANE_ID>`: Alkane ID

## dataapi get-bitcoin-price

Get the current Bitcoin price.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-bitcoin-price
```

## dataapi get-market-chart

Get Bitcoin market chart data.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-market-chart
```

## dataapi get-block-height

Get the latest block height processed by the indexer.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-block-height
```

**Example Output:**

```json
{
  "height": 850123
}
```

## dataapi get-block-hash

Get the latest block hash processed by the indexer.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-block-hash
```

## dataapi get-indexer-position

Get the current indexer position (height and hash).

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi get-indexer-position
```

## dataapi health

Check if the Data API is healthy.

```bash
alkanes-cli -p mainnet \
  --data-api https://mainnet.subfrost.io/v4/api \
  dataapi health
```

**Output:**

```
OK
```

## REST API Equivalent

These DataAPI commands correspond to REST endpoints:

- `get-alkanes` maps to `GET /alkanes`
- `get-pools` maps to `GET /pools`
- `get-address-balances` maps to `GET /address/{address}/balances`
- `get-block-height` maps to `GET /indexer/height`
- `health` maps to `GET /health`

See the [REST API documentation](../rest/overview) for the full endpoint reference.

## Next Steps

- [Alkanes Commands](./alkanes): Protocol operations
- [REST API Overview](../rest/overview): Full REST endpoint reference
- [Pools & AMM](../rest/pools): AMM REST endpoints
