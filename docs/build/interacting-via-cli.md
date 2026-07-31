---
title: Interacting via the CLI
sidebar_label: Interacting via the CLI
sidebar_position: 3
description: Use alkanes-cli to manage a wallet, deploy and call contracts, and query the chain.
---

# Interacting via the CLI

`alkanes-cli` is the command-line tool for working with the Alkanes metaprotocol: wallets, deployment, contract calls, and chain queries. This page is a task-oriented tour. For the exhaustive command list, see the [CLI & SDK Reference](../api-reference/cli-sdk/overview).

To install it, follow the [Quickstart](./quickstart).

## Choosing a network

Every command takes a network through `-p` (provider): `regtest`, `signet`, or `mainnet`.

```bash
alkanes-cli -p signet <command>
```

Common global options:

| Option | Description |
|--------|-------------|
| `--wallet-file <PATH>` | Path to the wallet file |
| `--passphrase <PHRASE>` | Passphrase used to sign |
| `--wallet-address <ADDR>` | Watch-only, read-only mode |
| `--jsonrpc-url <URL>` | Custom JSON-RPC endpoint |

For production traffic, pass an API key through `--jsonrpc-url` for higher rate limits. See [Authentication](../api-reference/getting-started/authentication) and [Rate Limits](../api-reference/platform/rate-limits).

## Wallet basics

```bash
# Create or import a wallet
alkanes-cli wallet create
alkanes-cli wallet import

# List addresses (range is start:end)
alkanes-cli wallet addresses --range 0:5

# Balances and unspent outputs
alkanes-cli wallet balance
alkanes-cli wallet utxos
```

See [Wallet Commands](../api-reference/cli-sdk/wallet) for the rest of the namespace: signing, history, backups, and fee rates.

## Deploying and calling contracts

Contract operations live under the `alkanes` namespace. A contract is addressed by its `[block, tx]` Alkane ID, and a call is a **cellpack**, a list that begins with the target ID and an opcode (see [Alkanes Metaprotocol](../protocol/alkanes)).

```bash
# Execute a call: contract [2,1], opcode 1
alkanes-cli -p signet alkanes execute "[2,1,1]" --fee-rate 10 -y

# Read state with a free view call: contract [2,1], opcode 2
alkanes-cli -p signet alkanes view "[2,1]" "2"

# Simulate a call without broadcasting
alkanes-cli -p signet alkanes simulate "2:1:2"

# Inspect a contract's bytecode and metadata
alkanes-cli -p signet alkanes inspect "2:1" --meta
```

The `-y` flag auto-confirms. `execute` produces a Bitcoin transaction and pays a fee; `view` and `simulate` read indexer state and cost nothing. See [Alkanes Commands](../api-reference/cli-sdk/alkanes) for the full flag set on `execute`, `simulate`, and `inspect`.

## Querying Bitcoin directly

The CLI also proxies Bitcoin Core and Esplora, so you can inspect the underlying chain without a second tool:

```bash
# Bitcoin Core RPC
alkanes-cli bitcoind getblockcount
alkanes-cli bitcoind getrawtransaction <TXID>

# Esplora
alkanes-cli esplora address <ADDRESS>
alkanes-cli esplora tx <TXID>
alkanes-cli esplora fee-estimates
```

The `esplora` namespace has its own reference page ([Esplora Commands](../api-reference/cli-sdk/esplora)); the `bitcoind` commands mirror the methods documented on [Bitcoin Core RPC](../api-reference/json-rpc/bitcoind).

## Broadcasting options

By default a transaction goes to the public mempool. For higher-value or MEV-sensitive transactions, the CLI can route through private relays instead:

| Option | Description |
|--------|-------------|
| (default) | Standard mempool broadcast |
| `--use-slipstream` | Submit through MARA Slipstream (bypasses the public mempool) |
| `--use-rebar` | Submit through Rebar Shield (private relay) |
| `--mine` | Mine immediately (regtest only) |

## Getting help

```bash
alkanes-cli --help
alkanes-cli <command> --help
```

## Where to go next

- [Wrapping frBTC](./wrapping-frbtc): a full wrap and unwrap walkthrough.
- [CLI & SDK Reference](../api-reference/cli-sdk/overview): every command and flag.
