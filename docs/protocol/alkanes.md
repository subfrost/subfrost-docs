---
title: Alkanes Metaprotocol
sidebar_label: Alkanes Metaprotocol
sidebar_position: 2
description: The smart-contract metaprotocol on Bitcoin that SUBFROST is built on.
---

# Alkanes Metaprotocol

**Alkanes** is a smart-contract metaprotocol on Bitcoin. It lets developers deploy and run programmable contracts directly on Bitcoin's base layer, with no sidechain and no separate validator set. frBTC, DIESEL, and FIRE are all Alkanes tokens, and SUBFROST's custody logic is coordinated through the Alkanes indexer.

## Where it sits

Alkanes builds on **Protorunes**, which extends the Runes protocol with programmable execution. The layering is:

```
Bitcoin  →  Runes  →  Protorunes  →  Alkanes
```

Because everything is anchored to Bitcoin blocks and validated by Bitcoin consensus, Alkanes contracts inherit Bitcoin's security. Contracts are written in Rust and compiled to WebAssembly (WASM), and are executed deterministically by the indexer, so every node that runs the protocol computes the same state.

## Protostones and cellpacks

A Bitcoin transaction carries an Alkanes instruction as a **protostone**: a protocol message encoded in the transaction's `OP_RETURN`. A protostone can move tokens between outputs and invoke a contract.

To call a contract, the protostone carries a **cellpack**. A cellpack is a list of integers, LEB128-encoded, of the form:

```
[block, tx, opcode, ...args]
```

- The first two values, `[block, tx]`, are the **AlkaneId** of the contract you are calling (see below).
- The next value is the **opcode**, which selects the contract method.
- The remaining values are the method's arguments.

This replaces the older, flat "calldata" model: the cellpack is a length-prefixed list of variable-width integers, not a fixed-size byte array.

## AlkaneId

Every alkane is identified by the location where it was etched:

```
[block, tx]
```

that is, the block height and the transaction index within that block. Some low ranges are reserved for system contracts. In text, an AlkaneId is written `block:tx`.

## Contract interface (ABI)

A contract declares its methods with a `MessageDispatch` enum, tagging each with an `#[opcode(n)]`. At build time this generates a `__meta` export describing the contract's methods, their opcodes, parameters, and return types. You can read that ABI back from any deployed contract through the **`meta`** view function, which is the canonical way to discover what a contract can do. See [Reading Alkane Metadata](../api-reference/guides/alkane-metadata).

## Composing operations in one transaction

A single transaction can carry several protostones that run in order. A common pattern for a rich interaction is three protostones:

1. **Transfer** the tokens a contract will consume to the outputs (and shadow outputs) it reads from.
2. **Mint** (for example, mint DIESEL alongside the interaction).
3. **Call** the contract, which receives the transferred tokens and performs the operation.

The tokens routed in step 1 land on **shadow outputs**, protocol-level outputs that are not real Bitcoin outputs but are addressable by the protocol. This lets a contract receive exactly the assets it should, which keeps each contract's execution isolated. The details of building these are in [Build on SUBFROST](../api-reference/getting-started/overview).

## Reading contract state

You do not read a contract's storage directly. Instead you call its **view functions** through the indexer:

- **`simulate`** evaluates a call read-only and returns the result.
- **`trace`** returns the execution trace for a call.
- The newer **`simulateprotostones`**, **`simulatetransaction`**, and **`simulateblock`** views return full execution traces (per protostone, with fuel used and touched storage) so you can preview exactly what a transaction or block would do before broadcasting it.

These are documented in the [JSON-RPC reference](../api-reference/json-rpc/alkanes).

## Fuel

Contract execution has a compute budget called **fuel**, similar to gas on Ethereum. An operation that runs out of fuel fails. View functions run with a high fuel ceiling, so read-only queries rarely hit the limit.

## Where to go next

- [frBTC Peg & Custody](./frbtc-peg-and-custody): how custody is built on top of this.
- [JSON-RPC reference](../api-reference/json-rpc/alkanes): the view functions in detail.
- [Reading Alkane Metadata](../api-reference/guides/alkane-metadata): discover any contract's ABI.
