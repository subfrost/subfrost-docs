---
title: alkanes_* Methods
sidebar_label: alkanes_*
sidebar_position: 5
description: Alkanes protocol methods for tokens, bytecode, simulation, and metadata, plus their metashrew_view mappings.
---

# alkanes_* Methods

> **Prefer `metashrew_view`.** The `alkanes_*` JSON-RPC methods are
> convenience wrappers and may diverge from canonical `metashrew_view`
> semantics over time. New integrations should call
> [`metashrew_view`](./metashrew) directly with the
> appropriate view function name. The convenience methods below
> remain available for ergonomic reasons; the mapping is documented
> per-method.

The `alkanes_*` namespace provides access to the Alkanes protocol, a metaprotocol smart contract system built on Bitcoin. Alkanes is a variant of protorunes, and therefore a subprotocol of the runes protocol on Bitcoin.

## Overview

Alkanes are smart contracts that run on Bitcoin, indexed via Metashrew. Each `alkanes_*` method is a thin convenience wrapper that:

1. Encodes the input arguments into a `MessageContextParcel` protobuf,
2. Calls `metashrew_view` with the matching view function name,
3. Decodes the result.

The first two columns of the table below are the canonical
`metashrew_view` mapping, call them directly for stable behavior and
broader feature coverage. See
[Reading Alkane Metadata](../guides/alkane-metadata) for a
worked example of the `meta` view function.

