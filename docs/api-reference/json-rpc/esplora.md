---
title: esplora_* Methods
sidebar_label: esplora_*
sidebar_position: 2
description: Electrs/Esplora block explorer methods for addresses, transactions, blocks, mempool, and fee estimation.
---

# esplora_* Methods

The `esplora_*` namespace provides access to Electrs/Esplora block explorer functionality. These methods mirror the Esplora REST API.

## Address Methods

### esplora_address

Get address information including chain stats.

**Parameters:**

- **0** (string): Bitcoin address

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_address",
  "params": ["bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h"],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "address": "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h",
    "chain_stats": {
      "funded_txo_count": 2265512,
      "funded_txo_sum": 5519171660624754,
      "spent_txo_count": 2264780,
      "spent_txo_sum": 5517676571260341,
      "tx_count": 2058518
    },
    "mempool_stats": {
      "funded_txo_count": 8,
      "funded_txo_sum": 9648555949,
      "spent_txo_count": 8,
      "spent_txo_sum": 9670382958,
      "tx_count": 8
    }
  },
  "id": 1
}
```

**Lua Example:**

```lua
local address = args[1]
local info = _RPC.esplora_address(address)
local stats = info.chain_stats
return {
  address = info.address,
  balance = stats.funded_txo_sum - stats.spent_txo_sum,
  tx_count = stats.tx_count,
  total_received = stats.funded_txo_sum,
  total_sent = stats.spent_txo_sum
}
```

Gets address statistics including funded/spent amounts and transaction count.

---

### esplora_address::utxo

Get unspent transaction outputs for an address.

**Parameters:**

- **0** (string): Bitcoin address

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_address::utxo",
  "params": ["bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h"],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "txid": "b875d7c6d8de34b5ac2d1deb8aecc0856190e1310ea7d71e9b7fd866313e648c",
      "vout": 3,
      "value": 1833859462,
      "status": {
        "confirmed": true,
        "block_height": 925724,
        "block_hash": "000000000000000000001a157def5fb6e2012803c07647e9f1f964bb28d04d05",
        "block_time": 1764433657
      }
    }
  ],
  "id": 1
}
```

**Lua Example:**

```lua
local address = args[1]
local utxos = _RPC.esplora_addressutxo(address)

local total = 0
local confirmed = 0
for _, utxo in ipairs(utxos) do
  total = total + utxo.value
  if utxo.status.confirmed then
    confirmed = confirmed + utxo.value
  end
end

return {
  address = address,
  utxo_count = #utxos,
  total_sats = total,
  confirmed_sats = confirmed,
  unconfirmed_sats = total - confirmed
}
```

Gets all UTXOs for an address with confirmation status.

---

### esplora_address::txs

Get transaction history for an address.

**Parameters:**

- **0** (string): Bitcoin address

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_address::txs",
  "params": ["bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h"],
  "id": 1
}
```

**Lua Example:**

```lua
local address = args[1]
local txs = _RPC.esplora_addresstxs(address)

local result = {}
for i = 1, math.min(#txs, 10) do
  local tx = txs[i]
  table.insert(result, {
    txid = tx.txid,
    confirmed = tx.status.confirmed,
    fee = tx.fee
  })
end

return { recent_txs = result, total = #txs }
```

Gets confirmed and unconfirmed transactions for an address.

---

## Transaction Methods

### esplora_tx

Get full transaction details.

**Parameters:**

- **0** (string): Transaction ID

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_tx",
  "params": ["0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098"],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "txid": "0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098",
    "version": 1,
    "locktime": 0,
    "size": 134,
    "weight": 536,
    "fee": 0,
    "vin": [
      {
        "txid": "0000000000000000000000000000000000000000000000000000000000000000",
        "vout": 4294967295,
        "is_coinbase": true,
        "scriptsig": "04ffff001d0104",
        "sequence": 4294967295
      }
    ],
    "vout": [
      {
        "scriptpubkey_type": "p2pk",
        "value": 5000000000
      }
    ],
    "status": {
      "confirmed": true,
      "block_height": 1,
      "block_hash": "00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048",
      "block_time": 1231469665
    }
  },
  "id": 1
}
```

**Lua Example:**

```lua
local txid = args[1]
local tx = _RPC.esplora_tx(txid)

local total_out = 0
for _, vout in ipairs(tx.vout) do
  total_out = total_out + vout.value
end

return {
  txid = tx.txid,
  fee = tx.fee,
  size = tx.size,
  weight = tx.weight,
  fee_rate = tx.weight > 0 and (tx.fee * 4 / tx.weight) or 0,
  confirmed = tx.status.confirmed,
  block_height = tx.status.block_height,
  input_count = #tx.vin,
  output_count = #tx.vout,
  total_output = total_out
}
```

Gets complete transaction data including inputs, outputs, and fee.

---

### esplora_tx::status

Get transaction confirmation status.

**Parameters:**

- **0** (string): Transaction ID

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_tx::status",
  "params": ["0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098"],
  "id": 1
}
```

**Lua Example:**

```lua
local txid = args[1]
local status = _RPC.esplora_txstatus(txid)
local current = _RPC.btc_getblockcount()

return {
  confirmed = status.confirmed,
  block_height = status.block_height,
  confirmations = status.confirmed and (current - status.block_height + 1) or 0
}
```

Checks if a transaction is confirmed and gets block details.

---

### esplora_tx::hex

Get raw transaction hex.

**Parameters:**

- **0** (string): Transaction ID

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_tx::hex",
  "params": ["0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098"],
  "id": 1
}
```

**Lua Example:**

```lua
local txid = args[1]
local hex = _RPC.esplora_txhex(txid)
return {
  txid = txid,
  hex = hex,
  size_bytes = #hex / 2
}
```

Gets the raw transaction in hexadecimal format.

---

### esplora_tx::outspends

Get spend status for all outputs of a transaction.

**Parameters:**

- **0** (string): Transaction ID

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_tx::outspends",
  "params": ["0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098"],
  "id": 1
}
```

**Lua Example:**

```lua
local txid = args[1]
local outspends = _RPC.esplora_txoutspends(txid)

