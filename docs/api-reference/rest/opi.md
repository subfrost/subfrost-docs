---
title: OPI (BRC-20 Indexer) REST API
sidebar_label: OPI (BRC-20)
sidebar_position: 6
description: OPI-standard REST endpoints for indexed BRC-20 token data on the SUBFROST API.
---

# OPI (BRC-20 Indexer) REST API

The OPI REST API provides indexed data for BRC-20 tokens. It follows the [Open Protocol Indexer (OPI)](https://github.com/bestinslot-xyz/OPI) standard by Best in Slot.

## Base URL

```
https://mainnet.subfrost.io/v4/opi
```

Also available on other networks:

- Signet: `https://signet.subfrost.io/v4/opi`
- Regtest: `https://regtest.subfrost.io/v4/opi`

With API key: `https://mainnet.subfrost.io/v4/{api_key}/opi`

---

## Block & Indexer Info

### Get Block Height

Get the current indexed block height.

**GET** `/v1/brc20/block_height`

**Example:**

```bash
curl "https://mainnet.subfrost.io/v4/opi/v1/brc20/block_height"
```

**Response:**

```
838346
```

### Get Extras Block Height

Get the extras block height (for additional indexed data).

**GET** `/v1/brc20/extras_block_height`

### Get DB Version

Get the database version.

**GET** `/v1/brc20/db_version`

### Get Event Hash Version

Get the event hash version for verification.

**GET** `/v1/brc20/event_hash_version`

---

## Balance Endpoints

### Get Current Balance of Wallet

Get the current BRC-20 balance for a wallet address.

**GET** `/v1/brc20/get_current_balance_of_wallet`

**Query Parameters:**

- `address` (required): Bitcoin wallet address
- `ticker` (required): Token ticker (case-insensitive)

**Example:**

```bash
curl "https://mainnet.subfrost.io/v4/opi/v1/brc20/get_current_balance_of_wallet?address=bc1q...&ticker=ordi"
```

**Response:**

```json
{
  "error": null,
  "result": {
    "overall_balance": "550000000000000000000",
    "available_balance": "50000000000000000000",
    "block_height": 840857
  }
}
```

### Get Balance on Block

Get the BRC-20 balance for a pkscript at the start of a specific block height.

**GET** `/v1/brc20/balance_on_block`

**Query Parameters:**

- `block_height` (required): Block height
- `pkscript` (required): Bitcoin pkscript (hex)
- `ticker` (required): Token ticker

**Example:**

```bash
curl "https://mainnet.subfrost.io/v4/opi/v1/brc20/balance_on_block?block_height=840000&pkscript=0014...&ticker=ordi"
```

---

## Token Holders & Transfer Notes

### Get Holders

Get all holders of a specific BRC-20 token.

**GET** `/v1/brc20/holders`

**Query Parameters:**

- `ticker` (required): Token ticker

**Response:**

```json
{
  "error": null,
  "result": {
    "unused_txes": [
      {
        "pkscript": "...",
        "wallet": "bc1q...",
        "overall_balance": "1000000000000000000",
        "available_balance": "1000000000000000000"
      }
    ],
    "block_height": 840857
  }
}
```

### Get Valid Transfer Notes of Wallet

Get unused (unspent) transfer inscriptions for a wallet.

**GET** `/v1/brc20/get_valid_tx_notes_of_wallet`

**Query Parameters:**

- `address` (optional): Bitcoin address
- `pkscript` (optional): Bitcoin pkscript (use one or the other)

**Response:**

```json
{
  "error": null,
  "result": {
    "unused_txes": [
      {
        "tick": "ordi",
        "inscription_id": "abc123i0",
        "amount": "1000000000000000000",
        "genesis_height": 800000
      }
    ],
    "block_height": 840857
  }
}
```

### Get Valid Transfer Notes of Ticker

Get all unused transfer inscriptions for a specific token.

**GET** `/v1/brc20/get_valid_tx_notes_of_ticker`

**Query Parameters:**

- `ticker` (required): Token ticker

---

## Activity & Events

### Get Activity on Block

Get all BRC-20 events for a specific block.

**GET** `/v1/brc20/activity_on_block`

**Query Parameters:**

- `block_height` (required): Block height

**Example:**

```bash
curl "https://mainnet.subfrost.io/v4/opi/v1/brc20/activity_on_block?block_height=840000"
```

**Response:**

```json
{
  "error": null,
  "result": [
    {
      "event_type": "transfer-inscribe",
      "inscription_id": "abc123i0",
      ...
    }
  ]
}
```

Event types include:

- `deploy-inscribe` - Token deployment
- `mint-inscribe` - Token minting
- `transfer-inscribe` - Transfer inscription created
- `transfer-transfer` - Transfer inscription sent
- `brc20prog-deploy-inscribe` - BRC2.0 contract deployment inscribed
- `brc20prog-deploy-transfer` - BRC2.0 contract deployment sent
- `brc20prog-call-inscribe` - BRC2.0 contract call inscribed
- `brc20prog-call-transfer` - BRC2.0 contract call sent
- `brc20prog-withdraw-inscribe` - BRC2.0 withdrawal inscribed
- `brc20prog-withdraw-transfer` - BRC2.0 withdrawal sent

### Get Event by Inscription ID

Get all events associated with a specific inscription.

**GET** `/v1/brc20/event`

**Query Parameters:**

- `inscription_id` (required): Inscription ID

**Example:**

```bash
curl "https://mainnet.subfrost.io/v4/opi/v1/brc20/event?inscription_id=abc123i0"
```

### Get Bitcoin RPC Results on Block

Get cached Bitcoin RPC results for a block (used for BRC2.0 precompiles).

**GET** `/v1/brc20/bitcoin_rpc_results_on_block`

**Query Parameters:**

- `block_height` (required): Block height

---

## Hash Verification

These endpoints are used for indexer verification and comparison.

### Get Hash of All Activity

Get the cumulative and block event hashes for verification.

**GET** `/v1/brc20/get_hash_of_all_activity`

**Query Parameters:**

- `block_height` (required): Block height

**Response:**

```json
{
  "error": null,
  "result": {
    "cumulative_event_hash": "abc123...",
    "block_event_hash": "def456...",
    "cumulative_trace_hash": "ghi789...",
    "block_trace_hash": "jkl012...",
    "indexer_version": "0.5.0",
    "block_height": 840000
  }
}
```

### Get Hash of All Current Balances

Get a hash of all current balances for verification. Note: this may take several minutes to compute.

**GET** `/v1/brc20/get_hash_of_all_current_balances`

**Response:**

```json
{
  "error": null,
  "result": {
    "current_balances_hash": "abc123...",
    "indexer_version": "0.5.0",
    "block_height": 840857
  }
}
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "error message",
  "result": null
}
```

Common errors:

- `block not indexed yet` - Requested block height exceeds indexed height
- `no balance found` - No balance exists for the given parameters
- `inscription_id is required` - Missing required parameter
- `internal error` - Server-side error
