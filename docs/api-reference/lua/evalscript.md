---
title: lua_evalscript
sidebar_label: lua_evalscript
sidebar_position: 2
description: Execute a Lua script directly with optional arguments and full RPC access.
---

# lua_evalscript

Execute a Lua script directly with optional arguments.

## Method

`lua_evalscript`

## Parameters

- **0** (string): Lua script source code
- **1+** (any): Optional arguments (accessible via `args` table)

## Request

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalscript",
  "params": [
    "local height = _RPC.btc_getblockcount()\nreturn { height = height, doubled = height * 2 }",
    "arg1",
    "arg2"
  ],
  "id": 1
}
```

## Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "calls": 1,
    "returns": {
      "height": 925737,
      "doubled": 1851474
    },
    "runtime": 45
  },
  "id": 1
}
```

## Response Fields

- **`calls`** (number): Number of RPC calls made during execution
- **`returns`** (any): Return value from the Lua script (converted to JSON)
- **`error`** (object/null): Error information if execution failed
- **`runtime`** (number): Execution time in milliseconds

## Error Response

When an error occurs during script execution:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "calls": 2,
    "returns": null,
    "error": {
      "code": -1,
      "message": "attempt to index a nil value"
    },
    "runtime": 15
  },
  "id": 1
}
```

## Examples

### Basic Script - Block Info

Get block height and hash:

```lua
local height = _RPC.btc_getblockcount()
local hash = _RPC.btc_getblockhash(height)
return { height = height, hash = hash }
```

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalscript",
  "params": [
    "local height = _RPC.btc_getblockcount()\nlocal hash = _RPC.btc_getblockhash(height)\nreturn { height = height, hash = hash }"
  ],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "calls": 2,
    "returns": {
      "height": 925737,
      "hash": "000000000000000000001d43fb868a7cfd0581192f648e7bf000c94fe94c6c03"
    },
    "runtime": 62
  },
  "id": 1
}
```

---

### Using Arguments - Address Balance

Calculate address balance from UTXOs:

```lua
local address = args[1]
local utxos = _RPC.esplora_addressutxo(address)

local total = 0
local confirmed = 0
local unconfirmed = 0

for _, utxo in ipairs(utxos) do
  total = total + utxo.value
  if utxo.status.confirmed then
    confirmed = confirmed + utxo.value
  else
    unconfirmed = unconfirmed + utxo.value
  end
end

return {
  address = address,
  total_sats = total,
  total_btc = total / 100000000,
  confirmed_sats = confirmed,
  unconfirmed_sats = unconfirmed,
  utxo_count = #utxos
}
```

---

### Multiple RPC Calls - Blockchain Summary

Get comprehensive blockchain info in one request:

```lua
local btc_height = _RPC.btc_getblockcount()
local ord_height = _RPC.ord_blockheight()
local metashrew_height = tonumber(_RPC.metashrew_height())
local fees = _RPC.esplora_feeestimates()
local mempool = _RPC.btc_getmempoolinfo()

return {
  heights = {
    bitcoin = btc_height,
    ord = ord_height,
    metashrew = metashrew_height
  },
  synced = {
    ord = ord_height >= btc_height - 2,
    metashrew = metashrew_height >= btc_height - 2
  },
  fees = {
    next_block = fees["1"],
    within_hour = fees["6"],
    economy = fees["144"]
  },
  mempool = {
    tx_count = mempool.size,
    size_mb = mempool.bytes / 1000000
  }
}
```

---

### Error Handling with pcall

Safely handle RPC errors:

```lua
local txid = args[1]

local success, tx = pcall(function()
  return _RPC.esplora_tx(txid)
end)

if not success then
  return {
    error = "Transaction not found",
    txid = txid
  }
end

return {
  txid = tx.txid,
  fee = tx.fee,
  size = tx.size,
  confirmed = tx.status.confirmed,
  block_height = tx.status.block_height
}
```

---

### Get Inscription Details

Fetch and process inscription data:

```lua
local inscription_id = args[1]
local insc = _RPC.ord_inscription(inscription_id)

return {
  id = insc.id,
  number = insc.number,
  content_type = insc.content_type,
  content_length = insc.content_length,
  genesis_height = insc.height,
  current_owner = insc.address,
  sat = insc.sat,
  rarity = insc.charms,
  children = insc.child_count
}
```

---

### Get Rune Info with Supply Calculation

```lua
local rune_name = args[1]
local rune = _RPC.ord_rune(rune_name)

local entry = rune.entry
local supply = entry.mints * (entry.terms and entry.terms.amount or 0)

return {
  id = rune.id,
  name = entry.spaced_rune,
  symbol = entry.symbol,
  divisibility = entry.divisibility,
  total_mints = entry.mints,
  supply = supply,
  mintable = rune.mintable,
  mint_terms = entry.terms
}
```

---

### Check Address for Inscriptions and Runes

```lua
local address = args[1]

-- Get ordinals data
local ord_data = _RPC.ord_address(address)

-- Get UTXOs for balance
local utxos = _RPC.esplora_addressutxo(address)
local balance = 0
for _, utxo in ipairs(utxos) do
  balance = balance + utxo.value
end

return {
  address = address,
  balance_sats = balance,
  balance_btc = balance / 100000000,
  inscriptions = ord_data.inscriptions,
  runes = ord_data.runes,
  utxo_count = #utxos
}
```

---

## JavaScript Example

```javascript
const script = `
local address = args[1]
local utxos = _RPC.esplora_addressutxo(address)

local total = 0
for _, utxo in ipairs(utxos) do
  total = total + utxo.value
end

return {
  address = address,
  balance_sats = total,
  balance_btc = total / 100000000,
  utxo_count = #utxos
}
`;

const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-subfrost-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'lua_evalscript',
    params: [script, 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h'],
    id: 1
  })
});

const data = await response.json();
console.log('Balance:', data.result.returns);
console.log('RPC calls made:', data.result.calls);
console.log('Runtime:', data.result.runtime, 'ms');
```

## Performance Tips

1. **Minimize RPC calls**: Each call adds latency
2. **Use local variables**: Faster than globals
3. **Return only needed data**: Smaller response = faster transfer
4. **Use pcall for error handling**: Prevents script termination on RPC errors
5. **Batch related queries**: Combine multiple checks into one script
