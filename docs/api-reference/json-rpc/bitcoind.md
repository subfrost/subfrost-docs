---
title: Bitcoin Core RPC
sidebar_label: Bitcoin Core RPC
sidebar_position: 6
description: btc_* passthrough methods for Bitcoin Core RPC, covering blocks, blockchain info, transactions, mempool, and fee estimation.
---

# btc_* Methods (Bitcoin Core)

The `btc_*` namespace provides passthrough access to Bitcoin Core RPC methods. These are the standard bitcoind JSON-RPC methods with a `btc_` prefix.

## Block Methods

### btc_getblockcount

Get the current block height.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getblockcount",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": 925736,
  "id": 1
}
```

**Lua Example:**

```lua
local height = _RPC.btc_getblockcount()
return { current_height = height }
```

Returns the number of blocks in the longest blockchain.

---

### btc_getblockhash

Get the block hash at a specific height.

**Parameters:**

- **0** (number): Block height

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getblockhash",
  "params": [840000],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": "0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5",
  "id": 1
}
```

**Lua Example:**

```lua
local hash = _RPC.btc_getblockhash(840000)
return { block_hash = hash }
```

Returns the hash of block at the specified height.

---

### btc_getbestblockhash

Get the hash of the current best block.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getbestblockhash",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": "000000000000000000011e795c61e6d795a3b35ac5ed8543de4cf7a7ced9b731",
  "id": 1
}
```

**Lua Example:**

```lua
local best_hash = _RPC.btc_getbestblockhash()
return { tip_hash = best_hash }
```

Returns the hash of the best (tip) block in the most-work chain.

---

### btc_getblock

Get block data by hash.

**Parameters:**

- **0** (string): Block hash
- **1** (number, optional): Verbosity (0=hex, 1=JSON, 2=JSON with full tx)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getblock",
  "params": ["0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5", 1],
  "id": 1
}
```

**Lua Example:**

```lua
local height = _RPC.btc_getblockcount()
local hash = _RPC.btc_getblockhash(height)
local block = _RPC.btc_getblock(hash, 1)
return {
  height = block.height,
  time = block.time,
  tx_count = #block.tx
}
```

Gets block data. Verbosity 0=hex, 1=JSON, 2=JSON with tx details.

---

### btc_getblockheader

Get block header data.

**Parameters:**

- **0** (string): Block hash
- **1** (boolean, optional): verbose (true for JSON, false for hex)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getblockheader",
  "params": ["0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5", true],
  "id": 1
}
```

**Lua Example:**

```lua
local hash = _RPC.btc_getbestblockhash()
local header = _RPC.btc_getblockheader(hash, true)
return {
  height = header.height,
  time = header.time,
  bits = header.bits,
  nonce = header.nonce
}
```

---

## Blockchain Info

### btc_getblockchaininfo

Get blockchain state information.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getblockchaininfo",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "chain": "main",
    "blocks": 925737,
    "headers": 925737,
    "bestblockhash": "000000000000000000001d43fb868a7cfd0581192f648e7bf000c94fe94c6c03",
    "difficulty": 149301205959699.9,
    "time": 1764440776,
    "mediantime": 1764438102,
    "verificationprogress": 1,
    "initialblockdownload": false,
    "chainwork": "0000000000000000000000000000000000000000f97a9cd4c701a35ab19f92d8",
    "size_on_disk": 800797064286,
    "pruned": false
  },
  "id": 1
}
```

**Lua Example:**

```lua
local info = _RPC.btc_getblockchaininfo()
return {
  chain = info.chain,
  height = info.blocks,
  difficulty = info.difficulty,
  synced = info.verificationprogress == 1
}
```

Returns info about the current state of the blockchain.

---

### btc_getdifficulty

Get the current difficulty.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getdifficulty",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": 149301205959699.9,
  "id": 1
}
```

**Lua Example:**

```lua
local difficulty = _RPC.btc_getdifficulty()
return {
  difficulty = difficulty,
  difficulty_trillion = difficulty / 1e12
}
```

Returns the proof-of-work difficulty as a multiple of minimum difficulty.

---

## Transaction Methods

### btc_getrawtransaction

Get raw transaction data.

**Parameters:**

- **0** (string): Transaction ID
- **1** (boolean, optional): verbose (true for decoded JSON)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getrawtransaction",
  "params": ["0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098", true],
  "id": 1
}
```

**Lua Example:**

```lua
local txid = args[1]
local tx = _RPC.btc_getrawtransaction(txid, true)
return {
  txid = tx.txid,
  size = tx.size,
  vsize = tx.vsize,
  vin_count = #tx.vin,
  vout_count = #tx.vout
}
```

---

### btc_sendrawtransaction

Broadcast a signed transaction.

**Parameters:**

- **0** (string): The signed transaction hex
- **1** (number, optional): Maximum fee rate in BTC/kvB

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_sendrawtransaction",
  "params": ["0100000001..."],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": "abc123def456...",
  "id": 1
}
```

**Lua Example:**

```lua
local hex = args[1]
local txid = _RPC.btc_sendrawtransaction(hex)
return { broadcast_txid = txid }
```

---

## Mempool Methods

### btc_getmempoolinfo

Get mempool statistics.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getmempoolinfo",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "loaded": true,
    "size": 15381,
    "bytes": 14475763,
    "usage": 76718160,
    "total_fee": 0.02045846,
    "maxmempool": 2000000000,
    "mempoolminfee": 0.0,
    "minrelaytxfee": 0.0,
    "incrementalrelayfee": 0.000001,
    "unbroadcastcount": 0,
    "fullrbf": true
  },
  "id": 1
}
```

**Lua Example:**

```lua
local mempool = _RPC.btc_getmempoolinfo()
return {
  tx_count = mempool.size,
  size_mb = mempool.bytes / 1000000,
  total_fees_btc = mempool.total_fee
}
```

Returns details on the active state of the mempool.

---

### btc_getrawmempool

Get all mempool transaction IDs.

**Parameters:**

- **0** (boolean, optional): verbose (true for detailed info per tx)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_getrawmempool",
  "params": [false],
  "id": 1
}
```

**Lua Example:**

```lua
local txids = _RPC.btc_getrawmempool(false)
return {
  mempool_count = #txids
}
```

Returns all transaction IDs in the mempool.

---

## Fee Estimation

### btc_estimatesmartfee

Estimate fee for confirmation within N blocks.

**Parameters:**

- **0** (number): Confirmation target in blocks

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "btc_estimatesmartfee",
  "params": [6],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "feerate": 0.00001013,
    "blocks": 6
  },
  "id": 1
}
```

> **Note:** This method is available via JSON-RPC but not in Lua scripts. Use `esplora_feeestimates` in Lua instead.

Estimates the fee per vbyte needed for confirmation within conf_target blocks.
