---
title: Alkanes 元协议
sidebar_label: Alkanes 元协议
sidebar_position: 2
description: SUBFROST 所构建于其上的比特币智能合约元协议。
---

# Alkanes 元协议

**Alkanes** 是构建在比特币之上的智能合约元协议。它让开发者可以直接在比特币的基础层上部署和运行可编程合约，不需要侧链，也不需要独立的验证者集合。frBTC、DIESEL 和 FIRE 都是 Alkanes 代币，SUBFROST 的托管逻辑正是通过 Alkanes 索引器来协调的。

## 它处于什么位置

Alkanes 构建在 **Protorunes** 之上，而 Protorunes 又在 Runes 协议的基础上扩展出了可编程执行能力。分层关系如下：

```
Bitcoin  →  Runes  →  Protorunes  →  Alkanes
```

由于一切都锚定在比特币区块上，并由比特币共识来验证，Alkanes 合约继承了比特币的安全性。合约使用 Rust 编写并编译为 WebAssembly（WASM），由索引器确定性地执行，因此每一个运行该协议的节点都会计算出相同的状态。

## Protostone 与 cellpack

一笔比特币交易通过 **protostone** 来携带 Alkanes 指令：这是编码在交易 `OP_RETURN` 中的一条协议消息。一个 protostone 可以在输出之间转移代币，也可以调用某个合约。

要调用合约，protostone 会携带一个 **cellpack**。cellpack 是一组经过 LEB128 编码的整数列表，形式如下：

```
[block, tx, opcode, ...args]
```

- 前两个值 `[block, tx]` 是你所调用合约的 **AlkaneId**（见下文）。
- 接下来的值是 **opcode**，用来选择合约的方法。
- 剩余的值是该方法的参数。

这取代了早期扁平的“calldata”模型：cellpack 是一个带长度前缀的变宽整数列表，而不是固定大小的字节数组。

## AlkaneId

每一个 alkane 都由它被铸刻（etch）的位置来标识：

```
[block, tx]
```

也就是区块高度以及该区块内的交易索引。一些较低的范围被保留给系统合约使用。在文本中，AlkaneId 写作 `block:tx`。

## 合约接口（ABI）

合约通过 `MessageDispatch` 枚举来声明自己的方法，并为每个方法打上 `#[opcode(n)]` 标签。在构建时，这会生成一个 `__meta` 导出项，描述该合约的方法、opcode、参数和返回类型。你可以通过 **`meta`** 视图函数从任何已部署的合约中读取这份 ABI，这是发现某个合约能做什么的标准方式。参见[读取 Alkane 元数据](../api-reference/guides/alkane-metadata)。

## 在一笔交易中组合多个操作

一笔交易可以携带多个按顺序执行的 protostone。一种常见的复杂交互模式是使用三个 protostone：

1. **转移（Transfer）**：把合约将要消费的代币转移到它会读取的输出（以及影子输出）上。
2. **铸造（Mint）**：例如在这次交互中一并铸造 DIESEL。
3. **调用（Call）**：调用该合约，由它接收被转移的代币并执行相应操作。

第 1 步中被路由的代币会落在**影子输出（shadow outputs）**上，这是一种协议层面的输出，并非真实的比特币输出，但可以被协议寻址。这使得一个合约能够精确地接收它应得的资产，从而让每个合约的执行保持隔离。构建这些内容的细节见[在 SUBFROST 上构建](../api-reference/getting-started/overview)。

## 读取合约状态

你不能直接读取合约的存储。你需要通过索引器调用它的**视图函数（view functions）**：

- **`simulate`** 只读地评估一次调用并返回结果。
- **`trace`** 返回某次调用的执行轨迹。
- 更新的 **`simulateprotostones`**、**`simulatetransaction`** 和 **`simulateblock`** 视图会返回完整的执行轨迹（按 protostone 划分，包含所消耗的 fuel 以及被触碰的存储），让你可以在广播之前预览一笔交易或一个区块究竟会做什么。

这些内容记录在 [JSON-RPC 参考文档](../api-reference/json-rpc/alkanes)中。

## Fuel

合约执行有一个叫做 **fuel** 的计算预算，类似于以太坊上的 gas。一个操作如果耗尽了 fuel 就会失败。视图函数运行在很高的 fuel 上限下，因此只读查询很少会触及这个限制。

## 接下来看什么

- [frBTC 锚定与托管](./frbtc-peg-and-custody)：托管是如何构建在这之上的。
- [JSON-RPC 参考文档](../api-reference/json-rpc/alkanes)：详细的视图函数说明。
- [读取 Alkane 元数据](../api-reference/guides/alkane-metadata)：发现任意合约的 ABI。
