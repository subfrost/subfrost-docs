---
title: Lua Script Examples
sidebar_label: Example Scripts
sidebar_position: 5
description: Real-world Lua scripts demonstrating common use cases, including multicall, balance aggregation, and confirmation checks.
---

# Lua Script Examples

Real-world Lua scripts demonstrating common use cases. These examples are from the Subfrost reference implementation.

## multicall.lua

Execute multiple RPC calls in a single batch request.

```lua
-- Execute multiple RPC calls in a single batch
-- Args: array of [method, params] tuples
-- Example: [["btc_getblockcount", []], ["btc_getblockhash", [100]]]

local results = {}

for i, call in ipairs(args) do
    if type(call) ~= "table" or #call ~= 2 then
        return {
            error = "Each multicall entry must be a tuple of [method, params]",
            index = i
        }
    end

    local method = call[1]
    local params = call[2]

    if type(method) ~= "string" then
        return { error = "Method name must be a string", index = i }
    end

    if type(params) ~= "table" then
        return { error = "Method params must be an array", index = i }
    end

    local success, result = pcall(function()
        local rpc_func = _RPC[method]
        if not rpc_func then
            error("Method not found: " .. method)
        end

        if #params == 0 then
            return rpc_func()
        elseif #params == 1 then
            return rpc_func(params[1])
        elseif #params == 2 then
            return rpc_func(params[1], params[2])
        else
            local unpack_func = table.unpack or unpack
            return rpc_func(unpack_func(params))
        end
    end)

    if success then
        table.insert(results, { result = result })
    else
        table.insert(results, { error = { message = tostring(result) } })
    end
end

return results
```

**Usage:**

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalscript",
  "params": [
    "-- multicall script here --",
    [["btc_getblockcount", []], ["btc_getblockhash", [850000]], ["esplora_feeestimates", []]]
  ],
  "id": 1
}
```

---

## balances.lua

Comprehensive balance information for an address, combining UTXOs with ordinal and alkane data.

```lua
-- Comprehensive balance information for an address
-- Args: address, protocol_tag (optional, default: "1")

local address = args[1]
local protocol_tag = args[2] or "1"

-- Get ord and metashrew heights
local ord_height = _RPC.ord_blockheight() or 0
local metashrew_height_str = _RPC.metashrew_height() or "0"
local metashrew_height = tonumber(metashrew_height_str) or 0
local max_indexed_height = math.max(ord_height, metashrew_height)

-- Get UTXOs
local utxos = _RPC.esplora_addressutxo(address) or {}

-- Get protorunes/alkanes data
local protorunes = _RPC.alkanes_protorunesbyaddress({
    address = address,
    protocolTag = protocol_tag
}) or {}

-- Get ord outputs (inscriptions and runes)
local ord_outputs = _RPC.ord_outputs(address) or {}

-- Build lookup maps
local runes_map = {}
if protorunes.outpoints then
    for _, outpoint in ipairs(protorunes.outpoints) do
        if outpoint.outpoint and outpoint.runes then
            local key = outpoint.outpoint.txid .. ":" .. outpoint.outpoint.vout
            runes_map[key] = outpoint.runes
        end
    end
end

local ord_outputs_map = {}
for _, output in ipairs(ord_outputs) do
    if output.outpoint then
        ord_outputs_map[output.outpoint] = {
            inscriptions = output.inscriptions or {},
            ord_runes = output.runes or {}
        }
    end
end

-- Categorize UTXOs
local spendable = {}
local assets = {}
local pending = {}

