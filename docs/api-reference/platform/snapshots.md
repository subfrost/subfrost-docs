---
title: Snapshot Download
sidebar_label: Snapshot Download
sidebar_position: 7
description: Bootstrap a metashrew RocksDB index from the public mainnet snapshot tarball instead of indexing from genesis.
---

# Snapshot Download

The metashrew RocksDB index can be bootstrapped from a public
snapshot rather than indexed from genesis. For mainnet that is the
difference between hours and weeks.

The snapshot is the verbatim contents of a healthy mainnet metashrew
indexer's `/data` directory, tarred and gzipped. Extract it into a
fresh metashrew data directory and start `rockshrew-mono`: it picks up
from the snapshot's tip and resumes forward from there.

`latest.tar.gz` is republished in place, so **check its size and age
before you plan a transfer** rather than trusting a figure in this
page. One `HEAD` tells you both:

```bash
curl -sIL https://cdn.subfrost.io/snapshots/latest.tar.gz \
  | grep -iE 'content-length|last-modified|x-goog-hash'
```

## URL

- **Mainnet**: `https://cdn.subfrost.io/snapshots/latest.tar.gz`

The CDN redirects to a public GCS bucket; the tarball is served with
HTTP/2, range-request support, and no auth. **It is large.** Measured
on 2026-10-01, `content-length` was 377,371,555,210 bytes — 377 GB
(352 GiB) compressed. Plan the transfer from your own `HEAD`, not from
that number.

Bucket listing is not public, so `latest.tar.gz` is the only object you
can discover from outside. There is no index of dated snapshots to
browse.

Signet and regtest are not currently published as public snapshots;
those chains sync from scratch in minutes to hours anyway.

## What the snapshot contains

The tarball expands to a complete RocksDB database produced by a
specific build of metashrew + alkanes-rs. Each refresh corresponds to
a tagged metashrew image; the contents are byte-identical (under our
strict-block-determinism guarantees) to what your own pod would
produce by indexing forward to the same height.

Caveat: the snapshot's on-disk format and indexer wasm version must
match the `rockshrew-mono` binary you intend to run. Mainnet
snapshots currently target metashrew `v9.0.5-rc.13` with alkanes-rs
`v2.2.0-rc.5`. If you are running an older or future version,
contact support before bootstrapping: the SMT layout has been stable
across the v9.0.5-rc.* series but newer versions may diverge.

## Quick start

```bash
mkdir -p /data/metashrew
cd /data/metashrew
curl -L https://cdn.subfrost.io/snapshots/latest.tar.gz \
  | tar -xzf - --strip-components=1

# Verify
ls CURRENT *.sst | head
# CURRENT exists and there is at least one *.sst file -> snapshot is intact

# Start rockshrew-mono pointing at /data/metashrew
rockshrew-mono \
  --db-path /data/metashrew \
  --indexer /path/to/indexer.wasm \
  --daemon-rpc-url http://your-bitcoind:8332 \
  --auth bitcoinrpc:bitcoinrpc
```

`--strip-components=1` discards the top-level directory in the
tarball so the contents land directly in `/data/metashrew`. The
indexer detects the existing data, reads `__INTERNAL/height` to learn
the snapshot's tip, and resumes forward from that height + 1.

## Streamed extraction (no tmp file, no double disk usage)

The default `curl | tar` pipeline above is already streamed:
nothing is written to disk except the final RocksDB files. So you need
room for the expanded database, not for the tarball as well — but the
expanded database is larger than the download. At the size measured
above, budget well over 400 GB of free space on the target filesystem
and check it before you start, because a pipeline that fills the disk
three hundred gigabytes in leaves you with a partial RocksDB and
nothing to resume from.

For the most reliable transfer (slower links, automatic retries,
parallel reads), use the `gcloud` CLI directly against the underlying
GCS bucket. That is exactly what our internal bootstrap jobs do:

```bash
CLOUDSDK_STORAGE_TRANSPORT=requests \
  gcloud storage cp \
    --no-user-output-enabled \
    gs://subfrost-cdn-bucket/snapshots/latest.tar.gz - \
  | tar -xzf - -C /data/metashrew --strip-components=1
```

This bypasses Cloudflare entirely, gets the maximum throughput your
egress allows, and retries on transient I/O failures.

## Verification

Once extraction completes:

