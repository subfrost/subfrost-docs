---
title: Indexing with metashrew
sidebar_label: Indexing with metashrew
sidebar_position: 7
description: How Alkanes state is indexed, how view functions work, and how to run the indexer yourself.
---

# Indexing with metashrew

Alkanes does not have its own chain. Its state is **derived from Bitcoin** by an indexer called **metashrew**, which runs a WebAssembly program (the Alkanes indexer, `alkanes.wasm`) against block data and answers queries about the result. Understanding this layer matters whenever you read on-chain state, and it is required if you want to run your own infrastructure.

Most developers never run an indexer: they use the [hosted JSON-RPC endpoint](../api-reference/json-rpc/overview). This page is for when you want to know how it works, or run it yourself.

## What metashrew does

metashrew is a general indexer that executes WASM against the Bitcoin blockchain. The Alkanes protocol ships as one such WASM program. Because the same program that indexes the chain is also the one that answers reads, the reads are a faithful projection of consensus state, not a separate database that could drift.

Two ideas do most of the work:

- **View functions.** A read is a **view function** invoked through `metashrew_view`: you name the view (`simulate`, `trace`, `meta`, and so on), pass its input, and pick a block tag. This is how you query balances, simulate a call, get an execution trace, or read a contract's ABI. The full catalog is on the [`metashrew_*` reference](../api-reference/json-rpc/metashrew).
- **Cost.** `simulate` is the heaviest call because it loads and runs the WASM. Reading a raw storage slot with `getstorageat` is much cheaper: it just fetches the value at a path without a full evaluation. Reach for the cheapest call that answers your question.

## How metashrew runs

metashrew runs as a single binary, `rockshrew-mono`, that bundles the runtime with a local RocksDB database and serves the JSON-RPC view layer from the same process. Because one binary indexes the chain and answers reads, the reads cannot drift from consensus state.

The runtime is async and times out long-running requests, and host functions can be added without breaking the interface. A newer, unreleased line of work adds Block-STM style parallel block execution to speed up indexing, on the same RocksDB model.

## Running an indexer

`rockshrew-mono` takes a Bitcoin Core RPC source, a database path, and the Alkanes indexer WASM:

```sh
rockshrew-mono \
  --daemon-rpc-url http://localhost:8332 \
  --auth bitcoinrpc:password \
  --indexer ./alkanes.wasm \
  --db-path ~/.metashrew \
  --start-block 880000 \
  --host 0.0.0.0 \
  --port 8080 \
  --cors '*'
```

`--start-block 880000` is the Alkanes genesis height, so the node skips the pre-genesis chain. Syncing from there still takes on the order of days.

To skip the full sync, bootstrap from a **published snapshot**: point `--repo` at a snapshot base URL and the node downloads the state and catches up to the tip in hours. SUBFROST serves snapshots from `https://cdn.subfrost.io/snapshots/`. Business-tier accounts can also pull the raw database directly over [rsync](../api-reference/platform/rsync) instead of `--repo`.

## Building your own indexer WASM

metashrew runs any WASM program that implements its host interface, so you can write custom indexing logic, not just run the Alkanes program. A program processes each block and writes key-value state through the runtime, and exposes view functions for reads. The runtime is async, times out long-running requests, and can add new host functions without breaking the interface.

One caveat comes with the unreleased parallel-execution work: block execution can run in parallel, so the old "same WASM, same index" guarantee no longer holds automatically. If you write an indexer that relies on ordering, write it with **serializable semantics** so the result does not depend on execution order.

## When to use metashrew vs a data indexer

metashrew is the source of truth, but it is not built for bulk history or dashboards. A secondary data indexer covers that ground: trade history, per-pair statistics, holder lists, and similar aggregates that the base indexer does not compute.

The rule of thumb:

- Data that becomes input to a **user-signed action** should come from metashrew view functions (the verifiable path).
- Data that only **renders a screen** (history, charts, leaderboards) is a better fit for a secondary data indexer.

## Where to go next

- [`metashrew_*` reference](../api-reference/json-rpc/metashrew): every view method and its inputs.
- [`alkanes_*` reference](../api-reference/json-rpc/alkanes): the simulate and trace views in detail.
- [Interacting via the CLI](./interacting-via-cli): query state without running a node.
