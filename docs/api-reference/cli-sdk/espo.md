---
title: Espo Commands
sidebar_label: Espo Commands
sidebar_position: 10
description: Query the Espo indexer for alkanes balances, holders, candles, and swap routing with alkanes-cli.
---

# Espo Commands

The `espo` namespace provides access to the Espo indexer for alkanes data and AMM analytics. Espo offers two modules: **Essentials** for core alkanes data and **AMM Data** for trading analytics.

## Example commands

These examples assume the Espo endpoint is configured as shown under [Configuration](#configuration).

### Essentials Module

Ping the Espo server to check connectivity:

```bash
$ alkanes-cli -p mainnet espo ping
```

Get the current Espo indexer height:

```bash
$ alkanes-cli -p mainnet espo get-height
```

Get alkanes balances for an address:

```bash
$ alkanes-cli -p mainnet espo get-address-balances bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```

Get holders of an alkane token (paginated):

```bash
$ alkanes-cli -p mainnet espo get-holders 2:0
```

Get total holder count for an alkane:

```bash
$ alkanes-cli -p mainnet espo get-holders-count 2:0
```

### AMM Data Module

Ping the AMM Data module:

```bash
$ alkanes-cli -p mainnet espo ammdata-ping
```

Get OHLCV candlestick data for a pool:

```bash
$ alkanes-cli -p mainnet espo get-candles 840100:5
```

Get all AMM pools with pagination:

```bash
$ alkanes-cli -p mainnet espo get-pools
```

Find optimal multi-hop swap route:

```bash
$ alkanes-cli -p mainnet espo find-best-swap-path 840000:1 840000:2
```

## Commands Overview

### Essentials Module

Core alkanes data queries including balances, holders, and storage.

- **`ping`**: Ping the Espo server
- **`get-height`**: Get current Espo indexer height
- **`get-address-balances`**: Get alkanes balances for an address
- **`get-address-outpoints`**: Get outpoints containing alkanes for an address
- **`get-outpoint-balances`**: Get alkanes balances at a specific outpoint
- **`get-holders`**: Get holders of an alkane token (paginated)
- **`get-holders-count`**: Get total holder count for an alkane
- **`get-keys`**: Get storage keys for an alkane contract (paginated)

### AMM Data Module

Trading and liquidity analytics for AMM pools.

- **`ammdata-ping`**: Ping the AMM Data module
- **`get-candles`**: Get OHLCV candlestick data for a pool
- **`get-trades`**: Get trade history for a pool
- **`get-pools`**: Get all pools with pagination
- **`find-best-swap-path`**: Find optimal multi-hop swap route
- **`get-best-mev-swap`**: Find best MEV arbitrage opportunity

## Configuration

Configure the Espo RPC endpoint:

```bash
# Using environment variable
export ESPO_RPC_URL=https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo

# Or as a flag
alkanes-cli --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo espo ping
```

The API key is required: a request to `https://mainnet.subfrost.io/v4/espo` without a key returns HTTP 401 with `{"code":"INVALID_API_KEY"}`.

## espo ping

Ping the Espo server to check connectivity.

```bash
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo ping
```

**Example Output:**
```
pong
```

## espo get-height

Get the current block height processed by the Espo indexer.

```bash
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo get-height
```

**Example Output:**
```
Espo Height: 825000
```

## espo get-address-balances

Get alkanes balances for a Bitcoin address. Optionally include detailed outpoint information.

```bash
# Basic balance query
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo get-address-balances bc1q...

# With outpoint details
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo get-address-balances bc1q... --include-outpoints
```

**Example Output:**
```
Alkanes Balances
═════════════════════════════════════
Address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

Alkane ID      Balance
─────────────  ─────────────
840000:1       1000000
840000:2       500000

Total Alkanes: 2
```

## espo get-holders

Get paginated list of holders for an alkane token.

```bash
# First page (100 holders)
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo get-holders 2:0

# Specific page with custom limit
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo get-holders 2:0 --page 2 --limit 50
```

**Example Output:**
```
Holders for Alkane 2:0
═════════════════════════════════════
Page: 0 | Limit: 100 | Total: 1523

Address                                          Balance
──────────────────────────────────────────────  ──────────
bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh    10000000
bc1q2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9    5000000
...

Has More: true
```

## espo get-candles

Get OHLCV candlestick data for a liquidity pool.

```bash
# Get 1-hour candles for base token
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo get-candles 840100:5 \
    --timeframe 1h \
    --side base \
    --limit 100

# Get daily candles for quote token
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo get-candles 840100:5 \
    --timeframe 1d \
    --side quote \
    --limit 30
```

**Timeframe Options:**
- `10m`: 10 minutes
- `1h`: 1 hour
- `1d`: 1 day
- `1w`: 1 week
- `1M`: 1 month

**Example Output:**
```
Candles for Pool 840100:5
═════════════════════════════════════
Timeframe: 1h | Side: base | Page: 0

Time                Open      High      Low       Close     Volume
──────────────────  ────────  ────────  ────────  ────────  ──────────
2024-12-15 10:00    1000000   1050000   990000    1020000   5000000
2024-12-15 11:00    1020000   1080000   1010000   1050000   6000000
...

Total: 100
```

## espo find-best-swap-path

Find the optimal multi-hop swap path between two tokens.

```bash
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo find-best-swap-path 840000:1 840000:2 \
    --mode exact_in \
    --amount-in 1000000 \
    --amount-out-min 900000 \
    --max-hops 3
```

**Modes:**
- `exact_in`: Specify input amount, calculate output
- `exact_out`: Specify output amount, calculate input
- `implicit`: Let the system determine the best approach

**Example Output:**
```
Best Swap Path
═════════════════════════════════════
Token In:  840000:1
Token Out: 840000:2
Mode:      exact_in

Amount In:  1000000
Amount Out: 950000
Hops:       2

Route:
  1. Pool 840100:5  (840000:1 → 840000:3)
     Amount In:  1000000
     Amount Out: 1500000

  2. Pool 840100:6  (840000:3 → 840000:2)
     Amount In:  1500000
     Amount Out: 950000
```

## espo get-best-mev-swap

Find the best MEV arbitrage opportunity for a token.

```bash
alkanes-cli -p mainnet \
  --espo-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo \
  espo get-best-mev-swap 840000:1 \
    --fee-bps 30 \
    --max-hops 3
```

**Example Output:**
```
Best MEV Opportunity
═════════════════════════════════════
Token:      840000:1
Fee (bps):  30 (0.3%)
Max Hops:   3

Amount In:  1000000
Amount Out: 1050000
Profit:     50000 (5%)

Arbitrage Route:
  1. Pool 840100:5  (840000:1 → 840000:2)
     Amount: 1000000 → 2000000

  2. Pool 840100:6  (840000:2 → 840000:1)
     Amount: 2000000 → 1050000

Net Profit: 50000
```

## Notes

- All pagination uses 0-based page numbers
- Alkane IDs are in format `block:tx` (e.g., `840000:1`)
- Outpoints are in format `txid:vout`
- AMM Data methods require AMM pools to be indexed
- The Espo indexer must be configured and running
- Use `--help` on any command to see all available options

## REST API Equivalent

These Espo commands correspond to JSON-RPC methods:
- `espo ping` → `ping`
- `espo get-height` → `get_espo_height`
- `espo get-address-balances` → `get_address_balances`
- `espo get-candles` → `ammdata.get_candles`
- `espo find-best-swap-path` → `ammdata.find_best_swap_path`

See the [JSON-RPC Espo documentation](../json-rpc/espo) for API details.