```bash
# RocksDB CURRENT marker should exist
test -f /data/metashrew/CURRENT && echo OK

# There should be at least one SST file
ls /data/metashrew/*.sst | wc -l    # expect many

# rockshrew-mono will refuse to start if the SMT pointers don't
# agree. Let it run; it logs the indexed tip on startup.
```

If `rockshrew-mono` boots and logs something like:

```
startup-heal: all pointers agree at height NNNNNN and bitcoind confirms; clean state
```

then the snapshot is intact and you are at the snapshot's tip.

## How current is the snapshot?

Read `Last-Modified` on the object and assume nothing else. The
snapshot is not on a guaranteed refresh schedule: when this page was
last checked (2026-10-01) `latest.tar.gz` carried
`Last-Modified: Tue, 02 Jun 2026 02:58:15 GMT`, four months behind the
tip.

That is still a working bootstrap — `rockshrew-mono` resumes from
`__INTERNAL/height` and indexes forward on its own — but the catch-up
is proportional to the gap, so a four-month-old snapshot means roughly
seventeen thousand blocks to index before you are at the tip, not the
few minutes a same-day snapshot would cost. Size that before you
commit to the approach, and compare it against indexing the tail
yourself.

If you need a snapshot pinned to a specific height, or a fresher one
than the object currently carries, contact support.

## Kubernetes bootstrap pattern

This is the same shape our own production pods use. The init
container streams the snapshot into the PVC before the indexer
container starts.

```yaml
apiVersion: v1
kind: Pod
spec:
  initContainers:
    - name: seed-snapshot
      image: google/cloud-sdk:slim
      command:
        - /bin/bash
        - -c
        - |
          set -euxo pipefail
          # Skip if we already have data (idempotent on retry)
          if [ -f /data/CURRENT ]; then
            echo "already seeded"
            exit 0
          fi
          CLOUDSDK_STORAGE_TRANSPORT=requests \
            gcloud storage cp \
              --no-user-output-enabled \
              gs://subfrost-cdn-bucket/snapshots/latest.tar.gz - \
            | tar -xzf - -C /data --strip-components=1
          test -f /data/CURRENT
      resources:
        requests: { cpu: "2", memory: "16Gi" }
        limits:   { cpu: "4", memory: "32Gi" }
      volumeMounts:
        - { name: data, mountPath: /data }
  containers:
    - name: rockshrew-mono
      image: your-metashrew-image:v9.0.5-rc.13
      args:
        - --db-path
        - /data
        - --indexer
        - /metashrew/indexer.wasm
        - --daemon-rpc-url
        - http://bitcoind.your-namespace:8332
      volumeMounts:
        - { name: data, mountPath: /data }
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: metashrew-data
```

The init container's `if [ -f /data/CURRENT ]; then exit 0` check
makes the bootstrap idempotent: pod restarts don't redownload, only
the first-ever boot pays the seed cost.

## Combining snapshot + reorg endpoint

If you are bootstrapping for the first time, just use the snapshot.

If you have an indexer that ran an older wasm past a known
hardfork height and is now divergent, the cheapest fix is **NOT** the
snapshot. It is the [reorg endpoint](./reorg), which
forces a targeted rollback to one block before the fork. The
snapshot would re-download the whole 377 GB object; the reorg endpoint
costs a few hundred HTTP requests plus a re-index of the affected
range.

Use the snapshot for: fresh installs, disaster recovery,
horizontally scaling out a new replica.

Use the reorg endpoint for: surgical fixes when you know the
divergence height and only need to replay a bounded range under a
new wasm.

## Caveats

- **Snapshot version vs binary version must match.** Bootstrapping a
  v2.1 binary from a v2.2 snapshot will not work; the on-disk schema
  is a runtime contract of the indexer wasm.
- **One-way transfer.** Plan for the full size, measured from your own
  `HEAD` rather than from this page, plus free local disk for the
  expanded database during extraction. Streamed extraction (the
  pipelines shown above) means you don't need room for both the
  tarball and the database.
- **Check the vintage.** `Last-Modified` has been months behind the
  tip. The bootstrap still works, but the catch-up index is
  proportional to the gap.
- **Public, unauthenticated.** Anyone can download. Don't put
  sensitive data in the same bucket.

## Related

- [Database Rsync Access](./rsync): authenticated rsync
  for per-service granularity (esplora, ord, bitcoind, metashrew
  separately). Required if you want anything other than mainnet
  metashrew.
- [Reorg Endpoint](./reorg): when you already have a
  full index but need to surgically replay a range under new wasm.
