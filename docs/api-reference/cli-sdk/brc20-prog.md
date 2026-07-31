---
title: BRC20-Prog Commands
sidebar_label: BRC20-Prog Commands
sidebar_position: 7
description: Deploy and interact with EVM-compatible smart contracts on Bitcoin via alkanes-cli.
---

# BRC20-Prog Commands

The `brc20-prog` namespace provides operations for BRC20-Prog, the EVM-compatible smart contract layer on Bitcoin. This enables Ethereum-style contract deployment and interaction.

## Example commands

Get the current block number from the BRC20-Prog EVM:

```bash
$ alkanes-cli -p mainnet brc20-prog block-number
```

Get the chain ID for the BRC20-Prog network:

```bash
$ alkanes-cli -p mainnet brc20-prog chain-id
```

## Commands Overview

**Contract Operations:**

- **`deploy-contract`**: Deploy a contract from Foundry build JSON
- **`transact`**: Call a contract function (state-changing)
- **`call`**: Call a contract function (read-only, eth_call)
- **`wrap-btc`**: Wrap BTC to frBTC and execute in brc20-prog

**Contract Queries:**

- **`get-code`**: Get contract bytecode (eth_getCode)
- **`get-contract-deploys`**: Get contract deployments by address
- **`get-storage-at`**: Get storage at location (eth_getStorageAt)

**Balance & Account:**

- **`get-balance`**: Get frBTC balance (eth_getBalance)
- **`brc20-balance`**: Get BRC20 balance (brc20_balance)
- **`get-transaction-count`**: Get nonce (eth_getTransactionCount)

**Transaction Queries:**

- **`get-transaction`**: Get transaction by hash (eth_getTransactionByHash)
- **`get-transaction-receipt`**: Get transaction receipt (eth_getTransactionReceipt)
- **`get-receipt-by-inscription`**: Get receipt by inscription ID
- **`get-inscription-by-tx`**: Get inscription ID by tx hash
- **`get-inscription-by-contract`**: Get inscription ID by contract address
- **`trace-transaction`**: Get transaction trace (debug_traceTransaction)

**Block Queries:**

- **`block-number`**: Get current block number (eth_blockNumber)
- **`get-block-by-number`**: Get block by number (eth_getBlockByNumber)
- **`get-block-by-hash`**: Get block by hash (eth_getBlockByHash)

**Other:**

- **`estimate-gas`**: Estimate gas (eth_estimateGas)
- **`chain-id`**: Get chain ID (eth_chainId)
- **`gas-price`**: Get gas price (eth_gasPrice)
- **`get-logs`**: Get logs (eth_getLogs)
- **`version`**: Get BRC20-Prog version (brc20_version)
- **`txpool-content`**: Get txpool content (txpool_content)
- **`client-version`**: Get client version (web3_clientVersion)
- **`unwrap`**: Get pending unwraps from FrBTC contract

## Endpoint Configuration

BRC20-Prog uses a separate JSON-RPC endpoint:

```bash
# Using the brc20-prog endpoint
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog block-number
```

Or with your API key:

```bash
--brc20-prog-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/brc20-prog
```

## brc20-prog deploy-contract

Deploy a Solidity contract from Foundry build output.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog deploy-contract ./out/MyContract.sol/MyContract.json \
  --fee-rate 10 \
  -y
```

**Arguments:**

- `<FOUNDRY_JSON_PATH>`: Path to Foundry build JSON file

**Options:**

- `--from <FROM>`: Addresses to source UTXOs from
- `--change <CHANGE>`: Change address
- `--fee-rate <FEE_RATE>`: Fee rate in sat/vB
- `--raw`: Show raw JSON output
- `--trace`: Enable transaction tracing
- `--mine`: Mine a block after broadcasting (regtest only)
- `-y, --auto-confirm`: Auto-confirm the transaction

## brc20-prog transact

Call a state-changing function on a BRC20-prog contract.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog transact \
  --address 0x1234...abcd \
  --signature "transfer(address,uint256)" \
  --calldata "0xRecipient...,1000" \
  --fee-rate 10 \
  -y
```

