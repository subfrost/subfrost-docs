---
title: BRC2.0 Integration
sidebar_label: BRC2.0 Integration
sidebar_position: 5
description: Deploy and call EVM-style Solidity contracts on Bitcoin through BRC2.0.
---

# BRC2.0 Integration

[BRC2.0 Metaprotocol](../protocol/brc20) runs EVM-compatible smart contracts on Bitcoin. If you write Solidity, you can deploy and call contracts here with tooling you already know, and reach Bitcoin-backed frBTC from inside them. This page covers the developer workflow through `alkanes-cli`. For the concept, see [BRC2.0 Metaprotocol](../protocol/brc20); for the full command list, see the [CLI & SDK Reference](../api-reference/cli-sdk/brc20-prog).

## The endpoint

BRC2.0 has its own JSON-RPC endpoint, separate from the Alkanes one. Pass it with `--brc20-prog-rpc-url`:

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog block-number
```

It speaks standard Ethereum JSON-RPC (`eth_call`, `eth_getBalance`, `eth_getCode`, `eth_getLogs`, `eth_chainId`, and the rest, see the [BRC20 Programmable Module (JSON-RPC)](../api-reference/json-rpc/brc20-prog) reference for the full method list), plus a few `brc20_*` methods for inscription-aware lookups.

## Deploying a contract

Compile your contract with Foundry, then deploy the build JSON:

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog deploy-contract ./out/MyContract.sol/MyContract.json \
  --fee-rate 10
```

Useful flags:

| Flag | Description |
|------|-------------|
| `--from <addresses>` | Addresses to source UTXOs from |
| `--change <address>` | Change address |
| `--no-activation` | Skip the activation transaction (use the two-transaction commit/reveal pattern) |
| `--trace` | Enable transaction tracing |
| `--mine` | Mine a block after broadcasting (regtest only) |

A deploy is carried by a Bitcoin inscription with a commit-then-reveal flow. By default the tooling also sends an activation transaction, a third transaction after the commit and reveal; pass `--no-activation` to skip it and use only the two-transaction commit/reveal pattern. If any of your UTXOs carry inscriptions, the tooling automatically inserts a split transaction first, moving the inscribed sats to a safe output before spending clean sats for the commit, and broadcasts the bundle atomically.

## Calling a contract

State-changing calls use `transact`; read-only calls use `call`:

```bash
# State-changing: transfer(address, uint256)
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog transact --address 0xYourContract --signature "transfer(address,uint256)" --calldata "0xRecipient,1000" \
  --fee-rate 10

# Read-only (eth_call): raw calldata
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog call --to 0xYourContract --data 0x70a08231...
```

`transact` takes a human-readable function signature (`--signature`) and comma-separated arguments (`--calldata`), so you do not encode the calldata by hand. `call` takes raw ABI-encoded data, mirroring `eth_call`.

## Wrapping BTC into a contract call

`wrap-and-execute2` wraps BTC to frBTC and calls a target contract in the same flow, so a user can go from native BTC to a contract interaction in one step. `--signature` names the function to call on `--target`; pass its arguments as comma-separated values with `--calldata` (empty by default, so `deposit()` needs none):

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog wrap-and-execute2 100000 \
  --target 0xYourContract \
  --signature "deposit()" \
  --fee-rate 10 \
  -y
```

To wrap BTC to frBTC without calling a contract, use `brc20-prog wrap-btc <AMOUNT> --from <ADDRESSES>` instead.

## Reading state

```bash
# frBTC balance of an address (eth_getBalance)
brc20-prog get-balance 0xYourAddress

# Contract bytecode (eth_getCode)
brc20-prog get-code 0xYourContract

# Event logs (eth_getLogs)
brc20-prog get-logs --address 0xYourContract --from-block 840000 --to-block latest
```

## Where to go next

- [BRC2.0 Metaprotocol](../protocol/brc20): how the protocol works.
- [CLI & SDK Reference](../api-reference/cli-sdk/brc20-prog): every `brc20-prog` command and flag.
- [Wrapping frBTC](./wrapping-frbtc): the Alkanes-side wrap flow.
