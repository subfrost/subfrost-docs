---
title: lua_savescript
sidebar_label: lua_savescript
sidebar_position: 3
description: Save a Lua script to the server and receive its SHA256 hash for repeated, low-bandwidth execution.
---

# lua_savescript

Save a Lua script to the server and receive its SHA256 hash for future execution.

## Method

`lua_savescript`

## Parameters

- **0** (string): Lua script source code

## Request

```json
{
  "jsonrpc": "2.0",
  "method": "lua_savescript",
  "params": [
    "local addr = args[1]\nlocal utxos = _RPC.esplora_addressutxo(addr)\nreturn #utxos"
  ],
  "id": 1
}
```

## Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "hash": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd"
  },
  "id": 1
}
```

## Response Fields

- **`hash`** (string): SHA256 hash of the script (64 hex characters)

## Usage Pattern

### 1. Save the Script

```json
{
  "jsonrpc": "2.0",
  "method": "lua_savescript",
  "params": [
    "local address = args[1]\nlocal utxos = _RPC.esplora_addressutxo(address)\nlocal total = 0\nfor _, u in ipairs(utxos) do total = total + u.value end\nreturn { balance = total, count = #utxos }"
  ],
  "id": 1
}
```

Response:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  "id": 1
}
```

### 2. Execute the Saved Script

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalsaved",
  "params": [
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
  ],
  "id": 2
}
```

## Benefits of Saved Scripts

1. **Reduced Bandwidth**: Send 64-char hash instead of full script
2. **Faster Parsing**: Script is pre-parsed on save
3. **Consistent Execution**: Same script runs every time
4. **Version Control**: Hash changes if script changes

## JavaScript Example

```javascript
class LuaScriptManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.savedScripts = new Map();
  }

  async rpc(method, params) {
    const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-subfrost-api-key': this.apiKey
      },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  }

  async saveScript(name, code) {
    const result = await this.rpc('lua_savescript', [code]);
    this.savedScripts.set(name, result.hash);
    return result.hash;
  }

  async runSaved(name, ...args) {
    const hash = this.savedScripts.get(name);
    if (!hash) throw new Error(`Script "${name}" not saved`);
    return await this.rpc('lua_evalsaved', [hash, ...args]);
  }
}

// Usage
const scripts = new LuaScriptManager('YOUR_API_KEY');

// Save once
await scripts.saveScript('getBalance', `
  local address = args[1]
  local utxos = _RPC.esplora_addressutxo(address)
  local total = 0
  for _, u in ipairs(utxos) do total = total + u.value end
  return { balance = total, count = #utxos }
`);

// Run many times
const balance1 = await scripts.runSaved('getBalance', 'bc1q...');
const balance2 = await scripts.runSaved('getBalance', 'bc1p...');
```

## Storage Notes

- Scripts are stored in-memory on the server
- Scripts may be cleared on server restart
- Use client-side caching for production applications
- Consider re-saving scripts on application startup

## Hash Computation

The hash is computed as SHA256 of the script content:

```javascript
const crypto = require('crypto');

function computeScriptHash(script) {
  return crypto.createHash('sha256').update(script).digest('hex');
}

// You can pre-compute hashes locally
const script = "return _RPC.btc_getblockcount()";
const hash = computeScriptHash(script);
console.log(hash); // Use this to check if script is already saved
```

## Error Cases

### Script Too Large

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Script exceeds maximum size limit"
  },
  "id": 1
}
```

### Invalid Lua Syntax

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Lua syntax error: unexpected symbol near 'end'"
  },
  "id": 1
}
```
