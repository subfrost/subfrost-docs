---
title: Reproducible builds
sidebar_label: Reproducible builds
sidebar_position: 9
description: The reproduction formula behind alkane verification, covering the registry time-machine, git source-ids, HOME, clang, and cross-host toolchains.
---

# Reproducible builds

Reproducing an alkane's wasm byte-for-byte means reproducing **everything the compiler baked into it**. The wasm embeds panic paths (`HOME`, the registry src-dir hash, git-checkout hashes, the toolchain triple) and a `producers` section (rustc plus the clang vendor and version). Each of those is an axis you have to pin. This page explains the ones that actually bite.

:::tip You do not pin these by hand
The verifier reverses every axis below out of the on-chain bytecode itself: the embedded paths and the `producers` record are the ground truth. A [verify request](../api-reference/verification/verify-and-attest#verify) of just `{ alkane, repo_url, commit, package }` is enough for most contracts. The sections here explain what the reverser and the builder reconstruct on your behalf, and what to override when a reversal is imperfect.
:::

## The environment axes

| Axis | Why it matters |
|---|---|
| **Toolchain host triple** | wasm32 rust-std is host-independent, but the toolchain's *host triple* leaks into the wasm two ways: (1) toolchain **paths** in panic strings, and (2) the `rustc -vV` **`host:` line**, which rustc folds into every crate's `-C metadata` and `StableCrateId`. The path is reconstructed on Linux by copying the toolchain into a directory named for the origin triple. The `host:` line only matches when the toolchain that runs really has the origin host triple: see the macOS and Windows examples below. |
| **clang vendor and version** | Written verbatim into `producers`. Ubuntu clang 14.0.0 (apt) and Homebrew clang 20.1.7 give different bytes. Homebrew clang is assembled on Linux from content-addressed GHCR bottle blobs (`llvm`, `z3` and `libedit`) plus `patchelf`. |
| **`HOME` and `remap-path-prefix`** | Registry, git-checkout, and toolchain paths all hang off `HOME`. With an empty `remap-path-prefix`, paths are raw and `HOME` must be reconstructed exactly (for example `/home/lee` or `/Users/kevinyao`). |
| **Registry mode** | A committed `Cargo.lock` means real crates.io plus `--locked`. No lock means the **time-machine**: freeze the crates.io index tree at the build date and serve it *as* `index.crates.io` so the registry src-dir hash is canonical. |
| **Git-dependency source-id** | A **bare** git source-id (`?rev=X#` rewritten to `#`, then `--locked`) changes `-C metadata` and therefore monomorphization order, which gives different bytes. Reproduce the exact spelling the origin lockfile used (`bare` or `rev`). |
| **secp256k1 C object** | The one axis that does not fully reconstruct on Linux: a secp256k1 object built by a *foreign host's* clang has a slightly different static footprint, which shifts the memory base a few bytes. Pure-Rust alkanes reach byte-exact; alkanes that link a foreign-host C object reach `verified`. A small shift of the memory base changes many offsets, so the match percentage is lower than the few shifted bytes suggest: on the explorer `4:76` shows a 96.7% match (checked 2026-09-26). Below that line the diff engine grants `verified` only when the code section is byte-identical. |

## The registry time-machine

When a repo commits no `Cargo.lock`, cargo would resolve against *today's* crates.io: different versions, different bytes. Instead the builder:

1. Fetches, at depth 1, the `crates.io-index-archive` commit frozen at the build's date.
2. Serves it over local HTTPS **as** `index.crates.io` (a hosts entry pointing `index.crates.io` at loopback, a self-signed certificate and `CARGO_HTTP_CAINFO`); the CLI's Docker sandbox does the same with `--add-host index.crates.io:127.0.0.1`.

This makes the registry src-dir hash canonical. The hash depends on the cargo version: cargo 1.82 gives `index.crates.io-6f17d22bba15001f`, cargo 1.86 gives `index.crates.io-1949cf8c6b5b557f`.

### Freezing to the deploy date automatically

The time-machine needs a `freeze_commit`. When none is supplied, the builder resolves it from the **deploy date**, which is the block time of the deploy transaction: it finds the [`rust-lang/crates.io-index-archive`](https://github.com/rust-lang/crates.io-index-archive) snapshot branch that covers that date and takes the last commit at or before it. If the dependency versions recovered from the bytecode show that the lockfile was resolved before deployment, the verifier freezes to that earlier date instead. This is the piece that lifts a build with no recipe and no committed lock to byte fidelity without anyone hand-picking a freeze commit.

## Bare git source-ids

Alkanes commonly depend on `alkanes-rs` (and `metashrew`) by git. The lockfile's *spelling* of that source-id changes the compiled metadata. To match a **bare** origin, resolve the dependency *with* its rev, then rewrite the lockfile source (`?rev=X#` becomes `#`) and build `--locked`. Reproducing the `rev` form is a straight `--locked` build.

## Multiple git dependencies, transitive pins, and mirrored repos

A real contract rarely pins one git dependency. The builder handles the whole graph:

- **Multi-dependency pinning.** It pins *every* git dependency it can identify (a pool commonly pins both `alkanes-rs` **and** `metashrew`), not just a single `alkanes-rs` rev. The reverser derives the exact rev each dependency was checked out at from the bytecode's `.cargo/git/checkouts/<name>-<hash>/<rev>/` paths and pins them by name.
- **Transitive pins through the lockfile.** A dependency pulled in *through* another git dependency (for example `metashrew` reached through `alkanes-rs` under the same URL) would otherwise drift to a moving `HEAD`, producing two revs of one crate and an `E0599` "multiple versions" error. The builder uses cargo's own resolver (`cargo update --precise`) to move the whole graph to the ground-truth rev consistently.
- **Mirrored repos.** When a contract and its dependencies reference the same crate through *different* repo URLs (for example `sandshrewmetaprotocols/metashrew` and `kungfuflex/metashrew`), cargo builds two incompatible copies. The builder can redirect one URL onto the other's exact source spec so both unify to a single source. Unlike the pins, a redirect is not derived from the bytecode automatically.
- **Date-freeze for unpinned dependencies.** Any git dependency still left unpinned (a `git = "url"` with no rev and no committed lock) is frozen to that repo's `HEAD` as of the deploy date, the same date the registry time-machine uses. This is the universal fallback that needs no per-dependency rev.

When the repo commits its own `Cargo.lock`, none of these rewrites run: the committed lock's source-ids are authoritative.

Over the API these map to the `git_pins` field (explicit `url rev [bare|rev]` lines) and the `git_date` field, but both are auto-reversed from the bytecode and the deploy transaction's block time, so you seldom set them. See the [verify request fields](../api-reference/verification/verify-and-attest#request-body).

## secp256k1 to wasm with Ubuntu clang

C dependencies like `secp256k1-sys` used to compile to wasm only under the self-contained Homebrew clang, because Ubuntu's apt clang leaks the host glibc include path (`/usr/include/stdint.h` pulls in a missing `bits/libc-header-start.h`) when targeting `wasm32-unknown-unknown`. The builder now passes `-nostdlibinc`, which drops the system libc includes while keeping clang's own builtin headers; the crate's bundled `wasm/wasm-sysroot` supplies the rest. With that, apt `clang-13`, `clang-14` and `clang-15` can build secp256k1 to wasm, so a **Linux-origin** contract can be matched at its *actual* apt clang version instead of being forced onto Homebrew clang.

## Worked example: `4:797` is reproducible

free-mint commits no lockfile and links no C. With `HOME` (`/home/lee`) and rustc (`1.82.0`) read from the bytecode, it reduces to three pins:

- **Registry**: time-machine, index frozen at `2025-03-19`, served as `index.crates.io` (hash `…6f17d22bba15001f`).
- **clang**: Ubuntu 14.0.0 from apt (`clang-14`). Even though the artifact is pure Rust, the `producers` record still names it.
- **Git source-id**: `alkanes-rs` as a **bare** source-id (`d787cdd1…`).

Result: the rebuilt sha256 `8b51384a…` equals the on-chain sha256, byte-exact, 100%: **reproducible**.

## Worked example: `2:0` is reproducible (macOS)

DIESEL's `alkanes-std-genesis-alkane-upgraded-eoa` was built on an Apple Silicon Mac (rustc `1.86.0`, Homebrew clang `20.1.7`, `HOME=/Users/kevinyao`), with the crates.io index frozen by the time-machine (cargo 1.86 hash `…1949cf8c6b5b557f`) and `metashrew` as a bare git source-id.

On Linux, the reconstruction **copies** the `1.86.0` toolchain to `$RUSTUP_HOME/toolchains/1.86.0-aarch64-apple-darwin` (a symlink is canonicalized away by rustc), sets `HOME=/Users/kevinyao`, clones the repo to the origin build directory, and assembles Homebrew clang 20.1.7 from bottle blobs. That makes the toolchain paths and `producers` byte-exact, but DIESEL links secp256k1, and the C object from a Linux-built Homebrew clang differs from the macOS-built one by about 6 bytes. The workbench fixture records that Linux rebuild as **verified**.

Rebuilt on a native macOS host with the origin's clang, the secp256k1 object matches too, and the rebuilt sha256 equals the on-chain sha256: **reproducible**. The verifier routes builds whose bytecode shows a macOS origin to a native macOS builder when one is available for exactly this reason.

## Worked example: `4:9200` is reproducible (Windows through Wine)

predicates `pair-equality` was built with a **Windows** rustc `1.86.0` (`x86_64-pc-windows-msvc`). The stubborn residual was the `rustc -vV` **`host:` line**, `x86_64-pc-windows-msvc`, which rustc folds into every crate's `-C metadata` and `StableCrateId`. Nothing on Linux reproduces that except a genuine Windows host triple, so the reproduction runs the **Windows toolchain under Wine** on Linux. The target architecture (`x86_64`) is the same, so Wine executes the real `rustc.exe`, and it reproduces the wasm **bit-for-bit**: **reproducible**.

## Worked example: `4:76` (busd) is verified (foreign-host C object)

Some alkanes link secp256k1's C object built by a host that cannot be reproduced on Linux the way the macOS and Windows toolchains are. `4:76` (busd) and the oyl implementations fall here: the Rust code and the `producers` record reconstruct exactly, but the secp256k1 static footprint from the foreign host's clang shifts the memory base by about 6 bytes. That is the entire, understood residual, but it does not mean only 6 bytes differ: a small shift of the memory base changes many offsets, so the match percentage is lower than the byte count suggests. On the explorer `4:76` shows a 96.7% match (checked 2026-09-26), below the 97% line.

The explorer's diff engine gives `verified` to a build whose code section is byte-identical even when the overall match is below 97%, so an ordinary verify request can publish an alkane whose residual is confined to data layout. Results the sandbox cannot produce at all, such as a build proven on a host the verifier does not run, go through the admin-only [attest endpoint](../api-reference/verification/verify-and-attest#attest) instead (`alkanes-cli upload` without `--verify`).

## Next steps

- [Verifying alkanes](./verifying-alkanes): the verdicts and how the explorer verifies.
- [BuildInfo workbench](../api-reference/cli-sdk/build-info): run this formula locally with `alkanes-cli`.
- [Verify and attest API](../api-reference/verification/verify-and-attest): every field you can override.
