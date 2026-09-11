---
title: Mempool JSON-RPC
sidebar_label: JSON-RPC Methods
sidebar_position: 2
description: mempool_* JSON-RPC methods for mempool queries, paginated snapshots, and the fee-rate histogram.
---

# Mempool JSON-RPC

> **Preview.** Live as of 2026-08-11. See the
> [overview](./overview) for the data model.

```
POST https://mainnet.subfrost.io/v4/YOUR_API_KEY/mempool
```

JSON-RPC 2.0. Single requests and arrays (batches) are both accepted.

> **`params` is an OBJECT, not a positional array.** This differs from the
> `esplora_*` and `metashrew_*` families on the same host. A positional array
> returns `-32602`.

```bash
curl -s https://mainnet.subfrost.io/v4/YOUR_API_KEY/mempool \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"mempool_info","params":{}}'
```

## Errors

| code | meaning |
|---|---|
| `-32700` | parse error |
| `-32600` | invalid request |
| `-32601` | unknown method |
| `-32602` | invalid params |
| `-32000` | not found: the txid is not in the mempool |

HTTP-level: `401 INVALID_API_KEY`, `403` when admin is required,
`503 AUTH_UNAVAILABLE` when the key store cannot be consulted.

> **`503 AUTH_UNAVAILABLE` is a refusal, not an outage to retry through.** This
> service authenticates itself rather than relying on an upstream gate, and it
> fails closed: if it cannot check your key it serves nobody.

---

## `mempool_info`

No params. The cheap poll.

```json
{
  "count": 142331, "bytes": 78412992, "vbytes": 41203118,
  "total_fee": 812340000, "fee_known": 141002, "fee_coverage": 0.9906,
  "provisional": 3, "seq": 918273, "instance": "a3f1c07e",
  "added_total": 4102773, "removed_total": 3960442, "subscribers": 12
}
```

`fee_coverage` is `0.0..=1.0`. See the [overview](./overview#fees-are-sometimes-absent-never-zero).

---

## `mempool_txids`

```json
{ "limit": 1000 }
```

Clamped to 5000.

```json
{ "txids": ["…"], "count": 142331, "seq": 918273 }
```

> **Order is unspecified and unstable.** It reflects internal slab order, which
> changes as slots recycle. Sort client-side if you need one; do not treat two
> consecutive calls as comparable sequences.

---

## `mempool_entry`

```json
{ "txid": "<display-order hex>", "include_hex": false }
```

```json
{
  "txid": "…", "wtxid": "…",
  "vsize": 141, "weight": 561,
  "fee": 1410, "feerate": 10.0,
  "first_seen": 1754770000123,
  "seq": 918001,
  "origin": "p2p", "provisional": false, "rbf": true
}
```

`first_seen` is when **we** first saw it, not when the node did. The two differ
by the arrival latency of whichever source got there first. `fee` and `feerate`
are absent when unknown.

Returns `-32000` when the transaction is not in the mempool.

---

## `mempool_entries`

```json
{ "txids": ["…", "…"], "include_hex": false }
```

At most 5000 per call.

```json
{ "entries": [ … ], "missing": ["…"] }
```

Absent txids come back in `missing` rather than erroring the whole batch.

---

## `mempool_raw`

```json
{ "txid": "…" }
```

```json
{ "hex": "0100…" }
```

---

## `mempool_recent`

```json
{ "limit": 100 }
```

The most recently arrived entries, **newest first**.

```json
{ "entries": [ … ], "seq": 918273 }
```

This is the animation seed: paint from this, then follow the
[WebSocket](./websocket) from the returned `seq`.

---

## `mempool_snapshot`

```json
{ "limit": 1000, "cursor": 0, "include_hex": false }
```

```json
{
  "entries": [ … ], "cursor": 917400, "has_more": true,
  "seq": 918273, "count": 142331, "instance": "a3f1c07e"
}
```

> **`cursor` is a sequence number, not an offset.** Paging a set that mutates
> under you by offset skips and repeats entries; paging by `seq` is stable
> because a `seq` is never reused. Pass the returned `cursor` back for the next
> page.

Use the returned `seq` and `instance` as your WebSocket `since_seq` to attach
without a gap.

---

## `mempool_feerate_histogram`

```json
{ "buckets": [0, 1, 2, 5, 10, 20, 50] }
```

Bucket **floors** in sat/vB, ascending. Defaults to a 24-bucket geometric scale.

```json
{
  "histogram": [[0.0, 0], [1.0, 412000], [2.0, 1840221]],
  "fee_coverage": 0.9906,
  "count": 142331
}
```

Each pair is `[bucket_floor_sat_per_vb, vbytes]`.

> **Only fee-known entries contribute, so read `fee_coverage` first.** A
> freshly started service has a thin histogram, and deriving an estimate from it
> without checking quotes the floor. The transaction still broadcasts, still
> looks fine, and simply does not confirm.

---

## `observe` *(admin only)*

```
POST /v4/YOUR_ADMIN_API_KEY/mempool/observe
```

**Not** JSON-RPC. Body is `{"hex":"0100…"}` or the raw transaction bytes.

Requires an api key flagged admin. The transaction enters the store with
`origin: "edge"` and `provisional: true`.

> **This does not broadcast.** The transaction is not forwarded to bitcoind;
> the endpoint holds no such capability. It exists so a broadcast made elsewhere
> shows up in the stream immediately rather than after relay latency. Something
> else must actually send it.
