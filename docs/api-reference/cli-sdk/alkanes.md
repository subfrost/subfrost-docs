---
title: Alkanes Commands
sidebar_label: Alkanes Commands
sidebar_position: 4
description: Contract execution, token queries, AMM swaps, and liquidity pool management with alkanes-cli.
---

# Alkanes Commands

The `alkanes` namespace provides operations for the Alkanes protocol including contract execution, token queries, AMM swaps, and liquidity pool management.

## Example commands

Get metadata for an alkane token (name, symbol, total supply):

```bash
$ alkanes-cli -p mainnet alkanes reflect-alkane 2:0
```

Get all AMM pools from the factory contract:

```bash
$ alkanes-cli -p mainnet alkanes get-all-pools
```

Get pool details for pools 0-9 using the experimental AssemblyScript WASM path (tx-script):

```bash
$ alkanes-cli -p mainnet alkanes get-all-pools --pool-details --experimental-asm --range 0-9
```

## Commands Overview

- **`execute`**: Execute an alkanes transaction with protostones
- **`simulate`**: Simulate a contract call without broadcasting
- **`trace`**: Trace an alkanes transaction
- **`inspect`**: Inspect a contract (disassemble, fuzz, metadata)
- **`tx-script`**: Execute a tx-script with WASM bytecode
- **`getbalance`**: Get alkane token balances for an address
- **`spendables`**: Get spendable outpoints for an address
- **`reflect-alkane`**: Get metadata for an alkane (name, symbol, supply)
- **`reflect-alkane-range`**: Reflect metadata for a range of alkanes
- **`getbytecode`**: Get the bytecode for an alkane contract
- **`wrap-btc`**: Wrap BTC to frBTC
- **`unwrap`**: Get pending unwraps
- **`get-all-pools`**: Get all AMM pools
- **`all-pools-details`**: Get detailed pool information
- **`pool-details`**: Get details for a specific pool
- **`init-pool`**: Initialize a new liquidity pool
- **`swap`**: Execute a swap on the AMM
- **`sequence`**: Get the sequence for an outpoint
- **`traceblock`**: Trace a block
- **`backtest`**: Backtest a transaction

## alkanes execute

Execute an alkanes transaction with one or more protostones.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes execute <PROTOSTONES> \
  --to <RECIPIENT> \
  --from <SOURCE> \
  --fee-rate 10 \
  -y
```

**Arguments:**

- `<PROTOSTONES>`: Protostone specifications

**Options:**

- `--inputs <INPUTS>`: Input requirements (format: `B:amount`, `B:amount:vN`, `block:tx:amount`)
- `--to <TO>`: Recipient addresses
- `--from <FROM>`: Source addresses for UTXOs
- `--change <CHANGE>`: Change address for BTC
- `--alkanes-change <ALKANES_CHANGE>`: Change address for unwanted alkanes
- `--fee-rate <FEE_RATE>`: Fee rate in sat/vB
- `--envelope <ENVELOPE>`: Path to envelope file (for contract deployment)
- `--raw`: Show raw JSON output
- `--trace`: Enable transaction tracing
- `--mine`: Mine a block after broadcasting (regtest only)
- `-y, --auto-confirm`: Auto-confirm the transaction

## alkanes simulate

Simulate an alkanes contract call without broadcasting.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes simulate 2:0:99 \
  --inputs "2:1:1000,32:0:5000"
```

**Arguments:**

- `<ALKANE_ID>`: Alkane ID with opcode (format: `block:tx:opcode`)

**Options:**

- `--inputs <INPUTS>`: Input alkanes as comma-separated triplets (e.g., `2:1:1,2:2:100`)
- `--height <HEIGHT>`: Block height for simulation
- `--block <BLOCK>`: Block hex data (0x prefixed)
- `--transaction <TRANSACTION>`: Transaction hex data (0x prefixed)
- `--envelope <ENVELOPE>`: Path to WASM file to pack into witness
- `--pointer <POINTER>`: Pointer value (default: 0)
- `--txindex <TXINDEX>`: Transaction index (default: 1)
- `--refund <REFUND>`: Refund pointer (default: 0)
- `--block-tag <BLOCK_TAG>`: Block tag (e.g., "latest" or height)
- `--raw`: Show raw JSON output

