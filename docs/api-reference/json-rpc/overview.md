---
title: JSON-RPC API Overview
sidebar_label: Overview
sidebar_position: 1
description: The SUBFROST JSON-RPC interface, its namespaces, request and response formats, batching, and error codes.
---

# JSON-RPC API Overview

The Subfrost API uses JSON-RPC 2.0 as its primary protocol. All methods are accessible through a unified endpoint with namespace prefixes.

## Endpoint

```
POST https://mainnet.subfrost.io/v4/jsonrpc
```

With API key in path:

```
POST https://mainnet.subfrost.io/v4/<your-api-key>
```

### BRC20-PROG Endpoint

For BRC20 Programmable Module (ETH-compatible JSON-RPC):

```
POST https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog
```

Or with API key:

```
POST https://mainnet.subfrost.io/v4/<your-api-key>/brc20-prog
```

## Request Format

```json
{
  "jsonrpc": "2.0",
  "method": "namespace_methodname",
  "params": [...],
  "id": 1
}
```

- **`jsonrpc`** (string): Must be "2.0"
- **`method`** (string): Method name with namespace prefix
- **`params`** (array): Method parameters
- **`id`** (number/string): Request identifier

## Response Format

### Success

```json
{
  "jsonrpc": "2.0",
  "result": { /* method result */ },
  "id": 1
}
```

### Error

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32601,
    "message": "Method not found"
  },
  "id": 1
}
```

## Namespaces

- **`esplora_*`**: Electrs block explorer API (e.g., `esplora_address::utxo`)
- **`ord_*`**: Ordinals protocol (e.g., `ord_inscription`)
- **`metashrew_*`**: Metashrew indexer (e.g., `metashrew_view`)
- **`alkanes_*`**: Alkanes protocol (e.g., `alkanes_protorunesbyaddress`)
- **`btc_*`**: Bitcoin Core RPC (e.g., `btc_getblockcount`)
- **`brc20_*`**: BRC20 Programmable Module (e.g., `brc20_balanceOf`), via the `/brc20-prog` endpoint
- **`subfrost_*`**: FROST threshold signature wallet (e.g., `subfrost_getpublic`, `subfrost_reset`, `subfrost_thieve`)
- **`lua_*`**: Lua script execution (e.g., `lua_evalscript`)
- **`sandshrew_*`**: Alias for lua_* (e.g., `sandshrew_evalscript`)

## Method Naming Convention

Methods use underscores and double colons to represent REST paths:

- **`_`**: Namespace separator (e.g., `esplora_address`)
- **`::`**: Path parameter placeholder (e.g., `esplora_address::utxo` maps to `/address/{param}/utxo`)

### Examples

```
esplora_address::utxo     → GET /address/{address}/utxo
ord_inscription           → GET /inscription/{id}
btc_getblockcount         → bitcoind getblockcount
```

## Batch Requests

Send multiple requests in a single HTTP call:

```json
[
  { "jsonrpc": "2.0", "method": "btc_getblockcount", "params": [], "id": 1 },
  { "jsonrpc": "2.0", "method": "btc_getbestblockhash", "params": [], "id": 2 },
  { "jsonrpc": "2.0", "method": "esplora_fee-estimates", "params": [], "id": 3 }
]
```

Response:

```json
[
  { "jsonrpc": "2.0", "result": 850000, "id": 1 },
  { "jsonrpc": "2.0", "result": "000000000000000000...", "id": 2 },
  { "jsonrpc": "2.0", "result": { "1": 25.5, "6": 15.2 }, "id": 3 }
]
```

## Error Codes

- **-32700**: Parse error (invalid JSON)
- **-32600**: Invalid Request (invalid JSON-RPC request)
- **-32601**: Method not found (unknown method)
- **-32602**: Invalid params (invalid method parameters)
- **-32603**: Internal error (server error)
- **-32000**: Rate limit exceeded

## Using in Lua Scripts

All RPC methods are available in Lua scripts via the `_RPC` global table:

```lua
-- From within a lua_evalscript
local height = _RPC.btc_getblockcount()
local utxos = _RPC.esplora_addressutxo("bc1q...")
local inscription = _RPC.ord_inscription("abc123i0")

return { height = height, utxo_count = #utxos }
```

See [Lua Scripting](../lua/overview) for more details.

## Next Steps

- [esplora_* Methods](./esplora): Block explorer API
- [ord_* Methods](./ord): Ordinals protocol
- [Bitcoin Core RPC](./bitcoind): Full node methods
- [Lua Scripting](../lua/overview): Server-side scripts
