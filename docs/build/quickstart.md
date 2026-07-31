---
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 2
description: Install the toolchain, write a minimal Alkanes contract, and deploy it to Bitcoin.
---

# Quickstart

This guide takes you from an empty machine to a deployed Alkanes contract on Bitcoin. It targets **signet** (a public test network) so you are not spending real BTC while you learn.

## Prerequisites

- **Rust 1.70 or later** (install from rustup.rs)
- **wasm-pack** (`cargo install wasm-pack`)
- **Node.js 18 or later** (for the CLI tooling)

## 1. Install the CLI

The CLI is built from source. It is not published to a package registry, so building from the repository is the supported path.

```bash
# Clone alkanes-rs (develop branch)
git clone https://github.com/kungfuflex/alkanes-rs.git -b develop
cd alkanes-rs

# Build the CLI
cargo build --release -p alkanes-cli

# Add it to your PATH (optional)
export PATH="$PWD/target/release:$PATH"
```

See [Installation](../api-reference/cli-sdk/installation) for prerequisites, PATH setup, and troubleshooting in more detail.

## 2. Create a wallet

```bash
# Create a new wallet
alkanes-cli wallet create

# Or import an existing mnemonic
alkanes-cli wallet import

# Show your address so you can fund it
alkanes-cli wallet receive
```

Fund the address from a signet faucet before deploying. See [Wallet Commands](../api-reference/cli-sdk/wallet) for the rest of the wallet surface.

## 3. Write a contract

Create a Rust library project:

```bash
cargo new --lib my-alkane
cd my-alkane
```

Set the crate up to compile to WebAssembly in `Cargo.toml`:

```toml
[package]
name = "my-alkane"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
alkanes-std = { git = "https://github.com/kungfuflex/alkanes-rs" }
alkanes-support = { git = "https://github.com/kungfuflex/alkanes-rs" }

[profile.release]
opt-level = "z"
lto = true
```

Write a minimal contract in `src/lib.rs`:

```rust
use alkanes_std::prelude::*;
use alkanes_support::context::Context;

#[derive(Default)]
pub struct MyAlkane {
    counter: u64,
}

impl MyAlkane {
    pub fn new() -> Self {
        Self { counter: 0 }
    }

    pub fn increment(&mut self) {
        self.counter += 1;
    }

    pub fn get_count(&self) -> u64 {
        self.counter
    }
}

// Export the contract
alkane!(MyAlkane);
```

## 4. Build to WebAssembly

```bash
wasm-pack build --target web --release
# Output: pkg/my_alkane_bg.wasm
```

## 5. Deploy

Deploying an Alkane means broadcasting a Bitcoin transaction that carries the WASM as an envelope and a **cellpack** that tells the protocol what to do (see [Alkanes Metaprotocol](../protocol/alkanes) for the model behind this).

```bash
alkanes-cli -p signet alkanes execute "[3,0,0]" \
  --envelope "./pkg/my_alkane_bg.wasm" \
  --fee-rate 10 \
  -y
```

The output shows your contract's **Alkane ID**, a `[block, tx]` pair such as `[2, 1]` (block 2, transaction index 1). That ID is how you address the contract from now on. `execute` takes more flags than shown here, see [Alkanes Commands](../api-reference/cli-sdk/alkanes) for the full set.

## 6. Interact

```bash
# Call increment (opcode 1) on your contract at [2,1]
alkanes-cli -p signet alkanes execute "[2,1,1]" \
  --fee-rate 10 \
  -y

# Read the counter (opcode 2), a view call that costs nothing
alkanes-cli -p signet alkanes view "[2,1]" "2"
```

Read calls are free and do not touch the chain: they run against indexer state. Write calls are Bitcoin transactions and pay a fee.

## Where to go next

- [Interacting via the CLI](./interacting-via-cli): the full set of wallet and contract commands.
- [Wrapping frBTC](./wrapping-frbtc): put real Bitcoin-backed value into a contract.
- [Alkanes Metaprotocol](../protocol/alkanes): cellpacks, opcodes, and view functions explained.
