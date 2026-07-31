---
title: Esplora Commands
sidebar_label: Esplora Commands
sidebar_position: 6
description: Block explorer queries for blocks, transactions, addresses, and fee estimates with alkanes-cli.
---

# Esplora Commands

The `esplora` namespace provides block explorer functionality for querying blocks, transactions, addresses, and fee estimates via the Electrs/Esplora API.

## Example commands

Get the current blockchain tip height:

```bash
$ alkanes-cli -p mainnet esplora blocks-tip-height
```

Get unspent transaction outputs (UTXOs) for an address:

```bash
$ alkanes-cli -p mainnet esplora address-utxo bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h
```

## Commands Overview

**Block Queries:**

- **`blocks-tip-hash`**: Get the hash of the latest block
- **`blocks-tip-height`**: Get the height of the latest block
- **`blocks`**: Get latest blocks
- **`block-height`**: Get block hash at a height
- **`block`**: Get block details
- **`block-status`**: Get block status
- **`block-txids`**: Get transaction IDs in a block
- **`block-header`**: Get block header
- **`block-raw`**: Get raw block data
- **`block-txid`**: Get transaction at index in block
- **`block-txs`**: Get transactions in a block

**Address Queries:**

- **`address`**: Get address information
- **`address-txs`**: Get address transactions
- **`address-txs-chain`**: Get confirmed address transactions
- **`address-txs-mempool`**: Get mempool transactions for address
- **`address-utxo`**: Get UTXOs for an address
- **`address-prefix`**: Search addresses by prefix

**Transaction Queries:**

- **`tx`**: Get transaction details
- **`tx-hex`**: Get transaction as hex
- **`tx-raw`**: Get raw transaction data
- **`tx-status`**: Get transaction status
- **`tx-merkle-proof`**: Get merkle proof
- **`tx-merkleblock-proof`**: Get merkleblock proof
- **`tx-outspend`**: Get outpoint spending info
- **`tx-outspends`**: Get all output spending info

**Broadcasting:**

- **`broadcast`**: Broadcast a transaction
- **`post-tx`**: Post a transaction

**Mempool:**

- **`mempool`**: Get mempool info
- **`mempool-txids`**: Get mempool transaction IDs
- **`mempool-recent`**: Get recent mempool transactions

**Fees:**

- **`fee-estimates`**: Get fee rate estimates

## esplora blocks-tip-height

Get the current blockchain tip height.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora blocks-tip-height
```

**Output:**

```
Tip Height: 850123
```

## esplora blocks-tip-hash

Get the hash of the latest block.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora blocks-tip-hash
```

## esplora block

Get details for a specific block.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora block 840000
```

**Arguments:**

- `<BLOCK_HASH_OR_HEIGHT>`: Block hash or height

## esplora block-txids

Get all transaction IDs in a block.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora block-txids 840000
```

## esplora address

Get information about a Bitcoin address.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora address bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h
```

**Arguments:**

- `<ADDRESS>`: Bitcoin address

## esplora address-utxo

Get unspent transaction outputs (UTXOs) for an address.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora address-utxo bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h
```

**Arguments:**

- `<ADDRESS>`: Bitcoin address

**Example Response:**

```json
[
  {
    "txid": "abc123...",
    "vout": 0,
    "value": 10000,
    "status": {
      "confirmed": true,
      "block_height": 840000
    }
  }
]
```

## esplora address-txs

Get transactions for an address.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora address-txs bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h
```

## esplora address-txs-mempool

Get unconfirmed (mempool) transactions for an address.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora address-txs-mempool bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h
```

## esplora tx

Get transaction details.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora tx <TXID>
```

**Arguments:**

- `<TXID>`: Transaction ID

## esplora tx-hex

Get transaction as hexadecimal.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora tx-hex <TXID>
```

## esplora tx-status

Get transaction confirmation status.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora tx-status <TXID>
```

## esplora tx-outspend

Check if a specific output has been spent.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora tx-outspend <TXID> <VOUT>
```

**Arguments:**

- `<TXID>`: Transaction ID
- `<VOUT>`: Output index

## esplora fee-estimates

Get current fee rate estimates for different confirmation targets.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora fee-estimates
```

**Example Response:**

```json
{
  "1": 25.5,
  "3": 20.0,
  "6": 15.2,
  "25": 10.0,
  "144": 5.0,
  "504": 3.0
}
```

The keys represent confirmation target in blocks, values are fee rates in sat/vB.

## esplora broadcast

Broadcast a signed transaction to the network.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora broadcast <TX_HEX>
```

**Arguments:**

- `<TX_HEX>`: Signed transaction as hexadecimal

## esplora mempool

Get mempool statistics.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora mempool
```

## esplora mempool-txids

Get all transaction IDs in the mempool.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora mempool-txids
```

## esplora mempool-recent

Get recent mempool transactions.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  esplora mempool-recent
```

## JSON-RPC Equivalent

These CLI commands correspond to JSON-RPC methods with the `esplora_` prefix:

- `esplora address-utxo` maps to `esplora_address::utxo`
- `esplora fee-estimates` maps to `esplora_fee-estimates`
- `esplora blocks-tip-height` maps to `esplora_blocks:tip:height`

**Example JSON-RPC:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_address::utxo",
  "params": ["bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h"],
  "id": 1
}
```

## Next Steps

- [Ord Commands](./ord): Ordinals queries
- [BRC20-Prog Commands](./brc20-prog): EVM contract operations
- [DataAPI Commands](./dataapi): High-level data queries
