---
title: Ord Commands
sidebar_label: Ord Commands
sidebar_position: 5
description: Query inscriptions, runes, and satoshi information from the Ordinals protocol with alkanes-cli.
---

# Ord Commands

The `ord` namespace provides queries for the Ordinals protocol including inscriptions, runes, satoshis, and related data.

## Example commands

Get details about an Ordinal inscription by ID:

```bash
$ alkanes-cli -p mainnet ord inscription 6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0
```

Get information about a Rune by name:

```bash
$ alkanes-cli -p mainnet ord rune UNCOMMON•GOODS
```

## Commands Overview

- **`inscription`**: Get inscription details by ID
- **`inscriptions-in-block`**: Get all inscriptions in a block
- **`address-info`**: Get address information
- **`block-info`**: Get block information
- **`block-count`**: Get the latest block count
- **`blocks`**: Get latest blocks
- **`children`**: Get children of an inscription
- **`content`**: Get inscription content
- **`output`**: Get output information
- **`parents`**: Get parents of an inscription
- **`rune`**: Get rune information
- **`sat`**: Get sat information
- **`tx-info`**: Get transaction information

## ord inscription

Get details about an Ordinal inscription by ID.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord inscription 6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0
```

**Arguments:**

- `<INSCRIPTION_ID>`: Inscription ID (format: `txid` + `i` + `index`)

**Example Response:**

```json
{
  "id": "6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0",
  "number": 12345,
  "address": "bc1p...",
  "content_type": "image/png",
  "content_length": 1234,
  "sat": 1234567890,
  "timestamp": "2024-01-15T12:30:00Z"
}
```

## ord inscriptions-in-block

Get all inscriptions created in a specific block.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord inscriptions-in-block 840000
```

**Arguments:**

- `<BLOCK_HEIGHT>`: Block height to query

## ord address-info

Get Ordinals-related information for an address.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord address-info bc1p...
```

**Arguments:**

- `<ADDRESS>`: Bitcoin address to query

## ord block-info

Get detailed block information from the Ord indexer.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord block-info 840000
```

**Arguments:**

- `<BLOCK_HEIGHT>`: Block height to query

## ord block-count

Get the current block count from the Ord indexer.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord block-count
```

**Example Output:**

```
850123
```

## ord blocks

Get information about the latest blocks.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord blocks
```

## ord children

Get child inscriptions of a parent inscription.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord children 6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0
```

**Arguments:**

- `<INSCRIPTION_ID>`: Parent inscription ID

## ord content

Get the content of an inscription.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord content 6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0
```

**Arguments:**

- `<INSCRIPTION_ID>`: Inscription ID

Returns the raw content bytes of the inscription.

## ord output

Get information about a specific transaction output.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord output <TXID>:<VOUT>
```

**Arguments:**

- `<OUTPOINT>`: Transaction output (format: `txid:vout`)

## ord parents

Get parent inscriptions of a child inscription.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord parents 6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0
```

**Arguments:**

- `<INSCRIPTION_ID>`: Child inscription ID

## ord rune

Get information about a Rune by name.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord rune "UNCOMMON•GOODS"
```

**Arguments:**

- `<RUNE_NAME>`: Rune name (with bullet character if applicable)

**Example Response:**

```json
{
  "id": "840000:1",
  "name": "UNCOMMON•GOODS",
  "symbol": "⧉",
  "divisibility": 0,
  "supply": "21000000",
  "burned": "0",
  "timestamp": "2024-04-20T00:00:00Z"
}
```

## ord sat

Get information about a specific satoshi.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord sat 1234567890
```

**Arguments:**

- `<SAT>`: Satoshi number

**Example Response:**

```json
{
  "sat": 1234567890,
  "rarity": "common",
  "block": 12345,
  "cycle": 0,
  "epoch": 0,
  "period": 0,
  "inscription": null
}
```

## ord tx-info

Get transaction information from the Ord indexer.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  ord tx-info <TXID>
```

**Arguments:**

- `<TXID>`: Transaction ID

## JSON-RPC Equivalent

These CLI commands correspond to JSON-RPC methods:

- `ord inscription` maps to `ord_inscription`
- `ord rune` maps to `ord_rune`
- `ord sat` maps to `ord_sat`
- `ord block-count` maps to `ord_blockcount`

**Example JSON-RPC:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_inscription",
  "params": ["6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0"],
  "id": 1
}
```

## Next Steps

- [Esplora Commands](./esplora): Block explorer queries
- [Alkanes Commands](./alkanes): Protocol operations
- [DataAPI Commands](./dataapi): High-level data queries
