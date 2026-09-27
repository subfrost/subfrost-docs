---
title: Source API
sidebar_label: Source API
sidebar_position: 2
description: Read a verified alkane's provenance, file tree, and file contents from the SUBFROST explorer API.
---

# Source API

Every alkane the explorer has **verified** carries its exact source with it: the repo, the commit, and, when the verification embedded the source itself (for example for a private repo), a byte-for-byte copy of the source tree the sandbox reproduced the on-chain wasm from. The Source API exposes that tree programmatically, so any surface can render the same file browser you see at `https://explorer.subfrost.io/alkane/{id}/source`.

There are three read endpoints under `https://explorer.subfrost.io/api/v1`, all keyed by alkane ID:

| Endpoint | Returns |
|---|---|
| [`GET /api/v1/{key}/source/{block}/{tx}`](#source-metadata) | Metadata: repo, commit, subdir, package, verification status, entrypoint. |
| [`GET /api/v1/{key}/source/{block}/{tx}/tree`](#file-tree) | The full file tree (paths, types, sizes). |
| [`GET /api/v1/{key}/source/{block}/{tx}/blob?path=…`](#file-contents) | The contents of one file. |

## The data model

The endpoints return four JSON shapes:

- **`AlkaneSource`**: resolved provenance and verification status for an alkane: `{ alkane, block, tx, verified, verdict, match_pct, origin, repo, owner, name, commit, subdir, package, entrypoint, private, fileCount }`.
- **`SourceTree`**: `{ alkane, origin, repo, commit, subdir, entrypoint, nodes: SourceNode[] }`.
- **`SourceNode`**: one entry in the tree, `{ path, type: "blob" | "tree", size? }` (the shape of GitHub's `git/trees` API).
- **`SourceBlob`**: one file's contents, `{ alkane, path, bytes, truncated, binary, text, base64? }`. `text` is `null` for a binary file; binary files served from the explorer's own store carry a `base64` payload instead.

Fields with no value (for example `subdir` on a crate at the repo root) are omitted from the JSON.

### Where the mapping comes from

There is **no static alkane → repo table**. The mapping is resolved from the alkane's verification record, the same lookup the [verify endpoint](./verify-and-attest#verify) and the explorer's source page use. When an alkane verifies, its record keeps `repo_url`, `commit`, `package`, and, when the source was embedded in the verification, an inline copy of the source tree. Each request resolves that record and picks a serving **origin**:

- **`db`**: the source is served from the explorer's own store of verified sources. This is the exact source the sandbox reproduced, and it works even when the origin repo is **private**, with no GitHub call. It takes priority whenever the record carries an inline copy.
- **`github`**: a public GitHub repo, read live at the verified commit through the GitHub `git/trees` API (tree) and `raw.githubusercontent.com` (file contents), cached per commit. Only GitHub is supported here: a verified alkane whose repo is hosted elsewhere, and which has no inline copy, resolves to `none`.
- **`none`**: the alkane has no browsable verified source. The endpoints return `404`.

An alkane becomes browsable here once it verifies. To make one browsable, submit its source through the [verify endpoint](./verify-and-attest#verify) or [`alkanes-cli upload`](../cli-sdk/build-info#5-upload-submit-a-buildinfo-to-the-explorer); a `reproducible` or `verified` verdict auto-promotes it. A run that embedded its own source can be served from `db` before it has verified, so always check the `verified` flag.

## Authentication

Same as the rest of the [`/api/v1` API](./verify-and-attest#authentication): the API key is a path segment, `/api/v1/{key}/source/…`, from the same key store as `https://mainnet.subfrost.io/v4/{key}`. Any active key may read. See [API Keys](../platform/api-keys).

A missing, unknown, or inactive key gets `401`.

## Source metadata

```
GET https://explorer.subfrost.io/api/v1/{key}/source/{block}/{tx}
```

Provenance and verification status for an alkane's source, plus the `entrypoint` file a client should open first. The entrypoint is the package's `src/lib.rs` when it can be found, otherwise the root `src/lib.rs`, any other `src/lib.rs`, the root `Cargo.toml`, the first `.rs` file, or the first file.

```bash
curl -sS https://explorer.subfrost.io/api/v1/$SUBFROST_API_KEY/source/2/0
```

Example response (illustrative values):

```json
{
  "ok": true,
  "source": {
    "alkane": "2:0",
    "block": "2",
    "tx": "0",
    "verified": true,
    "verdict": "reproducible",
    "match_pct": 100.0,
    "origin": "github",
    "repo": "https://github.com/kungfuflex/alkanes-rs",
    "owner": "kungfuflex",
    "name": "alkanes-rs",
    "commit": "fb11ee0e",
    "package": "alkanes-std-genesis-alkane-upgraded-eoa",
    "entrypoint": "crates/alkanes-std-genesis-alkane-upgraded-eoa/src/lib.rs",
    "private": false,
    "fileCount": 214
  }
}
```

`fileCount` counts files (`blob` nodes) in the tree. If the tree cannot be listed, the metadata is still returned, with `fileCount: 0`.

| Status | Cause |
|---|---|
| `400` | `block` or `tx` is not numeric. |
| `401` | Missing, unknown, or inactive API key. |
| `404` | No browsable verified source for this alkane (including when the verifier could not be reached). |
| `502` | Unexpected upstream failure. |

## File tree

```
GET https://explorer.subfrost.io/api/v1/{key}/source/{block}/{tx}/tree
```

The full recursive file listing at the verified commit. `nodes` mirrors the GitHub `git/trees` shape: both `blob` (file) and `tree` (directory) entries, with `size` in bytes for files. For the `github` origin the listing covers the whole repository; for the `db` origin it covers the stored files, with directory entries derived from their paths.

```bash
curl -sS https://explorer.subfrost.io/api/v1/$SUBFROST_API_KEY/source/32/0/tree
```

Example response (abbreviated, illustrative values):

```json
{
  "ok": true,
  "tree": {
    "alkane": "32:0",
    "origin": "db",
    "repo": "https://github.com/subfrost/subfrost-alkanes",
    "commit": "0748786d",
    "subdir": "crates/fr-btc",
    "entrypoint": "crates/fr-btc/src/lib.rs",
    "nodes": [
      { "path": "Cargo.toml", "type": "blob", "size": 412 },
      { "path": "crates", "type": "tree" },
      { "path": "crates/fr-btc", "type": "tree" },
      { "path": "crates/fr-btc/src/lib.rs", "type": "blob", "size": 18422 }
    ]
  }
}
```

| Status | Cause |
|---|---|
| `400` | `block` or `tx` is not numeric. |
| `401` | Missing, unknown, or inactive API key. |
| `404` | No browsable verified source for this alkane. |
| `502` | The listing failed (the repo is private on GitHub, deleted, or GitHub rate-limited the request). |

## File contents

```
GET https://explorer.subfrost.io/api/v1/{key}/source/{block}/{tx}/blob?path=…
```

The contents of one file. `path` should be a `blob` path from the tree. Returns a JSON `SourceBlob` by default; add `raw=1` for the raw bytes (`text/plain`, or `application/octet-stream` for a binary file).

```bash
curl -sS "https://explorer.subfrost.io/api/v1/$SUBFROST_API_KEY/source/2/0/blob?path=crates/alkanes-std-genesis-alkane-upgraded-eoa/src/lib.rs"
```

Example response (text abbreviated):

```json
{
  "ok": true,
  "blob": {
    "alkane": "2:0",
    "path": "crates/alkanes-std-genesis-alkane-upgraded-eoa/src/lib.rs",
    "bytes": 14071,
    "truncated": false,
    "binary": false,
    "text": "use alkanes_runtime::message::MessageDispatch;\n..."
  }
}
```

Raw bytes, for piping straight into a file or an editor pane:

```bash
curl -sS "https://explorer.subfrost.io/api/v1/$SUBFROST_API_KEY/source/2/0/blob?path=crates/alkanes-std-genesis-alkane-upgraded-eoa/src/lib.rs&raw=1"
```

Limits and binary files depend on the origin:

- **`github` origin**: a file over 512 KiB comes back with `truncated: true` and `text` cut at 512 KiB; `bytes` is still the full size. A file containing a NUL byte is treated as binary (`binary: true`, `text: null`) and has no `base64` payload, so `raw=1` returns an empty body for it.
- **`db` origin**: files are never truncated. Binary files carry a `base64` payload and `text: null`, and `raw=1` streams their bytes as `application/octet-stream`.

| Status | Cause |
|---|---|
| `400` | `block` or `tx` is not numeric, or `path` is missing. |
| `401` | Missing, unknown, or inactive API key. |
| `404` | No browsable verified source, or the file is not in the tree or could not be read. |
| `502` | Unexpected upstream failure. |

## Embedding the browser

The model maps one-to-one onto a two-pane browser (file tree plus viewer):

1. `GET …/source/{block}/{tx}`: read `entrypoint`. If `verified` is `false` or you get `404`, show "not verified yet".
2. `GET …/tree`: render `nodes` as a collapsible tree (fold `blob` paths on `/` into directories; `tree` nodes also give you empty directories).
3. On a file click, `GET …/blob?path=…`: render `text` with line numbers. If `binary` is `true`, show a "binary file" placeholder, or decode `base64` when it is present.

## Next steps

- [Verify and Attest](./verify-and-attest): publish an alkane's source so it becomes browsable.
- [Verifying alkanes](../../build/verifying-alkanes): how verification works.