local spent = 0
local unspent = 0
for _, os in ipairs(outspends) do
  if os.spent then
    spent = spent + 1
  else
    unspent = unspent + 1
  end
end

return {
  txid = txid,
  outputs = #outspends,
  spent = spent,
  unspent = unspent
}
```

Checks which outputs have been spent and by which transactions.

---

## Block Methods

### esplora_block

Get block details by hash.

**Parameters:**

- **0** (string): Block hash

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_block",
  "params": ["0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5"],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "id": "0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5",
    "height": 840000,
    "version": 710926336,
    "timestamp": 1713571767,
    "bits": 386089497,
    "nonce": 3932395645,
    "difficulty": 86388558925171.02,
    "merkle_root": "031b417c3a1828ddf3d6527fc210daafcc9218e81f98257f88d4d43bd7a5894f",
    "tx_count": 3050,
    "size": 2325617,
    "weight": 3993281,
    "previousblockhash": "0000000000000000000172014ba58d66455762add0512355ad651207918494ab"
  },
  "id": 1
}
```

**Lua Example:**

```lua
local hash = args[1]
local block = _RPC.esplora_block(hash)
return {
  height = block.height,
  tx_count = block.tx_count,
  size_kb = block.size / 1000,
  weight = block.weight,
  timestamp = block.timestamp,
  difficulty = block.difficulty
}
```

Gets block information including header data and transaction count.

---

### esplora_block-height

Get block hash at a specific height.

**Parameters:**

- **0** (number): Block height

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_block-height",
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
local height = args[1] or _RPC.btc_getblockcount()
local hash = _RPC.esplora_blockheight(height)
return { height = height, hash = hash }
```

Converts a block height to its hash.

---

### esplora_block::txids

Get all transaction IDs in a block.

**Parameters:**

- **0** (string): Block hash

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_block::txids",
  "params": ["0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5"],
  "id": 1
}
```

**Lua Example:**

```lua
local hash = args[1]
local txids = _RPC.esplora_blocktxids(hash)
return {
  block_hash = hash,
  tx_count = #txids,
  coinbase_tx = txids[1],
  last_tx = txids[#txids]
}
```

Gets the list of transaction IDs included in a block.

---

## Mempool Methods

### esplora_mempool

Get mempool statistics.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_mempool",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "count": 19178,
    "fee_histogram": [
      [2.325, 50053],
      [1.516, 96335],
      [1.077, 50087]
    ]
  },
  "id": 1
}
```

**Lua Example:**

```lua
local mempool = _RPC.esplora_mempool()
return {
  tx_count = mempool.count,
  fee_buckets = #mempool.fee_histogram
}
```

Gets current mempool size, fees, and fee histogram.

---

### esplora_mempool::recent

Get recent mempool transactions.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_mempool::recent",
  "params": [],
  "id": 1
}
```

**Lua Example:**

```lua
local recent = _RPC.esplora_mempoolrecent()
local result = {}
for i = 1, math.min(#recent, 5) do
  table.insert(result, {
    txid = recent[i].txid,
    fee = recent[i].fee,
    size = recent[i].vsize
  })
end
return { recent_txs = result }
```

Gets the most recently added mempool transactions.

---

## Fee Estimation

### esplora_fee-estimates

Get fee estimates for different confirmation targets.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "esplora_fee-estimates",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "1": 1.013,
    "2": 1.013,
    "3": 1.013,
    "6": 1.013,
    "25": 1.013,
    "144": 0.734,
    "504": 0.734,
    "1008": 0.734
  },
  "id": 1
}
```

**Lua Example:**

```lua
local fees = _RPC.esplora_feeestimates()
return {
  next_block = fees["1"],
  within_hour = fees["6"],
  within_day = fees["144"],
  economy = fees["1008"]
}
```

Gets recommended fee rates (sat/vB) for various block targets.
