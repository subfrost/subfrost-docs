---
title: Espo JSON-RPC API
sidebar_label: Espo
sidebar_position: 11
description: Espo indexer JSON-RPC methods for alkanes balances, holders, storage keys, and AMM analytics.
---

# Espo JSON-RPC API

The Espo indexer provides a JSON-RPC API for querying alkanes data and AMM analytics. The API is organized into two modules: **Essentials** for core data and **AMM Data** for trading analytics.

## Endpoint

Espo runs on a separate endpoint from the main JSON-RPC:

```
POST https://mainnet.subfrost.io/v4/YOUR_API_KEY/espo
```

The API key is required: a request to `https://mainnet.subfrost.io/v4/espo` without a key returns HTTP 401 with `{"code":"INVALID_API_KEY"}`.

## Essentials Module

Core alkanes data including balances, holders, and storage keys.

### ping

Ping the Espo server to verify connectivity.

**Parameters:** None

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "ping",
  "params": {}
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "pong"
}
```

---

### get_espo_height

Get the current block height processed by the Espo indexer.

**Parameters:** None

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_espo_height",
  "params": {}
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "height": 825000
  }
}
```

---

### get_address_balances

Get alkanes balances for a Bitcoin address with optional outpoint details.

**Parameters:**
- **address** (string): Bitcoin address
- **include_outpoints** (boolean, optional): Include detailed UTXO information (default: false)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_address_balances",
  "params": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "include_outpoints": true
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "balances": {
      "840000:1": "1000000",
      "840000:2": "500000"
    },
    "outpoints": [
      {
        "outpoint": "abc123def456...:0",
        "entries": [
          {
            "alkane": "840000:1",
            "amount": "1000000"
          }
        ]
      }
    ]
  }
}
```

**CLI Equivalent:**
```bash
alkanes-cli espo get-address-balances bc1q... --include-outpoints
```

---

### get_address_outpoints

Get all outpoints containing alkanes for an address.

**Parameters:**
- **address** (string): Bitcoin address

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_address_outpoints",
  "params": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "outpoints": [
      {
        "outpoint": "txid:0",
        "entries": [
          {
            "alkane": "840000:1",
            "amount": "1000000"
          }
        ]
      }
    ]
  }
}
```

---

### get_outpoint_balances

Get alkanes balances at a specific UTXO outpoint.

**Parameters:**
- **outpoint** (string): Outpoint in format "txid:vout"

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_outpoint_balances",
  "params": {
    "outpoint": "abc123def456...:0"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "outpoint": "abc123def456...:0",
    "items": [
      {
        "outpoint": "abc123def456...:0",
        "entries": [
          {
            "alkane": "840000:1",
            "amount": "1000000"
          }
        ]
      }
    ]
  }
}
```

---

### get_holders

Get paginated list of holders for an alkane token.

**Parameters:**
- **alkane** (string): Alkane ID in format "block:tx"
- **page** (number, optional): Page number (default: 0)
- **limit** (number, optional): Items per page (default: 100)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_holders",
  "params": {
    "alkane": "2:0",
    "page": 0,
    "limit": 100
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "alkane": "2:0",
    "page": 0,
    "limit": 100,
    "total": 1523,
    "has_more": true,
    "items": [
      {
        "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "amount": "10000000"
      },
      {
        "address": "bc1q2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9",
        "amount": "5000000"
      }
    ]
  }
}
```

**CLI Equivalent:**
```bash
alkanes-cli espo get-holders 2:0 --page 0 --limit 100
```

---

### get_holders_count

Get the total number of unique holders for an alkane token.

**Parameters:**
- **alkane** (string): Alkane ID in format "block:tx"

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_holders_count",
  "params": {
    "alkane": "2:0"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "count": 1523
  }
}
```

---

### get_keys

Get storage keys for an alkane contract with pagination and UTF-8 decoding.

**Parameters:**
- **alkane** (string): Alkane ID in format "block:tx"
- **page** (number, optional): Page number (default: 0)
- **limit** (number, optional): Items per page (default: 100)
- **try_decode_utf8** (boolean, optional): Attempt UTF-8 decoding (default: true)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get_keys",
  "params": {
    "alkane": "2:0",
    "page": 0,
    "limit": 100,
    "try_decode_utf8": true
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "alkane": "2:0",
    "page": 0,
    "limit": 100,
    "total": 450,
    "has_more": true,
    "items": {
      "0x6e616d65": {
        "hex": "0x6e616d65",
        "utf8": "name"
      },
      "0x73796d626f6c": {
        "hex": "0x73796d626f6c",
        "utf8": "symbol"
      }
    }
  }
}
```

