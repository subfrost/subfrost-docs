---
title: ord_* Methods
sidebar_label: ord_*
sidebar_position: 3
description: Ordinals protocol methods for inscriptions, runes, satoshis, outputs, and addresses.
---

# ord_* Methods

The `ord_*` namespace provides access to Ordinals protocol data, including inscriptions, runes, and satoshi tracking.

## Block Information

### ord_blockcount

Get the total block count.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_blockcount",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": 925737,
  "id": 1
}
```

**Lua Example:**

```lua
local count = _RPC.ord_blockcount()
return { block_count = count }
```

Returns the total number of blocks indexed.

---

### ord_blockhash

Get the block hash at a specific height.

**Parameters:**

- **0** (number): Block height

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_blockhash",
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
local height = args[1] or 840000
local hash = _RPC.ord_blockhash(height)
return { height = height, hash = hash }
```

Converts a block height to its hash.

---

### ord_blocktime

Get the timestamp of the latest block.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_blocktime",
  "params": [],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": 1764440776,
  "id": 1
}
```

**Lua Example:**

```lua
local timestamp = _RPC.ord_blocktime()
return { timestamp = timestamp }
```

Returns the Unix timestamp of the most recent indexed block.

---

### ord_blockheight

Get the current indexed block height.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_blockheight",
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

> **Note:** This method is available via JSON-RPC but may not be available in Lua scripts. Use `ord_blockcount` in Lua instead.

Returns the current block height indexed by the ord indexer.

---

## Inscription Methods

### ord_inscription

Get inscription details by ID.

**Parameters:**

- **0** (string): Inscription ID (format: `txidi0`)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_inscription",
  "params": ["6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0"],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "id": "6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0",
    "number": 0,
    "address": "bc1pd96xzyue7yvjf24cmu07xasezg3jpm5tyfem4txad5ke2jas4m7qkhe7dy",
    "content_type": "image/png",
    "content_length": 793,
    "fee": 322,
    "height": 767430,
    "sat": 1252201400444387,
    "satpoint": "717d25914a1191c30f4c1d709e3ec0e1fab79cc7bf92cd12a93bed68db63416a:0:0",
    "timestamp": 1671049920,
    "value": 606,
    "charms": [],
    "child_count": 5,
    "parents": [],
    "rune": null
  },
  "id": 1
}
```

**Lua Example:**

```lua
local id = args[1]
local insc = _RPC.ord_inscription(id)
return {
  id = insc.id,
  number = insc.number,
  content_type = insc.content_type,
  content_length = insc.content_length,
  genesis_height = insc.height,
  current_owner = insc.address,
  sat = insc.sat,
  fee = insc.fee
}
```

Gets full details about an Ordinal inscription.

---

### ord_inscriptions

Get inscriptions with pagination.

**Parameters:**

- **0** (number): Page number

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_inscriptions",
  "params": [0],
  "id": 1
}
```

**Lua Example:**

```lua
local page = args[1] or 0
local inscriptions = _RPC.ord_inscriptions(page)
return {
  page = page,
  count = #inscriptions
}
```

Lists inscriptions starting from a specific page.

---

### ord_inscriptions::block

Get inscriptions in a specific block.

**Parameters:**

- **0** (number): Block height

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_inscriptions::block",
  "params": [840000],
  "id": 1
}
```

> **Note:** This method is available via JSON-RPC but not in Lua scripts.

Gets all inscriptions created in a specific block.

---

## Rune Methods

### ord_rune

Get rune information by name.

**Parameters:**

- **0** (string): Rune name (with spacers like •)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_rune",
  "params": ["UNCOMMON•GOODS"],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "id": "1:0",
    "entry": {
      "block": 1,
      "burned": 16864,
      "divisibility": 0,
      "etching": "0000000000000000000000000000000000000000000000000000000000000000",
      "mints": 64709945,
      "number": 0,
      "premine": 0,
      "spaced_rune": "UNCOMMON•GOODS",
      "symbol": "⧉",
      "terms": {
        "amount": 1,
        "cap": 3.402823669209385e38,
        "height": [840000, 1050000]
      },
      "timestamp": 0,
      "turbo": true
    },
    "mintable": true,
    "parent": null
  },
  "id": 1
}
```

**Lua Example:**

```lua
local name = args[1]
local rune = _RPC.ord_rune(name)
return {
  id = rune.id,
  name = rune.entry.spaced_rune,
  symbol = rune.entry.symbol,
  divisibility = rune.entry.divisibility,
  total_mints = rune.entry.mints,
  mintable = rune.mintable
}
```

Gets details about a specific rune.

---

### ord_runes

Get all runes with pagination.

**Parameters:**

- **0** (number): Page number

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_runes",
  "params": [0],
  "id": 1
}
```

**Lua Example:**

```lua
local page = args[1] or 0
local runes = _RPC.ord_runes(page)
return {
  page = page,
  result_type = type(runes)
}
```

Lists all runes starting from a page number.

---

## Satoshi Methods

### ord_sat

Get information about a specific satoshi.

**Parameters:**

- **0** (number): Satoshi ordinal number

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_sat",
  "params": [1000000000000],
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "number": 1000000000000,
    "name": "nvoivgmdyqb",
    "block": 200,
    "cycle": 0,
    "epoch": 0,
    "period": 0,
    "offset": 0,
    "rarity": "uncommon",
    "percentile": "0.04761904767142859%",
    "decimal": "200.0",
    "degree": "0°200′200″0‴",
    "satpoint": "2b1f06c2401d3b49a33c3f5ad5864c0bc70044c4068f9174546f3cfc1887d5ba:0:0",
    "timestamp": 1231753120,
    "inscriptions": [],
    "charms": ["coin", "uncommon"]
  },
  "id": 1
}
```

**Lua Example:**

```lua
local sat_num = args[1]
local sat = _RPC.ord_sat(sat_num)
return {
  number = sat.number,
  name = sat.name,
  rarity = sat.rarity,
  block = sat.block,
  epoch = sat.epoch,
  charms = sat.charms
}
```

Gets details about a sat number including rarity and inscriptions.

---

## Output Methods

### ord_output

Get ordinals data for a specific output.

**Parameters:**

- **0** (string): Outpoint (format: txid:vout)

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_output",
  "params": ["0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098:0"],
  "id": 1
}
```

**Lua Example:**

```lua
local outpoint = args[1]
local output = _RPC.ord_output(outpoint)
return {
  outpoint = outpoint,
  address = output.address,
  value = output.value
}
```

Gets inscriptions and runes at a specific outpoint.

---

## Address Methods

### ord_address

Get address ordinals summary.

**Parameters:**

- **0** (string): Bitcoin address

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_address",
  "params": ["bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h"],
  "id": 1
}
```

> **Note:** This method is available via JSON-RPC but not in Lua scripts.

Gets inscription and rune summary for an address.

---

### ord_address::inscriptions

Get inscriptions owned by an address.

**Parameters:**

- **0** (string): Bitcoin address

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "ord_address::inscriptions",
  "params": ["bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h"],
  "id": 1
}
```

> **Note:** This method is available via JSON-RPC but not in Lua scripts.

Lists all inscriptions held by an address.
