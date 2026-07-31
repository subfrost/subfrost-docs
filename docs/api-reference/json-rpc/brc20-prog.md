---
title: BRC20 Programmable Module (JSON-RPC)
sidebar_label: brc20_* (BRC20-Prog)
sidebar_position: 7
description: Ethereum-compatible JSON-RPC methods for the BRC-20 Programmable Module, plus precompiled contracts and the BRC20_Controller.
---

# BRC20 Programmable Module (JSON-RPC)

The BRC2.0 Programmable Module provides smart contract execution capabilities for BRC-20 indexers, running on a custom EVM execution engine using [revm](https://github.com/bluealloy/revm). This allows inscribing smart contracts and function calls on the Bitcoin blockchain.

See the [BRC2.0 Proposal](https://github.com/bestinslot-xyz/brc20-prog-module-proposal) for detailed protocol information.

## Endpoint

```
POST https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog
```

Also available on other networks:

- Signet: `https://signet.subfrost.io/v4/jsonrpc/brc20-prog`
- Regtest: `https://regtest.subfrost.io/v4/jsonrpc/brc20-prog`

With API key: `https://mainnet.subfrost.io/v4/{api_key}/brc20-prog`

---

## Ethereum-Compatible Methods

BRC2.0 implements the [Ethereum JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) for read operations.

### `eth_blockNumber`

Returns the latest indexed block height.

```json
{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}
```

### `eth_getBlockByNumber`

Returns block information with all indexed transactions.

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getBlockByNumber",
  "params": ["0x1", true],
  "id": 1
}
```

### `eth_getBlockByHash`

Returns block information by block hash.

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getBlockByHash",
  "params": ["0x...", true],
  "id": 1
}
```

### `eth_getTransactionReceipt`

Returns the transaction receipt including logs and status.

```json
{
  "jsonrpc": "2.0",
  "method": "eth_getTransactionReceipt",
  "params": ["0x..."],
  "id": 1
}
```

### `eth_call`

Interact with deployed contracts (read-only).

```json
{
  "jsonrpc": "2.0",
  "method": "eth_call",
  "params": [{
    "to": "0x...",
    "data": "0x..."
  }, "latest"],
  "id": 1
}
```

### `eth_estimateGas`

Estimate gas for a transaction.

```json
{
  "jsonrpc": "2.0",
  "method": "eth_estimateGas",
  "params": [{
    "to": "0x...",
    "data": "0x..."
  }],
  "id": 1
}
```

---

## Debug Methods

### `debug_traceTransaction`

Returns a callTracer result for a transaction. Requires `EVM_RECORD_TRACES=true` on the server.

```json
{
  "jsonrpc": "2.0",
  "method": "debug_traceTransaction",
  "params": ["0x...", {"tracer": "callTracer"}],
  "id": 1
}
```

---

## Transaction Pool

### `txpool_content`

Returns pending transactions that were sent out of order.

```json
{
  "jsonrpc": "2.0",
  "method": "txpool_content",
  "params": [],
  "id": 1
}
```

---

## BRC-20 Balance Method

### `brc20_balance`

Returns the current BRC-20 balance (in-module) for a given pkscript and ticker.

**Parameters:**

- `pkscript` (string): Bitcoin pkscript (hex)
- `ticker` (string): BRC-20 ticker

```json
{
  "jsonrpc": "2.0",
  "method": "brc20_balance",
  "params": {
    "pkscript": "0014...",
    "ticker": "ordi"
  },
  "id": 1
}
```

---

## Receipt Lookup Methods

### `brc20_getTxReceiptByInscriptionId`

Returns the transaction receipt for a given inscription ID.

```json
{
  "jsonrpc": "2.0",
  "method": "brc20_getTxReceiptByInscriptionId",
  "params": ["abc123i0"],
  "id": 1
}
```

### `brc20_getInscriptionIdByTxHash`

Returns the inscription ID for a given transaction hash.

```json
{
  "jsonrpc": "2.0",
  "method": "brc20_getInscriptionIdByTxHash",
  "params": ["0x..."],
  "id": 1
}
```

---

## Precompiled Contracts

BRC2.0 includes precompiled contracts for Bitcoin-specific operations:

- **BIP322_Verifier**: `0x00000000000000000000000000000000000000fe`
- **BTC_Transaction**: `0x00000000000000000000000000000000000000fd`
- **BTC_LastSatLoc**: `0x00000000000000000000000000000000000000fc`
- **BTC_LockedPkScript**: `0x00000000000000000000000000000000000000fb`

### BIP322 Verifier

Verify BIP-322 signatures. Supports P2TR, P2WPKH, and P2SH-P2WPKH single-sig addresses.

```solidity
interface IBIP322_Verifier {
    function verify(
        bytes calldata pkscript,
        bytes calldata message,
        bytes calldata signature
    ) external returns (bool success);
}
```

### BTC Transaction

Get Bitcoin transaction details.

```solidity
interface IBTC_Transaction {
    function getTxDetails(bytes32 txid) external view returns (
        uint256 block_height,
        bytes32[] memory vin_txids,
        uint256[] memory vin_vouts,
        bytes[] memory vin_scriptPubKeys,
        uint256[] memory vin_values,
        bytes[] memory vout_scriptPubKeys,
        uint256[] memory vout_values
    );
}
```

### BTC Last Sat Location

Track satoshi locations using ordinal theory.

```solidity
interface IBTC_LastSatLoc {
    function getLastSatLocation(
        bytes32 txid,
        uint256 vout,
        uint256 sat
    ) external view returns (
        bytes32 last_txid,
        uint256 last_vout,
        uint256 last_sat,
        bytes memory old_pkscript,
        bytes memory new_pkscript
    );
}
```

### BTC Locked PkScript

Calculate lock pkscripts for time-locked outputs.

```solidity
interface IBTC_LockedPkscript {
    function getLockedPkscript(
        bytes calldata pkscript,
        uint256 lock_block_count
    ) external view returns (bytes memory locked_pkscript);
}
```

---

## BRC20_Controller Contract

The `BRC20_Controller` contract is deployed at `0xc54dd4581af2dbf18e4d90840226756e9d2b3cdb` and handles BRC-20 deposits, transfers, and withdrawals within the programmable module.

---

## Error Handling

Standard JSON-RPC 2.0 errors are returned:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request"
  },
  "id": 1
}
```
