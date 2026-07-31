---
title: Introduction
sidebar_label: Introduction
sidebar_position: 1
description: The SUBFROST API is the developer gateway to Bitcoin, Ordinals, BRC-20, and Alkanes data, plus the SUBFROST protocol.
---

# SUBFROST API

Welcome to the SUBFROST API reference. This is the developer gateway to Bitcoin and the SUBFROST protocol.

## What is the SUBFROST API?

The SUBFROST API is a unified set of APIs for building on Bitcoin. It gives you a single endpoint for Bitcoin Core, Esplora, Ordinals, BRC-20, and Alkanes data, plus server-side scripting and high-level REST endpoints.

The API provides:

- **JSON-RPC Gateway.** Unified access to Bitcoin Core, Esplora, Ord, BRC-20, and Alkanes methods.
- **Lua Scripting.** Execute custom server-side scripts with full RPC access.
- **REST API.** High-level endpoints for Alkanes, BRC-20, pools, and other blockchain data.
- **Real-time Data.** Access to mempool, UTXOs, inscriptions, and runes.

## API endpoints

JSON-RPC requests are made to:

```
https://mainnet.subfrost.io/v4/jsonrpc
```

Or with an API key in the path:

```
https://mainnet.subfrost.io/v4/YOUR_API_KEY
```

REST API endpoints use:

```
https://mainnet.subfrost.io/v4/api/<route>
```

## Quick example

Get the current block height:

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getblockcount",
  "params": [],
  "id": 1
}
```

Response:

```json
{
  "jsonrpc": "2.0",
  "result": 850000,
  "id": 1
}
```

## Available namespaces

- **`esplora_*`**: Electrs/Esplora block explorer API
- **`ord_*`**: Ordinals protocol (inscriptions, runes, sats)
- **`metashrew_*`**: indexer views
- **`alkanes_*`**: Alkanes protocol methods
- **`btc_*`**: Bitcoin Core RPC passthrough
- **`lua_*`**: server-side Lua script execution

## Authentication

SUBFROST supports multiple authentication methods:

1. **API Keys.** Use the `/v4/<apikey>` path or the `x-subfrost-api-key` header.
2. **CORS.** Register your domain for browser-based access.
3. **Alias Routes.** Use `/v4/<alias>` with your custom endpoint alias.

See the [Authentication](./authentication) guide for details.

## Next steps

- [Quickstart](./quickstart): get up and running in minutes.
- [JSON-RPC Overview](../json-rpc/overview): learn about the RPC interface.
- [Lua Scripting](../lua/overview): execute custom scripts server-side.
- [API Platform](../platform/overview): manage API keys and CORS settings.