**Options:**

- `--address <ADDRESS>`: Contract address (0x prefixed hex)
- `--signature <SIGNATURE>`: Function signature (e.g., "transfer(address,uint256)")
- `--calldata <CALLDATA>`: Arguments as comma-separated values
- `--from <FROM>`: Addresses to source UTXOs from
- `--change <CHANGE>`: Change address
- `--fee-rate <FEE_RATE>`: Fee rate in sat/vB
- `--raw`: Show raw JSON output
- `--trace`: Enable transaction tracing
- `--mine`: Mine a block after broadcasting (regtest only)
- `-y, --auto-confirm`: Auto-confirm the transaction

## brc20-prog wrap-btc

Wrap BTC to frBTC and execute a function on a target contract.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog wrap-btc 100000 \
  --target 0x1234...abcd \
  --signature "deposit()" \
  --calldata "" \
  --fee-rate 10 \
  -y
```

**Arguments:**

- `<AMOUNT>`: Amount of BTC to wrap (in satoshis)

**Options:**

- `--target <TARGET>`: Target contract address
- `--signature <SIGNATURE>`: Function signature to call
- `--calldata <CALLDATA>`: Calldata arguments
- `--from <FROM>`: Addresses to source UTXOs from
- `--change <CHANGE>`: Change address
- `--fee-rate <FEE_RATE>`: Fee rate in sat/vB
- `--raw`: Show raw JSON output
- `--trace`: Enable transaction tracing
- `--mine`: Mine a block after broadcasting (regtest only)
- `-y, --auto-confirm`: Auto-confirm the transaction

## brc20-prog call

Make a read-only call to a contract (eth_call equivalent).

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog call \
  --to 0x1234...abcd \
  --data 0x70a08231000000000000000000000000...
```

## brc20-prog get-balance

Get the frBTC balance of an address (eth_getBalance equivalent).

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog get-balance 0x1234...abcd
```

## brc20-prog get-code

Get the bytecode of a deployed contract.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog get-code 0x1234...abcd
```

## brc20-prog block-number

Get the current block number.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog block-number
```

## brc20-prog get-transaction

Get transaction details by hash.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog get-transaction 0xabc123...
```

## brc20-prog get-transaction-receipt

Get transaction receipt with logs and status.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog get-transaction-receipt 0xabc123...
```

## brc20-prog estimate-gas

Estimate gas for a transaction.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog estimate-gas \
  --to 0x1234...abcd \
  --data 0x...
```

## brc20-prog chain-id

Get the chain ID.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog chain-id
```

## brc20-prog get-logs

Get event logs matching filter criteria.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog get-logs \
  --address 0x1234...abcd \
  --from-block 840000 \
  --to-block latest
```

## brc20-prog trace-transaction

Get detailed execution trace for a transaction.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog trace-transaction 0xabc123...
```

## brc20-prog unwrap

Get pending unwraps from the BRC20-Prog FrBTC contract.

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog unwrap
```

## JSON-RPC Methods

BRC20-Prog supports standard Ethereum JSON-RPC methods:

- `eth_blockNumber`
- `eth_getBalance`
- `eth_getCode`
- `eth_call`
- `eth_estimateGas`
- `eth_getTransactionByHash`
- `eth_getTransactionReceipt`
- `eth_getBlockByNumber`
- `eth_getBlockByHash`
- `eth_getTransactionCount`
- `eth_getStorageAt`
- `eth_getLogs`
- `eth_chainId`
- `eth_gasPrice`

Plus BRC20-Prog specific methods:

- `brc20_version`
- `brc20_balance`
- `brc20_getTxReceiptByInscriptionId`
- `brc20_getInscriptionIdByTxHash`
- `brc20_getInscriptionIdByContractAddress`

## Next Steps

- [DataAPI Commands](./dataapi): High-level data queries
- [Alkanes Commands](./alkanes): Alkanes protocol operations
- [JSON-RPC brc20_\* Methods](../json-rpc/brc20-prog): Full RPC reference
