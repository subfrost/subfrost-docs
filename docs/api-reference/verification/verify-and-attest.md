---
title: Verify and Attest
sidebar_label: Verify and Attest
sidebar_position: 1
description: Submit an alkane's source to the SUBFROST explorer for a sandboxed rebuild, or record an out-of-band verification with an admin key.
---

# Verify and Attest

The [SUBFROST explorer](https://explorer.subfrost.io/alkanes) exposes a contract verification API at `https://explorer.subfrost.io/api/v1`. It has two write routes:

- **[`verify`](#verify)**: any active API key. The explorer rebuilds the source in a sandbox and publishes it only if the rebuild matches the on-chain bytecode.
- **[`attest`](#attest)**: admin key only. Records a verified source directly, without a rebuild.

To read a verified alkane's source back, see the [Source API](./source-api). For what the verdicts mean, see [Verifying alkanes](../../build/verifying-alkanes).

:::tip
You rarely call these endpoints by hand. [`alkanes-cli upload`](../cli-sdk/build-info#5-upload-submit-a-buildinfo-to-the-explorer) maps a BuildInfo onto the right body and POSTs it for you. The `curl` examples below are the raw HTTP equivalents.
:::

## Authentication

The API key is part of the path: `/api/v1/{key}/…`. Keys come from the same key store as the mainnet gateway, so a key that works at `https://mainnet.subfrost.io/v4/{key}` works here too. The `x-subfrost-api-key` header is not read by this API; put the key in the path. See [API Keys](../platform/api-keys) to create one.

- **Any active key** may call `verify`. The verifier only publishes a source when its own diff confirms the rebuild, so a bad recipe just fails; nothing is trusted blindly.
- **`attest` requires an admin key** issued by the SUBFROST team. Any other valid key gets `403`.

These write routes **fail closed**: there is no keyless tier, and a missing, unknown, or inactive key gets `401`.

## Verify

```
POST https://explorer.subfrost.io/api/v1/{key}/verify
```

Rebuild an alkane from a source recipe in the sandbox and diff it against the on-chain bytecode. If the diff engine confirms the match (verdict `reproducible` or `verified`), the source is **auto-promoted** to the alkane's verified-source panel and becomes readable through the [Source API](./source-api).

:::note Minimal recipe
You almost never need to fill in the reproduction fields by hand. The verifier fetches the on-chain bytecode once and **reverses the recipe out of it**: the embedded panic paths carry the exact git-dependency revs, `HOME`, and host triple; the `producers` section carries the clang and rustc versions; and the deploy transaction's confirmation time gives the crates.io freeze date. So a body of just `{ alkane, repo_url, commit, package }` (plus `subdir` when the crate is not at the repo root) reproduces most alkanes. Any field you *do* send **overrides** its auto-reversed value; send one only to correct a mis-reversal.
:::

### Request body

Only `alkane` and `repo_url` are required. Every other field is optional, and fields not in this table (or sent as `null` or `""`) are dropped before the request reaches the verifier.

| Field | Type | Notes |
|---|---|---|
| `alkane` | string | **Required.** Alkane ID as `"block:tx"`, both numeric (for example `"4:797"`). |
| `repo_url` | string | **Required.** Source git repository. |
| `commit` | string | Commit or ref to build. |
| `package` | string | Cargo package (`-p`). |
| `subdir` | string | Path of the crate inside the repo, if it is not at the root. |
| `rustc` | string | rustc version (for example `1.82.0`). Auto-reversed from the bytecode. |
| `clang_version` | string | clang version recorded in `producers` (for example `14.0.0`). Auto-reversed from the bytecode. |
| `home_dir` | string | Build `HOME`; reconstructs the registry, git and toolchain paths. Auto-reversed from the bytecode. |
| `freeze_commit` | string | `crates.io-index-archive` commit for the registry time-machine. If omitted, it is resolved from `git_date`. |
| `git_url` | string | A single git dependency to pin. Defaults to `https://github.com/kungfuflex/alkanes-rs`. |
| `alkanes_rev` | string | The rev to pin `git_url` to. |
| `git_source_form` | string | `bare` or `rev`: how that dependency's source-id was spelled in the origin lockfile. Defaults to `bare`. |
| `git_pins` | string | Several git dependency pins at once, one `url rev [bare\|rev]` per line. Pins **every** listed dependency (a contract commonly pins both `alkanes-rs` and `metashrew`), which the single `git_url`/`alkanes_rev` pair cannot express. Usually unnecessary: the verifier derives pins from the bytecode's checkout paths. |
| `git_date` | string | Deploy date (`YYYY-MM-DD` or RFC 3339). Freezes the crates.io index **and** any still-unpinned git dependency to what existed then, which is the fix for a contract that ships no committed lockfile. If neither `git_date` nor `freeze_commit` is sent, it defaults to the deploy transaction's block time (or earlier, when the dependency versions in the bytecode show the lockfile was resolved before deployment). |
| `build_env` | string | Extra build environment variables, one `KEY=VALUE` per line. |
| `typo_fix` | boolean | `true` rewrites a malformed `https:/github.com` URL in the repo's `Cargo.toml` to `https://github.com` before resolving. |
| `inline_src_b64` | string | The full source tree as a base64-encoded `tar.gz`. When present, the builder uses it instead of cloning `repo_url`, so a private or deleted repo can still verify; `repo_url` and `commit` are then recorded as provenance only. The verified tree is stored with the result, so the Source API serves it without GitHub access. |

When the repo commits its own `Cargo.lock`, the builder treats that lockfile as authoritative and skips the git pinning and date-freeze rewrites. [Reproducible builds](../../build/reproducible-builds) explains each axis.

### Examples

A full recipe for DIESEL (`2:0`):

```bash
curl -sS -X POST https://explorer.subfrost.io/api/v1/$SUBFROST_API_KEY/verify \
  -H 'content-type: application/json' \
  -d '{
    "alkane": "2:0",
    "repo_url": "https://github.com/kungfuflex/alkanes-rs",
    "commit": "fb11ee0e",
    "package": "alkanes-std-genesis-alkane-upgraded-eoa",
    "rustc": "1.86.0",
    "clang_version": "20.1.7",
    "home_dir": "/Users/kevinyao",
    "git_source_form": "bare"
  }'
```

The same alkane usually verifies from a **minimal** body, because the verifier reverses `rustc`, `clang_version`, `home_dir`, the git pins, and the crates.io freeze from the bytecode itself:

```bash
curl -sS -X POST https://explorer.subfrost.io/api/v1/$SUBFROST_API_KEY/verify \
  -H 'content-type: application/json' \
  -d '{
    "alkane": "2:0",
    "repo_url": "https://github.com/kungfuflex/alkanes-rs",
    "commit": "fb11ee0e",
    "package": "alkanes-std-genesis-alkane-upgraded-eoa"
  }'
```

### Response

The verifier's JSON and HTTP status are passed through unchanged. The rebuild runs as a background job, so a successful response describes a newly **queued** verification run, not a verdict:

```json
{
  "run_id": "6f0c…",
  "alkane": { "block": "2", "tx": "0" },
  "repo_url": "https://github.com/kungfuflex/alkanes-rs",
  "commit": "fb11ee0e",
  "package": "alkanes-std-genesis-alkane-upgraded-eoa",
  "status": "building",
  "stage": "queued"
}
```

When the run finishes, the verdict appears on the alkane's explorer page (`https://explorer.subfrost.io/alkane/{id}`). A `reproducible` or `verified` verdict means the source is now promoted, and [`GET /api/v1/{key}/source/{block}/{tx}`](./source-api#source-metadata) returns it with `verified: true`.

### Errors

| Status | Cause |
|---|---|
| `400` | Body is not valid JSON, `alkane` is not a numeric `"block:tx"`, or `repo_url` is missing. |
| `401` | Missing, unknown, or inactive API key. |
| `502` | The verifier could not be reached, or did not answer within 25 seconds. |
| other | Any other status comes from the verifier and is passed through, for example `422` when a field has the wrong type (such as `build_env` sent as an array) or `503` when verification is temporarily unavailable. |

## Attest

```
POST https://explorer.subfrost.io/api/v1/{key}/attest
```

**Admin only.** Directly record a bytecode-to-verified-source mapping **without** a sandbox rebuild. This exists for results proven outside the verifier's own sandbox that it cannot reproduce itself, for example a build proven on a host the verifier does not run. It needs an admin key issued by the SUBFROST team because it bypasses the diff check. `alkanes-cli upload` (without `--verify`) is the ergonomic way to call it: it sends the full BuildInfo as the `manifest`.

The attestation is keyed by the bytecode's sha256, so it applies to every alkane that shares that bytecode (for example, every clone of a template).

### Request body

`repo_url` is required. Identify the bytecode with **either** `block` and `tx` **or** `wasm_sha256`; if both are sent, `wasm_sha256` is used.

| Field | Type | Notes |
|---|---|---|
| `block`, `tx` | string | Alkane ID parts, as **strings** (for example `"4"` and `"76"`). JSON numbers are rejected. |
| `wasm_sha256` | string | Bytecode sha256, as an alternative to `block` and `tx`. |
| `repo_url` | string | **Required.** Source repository. |
| `commit`, `subdir`, `rustc`, `alkanes_rev` | string | Source provenance, recorded verbatim. |
| `verdict` | string | The attested verdict (for example `verified`). Defaults to `verified`. |
| `match_pct` | number | Normalized match percentage. |
| `note` | string | Free-text explanation of the residual. |
| `manifest` | object | Optional structured manifest (for example a full BuildInfo), stored with the attestation and shown as the reproduction recipe. |

### Example

```bash
curl -sS -X POST https://explorer.subfrost.io/api/v1/$ADMIN_KEY/attest \
  -H 'content-type: application/json' \
  -d '{
    "block": "4", "tx": "76",
    "repo_url": "https://github.com/kungfuflex/alkanes-rs",
    "verdict": "verified",
    "match_pct": 96.7,
    "note": "cross-host secp256k1 C-object memory-base residual (~6 bytes, shifts many offsets); logic and producers reproduced from source"
  }'
```

### Response

The stored record: `wasm_sha256`, `repo_url`, the provenance fields you sent, `verdict`, `match_pct`, `note`, `verified_via` (the `block:tx` you attested through, if any), and `manifest`.

### Errors

| Status | Cause |
|---|---|
| `400` | Body is not valid JSON, `repo_url` is missing, or neither `wasm_sha256` nor both `block` and `tx` were sent. |
| `401` | Missing, unknown, or inactive API key. |
| `403` | The key is valid but is not an admin key. |
| `404` | No bytecode exists for the given `block` and `tx`. |
| `422` | A field has the wrong type, for example `block` or `tx` sent as a number. |
| `502` | The verifier could not be reached, or did not answer within 15 seconds. |

## Next steps

- [Source API](./source-api): read a verified alkane's file tree and files.
- [BuildInfo Workbench](../cli-sdk/build-info): produce a recipe locally and upload it.
- [Reproducible builds](../../build/reproducible-builds): what each recipe field reconstructs.
