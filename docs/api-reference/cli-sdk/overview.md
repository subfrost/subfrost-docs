---
title: alkanes-cli & @alkanes/ts-sdk
sidebar_label: Overview
sidebar_position: 1
description: Command-line and TypeScript SDK access to the Alkanes protocol, Bitcoin blockchain, and SUBFROST APIs.
---

# alkanes-cli & @alkanes/ts-sdk

The `alkanes-cli` command-line tool and `@alkanes/ts-sdk` TypeScript library provide comprehensive access to the Alkanes protocol, Bitcoin blockchain, and SUBFROST APIs.

## What is alkanes-cli?

`alkanes-cli` is a powerful command-line interface for:

- **Wallet Management**: Create, manage, and sign transactions with HD wallets
- **Alkanes Metaprotocol**: Deploy contracts, execute transactions, and query balances
- **AMM & Liquidity**: Initialize pools, execute swaps, and manage liquidity
- **Bitcoin Operations**: Query blocks, transactions, UTXOs, and fee estimates
- **Ordinals & Runes**: Query inscriptions, runes, and sat information
- **BRC20-Prog**: Deploy and interact with EVM-compatible contracts on Bitcoin

## Connecting to SUBFROST

### Network Endpoints

The CLI can connect to SUBFROST APIs on different networks:

**Mainnet**

- JSON-RPC: `https://mainnet.subfrost.io/v4/jsonrpc`
- Data API: `https://mainnet.subfrost.io/v4/api`

**Signet**

- JSON-RPC: `https://signet.subfrost.io/v4/jsonrpc`
- Data API: `https://signet.subfrost.io/v4/api`

**Regtest**

- JSON-RPC: `https://regtest.subfrost.io/v4/jsonrpc`
- Data API: `https://regtest.subfrost.io/v4/api`

### Using Your API Key

For higher rate limits, use your API key in the path:

```bash
# With API key (higher rate limits)
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY \
  metashrew height
```

### Free Public Endpoints

For development and testing, use the public routes:

```bash
# Public endpoint (rate limited)
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  metashrew height
```

## Command Namespaces

The CLI is organized into these command namespaces:

- **`wallet`**: HD wallet creation, addresses, signing, and transactions
- **`alkanes`**: Alkanes protocol operations (execute, simulate, trace, swap)
- **`ord`**: Ordinals protocol queries (inscriptions, runes, sats)
- **`esplora`**: Block explorer queries (blocks, transactions, addresses)
- **`brc20-prog`**: BRC20-Prog EVM contract operations
- **`dataapi`**: High-level data queries (alkanes, pools, balances)
- **`metashrew`**: Low-level indexer queries
- **`bitcoind`**: Bitcoin Core RPC passthrough
- **`runestone`**: Runestone/protorune analysis
- **`protorunes`**: Protorune queries
- **`subfrost`**: SUBFROST-specific utilities
- **`lua`**: Server-side Lua script execution

## Global Options

These options are available for all commands:

```bash
alkanes-cli [OPTIONS] <COMMAND>

Options:
  --wallet-file <PATH>        Path to wallet file (default: ~/.alkanes/wallet.json)
  --passphrase <PASSPHRASE>   Wallet passphrase for signing
  --wallet-address <ADDRESS>  Watch-only address (no signing)
  --wallet-key <HEX>          Private key as hex string
  --wallet-key-file <PATH>    Private key file path

  --jsonrpc-url <URL>         JSON-RPC endpoint URL
  --data-api <URL>            Data API endpoint URL
  --esplora-api-url <URL>     Esplora API endpoint
  --ord-server-url <URL>      Ord server endpoint
  --metashrew-rpc-url <URL>   Metashrew RPC endpoint
  --brc20-prog-rpc-url <URL>  BRC20-Prog RPC endpoint

  --subfrost-api-key <KEY>    SUBFROST API key (or use SUBFROST_API_KEY env)

  -p, --provider <PROVIDER>   Network provider [default: regtest]
                              Options: mainnet, signet, regtest

  -h, --help                  Print help
  -V, --version               Print version
```

## Example commands

The commands below show the shape of the CLI; see the following pages for the full reference per namespace.

Check the current block height from the Metashrew indexer:

```bash
$ alkanes-cli -p mainnet metashrew height
```

Get the current Bitcoin price from the Data API:

```bash
$ alkanes-cli -p mainnet dataapi get-bitcoin-price
```

Query metadata for an alkane token (name, symbol, supply):

```bash
$ alkanes-cli -p mainnet alkanes reflect-alkane 2:0
```

Get unspent transaction outputs for a Bitcoin address:

```bash
$ alkanes-cli -p mainnet esplora address-utxo bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h
```

## TypeScript SDK (@alkanes/ts-sdk)

The same functionality is available in TypeScript via `@alkanes/ts-sdk`:

```typescript
import {
  createKeystore,
  unlockKeystore,
  createWallet,
  createProvider
} from '@alkanes/ts-sdk';

// Create a provider
const provider = createProvider({
  url: 'https://mainnet.subfrost.io/v4/jsonrpc',
  networkType: 'mainnet',
});

// Get block height
const height = await provider.getBlockHeight();
console.log('Block height:', height);
```

See the [Installation](./installation) guide to get started.

## Next Steps

- [Installation](./installation): Install the CLI and SDK
- [Wallet Commands](./wallet): Wallet management
- [Alkanes Commands](./alkanes): Protocol operations
- [DataAPI Commands](./dataapi): High-level queries