## alkanes trace

Trace an alkanes transaction to see execution details.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes trace <TXID>:<VOUT>
```

**Arguments:**

- `<OUTPOINT>`: The transaction outpoint to trace

**Options:**

- `--raw`: Show raw JSON output

## alkanes inspect

Inspect an alkanes contract for debugging and analysis.

```bash
# Disassemble bytecode
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes inspect 2:0 --disasm

# Show metadata
alkanes-cli alkanes inspect 2:0 --meta

# Fuzz contract with opcode range
alkanes-cli alkanes inspect 2:0 --fuzz --fuzz-ranges "99-110"

# Get code hash
alkanes-cli alkanes inspect 2:0 --codehash
```

**Arguments:**

- `<OUTPOINT>`: The contract outpoint

**Options:**

- `--disasm`: Disassemble the contract bytecode
- `--fuzz`: Fuzz the contract with a range of opcodes
- `--fuzz-ranges <RANGES>`: Opcode ranges to fuzz
- `--meta`: Show contract metadata
- `--codehash`: Show contract code hash
- `--raw`: Show raw JSON output

## alkanes reflect-alkane

Get metadata for an alkane token by calling standard view opcodes.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes reflect-alkane 2:0
```

**Output:**

```
Alkane Metadata for 2:0
═══════════════════════
  Name: DIESEL
  Symbol: DIESEL
  Total Supply: 5050000000
```

**Arguments:**

- `<ALKANE_ID>`: Alkane ID (format: `block:tx`)

**Options:**

- `--concurrency <N>`: Max concurrent RPC calls (default: 30)
- `--raw`: Show raw JSON output

## alkanes getbalance

Get alkane token balances for an address.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes getbalance bc1p...
```

**Arguments:**

- `[ADDRESS]`: The address to query (uses wallet address if not provided)

**Options:**

- `--raw`: Show raw JSON output

## alkanes spendables

Get spendable alkane outpoints for an address.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes spendables bc1p...
```

## alkanes wrap-btc

Wrap BTC to frBTC and lock in vault.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes wrap-btc 100000 \
  --to bc1p... \
  --fee-rate 10 \
  -y
```

**Arguments:**

- `<AMOUNT>`: Amount of BTC to wrap (in satoshis)

**Options:**

- `--to <TO>`: Address to receive frBTC tokens (required)
- `--from <FROM>`: Addresses to source UTXOs from
- `--change <CHANGE>`: Change address
- `--fee-rate <FEE_RATE>`: Fee rate in sat/vB
- `--raw`: Show raw JSON output
- `--trace`: Enable transaction tracing
- `--mine`: Mine a block after broadcasting (regtest only)
- `-y, --auto-confirm`: Auto-confirm the transaction

## alkanes swap

Execute a swap on the AMM.

```bash
# Swap DIESEL for frBTC
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes swap \
  --path "2:0,32:0" \
  --input 1000000 \
  --slippage 5.0 \
  --auto-confirm
```

**Options:**

- `--path <PATH>`: Swap path as comma-separated alkane IDs (e.g., `2:0,32:0` for DIESEL->frBTC)
- `--input <INPUT>`: Input token amount (required)
- `--minimum-output <AMOUNT>`: Minimum output (overrides slippage)
- `--slippage <PERCENT>`: Slippage percentage (default: 5.0%)
- `--expires <HEIGHT>`: Expiry block height (default: current + 100)
- `--to <TO>`: Recipient address (default: p2tr:0)
- `--from <FROM>`: Sender address (default: p2tr:0)
- `--change <CHANGE>`: Change address
- `--fee-rate <FEE_RATE>`: Fee rate in sat/vB
- `--factory <FACTORY>`: Factory ID for path optimization (default: 4:65522)
- `--no-optimize`: Skip path optimization
- `--trace`: Show trace after confirmation
- `--mine`: Mine a block after broadcasting (regtest only)
- `--auto-confirm`: Auto-confirm without prompting

## alkanes init-pool

Initialize a new liquidity pool.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes init-pool \
  --pair "2:0,32:0" \
  --liquidity "300000000:50000" \
  --to p2tr:0 \
  --from p2tr:0 \
  --auto-confirm
```

