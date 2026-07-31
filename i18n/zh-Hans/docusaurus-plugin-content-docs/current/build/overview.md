---
title: 在 SUBFROST 上构建
sidebar_label: 以开发者身份开始
sidebar_position: 1
description: 你可以在 SUBFROST 和 Alkanes 上构建什么，会用到哪些工具，以及从哪里开始。
---

# 在 SUBFROST 上构建

SUBFROST 构建于 **Alkanes** 之上，这是一个运行在 Bitcoin 上的智能合约元协议（参见 [Alkanes 元协议](../protocol/alkanes)）。只要你会写合约或 Web 应用，就可以在它之上构建：代币、AMM、金库，以及任何读取或转移 Bitcoin 支持的价值（如 frBTC）的东西。

本节是开发者路线，带你从一台空机器走到一个已部署的合约和一个可用的集成。

## 工具链

你会用到一小组工具，全部公开可用：

- **`alkanes-cli`**，用于在命令行中管理钱包、部署合约以及调用合约。它需要从源码构建（参见 [快速开始](./quickstart)）。
- **`@alkanes/ts-sdk`**，用于在 Web 应用或后端中以 TypeScript 与链交互。
- **一个托管的 JSON-RPC 端点**，这样你无需自己运行索引器就能开始上手。请求会发往 `https://mainnet.subfrost.io/v4/jsonrpc`。如果你想自己运行索引器，参见 [用 metashrew 做索引](./indexing-with-metashrew)。

完整的命令与 SDK 参考位于 [API 与 SDK 文档](../api-reference/cli-sdk/overview)。本路线是引导式教程；那一节则是查阅用的速查表。

## 本节内容

- **[快速开始](./quickstart)：** 安装工具链并部署你的第一个合约。
- **[通过 CLI 交互](./interacting-via-cli)：** 钱包、余额、执行与查询合约。
- **[包装 frBTC](./wrapping-frbtc)：** 从 CLI 和 SDK 中包装与解包由 Bitcoin 支持的 frBTC。
- **[BRC2.0 集成](./brc20-integration)：** 在 Bitcoin 上部署 EVM 风格的合约。
- **[连接钱包](./connecting-a-wallet)：** Web 应用的注入式 provider 与远程签名。
- **[用 metashrew 做索引](./indexing-with-metashrew)：** 自行运行索引器并查询链上状态。

## 开始之前

Alkanes 采用全新的钱包模型。请勿将持有 ordinals 或铭文（inscriptions）的钱包用于合约操作：使用专用的 Alkanes 钱包，详见 [安全须知](../using-subfrost/safety)。在测试网和 regtest 上这一点无关紧要，但这个习惯值得尽早养成。

## 接下来去哪里

- [快速开始](./quickstart)：部署你的第一个合约。
- [Alkanes 元协议](../protocol/alkanes)：你的合约运行所依托的模型。