---

## AMM Data Module

Trading and liquidity analytics for AMM pools.

### ammdata.ping

Ping the AMM Data module to verify connectivity.

**Parameters:** None

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "ammdata.ping",
  "params": {}
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "pong"
}
```

---

### ammdata.get_candles

Get OHLCV (Open, High, Low, Close, Volume) candlestick data for a liquidity pool.

**Parameters:**
- **pool** (string): Pool ID in format "block:tx"
- **timeframe** (string, optional): Candle interval ("10m", "1h", "1d", "1w", "1M")
- **side** (string, optional): Price side ("base" or "quote")
- **limit** (number, optional): Number of candles (default: 100)
- **page** (number, optional): Page number (default: 0)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "ammdata.get_candles",
  "params": {
    "pool": "840100:5",
    "timeframe": "1h",
    "side": "base",
    "limit": 100,
    "page": 0
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "pool": "840100:5",
    "timeframe": "1h",
    "side": "base",
    "page": 0,
    "limit": 100,
    "total": 2400,
    "has_more": true,
    "candles": [
      {
        "open_time": "1702645200",
        "close_time": "1702648800",
        "open": "1000000",
        "high": "1050000",
        "low": "990000",
        "close": "1020000",
        "volume": "5000000",
        "trades": 45
      },
      {
        "open_time": "1702648800",
        "close_time": "1702652400",
        "open": "1020000",
        "high": "1080000",
        "low": "1010000",
        "close": "1050000",
        "volume": "6000000",
        "trades": 52
      }
    ]
  }
}
```

**CLI Equivalent:**
```bash
alkanes-cli espo get-candles 840100:5 --timeframe 1h --side base --limit 100
```

---

### ammdata.get_trades

Get trade history for a pool with filtering and sorting options.

**Parameters:**
- **pool** (string): Pool ID in format "block:tx"
- **limit** (number, optional): Number of trades (default: 100)
- **page** (number, optional): Page number (default: 0)
- **side** (string, optional): Price side ("base" or "quote")
- **filter_side** (string, optional): Filter by trade side ("buy", "sell", or "all")
- **sort** (string, optional): Sort field
- **dir** (string, optional): Sort direction ("asc" or "desc")

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "ammdata.get_trades",
  "params": {
    "pool": "840100:5",
    "limit": 50,
    "page": 0,
    "side": "base",
    "filter_side": "buy",
    "sort": "timestamp",
    "dir": "desc"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "pool": "840100:5",
    "side": "base",
    "filter_side": "buy",
    "sort": "timestamp",
    "dir": "desc",
    "page": 0,
    "limit": 50,
    "total": 850,
    "has_more": true,
    "trades": [
      {
        "txid": "abc123...",
        "vout": 0,
        "timestamp": "1702645200",
        "block_height": 825000,
        "side": "buy",
        "amount_in": "1000000",
        "amount_out": "950000",
        "price": "0.95"
      }
    ]
  }
}
```

---

### ammdata.get_pools

Get all AMM pools with pagination.

**Parameters:**
- **limit** (number, optional): Number of pools (default: 100)
- **page** (number, optional): Page number (default: 0)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "ammdata.get_pools",
  "params": {
    "limit": 100,
    "page": 0
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "page": 0,
    "limit": 100,
    "total": 45,
    "has_more": false,
    "pools": {
      "840100:5": {
        "token0": "840000:1",
        "token1": "840000:2",
        "reserve0": "10000000",
        "reserve1": "15000000",
        "total_supply": "12247449"
      }
    }
  }
}
```

---

### ammdata.find_best_swap_path

Find the optimal multi-hop swap path between two tokens using advanced routing algorithms.