**Options:**

- `--pair <PAIR>`: Token pair (format: `BLOCK:TX,BLOCK:TX`)
- `--liquidity <LIQUIDITY>`: Initial liquidity (format: `AMOUNT0:AMOUNT1`)
- `--to <TO>`: Recipient address identifier (e.g., p2tr:0)
- `--from <FROM>`: Sender address identifier
- `--change <CHANGE>`: Change address
- `--minimum <MINIMUM>`: Minimum LP tokens to receive
- `--fee-rate <FEE_RATE>`: Fee rate in sat/vB
- `--factory <FACTORY>`: Factory ID (default: 4:1)
- `--trace`: Show trace after confirmation
- `--auto-confirm`: Auto-confirm without prompting

## alkanes get-all-pools

Get all pools from an AMM factory contract.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes get-all-pools
```

Uses factory 4:65522 by default.

## alkanes pool-details

Get details for a specific liquidity pool.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes pool-details 2:3
```

## alkanes get-all-pools --experimental-asm --pool-details

Get pool details using the experimental AssemblyScript WASM approach. This uses `tx-script` execution with embedded WASM binaries to batch multiple pool detail queries into efficient RPC calls.

```bash
# Fetch all pools with details (batched)
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes get-all-pools --experimental-asm --pool-details

# Fetch a specific range of pools (single chunk)
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes get-all-pools --experimental-asm --pool-details --range 0-9
```

**How it works:**

1. **Step 1**: Calls `tx-script` with the embedded `get-all-pools` WASM to get the total pool count
2. **Step 2**: Calls `tx-script` with the `get-all-pools-details` WASM to fetch details for a range of pools in a single RPC call

**Response format:**

```json
{
  "total": 142,
  "start": 0,
  "end": 9,
  "count": 10,
  "pools": [
    {
      "pool_id_block": 2,
      "pool_id_tx": 53199,
      "details": {
        "token_a_block": 2,
        "token_a_tx": 0,
        "token_b_block": 2,
        "token_b_tx": 16,
        "reserve_a": "79785789299",
        "reserve_b": "2835905850298579283",
        "total_supply": "474859903703873",
        "pool_name": "DIESEL / METHANE LP"
      }
    }
  ]
}
```

**Options:**

- `--experimental-asm`: Use AssemblyScript WASM for batched queries
- `--pool-details`: Include full pool details (reserves, tokens, LP supply)
- `--range <START>-<END>`: Pool index range to fetch (default: all pools)
- `--chunk-size <SIZE>`: Pools per batch when fetching all (default: 20)
- `--factory <FACTORY>`: Factory ID (default: 4:65522)

## alkanes tx-script

Execute a tx-script with WASM bytecode.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes tx-script \
  --envelope /path/to/script.wasm \
  --inputs "1,2,3"
```

**Options:**

- `--envelope <ENVELOPE>`: Path to WASM file (required)
- `--inputs <INPUTS>`: Cellpack inputs as comma-separated u128 values
- `--block-tag <BLOCK_TAG>`: Block tag (e.g., "latest" or height)
- `--raw`: Show raw JSON output

## alkanes getbytecode

Get the bytecode for an alkane contract.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes getbytecode 2:0
```

## alkanes unwrap

Get pending unwraps from the protocol.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes unwrap
```

## alkanes backtest

Backtest a transaction by simulating it in a block.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  alkanes backtest <TX_HEX>
```

## Next Steps

- [Wallet Commands](./wallet): Wallet management
- [Ord Commands](./ord): Ordinals queries
- [DataAPI Commands](./dataapi): High-level data queries
