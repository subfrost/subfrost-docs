---
title: Snapshot Download
sidebar_label: Snapshot Download
sidebar_position: 7
description: Bootstrap a metashrew RocksDB index from the public daily mainnet snapshot instead of indexing from genesis.
---

# Snapshot Download

The metashrew RocksDB index can be bootstrapped from a public
snapshot rather than indexed from genesis. For mainnet that is the
difference between hours and weeks.

The snapshot is the verbatim contents of a healthy mainnet metashrew
indexer's `/data` directory, tarred and gzipped, refreshed daily.
Extract it into a fresh metashrew data directory and start
`rockshrew-mono`: it picks up from the snapshot's tip and resumes
forward from there.

## URL

- **Mainnet**: `https://cdn.subfrost.io/snapshots/latest.tar.gz`

The CDN redirects to a public GCS bucket; the tarball is served with
HTTP/2, range-request support, and no auth. Size is approximately
80–120 GB depending on the height (the snapshot grows roughly
linearly with chain tip).

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
nothing is written to disk except the final RocksDB files. For a
100 GB tarball expanding to ~120 GB of RocksDB, that means you need
about 130 GB of disk space, not 250 GB.

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

`latest.tar.gz` is refreshed daily from a healthy mainnet indexer
pod. By the time you download it, the live chain has advanced 100–200
blocks past the snapshot's tip; `rockshrew-mono` will catch up
automatically in a few minutes once your bitcoind is reachable.

If you need a snapshot pinned to a specific historical height (for
incident replay or forensic analysis), contact support. We retain a
small rolling set of dated snapshots in the same bucket.

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
snapshot would re-download ~100 GB; the reorg endpoint costs a few
hundred HTTP requests plus a re-index of the affected range.

Use the snapshot for: fresh installs, disaster recovery,
horizontally scaling out a new replica.

Use the reorg endpoint for: surgical fixes when you know the
divergence height and only need to replay a bounded range under a
new wasm.

## Caveats

- **Snapshot version vs binary version must match.** Bootstrapping a
  v2.1 binary from a v2.2 snapshot will not work; the on-disk schema
  is a runtime contract of the indexer wasm.
- **One-way transfer.** Plan for the full size: ~120 GB ingress to
  your node, plus the same amount of free local disk during
  extraction. Streamed extraction (the pipelines shown above) means
  you don't need 2x the space.
- **Public, unauthenticated.** Anyone can download. Don't put
  sensitive data in the same bucket.

## Related

- [Database Rsync Access](./rsync): authenticated rsync
  for per-service granularity (esplora, ord, bitcoind, metashrew
  separately). Required if you want anything other than mainnet
  metashrew.
- [Reorg Endpoint](./reorg): when you already have a
  full index but need to surgically replay a range under new wasm.
