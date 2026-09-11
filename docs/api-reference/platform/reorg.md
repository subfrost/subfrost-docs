---
title: Reorg Endpoint
sidebar_label: Reorg Endpoint
sidebar_position: 6
description: A fake bitcoind RPC that rolls a rockshrew-mono indexer back to a chosen block height so it can re-index under a new wasm.
---

# Reorg Endpoint

The `/v4/YOUR_API_KEY/reorg/<N>` endpoint is a fake bitcoind RPC that drives a
`rockshrew-mono` indexer to roll back to an arbitrary block height. It
is useful when an alkanes-rs or metashrew upgrade introduces a
state-changing fork (a hardfork height) and you need to re-index from
just before that fork under the new wasm.

## When to use this

When an alkanes-rs release notes an activation height (for example
`v2.2.0-rc.5`'s OYL-disband activation at h=950564), any indexer that
ran the previous wasm past that height has applied the old behavior
and is now permanently divergent. Replaying the affected range under
the new wasm is the only way to converge.

Wiping the database and resyncing from genesis takes hours or days.
This endpoint is much faster: it forces a targeted rollback at a
specific height via metashrew's built-in startup-heal walk-back, then
the indexer resumes forward under the new wasm from there.

If you would rather start from a freshly indexed snapshot rather than
re-index the affected range yourself, see
[Snapshot Download](./snapshots).

## How it works

`rockshrew-mono` runs a startup-heal walk-back on every boot: starting
from the locally indexed tip, it asks bitcoind for the block hash at
each height and walks down until the remote hash matches the locally
stored hash; that height becomes the rollback target.

This endpoint pretends to be bitcoind and answers `getblockhash(h)`
with a synthesized non-matching hash for every `h > <N>`, and with the
real chain hash for every `h <= <N>`. So the walk-back keeps stepping
down until it reaches `<N>`, finds a match (passthrough to the real
chain), and rolls the database back to that height.

After the rollback completes, the endpoint reports `getblockcount` as
`<N>`, so the indexer sits idle at that height. You then point
`--daemon-rpc-url` back at your normal bitcoind and the indexer
resumes forward from `<N> + 1` under whatever wasm it now has loaded.

## Procedure

### 1. Stop your indexer

Stop `rockshrew-mono` (`SIGTERM` is fine: it shuts down cleanly).

### 2. Restart with the endpoint as the daemon URL

```bash
rockshrew-mono \
  --daemon-rpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY/reorg/950564 \
  --max-reorg-depth 2000 \
  ...other args unchanged...
```

Two flags matter:

- **`--daemon-rpc-url`** points at the reorg endpoint for the target
  height of your choice. Substitute `950564` with your target.
- **`--max-reorg-depth`** must exceed `current_tip - target`. The
  default is `100`, which is almost certainly too low for any
  intentional hardfork rollback. Set it generously: for a target
  ~1100 blocks below tip, `--max-reorg-depth 2000` gives slack and
  costs nothing at runtime.

The URL must carry your API key. A request to the unkeyed
`https://mainnet.subfrost.io/v4/reorg/<N>` returns HTTP 401 with
`{"code":"INVALID_API_KEY"}`.

### 3. Wait for the rollback to complete

In `rockshrew-mono`'s logs you will see the startup-heal walk-back:

```
startup-heal: pointer scan — __INTERNAL/height=951646 ...
startup-heal: hash mismatch at height 951646; walking back
startup-heal: hash mismatch at height 951645; walking back
...
startup-heal: hash mismatch at height 950565; walking back
startup-heal: all pointers agree at height 950564 and bitcoind confirms; clean state
Reorg detected. Rolling back to height 950563
```

Each step is one HTTP request. A 1000-block walk-back takes 10-30
seconds. After the rollback, the indexer reports tip = `<N>` and sits
idle (because the endpoint says `getblockcount` = `<N>`).

### 4. Switch back to your normal bitcoind

Stop `rockshrew-mono` again. Restart it with `--daemon-rpc-url`
pointing at your real bitcoind. It will detect the new tip, resume
indexing from `<N> + 1`, and apply the new wasm's behavior to every
block from the fork onward.

You can drop `--max-reorg-depth` back to its default if you set it
high for the rollback step.

## API reference

The endpoint mimics the bitcoind JSON-RPC interface. Three methods
are synthesized; everything else passes through to the live mainnet
chain via our bitcoind bouncer.

### `getblockcount`

Returns the target height `<N>` regardless of the real chain tip. This
makes the indexer idle once the rollback completes.

```bash
curl -X POST -H "content-type: application/json" \
  --data '{"jsonrpc":"2.0","method":"getblockcount","id":1}' \
  https://mainnet.subfrost.io/v4/YOUR_API_KEY/reorg/950564
# => {"result":950564,"error":null,"id":1,"jsonrpc":"2.0"}
```

### `getblockhash`

For `h > <N>` returns a synthetic non-matching hash of the form
`ffffffffffffffffffffffffffffffffffffffffffffffffffffffff{h:016x}`.
For `h <= <N>` passes through to the real chain.

```bash
# Above target: fake hash
curl -X POST -H "content-type: application/json" \
  --data '{"jsonrpc":"2.0","method":"getblockhash","params":[951000],"id":2}' \
  https://mainnet.subfrost.io/v4/YOUR_API_KEY/reorg/950564
# => {"result":"ffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000e82d8",...}

# At or below target: real chain hash
curl -X POST -H "content-type: application/json" \
  --data '{"jsonrpc":"2.0","method":"getblockhash","params":[950564],"id":3}' \
  https://mainnet.subfrost.io/v4/YOUR_API_KEY/reorg/950564
# => {"result":"00000000000000000000f289e6259e2377a32bf4703492ec2ba3381438dc863e",...}
```

### `getbestblockhash`

Returns the real-chain hash at `<N>` (i.e. `getblockhash(<N>)`).

### Everything else

`getblock`, `getblockheader`, `sendrawtransaction`, `getrawmempool`,
etc. pass through unchanged. The startup-heal path only consults
`getblockhash`, so passthrough is safe for normal operation; if your
indexer happens to request `getblock` on a synthetic above-target
hash it will get an upstream error, which is the correct signal that
that block is not on the served chain.

## GET request returns usage

`GET https://mainnet.subfrost.io/v4/YOUR_API_KEY/reorg/<N>` returns a short
plain-text usage doc, so paste-in-browser users see what to do.

## Networks

Currently mainnet only:

- **mainnet**: `https://mainnet.subfrost.io/v4/YOUR_API_KEY/reorg/<N>`

Signet and regtest will be added if there is demand. File an issue or
contact support.

## Caveats

- **The endpoint is stateless and per-call.** It does nothing
  persistent on our side. Two callers pointing different indexers at
  different `<N>` values get independently correct behavior at the
  same time.
- **It does not protect you from typos.** `--daemon-rpc-url
  .../v4/YOUR_API_KEY/reorg/0` will attempt to roll all the way back to height 0.
  No safety cap; treat the URL as authoritative.
- **Your wasm must already be the post-fork build before you start
  the rollback.** This endpoint replays history; if you walk back to
  `950563` and then resume with the old wasm, you will re-create the
  same divergence you started with.
- **`--max-reorg-depth` is the load-bearing flag.** Without it set
  high enough, the walk-back hits its floor and stops short of `<N>`,
  rolling back only `max_reorg_depth` blocks instead of the
  `tip - <N>` you wanted.

## Related

- [Snapshot Download](./snapshots): if you would
  rather start from a freshly indexed RocksDB snapshot than re-index
  the affected range yourself.
- [Database Rsync Access](./rsync): authenticated rsync
  for Business customers needing per-service granularity.
