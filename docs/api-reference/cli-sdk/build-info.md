---
title: BuildInfo Workbench
sidebar_label: BuildInfo Workbench
sidebar_position: 11
description: Reverse, rebuild, diff, and upload an alkane's wasm with the alkanes-cli build-info and upload commands.
---

# BuildInfo Workbench

`alkanes-cli` has a **BuildInfo workbench**: subcommands that reverse an alkane's build environment from its bytecode, reconstruct the wasm in a controlled sandbox, diff the two, and `upload` the result to the [SUBFROST explorer](https://explorer.subfrost.io/alkanes). The output is a single self-contained `BuildInfo` JSON (schema `1.0.0`) that fully specifies how to reproduce one alkane's on-chain wasm.

For what verification means and how the explorer runs it, see [Verifying alkanes](../../build/verifying-alkanes). For the reproduction formula itself, see [Reproducible builds](../../build/reproducible-builds).

## Availability

The workbench lives on the **`develop` branch** of [`kungfuflex/alkanes-rs`](https://github.com/kungfuflex/alkanes-rs/tree/develop/crates/alkanes-cli-common/src/buildinfo) and is not in any release yet, so build `alkanes-cli` from source as described in [Installation](./installation) (which already clones `develop`). The `upload` command is compiled into the `alkanes-cli` binary by default; no extra Cargo features are needed.

What each step needs:

- `build-info build` and the full `build-info` pipeline run the build in a **Docker** container, so Docker must be installed and running.
- `build-info reverse` and `build-info verify` need no Docker. They work offline on a local `.wasm`; they only need `--jsonrpc-url` when the target is an on-chain alkane ID.
- `upload` only POSTs the JSON to the explorer over HTTPS.

## Subcommands

`--at` accepts **either** an alkane ID (`block:tx`, fetched with `metashrew_view` `getbytecode` from `--jsonrpc-url`) **or** a local `.wasm` path. Offline is the default: `--jsonrpc-url` is not filled in from `-p`, so pass it whenever `--at` is an alkane ID. Both are global options and go before the subcommand. If the endpoint needs an auth header, add it with `--jsonrpc-header "Name: Value"`.

| Command | What it does |
|---|---|
| `build-info reverse --at <id or .wasm>` | Reverse the build environment (rustc, clang, `HOME`, host triple, whether it links C) from a target wasm. |
| `build-info build <build-info.json>` | Rebuild a wasm from a BuildInfo JSON in a Docker sandbox. |
| `build-info verify --at <id or .wasm> <candidate.wasm>` | Diff a candidate wasm against the target and print a verdict. |
| `build-info [src-dir] --at <id or .wasm>` | Full pipeline: reverse, reconstruct from source, diff, and emit a populated BuildInfo JSON. |
| `upload <build-info.json> --api-key <KEY>` | Submit a BuildInfo to the explorer (attest by default, or `--verify`). |

The end-to-end flow is **`build-info` then `upload`**: produce the recipe, then submit it.

### 1. reverse: read the build environment out of the bytecode

```bash
# From a local .wasm (fully offline):
alkanes-cli build-info reverse --at ./free_mint.wasm --emit reversed.json

# From an on-chain ID (fetches the bytecode over JSON-RPC):
alkanes-cli -p mainnet --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  build-info reverse --at 4:797
```

The readout on stderr summarizes what the wasm reveals: `rustc`, `clang` vendor and version, `home`, `host_triple`, and `links_c`. Without `--emit`, the full reversed JSON goes to stdout.

### 2. build-info: the full pipeline

Point it at a git checkout of the alkane's source and at the target. It reverses, rebuilds in the sandbox, diffs, and emits the complete BuildInfo:

```bash
alkanes-cli -p mainnet --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  build-info ./free-mint --at 4:797 \
  --repo https://github.com/kungfuflex/free-mint \
  --package free-mint \
  --emit build-info.json
```

Flags: `--repo`, `--commit`, `--package` (the Cargo `-p` package), `--features` (comma-separated, for example `mainnet`), `--emit` (write to a file instead of stdout). The `-p` global option is recorded as the BuildInfo's `identity.network` and defaults to `regtest`, so pass `-p mainnet` for mainnet alkanes.

If the source directory has a committed `Cargo.lock`, the BuildInfo switches to `committed-lock` registry mode and embeds the lockfile. If the build cannot run (for example, Docker is missing), the JSON is still emitted, with a `build not run` note and no `result`.

### 3. build: reconstruct a wasm from a recipe

```bash
alkanes-cli build-info build build-info.json --out built.wasm
# built built.wasm (297481 bytes, sha256=8b51384a…)
```

Without `--out`, the wasm is written to `./built.wasm`.

### 4. verify: diff a candidate against the target

```bash
alkanes-cli -p mainnet --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  build-info verify --at 4:797 built.wasm
```

For `4:797` this reports byte-exact, verdict `reproducible`. The local comparison scores each non-custom wasm section as matched or not matched, and uses these verdicts:

| Verdict | Rule |
|---|---|
| `reproducible` | Byte-exact. |
| `verified` | Code section identical, and the byte-identical sections account for at least 99.5% of the non-custom section bytes. |
| `code_match` | Code section identical, but the identical sections account for less than 99.5%. |
| `partial` | The byte-identical sections account for at least 98% of the non-custom section bytes. |
| `mismatch` | Anything else. |

The explorer's own diff engine scores byte-level similarity within each section and uses lower thresholds (see [the verdicts](../../build/verifying-alkanes#the-verdicts)), so a cross-host, C-linking build such as `4:76` (busd) can score lower here than it does on the explorer.

### 5. upload: submit a BuildInfo to the explorer

`upload` POSTs a request derived from the BuildInfo JSON to `<explorer-url>/api/v1/<key>/attest` or `<explorer-url>/api/v1/<key>/verify`, using a built-in HTTP/2 client (no curl needed):

```bash
# Default is attest: record the BuildInfo's verdict directly.
# Needs an admin key issued by the SUBFROST team.
alkanes-cli upload build-info.json --api-key $ADMIN_KEY

# --verify: send the recipe to /verify so the server rebuilds and diffs it.
# Any active API key works.
alkanes-cli upload build-info.json --api-key $SUBFROST_API_KEY --verify
```

Flags: `--api-key <KEY>` (required), `--explorer-url <url>` (defaults to `https://explorer.subfrost.io`; must be `https`), `--verify` (switch from attest to a sandbox rebuild).

- **attest** (default) writes the verdict without a server-side rebuild, so it needs an **admin key** issued by the SUBFROST team. The request carries the BuildInfo's `target_sha256`, alkane ID, source provenance, `result.verdict` and `result.normalized_match_pct`, the notes, and the full BuildInfo as `manifest`. The BuildInfo must have `source.repo`. If it has no `result`, `upload` attests `verified` at 100%, so run the full pipeline first.
- **`--verify`** works with any active key. The server rebuilds in its own sandbox and only promotes the source if its diff confirms the match. The rebuild runs in the background: `upload` prints the server's response and the `run_id`, and the verdict appears on the alkane's explorer page when the run finishes.

`upload` prints the server's JSON response, and exits with an error on any status other than 200 or 201.

:::caution Known issue with `upload --verify`
In the current `develop` code, `upload --verify` sends `build_env` as a JSON array and `typo_fix` as the text of a BuildInfo note, while the verify endpoint expects `build_env` as a newline-separated string and `typo_fix` as a boolean. A BuildInfo with a non-empty `environment.build_env`, or with a note that mentions a typo, can therefore be rejected. If that happens, submit the recipe with `curl` as shown [below](#submitting-without-the-cli), sending `build_env` as one string with a `KEY=VALUE` pair per line and `typo_fix` as `true` or `false`.
:::

## The BuildInfo artifact

A `BuildInfo` captures every axis that matters for a byte-exact rebuild. The canonical definition is the Rust type in `schema.rs` and the JSON Schema `build-info.schema.json`, both in [`crates/alkanes-cli-common/src/buildinfo/`](https://github.com/kungfuflex/alkanes-rs/tree/develop/crates/alkanes-cli-common/src/buildinfo) on `develop`, next to golden fixtures (the `4:797` fixture is the one quoted below; the `2:0` fixture records the Linux-only rebuild, and the `4:9200` fixture predates deployment). An abbreviated example, from the `4:797` fixture:

```json
{
  "schema_version": "1.0.0",
  "identity":  { "target_source": "onchain", "alkane_id": "4:797", "network": "mainnet",
                 "target_sha256": "8b51384a…", "target_size": 297481 },
  "source":    { "kind": "git", "repo": "https://github.com/kungfuflex/free-mint", "commit": "e33d5e8",
                 "package": "free-mint", "is_workspace_member": false,
                 "build_command": "cargo build --release --locked --target wasm32-unknown-unknown -p free-mint" },
  "toolchain": { "rustc_version": "1.82.0", "host_triple": "1.82.0-x86_64-unknown-linux-gnu",
                 "os_image": "ubuntu-22.04", "target": "wasm32-unknown-unknown" },
  "c_toolchain": { "vendor": "Ubuntu", "version": "14.0.0",
                   "source": { "method": "apt", "apt_package": "clang-14" }, "c_object_host_dependent": false },
  "environment": { "home": "/home/lee", "build_env": ["CC_wasm32_unknown_unknown=clang-14", "FREE_MINT_BUILD_IN_PROGRESS=1"] },
  "registry":  { "mode": "time-machine", "archive_commit": "010733a0…", "served_as": "index.crates.io",
                 "registry_hash": "index.crates.io-6f17d22bba15001f" },
  "git_deps":  [ { "url": "https://github.com/kungfuflex/alkanes-rs", "rev": "d787cdd1…", "source_form": "bare" } ],
  "result":    { "verdict": "reproducible", "built_sha256": "8b51384a…", "byte_exact": true,
                 "normalized_match_pct": 100.0, "sections": [] }
}
```

| Key | What it records |
|---|---|
| `identity` | The target: `onchain` (by alkane ID) or `local-file` (a `.wasm`, including a not-yet-deployed alkane), its sha256 and size. |
| `source` | A git repo, commit, `subdir` and package, or `inline` source files; the features and the literal build command. |
| `toolchain` | rustc version and the toolchain directory name (`host_triple`) whose paths must match, plus the sandbox OS image. |
| `c_toolchain` | clang vendor and version, how to obtain it (`apt`, `llvm-release` or `homebrew-bottle`), and whether the C object is host-dependent. |
| `environment` | `HOME`, `CARGO_HOME`, extra build environment variables, and any `remap-path-prefix` rules. |
| `registry` | `committed-lock` or `time-machine`, with the frozen `crates.io-index-archive` commit and the expected registry hash. |
| `git_deps` | Each git dependency's URL, rev, and source-id form (`bare` or `rev`). |
| `resolved_deps`, `cargo_lock_b64` | The resolved dependency graph and the exact `Cargo.lock` (base64), when known. |
| `result` | The diff outcome: verdict, rebuilt sha256, `byte_exact`, match percentage, per-section results. |

Each axis is explained in [Reproducible builds](../../build/reproducible-builds).

## Submitting without the CLI

`alkanes-cli upload` maps a BuildInfo onto the right request body for you. To call the HTTP API directly (for example from a script), the same `POST /api/v1/{key}/verify` endpoint accepts the fields as JSON. This is the `curl` equivalent of `upload --verify`:

```bash
curl -sS -X POST https://explorer.subfrost.io/api/v1/$SUBFROST_API_KEY/verify \
  -H 'content-type: application/json' \
  -d '{
    "alkane": "4:797",
    "repo_url": "https://github.com/kungfuflex/free-mint",
    "commit": "e33d5e8",
    "package": "free-mint",
    "rustc": "1.82.0",
    "clang_version": "14.0.0",
    "home_dir": "/home/lee",
    "alkanes_rev": "d787cdd1f22ef1b7e32337fc531209df85ed1db8",
    "git_source_form": "bare"
  }'
```

Most of those fields are optional: the server **auto-reverses** the recipe (rustc, clang, `HOME`, host triple, git-dependency revs, and the crates.io freeze date) from the on-chain bytecode, so `{ alkane, repo_url, commit, package }` alone verifies most alkanes. Anything you send overrides the auto-reversed value. The endpoint also accepts `git_pins` (several git dependencies as `url rev [bare|rev]` lines) and `git_date` (a deploy-date freeze) for contracts that pin several git dependencies or ship no committed lockfile. See the [Verify and attest API](../verification/verify-and-attest) for the full field list and the admin-only `attest` path.

## Next steps

- [Verify and attest API](../verification/verify-and-attest): the HTTP endpoints `upload` calls.
- [Source API](../verification/source-api): read a verified alkane's source once it is published.
- [API Keys](../platform/api-keys): get the key `upload` needs.
