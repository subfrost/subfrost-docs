---
title: 验证 Alkanes 合约
sidebar_label: 验证 Alkanes 合约
sidebar_position: 8
description: SUBFROST 区块浏览器如何证明一个 alkane 的链上字节码确实由给定源码构建而来，以及每种判定结果的含义。
---

# 验证 Alkanes 合约

[SUBFROST 区块浏览器](https://explorer.subfrost.io/alkanes)上的每一个合约，都可以追溯到产生其链上字节码的确切源码和构建环境，并在受控沙箱中逐字节复现。这是一种你可以自己重新运行的验证，而不是一个需要你去信任的勾选标记。

验证只回答一个问题：**这个链上合约真的来自某人声称的那份源码吗？** 区块浏览器的做法是重新构建源码，并把结果与实际部署的字节码进行比对。

## 比 EVM 浏览器上的“已验证”更进一步 {#better-than-verified-on-an-evm-explorer}

在大多数 EVM 区块浏览器上，“已验证”徽章的意思是：有人粘贴了一段 Solidity，它在某个指定的编译器下*编译出匹配的字节码*。Alkanes 是用 Rust 构建的 WebAssembly，而 Rust 工具链会把多得多的信息烘焙进产物：panic 路径、registry 源哈希、git checkout 哈希、宿主三元组（host triple），以及 clang 的 `producers` 记录。因此区块浏览器采用**完整复现**来验证：给定一个 alkane ID，它获取链上字节码，在一个固定了每一个环境维度的沙箱中重新构建源码，然后对结果做差异比对。

每个通过验证的 alkane 在其浏览器页面上都会显示一个**复现配方**面板：复现它所需的仓库、提交、rustc、clang、`HOME`、registry 模式以及 git source-id。这些信息足以让你在自己的机器上重放这次构建。

## 判定结果 {#the-verdicts}

区块浏览器的差异比对引擎会把重新构建出的 wasm 与链上字节码进行比较，并记录以下四种判定之一。前两种会在 alkane 页面上获得徽章，并公开其源码。

| 判定 | 含义 |
|---|---|
| **reproducible** | 重新构建出的 wasm 的 sha256 与链上字节码**逐字节一致**。无需信任任何东西，匹配本身就是证明。 |
| **verified** | 并非逐字节一致，但代码段完全相同，或非自定义段在字节层面至少有 97% 相似（比对允许块的偏移）。实际上残差通常只是几个字节的、依赖宿主的构建输出，典型情况是某个 secp256k1 C 目标文件的占用差异。代码可以被证明是相同的。 |
| **partial** | 至少 90% 一致，但配方中仍有未固定的维度（例如 `HOME` 或 clang 尚未被反推出来）。没有徽章。 |
| **mismatch** | 一致部分不足 90%：该源码构建不出已部署的字节码。没有徽章。 |

百分比的计算不包含自定义段（例如 `producers` 和 `name`）。在本地用 `alkanes-cli` 运行同样的比对时，阈值更严格，并且多出第五种判定 `code_match`；参见 BuildInfo 指南中的[验证步骤](../api-reference/cli-sdk/build-info#4-verify-diff-a-candidate-against-the-target)。

为什么不是每一次诚实的构建都能达到 `reproducible`？因为 wasm 中嵌入了编译器从其*环境*中带进来的东西：构建时的 `HOME`、crates.io 索引源目录哈希、git checkout 哈希、工具链宿主三元组，以及 `producers` 段中的 clang 厂商和版本。把它们全部复现出来，就能逐字节一致；漏掉任何一个，字节就会发生偏移。由外部宿主的 clang 编译的 C 代码（secp256k1）是唯一无法在 Linux 上完全重建的维度，而它恰好就是 `reproducible` 与 `verified` 之间的差距。

## 真实示例 {#real-examples}

以下 alkane 都已在主网上线，本文档中会反复用到它们。

| Alkane | 展示的内容 | 判定 |
|---|---|---|
| `4:797`，free-mint | 纯 Rust，Linux 构建，逐字节一致 | **reproducible** |
| `2:0`，DIESEL（`alkanes-std-genesis-alkane-upgraded-eoa`） | macOS 构建，在原生 macOS 主机上重新构建后逐字节一致 | **reproducible** |
| `4:9200`，predicates pair-equality | Windows（`x86_64-pc-windows-msvc`）构建，在 Wine 下逐字节复现 | **reproducible** |
| `4:76`，busd（以及 oyl 的各个实现） | 外部宿主的 secp256k1 C 目标文件残差（内存基址偏移约 6 字节）；区块浏览器上 96.7% 匹配（2026-09-26 核对） | **verified** |

### reproducible 与 verified 的具体区别 {#reproducible-versus-verified-concretely}

跨宿主的构建仍然可以达到 `reproducible`。烘焙进 panic 字符串的工具链路径，可以通过把工具链复制到以原始三元组命名的目录中来重建；而 rustc 折叠进 crate 元数据的 `host:` 行，则要通过运行一个宿主确实与原始构建相同的工具链来匹配。在 Linux 上无法重建的，是**由外部宿主的 clang 编译出的 C 目标文件**（secp256k1）。正是它让一次构建停留在 `verified`。

- **`4:797`（free-mint）** 是纯 Rust，在 Linux 上构建。一旦固定了 registry 路径、Ubuntu clang 14.0.0 以及 bare 形式的 `alkanes-rs` git source-id，一台 Linux 机器就能**逐字节**复现它，因此它是 `reproducible`。
- **`2:0`（DIESEL）** 是在一台 Apple Silicon Mac 上用 rustc 1.86.0 和 Homebrew clang 20.1.7 构建的，并且链接了 secp256k1。在 Linux 上，把工具链复制到 `1.86.0-aarch64-apple-darwin` 目录中（符号链接不行，因为 rustc 会把它规范化），再组装出同一个 Homebrew clang，就能重建除 secp256k1 C 目标文件之外的一切：工作台 fixture 将这次 Linux 重建记录为残差约 6 字节、判定为 `verified`；它没有区块浏览器的匹配百分比，因为区块浏览器是在原生 macOS 上重建 `2:0` 的。在原生 macOS 主机上重新构建时，它**逐字节**一致，是 `reproducible`。这也是为什么验证器会在有可用的原生 macOS 构建机时，把字节码显示为 macOS 来源的构建交给它处理。
- **`4:9200`（predicates pair-equality）** 是用 **Windows** 版 rustc 1.86.0（`x86_64-pc-windows-msvc`）构建的。最后的残差是 `rustc -vV` 输出中的 `host:` 行，rustc 会把它折叠进每个 crate 的 `-C metadata` 和 `StableCrateId`，而只有真正的 Windows 宿主三元组才能产生它。在 Linux 上**通过 Wine** 运行那个 Windows 工具链（架构同为 `x86_64`），就能**逐位**复现，因此它是 `reproducible`。
- **`4:76`（busd）以及 oyl 的各个实现**链接了由*外部宿主* clang 构建的 secp256k1，其 C 目标文件的占用会让内存基址偏移约 6 字节。代码逻辑和 `producers` 完全一致。内存基址的微小偏移会改变许多偏移量，因此匹配百分比比字节数所暗示的要低：在区块浏览器上，`4:76` 显示 96.7% 匹配（2026-09-26 核对）。低于这条线时，差异比对引擎只在代码段逐字节相同时才判为 `verified`；在沙箱之外证明的结果也可以通过 attest 记录为 `verified`。

[可复现构建](./reproducible-builds)会逐个维度地讲解这些配方。

## 区块浏览器如何验证 {#how-the-explorer-verifies}

1. 你（或合约作者）为某个 alkane ID 提交一份**构建配方**，可以使用 [`alkanes-cli upload --verify`](../api-reference/cli-sdk/build-info)，也可以 POST 到 [verify 端点](../api-reference/verification/verify-and-attest#verify)。实际上配方非常小：对大多数 alkane 来说，`{ alkane, repo_url, commit, package }`（当 crate 不在仓库根目录时再加上 `subdir`）就足够了。
2. 验证器获取链上字节码（`metashrew_view` `getbytecode`），并把源码的重新构建加入队列，在一个固定了配方各维度的沙箱中执行。请求会立即返回；构建作为后台任务运行。
3. 构建完成后，验证器把重新构建出的 wasm 与字节码做差异比对，并记录判定结果。**`reproducible` 或 `verified` 的结果会自动晋升**到该 alkane 的已验证源码面板。这些结果不存在任何需要信任的人工步骤。
4. 之后 alkane 页面会显示徽章、可浏览的源码树（`https://explorer.subfrost.io/alkane/{id}/source`）以及复现配方。同一份源码也可以通过 [Source API](../api-reference/verification/source-api) 以编程方式获取。

晋升后的结果以字节码的 sha256 为键，因此所有共享该字节码的 alkane（例如某个已验证模板的每一个克隆）也都会显示为已验证。

### 配方会自己反推出来 {#the-recipe-reverses-itself}

你很少需要逐项写出环境维度。验证器只读取一次链上字节码，就直接从中反推出配方。嵌入的 panic 路径携带了确切的 git 依赖修订版本、构建时的 `HOME` 以及工具链宿主三元组；`producers` 段携带了 clang 和 rustc 的版本；部署交易的确认时间则给出了冻结 crates.io 索引所用的日期。（如果字节码中找到的依赖版本表明锁文件是在部署之前解析的，冻结日期会相应前移。）

因此，只提交仓库、提交和包名，就能在无需手工调整的情况下复现大多数合约。你*确实*传入的任何字段，都只是**覆盖**其自动反推出的值。这就是为什么一个 verify 请求体几乎总是只有四五行。

### 谁可以提交 {#who-can-submit}

由于验证器只有在自己的差异比对确认匹配时才会公开源码，`verify` 端点对**任何**有效的 API 密钥都是安全的：错误的配方只会无法晋升。唯一需要信任的写入路径是 [`attest`](../api-reference/verification/verify-and-attest#attest)，它需要由 SUBFROST 团队签发的管理员密钥，因为它会在*不经过*沙箱重新构建的情况下记录结果。它的用途是记录在验证器自身沙箱之外证明过的结果，例如 Linux 验证器自己无法逐字节复现的构建。

## 接下来去哪里 {#next-steps}

- [可复现构建](./reproducible-builds)：逐个维度讲解复现公式。
- [BuildInfo Workbench](../api-reference/cli-sdk/build-info)：用 `alkanes-cli` 在本地反推、重新构建并比对一个 alkane，然后上传结果。
- [Verify and Attest API](../api-reference/verification/verify-and-attest)：通过 HTTP 提交配方。
- [Source API](../api-reference/verification/source-api)：读取已验证 alkane 的源码树和文件。
