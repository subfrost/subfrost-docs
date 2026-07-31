---
title: 用 metashrew 做索引
sidebar_label: 用 metashrew 做索引
sidebar_position: 7
description: Alkanes 状态如何被索引、view 函数如何工作，以及如何自行运行索引器。
---

# 用 metashrew 做索引

Alkanes 没有属于自己的链。它的状态是由一个名为 **metashrew** 的索引器从 Bitcoin **派生**出来的，该索引器针对区块数据运行一个 WebAssembly 程序（Alkanes 索引器，`alkanes.wasm`），并回答关于结果的查询。无论何时你要读取链上状态，理解这一层都很重要；如果你想运行自己的基础设施，理解它更是必须的。

大多数开发者从不需要自己运行索引器：他们使用[托管的 JSON-RPC 端点](../api-reference/json-rpc/overview)。本页面适用于你想了解其原理，或想自己运行它的情况。

## metashrew 做什么

metashrew 是一个通用索引器，它针对 Bitcoin 区块链执行 WASM 程序。Alkanes 协议就是以这样一个 WASM 程序的形式发布的。因为对链进行索引的程序，和回答读取请求的程序是同一个，所以这些读取结果是共识状态的忠实投影，而不是一个可能出现偏差的独立数据库。

有两个概念在其中承担了大部分工作：

- **View 函数。** 一次读取就是通过 `metashrew_view` 调用的一个 **view 函数**：你指定 view 的名称（`simulate`、`trace`、`meta` 等），传入其输入，并选定一个区块标记（block tag）。你就是通过这种方式查询余额、模拟一次调用、获取执行轨迹（trace），或读取某个合约的 ABI。完整目录见 [`metashrew_*` 参考](../api-reference/json-rpc/metashrew)。
- **成本。** `simulate` 是开销最大的调用，因为它要加载并运行该 WASM。而用 `getstorageat` 读取一个原始存储槽位则便宜得多：它只是获取某个路径下的值，而无需完整求值。请优先选用能回答你问题的最廉价调用。

## metashrew 如何运行

metashrew 以单一二进制文件 `rockshrew-mono` 的形式运行，它把运行时与本地 RocksDB 数据库打包在一起，并在同一进程中提供 JSON-RPC view 层服务。由于索引链和回答读取请求的是同一个二进制文件，读取结果不可能偏离共识状态。

运行时是异步的，会为长时间运行的请求设置超时，并且可以在不破坏接口的前提下新增宿主函数。一项更新的、尚未发布的工作在同一套 RocksDB 模型之上，加入了 Block-STM 风格的并行区块执行，以加快索引速度。

## 运行索引器

`rockshrew-mono` 需要一个 Bitcoin Core RPC 数据源、一个数据库路径，以及 Alkanes 索引器 WASM：

```sh
rockshrew-mono \
  --daemon-rpc-url http://localhost:8332 \
  --auth bitcoinrpc:password \
  --indexer ./alkanes.wasm \
  --db-path ~/.metashrew \
  --start-block 880000 \
  --host 0.0.0.0 \
  --port 8080 \
  --cors '*'
```

`--start-block 880000` 是 Alkanes 的创世高度，因此节点会跳过创世之前的链。从这里开始同步仍然需要数天量级的时间。

要跳过完整同步，可以从一个**已发布的快照**引导启动：把 `--repo` 指向一个快照基础 URL，节点就会下载状态并在数小时内追上链尖。SUBFROST 在 `https://cdn.subfrost.io/snapshots/` 提供快照服务。

## 构建你自己的索引器 WASM

metashrew 可以运行任何实现了其宿主接口（host interface）的 WASM 程序，因此你可以编写自定义的索引逻辑，而不局限于运行 Alkanes 程序本身。一个程序处理每个区块，并通过运行时写入键值状态，同时暴露供读取使用的 view 函数。运行时是异步的，会为长时间运行的请求设置超时，并且可以在不破坏接口的前提下新增宿主函数。

尚未发布的并行执行工作带来了一个需要注意的地方：区块执行可能并行进行，因此旧有的“同一份 WASM，同一份索引结果”保证不再自动成立。如果你编写的索引器依赖执行顺序，请以**可串行化语义（serializable semantics）**来编写它，使结果不依赖于执行顺序。

## 何时使用 metashrew，何时使用数据索引器

metashrew 是权威数据源，但它并非为批量历史数据或看板（dashboard）场景设计。次级数据索引器可以覆盖这部分需求：交易历史、按交易对统计的数据、持币地址列表，以及基础索引器不计算的类似聚合数据。

经验法则如下：

- 将成为**用户签名操作**输入的数据，应当来自 metashrew 的 view 函数（可验证的路径）。
- 仅用于**渲染画面**的数据（历史记录、图表、排行榜），更适合用次级数据索引器来提供。

## 接下来去哪里

- [`metashrew_*` 参考](../api-reference/json-rpc/metashrew)：每一个 view 方法及其输入。
- [`alkanes_*` 参考](../api-reference/json-rpc/alkanes)：simulate 与 trace 这两个 view 的详解。
- [通过 CLI 交互](./interacting-via-cli)：在不运行节点的情况下查询状态。