for _, utxo in ipairs(utxos) do
    local key = utxo.txid .. ":" .. utxo.vout
    local height = utxo.status and utxo.status.block_height

    local utxo_entry = {
        outpoint = key,
        value = utxo.value
    }

    if height then utxo_entry.height = height end
    if runes_map[key] then utxo_entry.runes = runes_map[key] end

    if ord_outputs_map[key] then
        if #ord_outputs_map[key].inscriptions > 0 then
            utxo_entry.inscriptions = ord_outputs_map[key].inscriptions
        end
        if next(ord_outputs_map[key].ord_runes) ~= nil then
            utxo_entry.ord_runes = ord_outputs_map[key].ord_runes
        end
    end

    local has_assets = (utxo_entry.runes and #utxo_entry.runes > 0) or
                      (utxo_entry.inscriptions and #utxo_entry.inscriptions > 0) or
                      (utxo_entry.ord_runes and next(utxo_entry.ord_runes) ~= nil)

    local is_confirmed = height and height <= max_indexed_height

    if not is_confirmed then
        table.insert(pending, utxo_entry)
    elseif has_assets then
        table.insert(assets, utxo_entry)
    else
        table.insert(spendable, utxo_entry)
    end
end

return {
    spendable = spendable,
    assets = assets,
    pending = pending,
    ordHeight = ord_height,
    metashrewHeight = metashrew_height
}
```

---

## address_utxos_with_txs.lua

Batch fetch UTXOs with full transaction details.

```lua
-- Batch fetch UTXOs for an address with full transaction details
-- Args: address

local address = args[1]

local utxos = _RPC.esplora_addressutxo(address)
if not utxos then
    return { utxos = {}, error = "Failed to fetch UTXOs" }
end

local result = { utxos = {}, count = 0 }

for i, utxo in ipairs(utxos) do
    local tx_data = _RPC.esplora_tx(utxo.txid)

    local utxo_entry = {
        txid = utxo.txid,
        vout = utxo.vout,
        value = utxo.value,
        status = utxo.status,
        tx = tx_data
    }

    table.insert(result.utxos, utxo_entry)
    result.count = result.count + 1
end

return result
```

---

## batch_utxo_balances.lua

Fetch UTXOs with alkane balances for each.

```lua
-- Batch UTXO balance fetching for alkanes
-- Args: address, protocol_tag (default: 1), block_tag (optional)

local address = args[1]
local protocol_tag = args[2] or 1
local block_tag = args[3]

local utxos = _RPC.esplora_addressutxo(address)
if not utxos then
    return { utxos = {}, error = "Failed to fetch UTXOs" }
end

local result = { utxos = {}, count = 0 }

for i, utxo in ipairs(utxos) do
    local balance_response = _RPC.protorunes_by_outpoint(
        utxo.txid,
        utxo.vout,
        block_tag,
        protocol_tag
    )

    local utxo_entry = {
        txid = utxo.txid,
        vout = utxo.vout,
        value = utxo.value,
        status = utxo.status,
        balances = {}
    }

    if balance_response and balance_response.balance_sheet then
        local cached = balance_response.balance_sheet.cached
        if cached and cached.balances then
            for alkane_id, amount in pairs(cached.balances) do
                table.insert(utxo_entry.balances, {
                    block = alkane_id.block,
                    tx = alkane_id.tx,
                    amount = amount
                })
            end
        end
    end

    table.insert(result.utxos, utxo_entry)
    result.count = result.count + 1
end

return result
```

---

## Custom Examples

### Get Inscription Content

```lua
local inscription_id = args[1]

local inscription = _RPC.ord_inscription(inscription_id)
if not inscription then
    return { error = "Inscription not found" }
end

local content = _RPC.ord_content(inscription_id)

return {
    id = inscription.id,
    number = inscription.number,
    content_type = inscription.content_type,
    content_length = inscription.content_length,
    content_base64 = content,
    owner = inscription.address,
    sat = inscription.sat
}
```

### Monitor Rune Minting Progress

```lua
local rune_name = args[1]

local rune = _RPC.ord_rune(rune_name)
if not rune or not rune.entry then
    return { error = "Rune not found" }
end

local entry = rune.entry
local mints = tonumber(entry.mints) or 0
local cap = entry.terms and entry.terms.cap or 0

return {
    name = entry.spaced_rune,
    symbol = entry.symbol,
    mints = mints,
    cap = cap,
    progress_percent = cap > 0 and (mints / cap * 100) or 100,
    remaining = cap - mints,
    fully_minted = mints >= cap
}
```

### Check Transaction Confirmation

```lua
local txid = args[1]
local required_confirmations = args[2] or 6

local current_height = _RPC.btc_getblockcount()
local tx = _RPC.esplora_tx(txid)

if not tx then
    return { error = "Transaction not found", txid = txid }
end

local confirmations = 0
if tx.status and tx.status.confirmed and tx.status.block_height then
    confirmations = current_height - tx.status.block_height + 1
end

return {
    txid = txid,
    confirmed = tx.status.confirmed,
    block_height = tx.status.block_height,
    confirmations = confirmations,
    meets_requirement = confirmations >= required_confirmations,
    required = required_confirmations
}
```
