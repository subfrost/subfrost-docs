---
title: frUSD Deposits (Ethereum)
sidebar_label: frUSD Deposits (Ethereum)
sidebar_position: 10
description: Protobuf views for frUSD deposits made on Ethereum, indexed by BTC recipient script.
---

# frUSD Deposits (Ethereum)

Track SUBFROST **frUSD** deposits made on **Ethereum**, indexed **by BTC
recipient** ("has this user's crosschain deposit landed on Ethereum yet, and for
how much?"), served from a dedicated evmshrew indexer.

When a user deposits into the frUSD vault on Ethereum, the mint carries the BTC
recipient the bridged value is destined for. This index joins each `PaymentQueued`
event back to that recipient, so a single lookup answers the pre-unwrap window
that no Bitcoin-side index can see.

## Endpoint

```
POST https://mainnet.subfrost.io/v4/YOUR_API_KEY/ethereum/frusd
```

A separate path from the main `/v4/YOUR_API_KEY` endpoint, backed by its own
Ethereum indexer, so its height advances independently. Call `frusdindexheight`
to see how current it is. The data is public on-chain history; the free
`/v4/jsonrpc/ethereum/frusd` anchor serves it without a key.

## The ABI is protobuf

Every view takes a **protobuf-encoded request** and returns a **protobuf-encoded
response**, the same convention as the BTC/USD pool and the rest of the Alkanes
view stack. There is no JSON on the wire and no JSON envelope inside the result.

Calls go through `metashrew_view`:

```json
{
  "jsonrpc": "2.0",
  "method": "metashrew_view",
  "params": ["<view_name>", "<request_hex>", "latest"],
  "id": 1
}
```

- **`view_name`**: one of the views below, e.g. `frusddepositsbyrecipient`
- **`request_hex`**: `0x` + hex of the **serialized protobuf request**. Views
  taking no arguments accept `"0x"`.
- **`latest`**: the height tag.

The `result` is a `0x`-prefixed hex string: hex-decode it, then parse the bytes as
the matching protobuf response.

> **The request is a protobuf *message*, not the bare value.**
> `frusddepositsbyrecipient` wants `{ recipient_script = 1 }`, **not** the raw
> script bytes. Passing the raw script returns an empty `0x` that looks exactly
> like "no deposits". Encode the request message (and do not prepend the height:
> the endpoint does that for you).

## Views

| View | Request | Response |
| --- | --- | --- |
| `frusddepositsbyrecipient` | `DepositsByRecipientRequest` | `DepositsResponse` |
| `frusdindexheight` | *(empty: `"0x"`)* | `IndexHeightResponse` |

- **`recipient_script`** is the raw BTC output script (`scriptPubKey`). For a
  taproot recipient that is `5120` ++ the 32-byte x-only key. Decode the address
  to its script first; it is not an address string.
- **`fr_amount`** is a big-endian `uint256` with **8 decimals** (matching the
  frUSD alkane on Bitcoin): `99701199000` is `997.01199 frUSD`. Parse with a
  bignum and divide by `1e8` for display.
- **An empty `DepositsResponse` is not an error.** It means the recipient has no
  deposits *yet*: either none were ever made, or the deposit's Ethereum block is
  still above `frusdindexheight`. Compare against the index height before telling a
  user "not found".
- **`payment_id`** is the vault's monotonic id, stable and unique; use it as your
  render key and to detect new deposits. **`confirmed`** is always `true` today (a
  record exists only once mined) and is reserved for a future pending variant.

### Generating a client

Save the [schema](#schema) as `frusd.proto` and generate:

```bash
# Python
protoc -I. --python_out=. frusd.proto

# TypeScript (ts-proto)
protoc -I. --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=. frusd.proto
```

```python
import requests
import frusd_pb2 as pb

ENDPOINT = "https://mainnet.subfrost.io/v4/YOUR_API_KEY/ethereum/frusd"

def view(name: str, req=None) -> bytes:
    payload = req.SerializeToString() if req is not None else b""
    r = requests.post(ENDPOINT, json={
        "jsonrpc": "2.0", "method": "metashrew_view",
        "params": [name, "0x" + payload.hex(), "latest"], "id": 1,
    }).json()
    if "error" in r:
        raise RuntimeError(f"{name}: {r['error']['message']}")
    return bytes.fromhex(r["result"][2:])

# height the index has reached
h = pb.IndexHeightResponse()
h.ParseFromString(view("frusdindexheight"))
print("indexed to", h.height)

# a user's deposits, by BTC recipient script (taproot 5120…)
script = bytes.fromhex("5120475c097fdebbc6900e42d6fc8603d2f6030f43a77bfe02b9547a32ecb2df342e")
resp = pb.DepositsResponse()
resp.ParseFromString(view("frusddepositsbyrecipient",
                          pb.DepositsByRecipientRequest(recipient_script=script)))
for d in resp.deposits:
    frusd = int.from_bytes(d.fr_amount, "big") / 1e8
    print(d.payment_id, f"{frusd:.2f} frUSD", d.block_number, "0x" + d.tx_hash.hex())
```

```ts
import {
  DepositsByRecipientRequest, DepositsResponse, IndexHeightResponse,
} from "./frusd";

const ENDPOINT = "https://mainnet.subfrost.io/v4/YOUR_API_KEY/ethereum/frusd";

async function view(name: string, req?: Uint8Array): Promise<Uint8Array> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "metashrew_view",
      params: [name, "0x" + Buffer.from(req ?? new Uint8Array()).toString("hex"), "latest"],
      id: 1,
    }),
  });
  const { result, error } = await res.json();
  if (error) throw new Error(`${name}: ${error.message}`);
  return Uint8Array.from(Buffer.from(result.slice(2), "hex"));
}

// how current is the index?
const h = IndexHeightResponse.decode(await view("frusdindexheight"));

// a user's deposits
const script = Buffer.from("5120475c097fdebbc6900e42d6fc8603d2f6030f43a77bfe02b9547a32ecb2df342e", "hex");
const req = DepositsByRecipientRequest.encode({ recipientScript: script }).finish();
const { deposits } = DepositsResponse.decode(await view("frusddepositsbyrecipient", req));

for (const d of deposits) {
  const frUsd = Number(BigInt("0x" + Buffer.from(d.frAmount).toString("hex"))) / 1e8;
  console.log(d.paymentId, `${frUsd.toFixed(2)} frUSD`, d.blockNumber, "0x" + Buffer.from(d.txHash).toString("hex"));
}
```

## Rendering & tracking deposits

A "your deposits" panel or a live tracker follows the same shape:

1. **Resolve the user's BTC recipient script**, the taproot output they bridged
   to. Convert address → `scriptPubKey` (taproot → `5120<x-only-key>`).
2. **Call `frusddepositsbyrecipient`.** Render each deposit: amount
   (`fr_amount / 1e8`), the Ethereum tx (`tx_hash` → explorer link), `block_number`,
   and `payment_id` (stable key).
3. **Show sync context** with `frusdindexheight`. If a user's expected deposit
   block is above the index height, show "indexing…", not "not found". Confirmations
   ≈ `frusdindexheight − block_number`.
4. **Poll ~15s** for a live tracker (ETH block time ≈ 12s). Detect new deposits by
   the max `payment_id` seen. Cache by `(recipient, indexHeight)`; deposits are
   append-only per recipient, so only refetch when the height moves.

## Schema

```protobuf
syntax = "proto3";
package frusd;

message DepositsByRecipientRequest {
  bytes recipient_script = 1;   // raw BTC scriptPubKey (taproot = 0x5120 ++ x-only key)
}

message DepositsResponse {
  repeated Deposit deposits = 1;
}

message Deposit {
  uint64 payment_id   = 1;      // vault paymentId (monotonic, stable id)
  bytes  fr_amount    = 2;      // frUSD amount, big-endian uint256, 8 decimals
  uint64 block_number = 3;      // Ethereum block mined in
  bytes  tx_hash      = 4;      // depositAndBridge tx hash (32 bytes)
  bool   confirmed    = 5;      // always true today (record == mined)
}

message IndexHeightRequest {}
message IndexHeightResponse {
  uint64 height = 1;            // highest Ethereum block indexed
}
```
