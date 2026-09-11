---
title: Mempool WebSocket
sidebar_label: WebSocket Stream
sidebar_position: 3
description: The mempool WebSocket stream, covering subscriptions, frames, resync without a gap, and backpressure.
---

# Mempool WebSocket

> **Preview.** Live as of 2026-08-11. See the
> [overview](./overview) for the data model.

```
wss://mainnet.subfrost.io/v4/YOUR_API_KEY/mempool/ws
```

Plain JSON over WebSocket, no subprotocol. Text frames, one JSON object each.
The api key is in the path and is checked on the upgrade itself.

```js
const ws = new WebSocket(
  "wss://mainnet.subfrost.io/v4/YOUR_API_KEY/mempool/ws"
);
```

## Subscribe

```json
{"op":"subscribe","channels":["tx","block","info"],"since_seq":91827,"include_hex":false}
{"op":"unsubscribe","channels":["block"]}
{"op":"ping"}
```

`channels` defaults to all; `["*"]` and `["all"]` are accepted.

| channel | frames |
|---|---|
| `tx` | `add`, `remove` |
| `block` | `block` |
| `info` | reserved |

Control frames (`hello`, `reset`, `pong`) are **never** filtered out, whatever
you subscribed to. Unknown ops and malformed JSON get a `reset` frame carrying
the reason rather than being silently ignored.

## Frames

Every frame carries `seq`.

```json
{"type":"hello","instance":"a3f1c07e","seq":91827,"count":142331,"replayed":false}

{"type":"add","seq":91828,"txid":"…","wtxid":"…","vsize":141,"weight":561,
 "fee":1410,"feerate":10.0,"first_seen":1754770000123,
 "origin":"p2p","provisional":false,"rbf":true}

{"type":"remove","seq":91829,"txid":"…","vsize":141,"reason":"mined"}

{"type":"block","seq":91830,"height":961541,"hash":"0000…","removed":1843}

{"type":"reset","seq":91831,"reason":"lagged","action":"resync"}

{"type":"pong","seq":91831}
```

### Why a transaction left

`remove.reason` distinguishes five cases, and they are not interchangeable:

| reason | meaning |
|---|---|
| `mined` | included in a block we received over p2p |
| `replaced` | superseded by a conflicting transaction (BIP125), inferred from our own spend index |
| `evicted` | **we** hit our own cap and dropped the lowest feerate |
| `provisional_expired` | an edge-observed transaction the node never corroborated |
| `expired` | resident longer than our own age bound |

> **`evicted` is about us, not the network.** It means this service hit its own
> memory cap and dropped the lowest-feerate entry. The transaction may be
> perfectly healthy and still in every other node's mempool. Do not surface it
> to a user as "dropped".

There is no `node_removed` and no `reconciled`. Both were artefacts of asking
bitcoind directly (the ZMQ `sequence` `R` label and a `getrawmempool` set
difference), and ingest is now p2p only, so Core never tells us it dropped
anything. `expired` is our own age bound and the only remaining defence against
an entry the node quietly evicted lingering here; it is a *backstop*, not a
report of what the node did.

A `block` frame is an aggregate. Per-transaction `remove` frames with
`reason: "mined"` are still emitted, and always **before** the `block` frame.

## Reconnecting without a gap

`hello` is always the first frame, and it carries `instance`.

1. **`instance` differs from last time** → full resync, unconditionally,
   whatever `since_seq` you were about to send. You are talking to a different
   process and its sequence numbers describe a different history.
2. **`since_seq` at or beyond the current `seq`** → you are caught up, go live.
3. **`since_seq` behind** → `{"type":"reset","action":"resync"}`. Re-fetch
   [`mempool_snapshot`](./jsonrpc#mempool_snapshot), then resubscribe
   with the `seq` it returned.

```
connect → read hello
  ├─ instance changed?  → mempool_snapshot (paginate) → subscribe since_seq = snapshot.seq
  └─ instance same      → subscribe since_seq = <last applied>
                            └─ got `reset`? → snapshot, then subscribe again
```

> **Historical replay is not implemented yet**, so case 3 currently always
> resyncs rather than replaying the frames you missed. Write the client to
> handle `reset` regardless: it is also how backpressure is signalled, below,
> and that path is permanent.

## Backpressure

There is **no per-connection outbound queue** beyond a shared broadcast ring. A
client that cannot keep up falls off the back of it and receives:

```json
{"type":"reset","seq":…,"reason":"lagged","action":"resync"}
```

The connection stays open. Resync and carry on.

> **This is deliberate, and it is why the service will not grow a heap on your
> behalf.** Buffering per-client so a slow browser tab never misses a frame is
> exactly how the previous mempool implementation ran out of memory. A `reset`
> you can recover from beats an out-of-memory kill nobody can.

## Worked example

```js
const RPC = "https://mainnet.subfrost.io/v4/YOUR_API_KEY/mempool";
let instance = null, lastSeq = 0;

async function snapshot() {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "mempool_recent",
      params: { limit: 500 },
    }),
  }).then((r) => r.json());
  paint(r.result.entries);
  return r.result.seq;
}

function connect() {
  const ws = new WebSocket("wss://mainnet.subfrost.io/v4/YOUR_API_KEY/mempool/ws");
  ws.onmessage = async (ev) => {
    const f = JSON.parse(ev.data);
    switch (f.type) {
      case "hello":
        // A changed instance invalidates every seq we hold.
        if (instance && f.instance !== instance) lastSeq = 0;
        instance = f.instance;
        if (!lastSeq) lastSeq = await snapshot();
        ws.send(JSON.stringify({ op: "subscribe", since_seq: lastSeq }));
        return;
      case "reset":
        lastSeq = await snapshot();
        ws.send(JSON.stringify({ op: "subscribe", since_seq: lastSeq }));
        return;
      case "add":    lastSeq = f.seq; onAdd(f);    return;
      case "remove": lastSeq = f.seq; onRemove(f); return;
      case "block":  lastSeq = f.seq; onBlock(f);  return;
    }
  };
  ws.onclose = () => setTimeout(connect, 1000);
}
```
