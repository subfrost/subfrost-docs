---
title: 可复现构建
sidebar_label: 可复现构建
sidebar_position: 9
description: alkane 验证背后的复现公式，涵盖 registry 时光机、git source-id、HOME、clang 以及跨宿主工具链。
---

# 可复现构建

要逐字节复现一个 alkane 的 wasm，就意味着要复现**编译器烘焙进它的一切**。wasm 中嵌入了 panic 路径（`HOME`、registry src-dir 哈希、git checkout 哈希、工具链三元组）以及一个 `producers` 段（rustc，以及 clang 的厂商和版本）。其中每一项都是一个你必须固定的维度。本页讲解真正会造成影响的那些维度。

:::tip 你不需要手工固定这些
验证器会直接从链上字节码本身反推出下面的每一个维度：嵌入的路径和 `producers` 记录就是基准事实。对大多数合约而言，一个只包含 `{ alkane, repo_url, commit, package }` 的 [verify 请求](../api-reference/verification/verify-and-attest#verify)就足够了。本页各节解释的是反推器和构建器替你重建了什么，以及当反推结果不完美时应该覆盖哪些字段。
:::

## 环境维度 {#the-environment-axes}

| 维度 | 为什么重要 |
|---|---|
| **工具链宿主三元组** | wasm32 的 rust-std 与宿主无关，但工具链的*宿主三元组*会通过两种方式泄漏进 wasm：(1) panic 字符串中的工具链**路径**；(2) `rustc -vV` 的 **`host:` 行**，rustc 会把它折叠进每个 crate 的 `-C metadata` 和 `StableCrateId`。在 Linux 上，路径可以通过把工具链复制到以原始三元组命名的目录中来重建。而 `host:` 行只有在实际运行的工具链确实拥有原始宿主三元组时才能匹配：参见下文的 macOS 和 Windows 示例。 |
| **clang 厂商与版本** | 会被原样写入 `producers`。Ubuntu clang 14.0.0（apt）和 Homebrew clang 20.1.7 会产生不同的字节。Homebrew clang 是在 Linux 上用按内容寻址的 GHCR bottle blob（`llvm`、`z3` 和 `libedit`）加上 `patchelf` 组装出来的。 |
| **`HOME` 与 `remap-path-prefix`** | registry、git checkout 和工具链的路径都挂在 `HOME` 之下。当 `remap-path-prefix` 为空时，路径是原始的，必须精确重建 `HOME`（例如 `/home/lee` 或 `/Users/kevinyao`）。 |
| **Registry 模式** | 提交了 `Cargo.lock`，就意味着使用真实的 crates.io 并加上 `--locked`。没有锁文件，就要用**时光机**：把 crates.io 索引树冻结在构建日期，并*以* `index.crates.io` 的身份提供服务，使 registry src-dir 哈希保持规范。 |
| **Git 依赖的 source-id** | **bare** 形式的 git source-id（把 `?rev=X#` 改写为 `#`，然后 `--locked`）会改变 `-C metadata`，进而改变单态化顺序，产生不同的字节。请复现原始锁文件所用的确切写法（`bare` 或 `rev`）。 |
| **secp256k1 C 目标文件** | 唯一无法在 Linux 上完全重建的维度：由*外部宿主* clang 构建的 secp256k1 目标文件，其静态占用略有不同，会让内存基址偏移几个字节。纯 Rust 的 alkane 可以达到逐字节一致；链接了外部宿主 C 目标文件的 alkane 则达到 `verified`。内存基址的微小偏移会改变许多偏移量，因此匹配百分比比这几个字节所暗示的要低：在区块浏览器上，`4:76` 显示 96.7% 匹配（2026-09-26 核对）。低于这条线时，差异比对引擎只在代码段逐字节相同时才判为 `verified`。 |

## Registry 时光机 {#the-registry-time-machine}

当一个仓库没有提交 `Cargo.lock` 时，cargo 会按*今天的* crates.io 来解析依赖：版本不同，字节也就不同。因此构建器会：

1. 以深度 1 获取冻结在构建日期的 `crates.io-index-archive` 提交。
2. 通过本地 HTTPS **以** `index.crates.io` 的身份提供它（一条把 `index.crates.io` 指向本机回环地址的 hosts 条目、一张自签名证书和 `CARGO_HTTP_CAINFO`）；CLI 的 Docker 沙箱则通过 `--add-host index.crates.io:127.0.0.1` 达到同样的效果。

这样 registry src-dir 哈希就是规范的。该哈希取决于 cargo 版本：cargo 1.82 得到 `index.crates.io-6f17d22bba15001f`，cargo 1.86 得到 `index.crates.io-1949cf8c6b5b557f`。

### 自动冻结到部署日期 {#freezing-to-the-deploy-date-automatically}

时光机需要一个 `freeze_commit`。如果没有提供，构建器会根据**部署日期**（即部署交易所在区块的时间）来确定它：找到覆盖该日期的 [`rust-lang/crates.io-index-archive`](https://github.com/rust-lang/crates.io-index-archive) 快照分支，并取该日期当时或之前的最后一个提交。如果从字节码中恢复出的依赖版本表明锁文件是在部署之前解析的，验证器就改为冻结到那个更早的日期。正是这一环，让一个既没有配方、也没有提交锁文件的构建，在无人手工挑选冻结提交的情况下达到字节级的保真度。

## Bare git source-id {#bare-git-source-ids}

Alkanes 通常以 git 方式依赖 `alkanes-rs`（以及 `metashrew`）。锁文件中对该 source-id 的*写法*会改变编译出的元数据。要匹配 **bare** 形式的原始构建，先*带着* rev 解析依赖，再改写锁文件中的 source（`?rev=X#` 变为 `#`），然后用 `--locked` 构建。复现 `rev` 形式则只需直接进行 `--locked` 构建。

## 多个 git 依赖、传递固定与镜像仓库 {#multiple-git-dependencies-transitive-pins-and-mirrored-repos}

真实的合约很少只固定一个 git 依赖。构建器会处理整个依赖图：

- **多依赖固定。** 它会固定所有能识别出的 git 依赖（一个池子合约通常同时固定 `alkanes-rs` **和** `metashrew`），而不只是单个 `alkanes-rs` 的 rev。反推器会从字节码中的 `.cargo/git/checkouts/<name>-<hash>/<rev>/` 路径推导出每个依赖被 checkout 时的确切 rev，并按名称固定它们。
- **通过锁文件的传递固定。** 通过另一个 git 依赖*间接*引入的依赖（例如在同一 URL 下经由 `alkanes-rs` 引入的 `metashrew`）否则会漂移到不断变化的 `HEAD`，导致同一个 crate 出现两个 rev，并报出 `E0599` “multiple versions” 错误。构建器使用 cargo 自己的解析器（`cargo update --precise`），把整个依赖图一致地移动到基准 rev。
- **镜像仓库。** 当一个合约及其依赖通过*不同*的仓库 URL 引用同一个 crate 时（例如 `sandshrewmetaprotocols/metashrew` 和 `kungfuflex/metashrew`），cargo 会构建出两份互不兼容的副本。构建器可以把其中一个 URL 重定向到另一个的确切 source 规格上，使两者统一为同一个来源。与固定不同，重定向不会自动从字节码中推导出来。
- **对未固定依赖做日期冻结。** 任何仍未固定的 git 依赖（没有 rev、也没有提交锁文件的 `git = "url"`）都会被冻结到该仓库在部署日期时的 `HEAD`，也就是 registry 时光机所用的同一个日期。这是通用的兜底方案，不需要逐个依赖指定 rev。

当仓库提交了自己的 `Cargo.lock` 时，上述改写都不会执行：已提交锁文件中的 source-id 具有权威性。

在 API 中，这些对应 `git_pins` 字段（显式的 `url rev [bare|rev]` 行）和 `git_date` 字段，但两者都会根据字节码和部署交易的区块时间自动反推，所以你很少需要设置它们。参见 [verify 请求字段](../api-reference/verification/verify-and-attest#request-body)。

## 用 Ubuntu clang 把 secp256k1 编译为 wasm {#secp256k1-to-wasm-with-ubuntu-clang}

像 `secp256k1-sys` 这样的 C 依赖，过去只能在自包含的 Homebrew clang 下编译为 wasm，因为 Ubuntu 的 apt clang 在以 `wasm32-unknown-unknown` 为目标时，会泄漏宿主 glibc 的 include 路径（`/usr/include/stdint.h` 会引入缺失的 `bits/libc-header-start.h`）。现在构建器会传入 `-nostdlibinc`，它去掉系统 libc 的 include，同时保留 clang 自带的内置头文件；其余部分由 crate 自带的 `wasm/wasm-sysroot` 提供。这样一来，apt 的 `clang-13`、`clang-14` 和 `clang-15` 都能把 secp256k1 编译为 wasm，于是一个 **Linux 来源**的合约可以用它*实际使用的* apt clang 版本来匹配，而不必被迫改用 Homebrew clang。

## 实例：`4:797` 是 reproducible {#worked-example-4797-is-reproducible}

free-mint 没有提交锁文件，也没有链接 C 代码。从字节码中读出 `HOME`（`/home/lee`）和 rustc（`1.82.0`）之后，它只剩三个需要固定的维度：

- **Registry**：时光机，索引冻结在 `2025-03-19`，以 `index.crates.io` 的身份提供（哈希 `…6f17d22bba15001f`）。
- **clang**：来自 apt 的 Ubuntu 14.0.0（`clang-14`）。即使产物是纯 Rust，`producers` 记录中仍然会写明它。
- **Git source-id**：`alkanes-rs` 使用 **bare** 形式的 source-id（`d787cdd1…`）。

结果：重新构建出的 sha256 `8b51384a…` 等于链上的 sha256，逐字节一致，100%：**reproducible**。

## 实例：`2:0` 是 reproducible（macOS） {#worked-example-20-is-reproducible-macos}

DIESEL 的 `alkanes-std-genesis-alkane-upgraded-eoa` 是在一台 Apple Silicon Mac 上构建的（rustc `1.86.0`、Homebrew clang `20.1.7`、`HOME=/Users/kevinyao`），crates.io 索引由时光机冻结（cargo 1.86 的哈希 `…1949cf8c6b5b557f`），`metashrew` 使用 bare 形式的 git source-id。

在 Linux 上，重建过程会把 `1.86.0` 工具链**复制**到 `$RUSTUP_HOME/toolchains/1.86.0-aarch64-apple-darwin`（符号链接会被 rustc 规范化掉），设置 `HOME=/Users/kevinyao`，把仓库克隆到原始构建目录，并用 bottle blob 组装出 Homebrew clang 20.1.7。这样工具链路径和 `producers` 都能逐字节一致，但 DIESEL 链接了 secp256k1，而由 Linux 上构建的 Homebrew clang 产出的 C 目标文件，与 macOS 上构建的那份相差约 6 字节。工作台 fixture 将这次 Linux 重建记录为 **verified**。

在原生 macOS 主机上用原始的 clang 重新构建时，secp256k1 目标文件也能匹配，重新构建出的 sha256 等于链上的 sha256：**reproducible**。正因如此，当有可用的原生 macOS 构建机时，验证器会把字节码显示为 macOS 来源的构建交给它处理。

## 实例：`4:9200` 是 reproducible（通过 Wine 的 Windows 构建） {#worked-example-49200-is-reproducible-windows-through-wine}

predicates 的 `pair-equality` 是用 **Windows** 版 rustc `1.86.0`（`x86_64-pc-windows-msvc`）构建的。顽固的残差是 `rustc -vV` 的 **`host:` 行** `x86_64-pc-windows-msvc`，rustc 会把它折叠进每个 crate 的 `-C metadata` 和 `StableCrateId`。在 Linux 上，除了真正的 Windows 宿主三元组之外，没有任何东西能复现它，所以复现过程在 Linux 上**通过 Wine 运行 Windows 工具链**。目标架构（`x86_64`）相同，因此 Wine 执行的是真正的 `rustc.exe`，并**逐位**复现出该 wasm：**reproducible**。

## 实例：`4:76`（busd）是 verified（外部宿主的 C 目标文件） {#worked-example-476-busd-is-verified-foreign-host-c-object}

有些 alkane 链接的 secp256k1 C 目标文件，是由一台无法像 macOS 和 Windows 工具链那样在 Linux 上复现的宿主构建的。`4:76`（busd）和 oyl 的各个实现就属于这种情况：Rust 代码和 `producers` 记录都能精确重建，但来自外部宿主 clang 的 secp256k1 静态占用会让内存基址偏移约 6 字节。这就是全部的、原因明确的残差，但这并不意味着只有 6 个字节不同：内存基址的微小偏移会改变许多偏移量，因此匹配百分比比字节数所暗示的要低。在区块浏览器上，`4:76` 显示 96.7% 匹配（2026-09-26 核对），低于 97% 这条线。

区块浏览器的差异比对引擎会把代码段逐字节相同的构建判为 `verified`，即使整体匹配低于 97%，因此对于残差仅限于数据布局的 alkane，一个普通的 verify 请求就能公开它。沙箱完全无法产生的结果，例如在验证器不运行的宿主上证明过的构建，则改走仅限管理员的 [attest 端点](../api-reference/verification/verify-and-attest#attest)（即不带 `--verify` 的 `alkanes-cli upload`）。

## 接下来去哪里 {#next-steps}

- [验证 Alkanes 合约](./verifying-alkanes)：各种判定结果，以及区块浏览器如何验证。
- [BuildInfo Workbench](../api-reference/cli-sdk/build-info)：用 `alkanes-cli` 在本地运行这套公式。
- [Verify and Attest API](../api-reference/verification/verify-and-attest)：所有可以覆盖的字段。
