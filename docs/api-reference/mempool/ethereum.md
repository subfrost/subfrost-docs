---
title: Ethereum Mempool (Preview)
sidebar_label: Ethereum Mempool
sidebar_position: 4
description: A live view of the Ethereum public mempool over JSON-RPC and a WebSocket change stream.
---

# Ethereum Mempool (Preview)

> **Preview.** Live as of 2026-08-21. The Ethereum sibling of the
> [Bitcoin mempool](./overview): same protocol, ETH transactions.

A live view of the **Ethereum public mempool**, ingested straight off the
`eth` devp2p wire network (not a single node's `eth_subscribe`). You sit among
many peers and often see a transaction (including a SUBFROST `depositAndBridge`)
**before it is mined**, and before any one RPC provider's pool surfaces it.

```
POST https://mainnet.subfrost.io/v4/YOUR_API_KEY/ethereum/mempool       # JSON-RPC
GET  wss://mainnet.subfrost.io/v4/YOUR_API_KEY/ethereum/mempool/ws       # change stream
```

Both `/v4` and `/v5` work. This is a **public-mempool** view: direct-to-builder
/ private orderflow (Flashbots, exclusive builder RPCs) never propagates over
devp2p, so it structurally misses some gas. That is fine for deposit-tracking, not a
substitute for a builder feed.

## The record

Every transaction is summarised as a `TxRecord`. The full calldata is fetched on
demand, not held resident: you get its length and 4-byte selector.

| field | type | notes |
|---|---|---|
| `hash` | `0x…32` | transaction hash |
| `from` | `0x…20` | recovered signer |
| `to` | `0x…20` \| `null` | `null` for contract creation |
| `nonce` | number | |
| `value` | string | wei (decimal string, may exceed 2⁵³) |
| `gas_limit` | number | |
| `max_fee_per_gas` | string | wei |
| `max_priority_fee_per_gas` | string | wei |
| `tx_type` | number | 0 legacy, 2 EIP-1559, 3 blob, … |
| `input_len` | number | calldata length in bytes |
| `selector` | `0x…4` | first 4 calldata bytes (`""` if none) |
| `first_seen_ms` | number | unix ms we first saw it |
| `seq` | number | monotonic per-instance sequence |

## JSON-RPC

JSON-RPC 2.0. **`params` is an OBJECT**, not a positional array (a positional
array returns `-32602`).

```bash
curl -s https://mainnet.subfrost.io/v4/YOUR_API_KEY/ethereum/mempool \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"mempool_info","params":{}}'
```

| method | params | returns |
|---|---|---|
| `mempool_info` | `{}` | `{count, added_total, removed_total, subscribers, seq}` |
| `mempool_txids` | `{limit}` | `{txids:[0x…], count, seq}` |
| `mempool_entry` | `{txid}` | the `TxRecord`, or `-32000` if not resident |
| `mempool_recent` | `{limit}` | `{entries:[TxRecord], seq}`, newest first |

| error | meaning |
|---|---|
| `-32601` | unknown method |
| `-32602` | invalid params (e.g. positional array) |
| `-32000` | not found: the txid is not in the mempool |

## WebSocket change stream

Connect to `…/ethereum/mempool/ws`. Text frames, one JSON object each; **every
frame carries `seq`** so you can detect gaps.

```
→  {"op":"subscribe","channels":["tx","block"]}
←  {"type":"hello","instance":"a3f1c07e","seq":40213}
←  {"type":"add","record":{ …TxRecord… },"seq":40214}
←  {"type":"remove","hash":"0x…","reason":"mined","seq":40219}
←  {"type":"block","number":21234567,"hash":"0x…","removed":41,"seq":40260}
```

- Client ops: `subscribe` / `unsubscribe` (`channels`: `"tx"`, `"block"`) and `ping`.
- Server frames: `hello` (first), `add` (a `TxRecord`), `remove{hash,reason}`,
  `block{number,hash,removed}`, `reset{reason,action:"resync"}`, `pong`.
- **Backpressure:** a client too slow to drain falls off the broadcast ring and
  receives `reset{action:"resync"}`; the server never buffers on its heap. On a
  `reset`, re-fetch state with `mempool_recent` and resume from the new `seq`.

## Tracking a crosschain deposit

To surface "**Deposit pending on Ethereum**" the moment a user's bridge tx hits
the mempool, subscribe to `tx` and match `add` frames whose:

- `to` == the frUSD vault `0x95779e7e1c943042255b8a78273fe6de4823cf06`, and
- `selector` == `0xbedb65ee` (`depositAndBridge`).

That fires *before* the transaction is mined; the confirmed on-chain record then
appears in the [frUSD Deposits index](../json-rpc/frusd) once it lands.

## Caveats

- **Public mempool only**: misses private/builder orderflow (see above).
- **Preview**: the shape is stable but the service is young; treat gaps as
  possible and lean on `seq` + `reset` to resync rather than assuming a perfect
  stream.
