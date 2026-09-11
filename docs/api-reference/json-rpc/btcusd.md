---
title: BTC/USD Pool
sidebar_label: BTC/USD Pool
sidebar_position: 8
description: Protobuf views over metashrew_view for the SUBFROST BTC/USD pool, covering reserves, LP supply, prices, trades, and OHLC candles.
---

# BTC/USD Pool

Live state for the SUBFROST BTC/USD pool (reserves, LP supply, the pool's own
price, executed trades and OHLC candles), served from a dedicated indexer.

The pool is a [Curve CryptoSwap (v2)](https://curve.readthedocs.io/) port running
on Alkanes. It trades **frUSD** (`4:1776`) against **frBTC** (`32:0`), both
8-decimal, behind the self-upgradeable proxy **`4:1778`**, which holds all pool
state and is itself the frBTCUSD LP token.

## Endpoint

```
POST https://mainnet.subfrost.io/v4/YOUR_API_KEY/btcusd
```

A separate path from the main `/v4/YOUR_API_KEY` endpoint, backed by its own
indexer, so its height advances independently. Call `indexheight` to see how
current it is.

## The ABI is protobuf

Every view takes a **protobuf-encoded request** and returns a **protobuf-encoded
response**, following the same convention as `alkanes-rs` and the rest of the
Alkanes view stack. There is no JSON on the wire and no JSON envelope inside the
result. Turning these messages into JSON (or into your own types) is your code's
job, which is the point: you decode straight into generated structs with no
lossy string round-trip in between.

Calls go through `metashrew_view`:

```json
{
  "jsonrpc": "2.0",
  "method": "metashrew_view",
  "params": ["<view_name>", "<request_hex>", "latest"],
  "id": 1
}
```

- **`view_name`**: one of the views below, e.g. `getprice`
- **`request_hex`**: `0x` + hex of the **serialized protobuf request**. Views
  taking no arguments accept `"0x"`.
- **`latest`**: the height tag.

The `result` is a `0x`-prefixed hex string: hex-decode it, then parse the bytes
as the matching protobuf response.

> **An empty or truncated request is not an error.** Protobuf has no required
> fields, so a malformed body decodes to a default message and the view answers
> as if you asked about nothing: `found: false`. There is no error string to
> check. Always read `found` (or `ok`), never the absence of an error.

### Generating a client

Save the [schema](#schema) as `cryptoswap.proto` and generate:

```bash
# Python
protoc -I. --python_out=. cryptoswap.proto

# TypeScript (ts-proto)
protoc -I. --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=. cryptoswap.proto
```

```python
import json, requests
import cryptoswap_pb2 as pb

ENDPOINT = "https://mainnet.subfrost.io/v4/YOUR_API_KEY/btcusd"

def view(name: str, req=None) -> bytes:
    payload = req.SerializeToString() if req is not None else b""
    r = requests.post(ENDPOINT, json={
        "jsonrpc": "2.0", "method": "metashrew_view",
        "params": [name, "0x" + payload.hex(), "latest"], "id": 1,
    }).json()
    if "error" in r:
        raise RuntimeError(f"{name}: {r['error']['message']}")
    return bytes.fromhex(r["result"][2:])

pool = pb.AlkaneId(block=4, tx=1778)

resp = pb.GetPriceResponse()
resp.ParseFromString(view("getprice", pb.GetPriceRequest(pool=pool)))

print(resp.marginal_price_q)                              # '15585063275356'
print(int(resp.price_q_scale) // int(resp.marginal_price_q))  # 64164  (USD per BTC)
```

```ts
import {
  AlkaneId, GetPriceRequest, GetPriceResponse,
} from "./cryptoswap";

const ENDPOINT = "https://mainnet.subfrost.io/v4/YOUR_API_KEY/btcusd";

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

const pool = AlkaneId.create({ block: 4, tx: 1778 });
const bytes = await view("getprice", GetPriceRequest.encode({ pool }).finish());
const price = GetPriceResponse.decode(bytes);

const usdPerBtc = BigInt(price.priceQScale) / BigInt(price.marginalPriceQ!); // 64164n
```

## Reading prices

> **`price_q` is `token1` per `token0`, in RAW token units, scaled by
> `price_q_scale` (1e18).** It is NOT a USD figure, and the direction is not the
> one most people expect: `token0` is frUSD and `token1` is frBTC, so `price_q`
> is **frBTC per frUSD**. USD per BTC is its reciprocal.

Token slots are ordered by alkane id, not by role: `token0` is whichever of the
pair has the lower `(block, tx)`. For this pool that is frUSD `4:1776`, with frBTC
`32:0` as `token1`. Read `token0`/`token1` off the response rather than assuming.

For a pair whose tokens share a decimal count (as here, both 8-decimal):

```
usd_per_btc = price_q_scale / marginal_price_q
            = 1e18 / 15585063275356
            ≈ 64164
```

For a pair with differing decimals, convert the raw ratio to display units by
multiplying by `10 ** (decimals0 - decimals1)` first.

> **Every amount and price is a DECIMAL STRING, not an integer field.** The
> pool's state does not fit protobuf's integer types: `total_supply` is currently
> 23113653069174808444 (past `u64`), and `D` scales with reserves. Parse with a
> bignum (`int` in Python, `BigInt` in TS), never a float.

### Two prices, and which to use

| Field | Meaning | Available |
| --- | --- | --- |
| `executed_price_q` | Price of the pool's most recent actual trade | Only after the pool has traded |
| `marginal_price_q` | The pool's own current price, from its `price_scale` | From the pool's first block |
| `oracle_price_q` | The pool's internal EMA of recent trade prices | From the pool's first block |

Prefer `marginal_price_q` for a quote and `executed_price_q` for "what did someone
actually pay". The executed fields are `optional` and absent until the pool has
been traded against. A freshly seeded pool has liquidity and a price but no
trades, which is exactly its state today. All three share the same
`token1`-per-`token0` convention, so they are directly comparable.

## Views

| View | Request | Response |
| --- | --- | --- |
| `ping` | `PingRequest` | `PingResponse` |
| `indexheight` | `IndexHeightRequest` | `IndexHeightResponse` |
| `getblocksummary` | `GetBlockSummaryRequest` | `GetBlockSummaryResponse` |
| `getrawvalue` | `GetRawValueRequest` | `GetRawValueResponse` |
| `getpools` | `GetPoolsRequest` | `GetPoolsResponse` |
| `getpool` | `GetPoolRequest` | `GetPoolResponse` |
| `getpoolstate` | `GetPoolStateRequest` | `GetPoolStateResponse` |
| `getreserves` | `GetReservesRequest` | `GetReservesResponse` |
| `getswaps` | `GetSwapsRequest` | `GetSwapsResponse` |
| `getprice` | `GetPriceRequest` | `GetPriceResponse` |
| `getcandles` | `GetCandlesRequest` | `GetCandlesResponse` |
| `getcandleat` | `GetCandleAtRequest` | `GetCandleAtResponse` |

Notes that are not obvious from the schema:

- **`getpool`** returns the pool record plus its latest `state`, so it saves a
  round trip over `getpool` + `getpoolstate`. `state` is absent until the pool
  has written state.
- **`getpoolstate`** carries both the contract's raw slots (`price_scale`,
  `price_oracle`, `last_prices`, in the CONTRACT's coin order, between
  decimal-normalised balances) and the re-oriented `*_price_q` fields. **Use the
  `_q` fields** unless you are reproducing contract internals; the raw slots are
  not in the same orientation, and for this pool the two orders are opposite.
- **`getcandles`** only supports 3600 and 86400 second buckets. An unsupported
  width returns `ok: false` with `supported_buckets` populated rather than an
  error. Candles are built from executed trades, so a pool with no trades has no
  candles even though it has a price.
- **`getrawvalue`** reads any single storage slot of a tracked pool (e.g.
  `key: "/price_scale"`), returning the raw little-endian bytes the contract
  wrote. Use it to reach state the typed views do not model.
- **`getswaps`** and **`getpools`** paginate with `page`/`limit`. Omitting
  `limit` returns everything (capped at 20000).
- **`ann`** is `A * n^n * A_MULTIPLIER` (CryptoSwap amplification), **not** a
  StableSwap `A`. Fees are over 1e10: `mid_fee` 20000000 is 0.2% (20 bps),
  `out_fee` 80000000 is 0.8%, and `admin_fee` 5000000000 is 50% (of the swap
  fee, not of the trade). The charged fee slides between `mid_fee` (balanced) and
  `out_fee` (imbalanced).

## Schema

```protobuf
syntax = "proto3";
package alspo.cryptoswap;

message AlkaneId {
  uint32 block = 1;
  uint64 tx = 2;
}

message PingRequest {}
message PingResponse { string message = 1; }

message IndexHeightRequest {}
message IndexHeightResponse { optional uint32 height = 1; }

message GetBlockSummaryRequest { uint32 height = 1; }
message GetBlockSummaryResponse {
  bool found = 1;
  uint32 height = 2;
  string blockhash = 3;              // big-endian hex
  uint32 tx_count = 4;
  uint32 swap_count = 5;
  uint32 new_pool_count = 6;
  uint32 add_liquidity_count = 7;
  uint32 remove_liquidity_count = 8;
  uint32 claim_fees_count = 9;
  uint32 admin_count = 10;
}

message GetRawValueRequest { AlkaneId pool = 1; bytes key = 2; }
message GetRawValueResponse {
  bool found = 1;
  bytes txid = 2;                    // big-endian
  bytes value = 3;                   // raw little-endian, as written
}

message Pool {
  AlkaneId pool = 1;
  AlkaneId token0 = 2;               // ordered by (block, tx)
  AlkaneId token1 = 3;
  uint32 first_seen_height = 4;
  uint64 first_seen_ts = 5;
  bool is_canonical = 6;
  bool from_init = 7;
  bool coin0_is_token0 = 8;          // false here: contract coin order is reversed
  string precision_coin0 = 9;
  string precision_coin1 = 10;
  string ann = 11;
  string gamma = 12;
  string mid_fee = 13;
  string out_fee = 14;
  string admin_fee = 15;
  string swap_count = 16;
  string volume0 = 17;
  string volume1 = 18;
}

message PoolState {
  uint32 height = 1;
  uint64 timestamp = 2;
  string reserve0 = 3;               // module token0/token1 orientation
  string reserve1 = 4;
  string total_supply = 5;
  string price_scale = 6;            // raw contract slots, CONTRACT coin order
  string price_oracle = 7;
  string last_prices = 8;
  uint64 last_prices_height = 9;
  optional string marginal_price_q = 10;  // re-oriented; use these
  optional string oracle_price_q = 11;
  optional string last_price_q = 12;
  string d = 13;
  string virtual_price = 14;
  string xcp_profit = 15;
  bool is_killed = 16;
  bool ramping = 17;
  uint64 future_ag_height = 18;
}

message GetPoolsRequest {
  optional bool canonical = 1;
  optional uint32 page = 2;
  optional uint32 limit = 3;
}
message GetPoolsResponse {
  bool ok = 1;
  uint32 page = 2;
  uint32 limit = 3;
  uint32 total = 4;
  bool has_more = 5;
  string price_q_scale = 6;
  repeated Pool pools = 7;
}

message GetPoolRequest { AlkaneId pool = 1; }
message GetPoolResponse {
  bool found = 1;
  Pool pool = 2;
  PoolState state = 3;
  string price_q_scale = 4;
}

message GetPoolStateRequest { AlkaneId pool = 1; }
message GetPoolStateResponse {
  bool found = 1;
  AlkaneId pool = 2;
  AlkaneId token0 = 3;
  AlkaneId token1 = 4;
  PoolState state = 5;
  string price_q_scale = 6;
}

message GetReservesRequest { AlkaneId pool = 1; }
message GetReservesResponse {
  bool found = 1;
  AlkaneId pool = 2;
  AlkaneId token0 = 3;
  AlkaneId token1 = 4;
  uint32 height = 5;
  uint64 timestamp = 6;
  string reserve0 = 7;
  string reserve1 = 8;
  string total_supply = 9;
}

message Swap {
  uint64 timestamp = 1;
  uint32 height = 2;
  bytes txid = 3;                    // big-endian
  uint32 vout = 4;
  AlkaneId token_in = 5;
  string amount_in = 6;
  AlkaneId token_out = 7;
  string amount_out = 8;
  string price_q = 9;
  bool zero_for_one = 10;
}

message GetSwapsRequest {
  AlkaneId pool = 1;
  optional uint32 page = 2;
  optional uint32 limit = 3;
}
message GetSwapsResponse {
  bool ok = 1;
  AlkaneId pool = 2;
  uint32 page = 3;
  uint32 limit = 4;
  uint32 total = 5;
  bool has_more = 6;
  string price_q_scale = 7;
  repeated Swap swaps = 8;
}

message GetPriceRequest { AlkaneId pool = 1; }
message GetPriceResponse {
  bool found = 1;
  AlkaneId pool = 2;
  AlkaneId token0 = 3;
  AlkaneId token1 = 4;
  string price_q_scale = 5;
  optional string executed_price_q = 6;
  optional uint64 executed_timestamp = 7;
  optional uint32 executed_height = 8;
  bytes executed_txid = 9;
  optional string marginal_price_q = 10;
  optional string oracle_price_q = 11;
  optional uint32 state_height = 12;
}

message Candle {
  uint64 bucket_start = 1;
  string open = 2;
  string high = 3;
  string low = 4;
  string close = 5;
  string volume0 = 6;
  string volume1 = 7;
  uint32 trades = 8;
}

message GetCandlesRequest {
  AlkaneId pool = 1;
  uint32 bucket = 2;                 // 3600 or 86400
  optional uint64 from = 3;
  optional uint64 to = 4;
  optional uint32 page = 5;
  optional uint32 limit = 6;
}
message GetCandlesResponse {
  bool ok = 1;
  AlkaneId pool = 2;
  uint32 bucket = 3;
  uint32 page = 4;
  uint32 limit = 5;
  uint32 total = 6;
  bool has_more = 7;
  string price_q_scale = 8;
  repeated Candle candles = 9;
  repeated uint32 supported_buckets = 10;
}

message GetCandleAtRequest {
  AlkaneId pool = 1;
  uint32 bucket = 2;
  uint64 at = 3;
}
message GetCandleAtResponse {
  bool found = 1;
  AlkaneId pool = 2;
  uint32 bucket = 3;
  Candle candle = 4;
  string price_q_scale = 5;
  repeated uint32 supported_buckets = 6;
}
```
