---
title: lua_evalsaved
sidebar_label: lua_evalsaved
sidebar_position: 4
description: Execute a previously saved Lua script by its SHA256 hash, for lower bandwidth and faster parsing than lua_evalscript.
---

# lua_evalsaved

Execute a previously saved Lua script by its SHA256 hash.

## Method

`lua_evalsaved`

## Parameters

- **0** (string): Script SHA256 hash (from lua_savescript)
- **1+** (any): Optional arguments (accessible via `args` table)

## Request

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalsaved",
  "params": [
    "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd",
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
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
    "returns": 5,
    "error": null,
    "runtime": 32
  },
  "id": 1
}
```

## Response Fields

- **`calls`** (number): Number of RPC calls made during execution
- **`returns`** (any): Return value from the Lua script
- **`error`** (object/null): Error information if execution failed
- **`runtime`** (number): Execution time in milliseconds

## Error: Script Not Found

If the script hash is not in storage:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "calls": 0,
    "returns": null,
    "error": {
      "code": -32602,
      "message": "Script not found for hash: a1b2c3d4..."
    },
    "runtime": 0
  },
  "id": 1
}
```

## Complete Workflow Example

### Step 1: Save the Script

```json
{
  "jsonrpc": "2.0",
  "method": "lua_savescript",
  "params": [
    "local address = args[1]\nlocal ord_outputs = _RPC.ord_outputs(address)\nlocal inscriptions = {}\nfor _, output in ipairs(ord_outputs) do\n  if output.inscriptions then\n    for _, insc in ipairs(output.inscriptions) do\n      table.insert(inscriptions, insc)\n    end\n  end\nend\nreturn { count = #inscriptions, inscriptions = inscriptions }"
  ],
  "id": 1
}
```

Response:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "hash": "7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730"
  },
  "id": 1
}
```

### Step 2: Execute Multiple Times

First execution:

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalsaved",
  "params": [
    "7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
    "bc1pxyz..."
  ],
  "id": 2
}
```

Second execution with different address:

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalsaved",
  "params": [
    "7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
    "bc1pabc..."
  ],
  "id": 3
}
```

## JavaScript Example with Fallback

```javascript
async function executeScript(scriptCode, ...args) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(scriptCode).digest('hex');

  // Try evalsaved first
  try {
    const response = await rpc('lua_evalsaved', [hash, ...args]);
    if (!response.error || !response.error.message.includes('not found')) {
      return response;
    }
  } catch (e) {
    // Script not saved, continue to save it
  }

  // Save the script
  await rpc('lua_savescript', [scriptCode]);

  // Now execute with evalsaved
  return await rpc('lua_evalsaved', [hash, ...args]);
}

// Usage
const script = `
  local address = args[1]
  local utxos = _RPC.esplora_addressutxo(address)
  return #utxos
`;

const result = await executeScript(script, 'bc1q...');
console.log('UTXO count:', result.returns);
```

## Advantages Over lua_evalscript

- **Request size:** lua_evalscript sends full script, lua_evalsaved sends 64-char hash
- **Parse time:** lua_evalscript parses every request, lua_evalsaved parses once on save
- **Network usage:** lua_evalsaved is lower bandwidth
- **Best for:** lua_evalscript for development, lua_evalsaved for production

## Caching Strategy

For production applications:

```javascript
class ScriptCache {
  constructor() {
    this.scripts = new Map();
    this.hashes = new Map();
  }

  register(name, code) {
    const hash = this.computeHash(code);
    this.scripts.set(name, { code, hash, saved: false });
    this.hashes.set(hash, name);
  }

  computeHash(code) {
    return require('crypto').createHash('sha256').update(code).digest('hex');
  }

  async ensureSaved(rpcClient, name) {
    const script = this.scripts.get(name);
    if (!script) throw new Error(`Unknown script: ${name}`);

    if (!script.saved) {
      await rpcClient.call('lua_savescript', [script.code]);
      script.saved = true;
    }

    return script.hash;
  }

  async run(rpcClient, name, ...args) {
    const hash = await this.ensureSaved(rpcClient, name);
    return await rpcClient.call('lua_evalsaved', [hash, ...args]);
  }
}

// Initialize on startup
const cache = new ScriptCache();
cache.register('getBalance', `
  local addr = args[1]
  local utxos = _RPC.esplora_addressutxo(addr)
  local sum = 0
  for _, u in ipairs(utxos) do sum = sum + u.value end
  return sum
`);

// Use throughout application
const balance = await cache.run(rpc, 'getBalance', 'bc1q...');
```
