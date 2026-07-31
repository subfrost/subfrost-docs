---
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 2
description: Make your first SUBFROST API request in a few minutes.
---

# Quickstart

Get started with the SUBFROST API in just a few minutes.

## Prerequisites

- A SUBFROST account (sign up at [api.subfrost.io](https://api.subfrost.io/)).
- An API key from your dashboard.
- Basic familiarity with JSON-RPC.

## Getting started

1. **Sign up.** Create an account at [api.subfrost.io](https://api.subfrost.io/).
2. **Verify email.** Confirm your email address.
3. **Create API key.** Generate your first API key from your dashboard.
4. **Start building.** Make your first API request using the examples below.

## Networks

Choose the network for your application:

- **Mainnet:** `https://mainnet.subfrost.io`
- **Signet:** `https://signet.subfrost.io`
- **Regtest:** `https://regtest.subfrost.io`

## Making your first request

### Using cURL

```bash
curl -X POST https://mainnet.subfrost.io/v4/jsonrpc \
  -H "Content-Type: application/json" \
  -H "x-subfrost-api-key: YOUR_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "method": "btc_getblockcount",
    "params": [],
    "id": 1
  }'
```

### Using JavaScript

```javascript
const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-subfrost-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'btc_getblockcount',
    params: [],
    id: 1
  })
});

const data = await response.json();
console.log('Block height:', data.result);
```

### Using Python

```python
import requests

response = requests.post(
    'https://mainnet.subfrost.io/v4/jsonrpc',
    headers={
        'Content-Type': 'application/json',
        'x-subfrost-api-key': 'YOUR_API_KEY'
    },
    json={
        'jsonrpc': '2.0',
        'method': 'btc_getblockcount',
        'params': [],
        'id': 1
    }
)

data = response.json()
print(f"Block height: {data['result']}")
```

## Common operations

A few methods to try next. See the [JSON-RPC Reference](../json-rpc/overview) for full details.

| Goal | Method | Reference |
| --- | --- | --- |
| Get a Bitcoin block height | `btc_getblockcount` | [Bitcoin Core RPC](../json-rpc/bitcoind) |
| Get a block hash by height | `btc_getblockhash` | [Bitcoin Core RPC](../json-rpc/bitcoind) |
| Get all UTXOs for an address | `esplora_address::utxo` | [esplora_* Methods](../json-rpc/esplora) |
| Get current fee estimates | `esplora_fee-estimates` | [esplora_* Methods](../json-rpc/esplora) |
| Get inscription details | `ord_inscription` | [ord_* Methods](../json-rpc/ord) |
| Get rune information | `ord_rune` | [ord_* Methods](../json-rpc/ord) |
| Run a custom server-side script | `lua_evalscript` | [Lua Scripting](../lua/overview) |

## Error handling

The API returns standard JSON-RPC error responses:

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

Common error codes:

- **-32700**: Parse error (invalid JSON)
- **-32600**: Invalid request (malformed JSON-RPC)
- **-32601**: Method not found
- **-32602**: Invalid params
- **-32603**: Internal error

## Next steps

- [Authentication](./authentication): set up API keys and CORS.
- [JSON-RPC Reference](../json-rpc/overview): full method documentation.
- [Lua Scripting](../lua/overview): custom server-side scripts.
