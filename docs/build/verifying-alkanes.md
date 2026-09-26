---
title: Verifying alkanes
sidebar_label: Verifying alkanes
sidebar_position: 8
description: How the SUBFROST explorer proves that an alkane's on-chain bytecode was built from a given source, and what each verdict means.
---

# Verifying alkanes

Every contract on the [SUBFROST explorer](https://explorer.subfrost.io/alkanes) can be traced back to the exact source and build environment that produced its on-chain bytecode, reproduced byte-for-byte in a controlled sandbox. This is verification you can re-run yourself, not a checkmark you have to trust.

Verification answers one question: **does this on-chain contract really come from the source someone claims?** The explorer answers it by rebuilding the source and comparing the result with the bytecode that is actually deployed.

## Better than "verified" on an EVM explorer

On most EVM explorers a "verified" badge means someone pasted Solidity that *compiles to matching bytecode* under one blessed compiler. Alkanes are WebAssembly built from Rust, and the Rust toolchain bakes far more into the artifact: panic paths, the registry source hash, git-checkout hashes, the host triple, and the clang `producers` record. So the explorer verifies by **full reproduction**. Given an alkane ID, it fetches the on-chain bytecode, rebuilds the source in a sandbox that pins every environment axis, and diffs the result.

Each verified alkane shows a **reproduction recipe** panel on its explorer page: the repo, commit, rustc, clang, `HOME`, registry mode, and git source-ids that were needed to reproduce it. That is enough to replay the build on your own machine.

## The verdicts

The explorer's diff engine compares the rebuilt wasm with the on-chain bytecode and records one of four verdicts. The first two earn a badge on the alkane page and publish the source.

| Verdict | Meaning |
|---|---|
| **reproducible** | The rebuilt wasm's sha256 is **byte-exact** to the on-chain bytecode. Nothing is trusted; the match is the proof. |
| **verified** | Not byte-exact, but the code section is byte-identical, or the non-custom sections are at least 97% similar at the byte level (the comparison tolerates shifted blocks). In practice the residual is a few bytes of host-dependent build output, typically the footprint of a secp256k1 C object. The code is provably the same. |
| **partial** | At least 90% matches, but the recipe still has an unpinned axis (for example `HOME` or clang not yet reversed). No badge. |
| **mismatch** | Less than 90% matches: the source does not build to the deployed bytecode. No badge. |

Custom sections (such as `producers` and `name`) are excluded from the percentage. `alkanes-cli`, when you run the same comparison locally, uses stricter thresholds and adds a fifth verdict, `code_match`; see [the verify step](../api-reference/cli-sdk/build-info#4-verify-diff-a-candidate-against-the-target) in the BuildInfo guide.

Why isn't every honest build `reproducible`? Because a wasm embeds things the compiler put there from its *environment*: the build's `HOME`, the crates.io index source-dir hash, git-checkout hashes, the toolchain host triple, and the clang vendor and version in the `producers` section. Reproduce all of them and you get byte-exact; miss one and the bytes shift. C code compiled by a foreign host's clang (secp256k1) is the one axis that does not fully reconstruct on Linux, and it is exactly the gap between `reproducible` and `verified`.

## Real examples

These alkanes are live on mainnet and are used throughout these docs.

| Alkane | What it shows | Verdict |
|---|---|---|
| `4:797`, free-mint | Pure Rust, Linux build, byte-exact | **reproducible** |
| `2:0`, DIESEL (`alkanes-std-genesis-alkane-upgraded-eoa`) | macOS build, byte-exact when rebuilt on a native macOS host | **reproducible** |
| `4:9200`, predicates pair-equality | Windows (`x86_64-pc-windows-msvc`) build reproduced byte-exact under Wine | **reproducible** |
| `4:76`, busd (and the oyl implementations) | Foreign-host secp256k1 C-object residual (memory base shifted by about 6 bytes); 96.7% match on the explorer (checked 2026-09-26) | **verified** |

### Reproducible versus verified, concretely

A cross-host build can still reach `reproducible`. The toolchain path baked into panic strings is reconstructed by copying the toolchain into a directory named for the origin triple, and the `host:` line that rustc folds into crate metadata is matched by running a toolchain whose host really is the origin's. What does not reconstruct on Linux is a **C object compiled by a foreign host's clang** (secp256k1). That is what leaves a build at `verified`.

- **`4:797` (free-mint)** is pure Rust, built on Linux. Once the registry path, Ubuntu clang 14.0.0, and the bare `alkanes-rs` git source-id were pinned, a Linux box reproduced it **byte-for-byte**, so it is `reproducible`.
- **`2:0` (DIESEL)** was built on an Apple Silicon Mac with rustc 1.86.0 and Homebrew clang 20.1.7, and it links secp256k1. On Linux, copying the toolchain into a `1.86.0-aarch64-apple-darwin` directory (a symlink does not work, because rustc canonicalizes it) and assembling the same Homebrew clang reconstructs everything except the secp256k1 C object. The workbench fixture for that Linux rebuild records a residual of about 6 bytes and the verdict `verified`; no explorer match percentage exists for it, because the explorer rebuilds `2:0` natively. Rebuilt on a native macOS host, it matches **byte-for-byte** and is `reproducible`. This is why the verifier sends builds whose bytecode shows a macOS origin to a native macOS builder when one is available.
- **`4:9200` (predicates pair-equality)** was built with the **Windows** rustc 1.86.0 (`x86_64-pc-windows-msvc`). The last residual was the `rustc -vV` `host:` line, which rustc folds into every crate's `-C metadata` and `StableCrateId`, and which only a genuine Windows host triple produces. Running that Windows toolchain **under Wine** on Linux (same `x86_64` architecture) reproduces it **bit-for-bit**, so it is `reproducible`.
- **`4:76` (busd) and the oyl implementations** link secp256k1 built by a *foreign host's* clang, whose C-object footprint shifts the memory base by about 6 bytes. Code logic and `producers` are exact. A small shift of the memory base changes many offsets, so the match percentage is lower than the byte count suggests: on the explorer `4:76` shows a 96.7% match (checked 2026-09-26). Below that line the diff engine grants `verified` only when the code section is byte-identical; a result proven outside the sandbox can also be recorded as `verified` through attest.

[Reproducible builds](./reproducible-builds) walks through each of these recipes axis by axis.

## How the explorer verifies

1. You (or the contract author) submit a **build recipe** for an alkane ID, either with [`alkanes-cli upload --verify`](../api-reference/cli-sdk/build-info) or by POSTing to the [verify endpoint](../api-reference/verification/verify-and-attest#verify). In practice the recipe is tiny: `{ alkane, repo_url, commit, package }` (plus `subdir` when the crate is not at the repo root) is enough for most alkanes.
2. The verifier fetches the on-chain bytecode (`metashrew_view` `getbytecode`) and queues a rebuild of the source in a sandbox that pins the recipe's axes. The request returns straight away; the build runs as a background job.
3. When the build finishes, the verifier diffs the rebuilt wasm against the bytecode and records the verdict. **A `reproducible` or `verified` result auto-promotes** the source to the alkane's verified-source panel. There is no trusted manual step for these.
4. The alkane page then shows the badge, a browsable source tree (`https://explorer.subfrost.io/alkane/{id}/source`), and the reproduction recipe. The same source is available programmatically through the [source API](../api-reference/verification/source-api).

A promoted result is keyed by the sha256 of the bytecode, so every alkane that shares that bytecode (for example, every clone of a verified template) shows as verified too.

### The recipe reverses itself

You rarely spell out the environment axes. The verifier reads the on-chain bytecode **once** and reverses the recipe straight out of it. The embedded panic paths carry the exact git-dependency revisions, the build `HOME`, and the toolchain host triple; the `producers` section carries the clang and rustc versions; and the deploy transaction's confirmation time gives the date to freeze the crates.io index at. (When the dependency versions found in the bytecode show that the lockfile was resolved before deployment, the freeze date moves back to match.)

So a submission of just the repo, commit, and package reproduces most contracts with no hand-tuning. Any field you *do* pass simply **overrides** its auto-reversed value. This is why a verify request body is almost always four or five lines.

### Who can submit

Because the verifier only promotes a source when its own diff confirms the match, the `verify` endpoint is safe for **any** active API key: a bad recipe simply fails to promote. The only trusted write path is [`attest`](../api-reference/verification/verify-and-attest#attest), which needs an admin key issued by the SUBFROST team because it records a result *without* a sandbox rebuild. It exists for results proven outside the verifier's own sandbox, such as builds the Linux verifier cannot reproduce byte-exact on its own.

## Next steps

- [Reproducible builds](./reproducible-builds): the reproduction formula, axis by axis.
- [BuildInfo workbench](../api-reference/cli-sdk/build-info): reverse, rebuild, and diff an alkane locally with `alkanes-cli`, then upload the result.
- [Verify and attest API](../api-reference/verification/verify-and-attest): submit a recipe over HTTP.
- [Source API](../api-reference/verification/source-api): read a verified alkane's source tree and files.
