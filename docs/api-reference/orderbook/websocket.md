---
title: Orderbook WebSocket
sidebar_label: WebSocket
sidebar_position: 3
description: The orderbook WebSocket firehose. Subscribe to a market topic, receive a snapshot, then live deltas.
---

# Orderbook WebSocket

> **⚠️ Beta.** Protocol may change. See the
> [overview](./overview) for the market model and order envelope.

The WebSocket firehose streams a snapshot of a market followed by live deltas as
orders are created, updated, filled, or removed. It's the low-latency way to
keep a local order book in sync.

## Connect

```
wss://mainnet.subfrost.io/v4/YOUR_API_KEY/orderbook/ws
```

Plain JSON over WebSocket (no subprotocol). Cloudflare-proxied, so a standard
browser `WebSocket` or any WS client works.

```js
const ws = new WebSocket(
  "wss://mainnet.subfrost.io/v4/YOUR_API_KEY/orderbook/ws"
);
```

## Subscribe

Send a `subscribe` command with a market topic (see the
[market model](./overview#market-model)). You may subscribe to
multiple markets on one connection.

```json
{ "action": "subscribe", "market": "lending:mainnet:pair:2:0_32:0" }
```

Immediately after subscribing you receive a **snapshot** of that market's active
orders, then **deltas** as they happen.

```json
// snapshot
{ "type": "snapshot", "market": "lending:mainnet:pair:2:0_32:0",
  "orders": [ /* normalized order envelopes */ ] }

// an order was created or changed
{ "type": "order", "op": "upsert", "order": { /* envelope */ } }

// an order left the active book (filled / cancelled / expired / pruned)
{ "type": "order", "op": "remove",
  "source": "lending", "id": "clx123abc",
  "marketKey": "lending:mainnet:pair:2:0_32:0" }
```

Unsubscribe at any time:

```json
{ "action": "unsubscribe", "market": "lending:mainnet:pair:2:0_32:0" }
```

## Keep-alive

The server sends `{ "type": "ping" }` every ~25s. Treat a long gap with no
frames as a dropped connection and reconnect (then re-subscribe + re-snapshot).

## Keeping a book in sync

1. Connect and `subscribe` to your market topic(s).
2. Seed your local book from the `snapshot`.
3. Apply each `upsert` (add/replace by `id`) and `remove` (delete by `id`).
4. On reconnect, discard local state and re-seed from a fresh snapshot; the
   snapshot is always authoritative.

## Example

```js
const ws = new WebSocket("wss://mainnet.subfrost.io/v4/YOUR_API_KEY/orderbook/ws");
const book = new Map();

ws.onopen = () =>
  ws.send(JSON.stringify({ action: "subscribe", market: "orbitals:mainnet:module:fire-pos" }));

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === "snapshot") {
    book.clear();
    for (const o of msg.orders) book.set(o.id, o);
  } else if (msg.type === "order") {
    if (msg.op === "upsert") book.set(msg.order.id, msg.order);
    else if (msg.op === "remove") book.delete(msg.id);
  }
  // msg.type === "ping" → keep-alive, ignore
};
```
