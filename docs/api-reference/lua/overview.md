---
title: Lua Scripting Overview
sidebar_label: Overview
sidebar_position: 1
description: Execute server-side Lua scripts with full RPC access to reduce round trips and combine related queries.
---

# Lua Scripting Overview

Subfrost supports server-side Lua script execution, enabling complex operations with minimal API calls. Scripts have full access to RPC methods through the `_RPC` global table.

## Why Lua Scripting?

1. **Reduce Round Trips**: Execute multiple RPC calls in a single request
2. **Server-side Logic**: Process data before returning
3. **Atomic Operations**: Combine related queries
4. **Reusable Scripts**: Save and execute scripts by hash

## Available Methods

- **`lua_evalscript`**: Execute a Lua script directly
- **`lua_savescript`**: Save a script and get its SHA256 hash
- **`lua_evalsaved`**: Execute a previously saved script

## Quick Example

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalscript",
  "params": [
    "local height = _RPC.btc_getblockcount()\nlocal hash = _RPC.btc_getblockhash(height)\nreturn { height = height, hash = hash }",
    "arg1"
  ],
  "id": 1
}
```

Response:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "calls": 2,
    "returns": {
      "height": 925741,
      "hash": "00000000000000000000c68f2b5a8fe69a1b9304ace4f2d8a63eefc5706d6c11"
    },
    "runtime": 62
  },
  "id": 1
}
```

## The _RPC Global Table

All RPC methods are available through `_RPC`. The naming follows a flat pattern:

### Bitcoin Core Methods

```lua
_RPC.btc_getblockcount()
_RPC.btc_getblockhash(height)
_RPC.btc_getbestblockhash()
_RPC.btc_getblock(hash, verbosity)
_RPC.btc_getblockheader(hash, verbose)
_RPC.btc_getblockchaininfo()
_RPC.btc_getdifficulty()
_RPC.btc_getrawtransaction(txid, verbose)
_RPC.btc_sendrawtransaction(hex)
_RPC.btc_getmempoolinfo()
_RPC.btc_getrawmempool(verbose)
```

### Esplora Methods

```lua
_RPC.esplora_address(address)
_RPC.esplora_addressutxo(address)
_RPC.esplora_addresstxs(address)
_RPC.esplora_tx(txid)
_RPC.esplora_txstatus(txid)
_RPC.esplora_txhex(txid)
_RPC.esplora_txoutspends(txid)
_RPC.esplora_block(hash)
_RPC.esplora_blockheight(height)
_RPC.esplora_blocktxids(hash)
_RPC.esplora_feeestimates()
_RPC.esplora_mempool()
_RPC.esplora_mempoolrecent()
```

### Ord Methods

```lua
_RPC.ord_blockcount()
_RPC.ord_blockhash(height)
_RPC.ord_blocktime()
_RPC.ord_inscription(id)
_RPC.ord_inscriptions(page)
_RPC.ord_rune(name)
_RPC.ord_runes(page)
_RPC.ord_sat(number)
_RPC.ord_output(outpoint)
```

### Metashrew/Alkanes Methods

```lua
_RPC.metashrew_height()
_RPC.metashrew_view(method, input, block_tag)
_RPC.alkanes_protorunesbyaddress({ address = "...", protocolTag = "1" })
```

## Accessing Arguments

Arguments passed to the script are available in the `args` table (1-indexed):

```lua
local address = args[1]
local limit = args[2] or 10

local utxos = _RPC.esplora_addressutxo(address)

local result = {}
for i = 1, math.min(#utxos, limit) do
  table.insert(result, utxos[i])
end

return result
```

## Response Format

All Lua methods return a standardized response:

```json
{
  "calls": 5,
  "returns": { /* script return value */ },
  "runtime": 123
}
```

- **`calls`** (number): Number of RPC calls made
- **`returns`** (any): Script return value (JSON)
- **`error`** (object/null): Error info if execution failed
- **`runtime`** (number): Execution time in milliseconds

## Error Handling

```lua
local success, result = pcall(function()
  return _RPC.btc_getblock("invalidhash", 1)
end)

if not success then
  return { error = "Block not found" }
end

return result
```

## Lua Version & Libraries

Scripts run on Lua 5.4 with these libraries:

- Basic operations (`type`, `pairs`, `ipairs`, `tostring`, `tonumber`)
- `table` library (`table.insert`, `table.remove`, `table.sort`, etc.)
- `string` library (`string.sub`, `string.find`, `string.format`, etc.)
- `math` library (`math.floor`, `math.max`, `math.min`, etc.)
- `pcall`/`error` for error handling

**Not available:**

- File I/O (`io` library)
- Network access (except via `_RPC`)
- `os` library
- `debug` library

## Next Steps

- [lua_evalscript](./evalscript): Execute scripts
- [lua_savescript](./savescript): Save reusable scripts
- [lua_evalsaved](./evalsaved): Run saved scripts
- [Example Scripts](./examples): Complete examples