**Parameters:**
- **token_in** (string): Input token ID
- **token_out** (string): Output token ID
- **mode** (string, optional): Swap mode ("exact_in", "exact_out", or "implicit")
- **amount_in** (string, optional): Input amount (for exact_in mode)
- **amount_out** (string, optional): Output amount (for exact_out mode)
- **amount_out_min** (string, optional): Minimum acceptable output
- **amount_in_max** (string, optional): Maximum acceptable input
- **available_in** (string, optional): Available input amount
- **fee_bps** (number, optional): Fee in basis points (default: 30, i.e., 0.3%)
- **max_hops** (number, optional): Maximum number of hops (default: 3)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "ammdata.find_best_swap_path",
  "params": {
    "token_in": "840000:1",
    "token_out": "840000:2",
    "mode": "exact_in",
    "amount_in": "1000000",
    "amount_out_min": "900000",
    "fee_bps": 30,
    "max_hops": 3
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "mode": "exact_in",
    "token_in": "840000:1",
    "token_out": "840000:2",
    "fee_bps": 30,
    "max_hops": 3,
    "amount_in": "1000000",
    "amount_out": "950000",
    "hops": [
      {
        "pool": "840100:5",
        "token_in": "840000:1",
        "token_out": "840000:3",
        "amount_in": "1000000",
        "amount_out": "1500000"
      },
      {
        "pool": "840100:6",
        "token_in": "840000:3",
        "token_out": "840000:2",
        "amount_in": "1500000",
        "amount_out": "950000"
      }
    ]
  }
}
```

**CLI Equivalent:**
```bash
alkanes-cli espo find-best-swap-path 840000:1 840000:2 \
  --mode exact_in --amount-in 1000000 --amount-out-min 900000
```

---

### ammdata.get_best_mev_swap

Find the best MEV (Maximal Extractable Value) arbitrage opportunity for a token across all available pools.

**Parameters:**
- **token** (string): Token ID to find arbitrage for
- **fee_bps** (number, optional): Fee in basis points (default: 30)
- **max_hops** (number, optional): Maximum number of hops (default: 3)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "ammdata.get_best_mev_swap",
  "params": {
    "token": "840000:1",
    "fee_bps": 30,
    "max_hops": 3
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ok": true,
    "token": "840000:1",
    "fee_bps": 30,
    "max_hops": 3,
    "amount_in": "1000000",
    "amount_out": "1050000",
    "profit": "50000",
    "hops": [
      {
        "pool": "840100:5",
        "token_in": "840000:1",
        "token_out": "840000:2",
        "amount_in": "1000000",
        "amount_out": "2000000"
      },
      {
        "pool": "840100:6",
        "token_in": "840000:2",
        "token_out": "840000:1",
        "amount_in": "2000000",
        "amount_out": "1050000"
      }
    ]
  }
}
```

---

## Implementation Notes

- All methods use JSON-RPC 2.0 protocol
- AMM Data methods use dot notation (e.g., `ammdata.get_candles`)
- Alkane IDs are in format `block:tx` (e.g., `840000:1`)
- Outpoints are in format `txid:vout`
- Pagination is 0-indexed
- All numeric amounts are returned as strings to preserve precision
- BigInt values are converted to strings in responses

## TypeScript SDK Usage

Use the `@alkanes/ts-sdk` for easy TypeScript/JavaScript integration:

```typescript
import { AlkanesProvider } from '@alkanes/ts-sdk';

// Initialize provider
const provider = new AlkanesProvider({ network: 'mainnet' });
await provider.initialize();

// Essentials Module
const height = await provider.espo.getHeight();
const balances = await provider.espo.getAddressBalances('bc1q...', true);
const holders = await provider.espo.getHolders('2:0', 0, 100);

// AMM Data Module
const candles = await provider.espo.getCandles('840100:5', '1h', 'base', 100, 0);
const path = await provider.espo.findBestSwapPath(
  '840000:1',
  '840000:2',
  'exact_in',
  '1000000',
  undefined,
  '900000'
);
const mev = await provider.espo.getBestMevSwap('840000:1', 30, 3);
```

See [alkanes-cli & @alkanes/ts-sdk](../cli-sdk/overview) for more details on the SDK.
