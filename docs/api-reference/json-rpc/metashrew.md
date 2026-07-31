---
title: metashrew_* Methods
sidebar_label: metashrew_*
sidebar_position: 4
description: Metashrew indexer methods for WASM-based blockchain views, including protorunes and alkane metadata lookups.
---

# metashrew_* Methods

The `metashrew_*` namespace provides access to the Metashrew indexer, which powers custom WASM-based blockchain views.

## Overview

Metashrew is a flexible indexer that runs WebAssembly programs against Bitcoin blockchain data. It enables:

- Custom indexing logic
- Efficient state queries
- Protocol-specific views (Alkanes, Protorunes, etc.)

## Runtime and architecture

metashrew runs as a single binary, `rockshrew-mono`, that bundles the indexer with a local RocksDB database and serves the JSON-RPC view layer from the same process. One binary indexes the chain and answers reads, so the reads are a faithful projection of consensus state rather than a separate database that could drift.

metashrew is the source of truth for on-chain reads. Every value this API returns comes from a view function that the indexer evaluated against the chain, so there is no secondary store to reconcile and no separate read model to fall behind.

The current release line is metashrew `v9.0.5-rc.13`, running the Alkanes indexer from alkanes-rs `v2.2.1-rc.5`.

The runtime is async (wasmtime) and times out long-running requests, and new host functions can be added without changing the host ABI. A newer, unreleased line of work adds Block-STM style parallel block execution to speed up indexing, on the same RocksDB model. Ordering guarantees still hold, but the general "same WASM, same index" property no longer holds automatically under parallel execution, so if you write an indexer that relies on execution order, use serializable semantics.

## Methods

### metashrew_height

Get the current indexed height of Metashrew.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "metashrew_height",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": "925736",
  "id": 1
}
```

**Lua Example:**

```lua
local height = tonumber(_RPC.metashrew_height())
return { indexed_height = height }
```

Returns the current block height indexed by Metashrew.

---

### metashrew_view

Execute a view function on the Metashrew indexer.

**Parameters:**

- **0** (string): View method name
- **1** (any): Input data (method-specific)
- **2** (string): Block tag ("latest" or block number)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "metashrew_view",
  "params": [
    "protorunesbyaddress",
    {
      "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "protocolTag": "1"
    },
    "latest"
  ],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "outpoints": [
      {
        "outpoint": {
          "txid": "abc123...",
          "vout": 0
        },
        "runes": [
          {
            "id": { "block": 840000, "tx": 1 },
            "amount": "1000000"
          }
        ]
      }
    ]
  },
  "id": 1
}
```

**Lua Example:**

```lua
local address = args[1]
local result = _RPC.metashrew_view(
  "protorunesbyaddress",
  {
    address = address,
    protocolTag = "1"
  },
  "latest"
)
return { result_type = type(result) }
```

---

## Common View Methods

Every alkanes and protorunes query is a view function invoked through `metashrew_view`. The catalog below lists the functions the indexer exposes. The alkanes-specific ones (simulation, trace, bytecode, metadata) are documented in full on the [`alkanes_* Methods`](./alkanes) page.

| View function | Purpose |
|---|---|
| `simulate` | Read-only evaluate a single protostone or cellpack against current state, returns the final result. |
| `simulateprotostones` | Simulate one or more protostones with full per-protostone execution traces. See [alkanes](./alkanes). |
| `simulatetransaction` | Simulate a whole transaction (raw tx or PSBT) with traces. See [alkanes](./alkanes). |
| `simulateblock` | Simulate a whole block of transactions in order, with per-tx traces. See [alkanes](./alkanes). |
| `trace` | Execution trace for the protostone at a given outpoint. |
| `traceblock` | Execution traces for every protostone in a block. |
| `meta` | Contract ABI, read from the alkane's `__meta` WASM export (see below). |
| `getbytecode` | Raw WASM bytecode of a deployed alkane. |
| `protorunesbyaddress` | Protorunes and alkanes held by an address. Deprecated in alkanes v3, prefer the esplora UTXO API plus `protorunesbyoutpoint`. |
| `protorunesbyoutpoint` | Protorunes and alkanes at a specific outpoint. |
| `getstorageat` | Read a raw storage slot. Cheap: it does not run a full WASM evaluation, it just fetches the value at a storage path. |
| `alkanes_id_to_outpoint` | Resolve an alkane id to the outpoint where it was etched. |

`spendablesbyaddress` is also available as a top-level method (not under `metashrew_view`); it returns the spendable UTXOs for an address.

The following view methods are commonly available through `metashrew_view`:

### protorunesbyaddress

Get protorunes (including alkanes) held by an address.

**Input:**

```json
{
  "address": "bc1q...",
  "protocolTag": "1"
}
```

**Lua Example:**

```lua
local result = _RPC.metashrew_view(
  "protorunesbyaddress",
  { address = args[1], protocolTag = "1" },
  "latest"
)
return { result_type = type(result) }
```

---

### protorunesbyoutpoint

Get protorunes at a specific outpoint.

**Input:**

```json
{
  "txid": "abc123...",
  "vout": 0,
  "protocolTag": "1"
}
```

---

### meta

Return the ABI of an alkane contract, extracted directly from the
contract's `__meta` wasm export. The response is a hex-encoded UTF-8
JSON blob whose shape is:

```json
{
  "contract": "DIESEL",
  "methods": [
    { "name": "mint",             "opcode": 77,  "params": [], "returns": "void" },
    { "name": "get_name",         "opcode": 99,  "params": [], "returns": "String" },
    { "name": "get_symbol",       "opcode": 100, "params": [], "returns": "String" },
    { "name": "get_total_supply", "opcode": 101, "params": [], "returns": "u128" }
  ]
}
```

This is the canonical way to discover what a deployed alkane can do:
the `__meta` export is generated by the contract's `MessageDispatch`
enum at build time, so if the contract's dispatch changes, so does the
metadata. AMM pools, factories, DAO modules, anything that doesn't
fit the narrow token shape, should be inspected via `meta`, not via
the `alkanes_meta` convenience method.

**Input:** protobuf-encoded `MessageContextParcel` with `calldata` set
to the encoded alkane id target only (no opcode, the view function
calls `__meta`).

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "metashrew_view",
  "params": [
    "meta",
    "0x2a020200",
    "latest"
  ],
  "id": 1
}
```

**Response (raw):**

```json
{
  "jsonrpc": "2.0",
  "result": "0x7b22636f6e7472616374223a2244...",
  "id": 1
}
```

Decode the hex, you get the JSON blob above.

See [Reading Alkane Metadata](../guides/alkane-metadata) for the
full picture: `__meta` semantics, building the calldata, TypeScript and
Rust SDK examples, and the offline-via-bytecode inspection path.

---

### runebyid

Get rune information by ID.

**Input:**

```json
{
  "block": 840000,
  "tx": 1
}
```

---

## Block Tags

The `block_tag` parameter controls which state to query:

- **"latest"**: Most recent indexed block
- **"850000"**: Specific block height (as string)

---

## Protocol Tags

For protorune-based queries, the `protocolTag` identifies the protocol:

- **"1"**: Alkanes
- **"13"**: Other protorunes

---

## Sync Status Check

Compare indexer heights to check sync status:

**Lua Example:**

```lua
local metashrew_h = tonumber(_RPC.metashrew_height())
local btc_h = _RPC.btc_getblockcount()

return {
  metashrew = metashrew_h,
  bitcoin = btc_h,
  synced = metashrew_h >= btc_h - 2,
  blocks_behind = btc_h - metashrew_h
}
```
