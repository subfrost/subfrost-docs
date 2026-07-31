---
title: Reading Alkane Metadata
sidebar_label: Reading Alkane Metadata
sidebar_position: 1
description: Discover a deployed alkane's ABI (methods, opcodes, parameters) from its on-chain wasm using the __meta export.
---

# Reading Alkane Metadata

Every Alkanes contract exports a `__meta` wasm function that returns its own
ABI (method names, opcodes, parameter shapes, return types) as JSON.
The Metashrew `meta` view function calls this export and returns the
result, so you can ask any deployed alkane "what methods do you have?"
without having to read source code or guess opcodes.

This is the same primitive the `alkanes-cli alkanes inspect`, `alkanes-cli alkanes meta`, and `@alkanes/ts-sdk`'s `provider.alkanes.getMeta()` use
under the hood.

## How the `__meta` export works

When you build an alkane with the `declare_alkane!` macro, the runtime
generates a `__meta` wasm export that walks the `MessageDispatch` enum
attached to your contract and emits a JSON blob:

```json
{
  "contract": "DIESEL",
  "methods": [
    { "name": "initialize", "opcode": 0, "params": [], "returns": "void" },
    { "name": "mint",        "opcode": 77, "params": [], "returns": "void" },
    { "name": "get_name",    "opcode": 99, "params": [], "returns": "String" },
    { "name": "get_symbol",  "opcode": 100, "params": [], "returns": "String" },
    { "name": "get_total_supply", "opcode": 101, "params": [], "returns": "u128" }
  ]
}
```

Each method tells you:

- **name**: human-readable method name from the `MessageDispatch` enum variant
- **opcode**: the u128 value the calldata varint list must start with
- **params**: input arguments (name + type) in order
- **returns**: the type of the response data

This is the contract's source of truth, there's no separate registry.
If a contract's deployed wasm changes its dispatch, the metadata changes
with it automatically.

## Calling from JSON-RPC

The Metashrew `meta` view function does this for you. The single
argument is the wasm calldata produced by enciphering the alkane id
target (no opcode, the view function knows it's calling `__meta`):

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

The hex argument `0x2a020200` is the protobuf-encoded
`MessageContextParcel` with `calldata = [2, 0]` (target alkane 2:0,
the DIESEL contract). Hand-rolling that hex is painful, both
SDKs below build it for you from `"block:tx"` strings.

The response is the contract's ABI as a hex-encoded JSON string:

```json
{
  "jsonrpc": "2.0",
  "result": "0x7b22636f6e7472616374223a2244...",
  "id": 1
}
```

Decode the hex, you get the JSON blob above.

## TypeScript / `@alkanes/ts-sdk`

```typescript
import { AlkanesProvider } from '@alkanes/ts-sdk';

const provider = new AlkanesProvider({
  jsonRpcUrl: 'https://mainnet.subfrost.io/jsonrpc',
});

// 1) High-level helper, `getMeta` does the encoding + hex-decode for you.
const meta = await provider.alkanes.getMeta('2:0');
console.log(meta);
// { contract: "DIESEL", methods: [...] }

// 2) Walk the methods to discover the opcode for a name.
const mintOpcode = meta.methods.find((m) => m.name === 'mint')?.opcode;
console.log(`mint opcode is ${mintOpcode}`); // 77

// 3) Use it in a simulate call (read-only contract evaluation).
const supplyResult = await provider.alkanes.simulate('2:0', {
  alkanes: [],
  transaction: [],
  block: [],
  height: 950000,
  vout: 0,
  txindex: 0,
  calldata: [101],   // opcode 101 = get_total_supply
  pointer: 0,
  refund_pointer: 0,
});
console.log('totalSupply (LE u128 hex):', supplyResult.execution.data);
```

For historical metadata (e.g. inspect what the contract looked like at
height 940000 before an upgrade):

```typescript
const oldMeta = await provider.alkanes.getMeta('2:0', '940000');
```

## Rust

If you're building tooling outside the TS SDK, you can call the
view function with `alkanes-cli-common::provider::ConcreteProvider`
or roll your own:

```rust
use alkanes_cli_common::provider::{ConcreteProvider, Provider};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let provider = ConcreteProvider::new(
        "https://mainnet.subfrost.io/jsonrpc".to_string(),
        None, // bitcoin rpc not needed for view calls
    )?;

    // getMeta returns the raw JSON bytes from `__meta`.
    let meta_bytes = provider.alkanes_meta("2:0", Some("latest")).await?;
    let meta_str = String::from_utf8(meta_bytes)?;
    let meta: serde_json::Value = serde_json::from_str(&meta_str)?;

    println!("contract: {}", meta["contract"]);
    for method in meta["methods"].as_array().unwrap() {
        println!(
            "  opcode {:>4}  {:<30}  returns {}",
            method["opcode"], method["name"], method["returns"]
        );
    }
    Ok(())
}
```

`Cargo.toml`:

```toml
[dependencies]
alkanes-cli-common = { git = "https://github.com/kungfuflex/alkanes-rs", branch = "kungfuflex/v3.0.0" }
tokio = { version = "1", features = ["full"] }
anyhow = "1"
serde_json = "1"
```

## From the bytecode directly (offline)

When you have an alkane's wasm bytes locally and don't want to round-trip
through an indexer, you can call `__meta` against the wasm directly
using `alkanes-cli alkanes inspect`:

```bash
alkanes-cli alkanes inspect <alkane-id> --meta
```

Programmatically the same primitive is available via
`@alkanes/ts-sdk`'s `inspectBytecode`:

```typescript
const bytecode = await provider.alkanes.getBytecode('2:0');
const inspection = await provider.alkanes.inspectBytecode(bytecode, '2:0', {
  meta: true,
});
console.log(inspection.metadata); // same shape as getMeta()
```

This is the inspection path the CLI uses, useful when you have a
binary you haven't deployed yet, or want to verify that what's deployed
matches what you compiled.

## Why `__meta` over `alkanes_meta`

The `alkanes_meta` JSON-RPC convenience method returns a different,
narrower shape (`{name, symbol, decimals, totalSupply}`) that assumes
the contract follows token conventions. Many alkanes don't (AMM pools,
factories, DAO modules), for those, `metashrew_view "meta"` is the
only way to discover what they can actually do.

See also: [metashrew_* Methods](../json-rpc/metashrew) for the
broader set of view functions.
