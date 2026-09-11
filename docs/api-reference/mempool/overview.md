---
title: Mempool API
sidebar_label: Overview
sidebar_position: 1
description: A live view of the Bitcoin mempool over JSON-RPC and a sequenced WebSocket change stream.
---

# Mempool API

> **Preview.** Live as of 2026-08-11 on `mainnet.subfrost.io`. Single replica,
> so `instance` changes on every restart and your `seq` cursor resets with it.
> Handle `hello` as described under
> [reconnecting](./websocket#reconnecting-without-a-gap).

A live view of the Bitcoin mempool, served two ways:

| | |
|---|---|
| **JSON-RPC** | `POST /v4/YOUR_API_KEY/mempool` |
| **WebSocket** | `GET /v4/YOUR_API_KEY/mempool/ws` |

`/v5/YOUR_API_KEY/mempool` is accepted identically.

The WebSocket is the point. Polling a mempool projection every few seconds tells
you what it *was*; a change stream with resumable sequence numbers lets you
animate what it *is*.

## The model

The service peers directly to our own bitcoind and keeps the mempool in memory.
Transactions arrive from two sources, and each entry records which one saw it
first:

| `origin` | source | latency |
|---|---|---|
| `edge` | observed at our edge as a user broadcast it | immediate, **provisional** |
| `p2p` | `inv` → `getdata` → `tx` over the peer connection | seconds |

Ingest is Bitcoin p2p and nothing else. There is no ZMQ subscriber and no
bitcoind JSON-RPC client: the process holds no node credential at all. Two
consequences worth planning around rather than discovering:

* **Announcements cost seconds, not milliseconds.** Core batches `inv` to
  inbound peers on a Poisson timer. If you need to see your own broadcast
  instantly, that is what the `edge` origin is for.
* **Core never tells us it removed something.** Mined is recovered from blocks,
  and an RBF replacement is inferred locally from our own spend index. Node-side
  expiry is simply unobservable, so our view can drift *upward* against the
  node's; we may hold a transaction it quietly dropped, bounded only by our own
  age sweep.

`origin` only ever upgrades in that order. An `edge`-observed transaction is
marked `provisional: true` until the node corroborates it. The user's broadcast
reached *us*, which is not the same as the node having accepted it. Provisional
entries that are never corroborated are removed with reason
`provisional_expired`.

> **Do not treat a provisional entry as confirmed-in-mempool.** It means "we saw
> this transaction", not "the network will relay it". A transaction can be
> malformed, non-standard, or conflict with something already in the pool, and
> you will find out only when it fails to corroborate.

## Sequence numbers

Every entry and every WebSocket frame carries a `seq`, a strictly increasing,
**per-process** counter. It is how you page a mutating set without gaps and how
you reattach a stream without missing changes.

Each process also has an `instance` id. **If `instance` changes, every `seq` you
hold is meaningless**: you are talking to a different process, whose counter
describes a different history. Resync unconditionally. The protocol makes this
detectable on purpose rather than leaving you to notice numbers going backwards.

## Byte order

Every txid, wtxid and block hash on the wire (JSON-RPC and WebSocket alike) is
**display order**, matching what bitcoind's RPC and every block explorer show.
No reversal is needed on your side.

## Fees are sometimes absent, never zero

`fee` and `feerate` are **omitted** from an entry when the absolute fee is not
known, rather than reported as `0`. p2p carries neither fees nor input values, so
a transaction's fee is only known once it is hydrated: immediately when every
input spends another mempool transaction, and otherwise once our own index has
been asked for the missing prevouts.

`mempool_info` reports `fee_coverage`, the fraction of resident entries whose
fee is known.

> **Check `fee_coverage` before deriving a fee estimate.** A freshly started
> service has a thin fee-rate histogram, and a naive read of it quotes the floor.
> Underpaying because the data was incomplete is indistinguishable, at the call
> site, from underpaying because the mempool was empty.

## Where to go next

- **[JSON-RPC methods](./jsonrpc)**: queries, snapshots, the
  fee-rate histogram.
- **[WebSocket stream](./websocket)**: frames, resync, backpressure.

The usual pattern is both: seed from `mempool_recent` or `mempool_snapshot`,
then follow the WebSocket from the `seq` it returned.