| Convenience method | `metashrew_view` function | Notes |
|----------------------------------|---------------------------|-------|
| `alkanes_protorunesbyaddress` | `protorunesbyaddress` | DEPRECATED in alkanes v3.0, drop and use the esplora UTXO API + `protorunesbyoutpoint` on each utxo. |
| `alkanes_getbytecode` | `getbytecode` | |
| `alkanes_simulate` | `simulate` | Lower-level than the convenience method, use this for any read-only contract evaluation. |
| `alkanes_meta` | `meta` | The `metashrew_view "meta"` form returns the full ABI from the contract's `__meta` wasm export. The convenience `alkanes_meta` returns a narrower token-shape and SHOULD NOT be used for non-token alkanes (AMM pools, factories, etc.). |
| `alkanes_trace` | `trace` | |
| `alkanes_traceblock` | `traceblock` | |
| (none, call `metashrew_view`) | `simulateprotostones` | Traced protostone simulation. See [Simulation view functions](#simulation-view-functions-with-trace). |
| (none, call `metashrew_view`) | `simulatetransaction` | Traced transaction simulation (raw tx or PSBT). See below. |
| (none, call `metashrew_view`) | `simulateblock` | Traced whole-block simulation. See below. |

## Methods

### alkanes_protorunesbyaddress

Get all alkane tokens held by an address.

**Parameters:**

- **0** (object): Request object with `address` and `protocolTag`
- **1** (string): Block tag (optional, default: "latest")

**Request Object:**

```json
{
  "address": "bc1q...",
  "protocolTag": "1"
}
```

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "alkanes_protorunesbyaddress",
  "params": [
    {
      "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "protocolTag": "1"
    }
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
          "txid": "abc123def456...",
          "vout": 0
        },
        "runes": [
          {
            "id": { "block": 840000, "tx": 1 },
            "amount": "1000000000"
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
local result = _RPC.alkanes_protorunesbyaddress({
  address = address,
  protocolTag = "1"
})
return { result_type = type(result) }
```

---

### alkanes_getbytecode

Get the bytecode of an alkane contract.

**Parameters:**

- **0** (object): Alkane ID with `block` and `tx`
- **1** (string): Block tag (optional)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "alkanes_getbytecode",
  "params": [
    { "block": 840000, "tx": 1 }
  ],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "bytecode": "0061736d01000000..."
  },
  "id": 1
}
```

> **Note:** This method is available via JSON-RPC. Lua support may vary.

---

### alkanes_simulate

Simulate an alkane transaction.

**Parameters:**

- **0** (object): Simulation request
- **1** (string): Block tag (optional)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "alkanes_simulate",
  "params": [
    {
      "alkaneId": { "block": 840000, "tx": 1 },
      "inputs": ["0x..."],
      "target": { "block": 840000, "tx": 2 },
      "pointer": 0,
      "refundPointer": 0,
      "vout": 0,
      "data": "0x..."
    }
  ],
  "id": 1
}
```

---

### alkanes_meta

Get token-shaped metadata about an alkane contract.

> **Use `metashrew_view "meta"` instead** for any non-token alkane (AMM
> pool, factory, DAO module). The `alkanes_meta` convenience method
> returns a narrower `{name, symbol, decimals, totalSupply}` shape that
> assumes token semantics; the canonical `meta` view function returns
> the contract's full `__meta` ABI export: names, opcodes, parameter
> shapes, return types. See
> [Reading Alkane Metadata](../guides/alkane-metadata).

**Parameters:**

- **0** (object): Alkane ID with `block` and `tx`
- **1** (string): Block tag (optional)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "alkanes_meta",
  "params": [
    { "block": 840000, "tx": 1 }
  ],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "name": "Example Token",
    "symbol": "EXT",
    "decimals": 8,
    "totalSupply": "21000000000000000"
  },
  "id": 1
}
```

> **Note:** This method is available via JSON-RPC. Lua support may vary.

---

## Simulation view functions (with trace)

Beyond the single `alkanes_simulate` / `simulate` pair above, the indexer exposes three richer simulation view functions, available in the current release line (alkanes-rs `v2.2.1-rc.5`, running under metashrew `v9.0.5-rc.13`). Unlike `simulate`, which returns only the final result, these return a full execution **trace** for every protostone, the fuel used, the storage slots touched, and the final balances per output. They run read-only against indexed state, so you can preview exactly what a transaction or block would do before broadcasting it. They replace the older, slower preview path.

Invoke them through [`metashrew_view`](./metashrew) by name, with a protobuf-encoded request (hex) and a block tag; the response is a protobuf-encoded result (hex):

```json
{
  "jsonrpc": "2.0",
  "method": "metashrew_view",
  "params": ["simulateblock", "0x<protobuf-hex>", "latest"],
  "id": 1
}
```

All three accept an optional `storage_overrides` field: a list of storage slots (keyed by alkane id) to override before running, for what-if simulation.

### simulateprotostones

Simulate one or more protostones directly, without needing a fully formed transaction.

Request (`SimulateProtostonesRequest`):

| Field | Type | Notes |
|---|---|---|
| `height` | u64 | Block height to simulate at. |
| `alkane_inputs` | AlkaneTransfer[] | Incoming alkanes the first protostone sees. |
| `protostones` | bytes | Enciphered protostones (the same bytes a runestone's protocol field carries). |
| `transaction` | bytes | Optional. A caller-supplied transaction to carry the protostones; if omitted, one is synthesized. |
| `block` | bytes | Optional. A caller-supplied block; if omitted, a minimal single-transaction block is synthesized. |
| `storage_overrides` | list | Optional what-if storage overrides (see above). |

### simulatetransaction

Simulate a complete transaction. The `transaction` field accepts either a raw consensus-encoded transaction or a PSBT (PSBT is tried first, since it is the common mobile-wallet input). The transaction runs inside an auto-synthesized block whose header is chained off the previous indexed block.

Request (`SimulateTransactionRequest`):

| Field | Type | Notes |
|---|---|---|
| `height` | u64 | Block height to simulate at. |
| `transaction` | bytes | Raw transaction or PSBT. |
| `storage_overrides` | list | Optional what-if storage overrides. |

### simulateblock

Simulate an entire block of transactions in order. This is what powers evaluating a set of mempool transactions together, in a block you assemble yourself.

Request (`SimulateBlockRequest`):

| Field | Type | Notes |
|---|---|---|
| `height` | u64 | Block height to simulate at. |
| `block` | bytes | Consensus-encoded block. |
| `storage_overrides` | list | Optional what-if storage overrides. |

Response (`SimulateBlockResponse`): `block_hash`, `height`, `total_fuel_used`, and `txs`, which holds one entry per transaction in block order. Coinbase and no-runestone transactions surface as empty entries with `error = "no_runestone"`, so `txs[i]` stays aligned with the block's `txdata[i]`.

### Per-transaction response shape

`simulateprotostones` and `simulatetransaction` return one per-transaction result; `simulateblock` returns one per transaction. Each result has:

| Field | Type | Notes |
|---|---|---|
| `txid` | string | |
| `height` | u64 | |
| `protostones` | ProtostoneExecution[] | Per protostone: `index`, the synthetic `outpoint` (txid plus shadow vout), the execution `trace`, `fuel_used`, and `touched_storage` (final value of every storage slot the protostone wrote, keyed by the owning alkane). |
| `final_balances_by_vout` | VoutBalances[] | Final alkane balances at each output. |
| `total_fuel_used` | u64 | |
| `used_transaction` | bytes | The exact transaction that was run. |
| `used_block` | bytes | The exact block that was run (synthesized when not supplied). |
| `error` | string | Empty on success. |

---

## Alkane Identifiers

Alkanes are identified by their etching location:

```json
{ "block": 840000, "tx": 1 }
```

This represents:

- **block**: The block height where the alkane was created
- **tx**: The transaction index within that block

String format: `840000:1`

---

## Protocol Tag

For Alkanes, the protocol tag is always `"1"`:

```json
{ "protocolTag": "1" }
```

---

:::note[JSON convenience form vs raw metashrew_view]
The gateway exposes one JSON convenience method, `alkanes_simulate`, which takes a single object parameter (`alkaneId`, `inputs`, `target`, `pointer`, `refundPointer`, `vout`, `data`) and wraps the `simulate` view. There is no `alkanes_simulateblock` convenience method: `simulateprotostones`, `simulatetransaction`, and `simulateblock` are reached through `metashrew_view` with a hex-encoded protobuf input, using the field tables above. For new integrations the canonical path is `metashrew_view` directly, since the `alkanes_*` methods are documented as thin convenience wrappers over it.
:::
