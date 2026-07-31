---
title: 5 分钟快速上手
sidebar_label: 5 分钟快速上手
sidebar_position: 2
description: 选择一个钱包，存入 Bitcoin，在 SUBFROST 上完成你的第一笔兑换。
---

# 5 分钟快速上手

本指南将带你从零开始完成第一笔兑换。你会选择接入 SUBFROST 的方式、设置钱包，并兑换一些 Bitcoin。

## 第 1 步：打开 SUBFROST

今天最简单的开始方式是使用 **网页应用**。原生客户端也即将推出：

- **<a href="https://app.subfrost.io" target="_blank" rel="noopener noreferrer">Web app</a>.** 现已可用，是目前推荐的入门方式。
- **Android。** 即将推出。
- **iOS。** 即将推出（App Store 审核中）。
- **Chrome 浏览器扩展。** 即将推出。

本指南将使用网页应用。各选项的详细说明见 [钱包](../using-subfrost/wallets)。

## 第 2 步：设置钱包

有两条路径可选，任选其一即可。

### 创建一个新的 SUBFROST 钱包（推荐新手使用）

1. 打开 Connect Wallet 菜单，选择 **Create New Wallet**。
2. 设置一个强密码（至少 8 个字符）。
3. **写下你的 12 个助记词恢复短语**，并妥善保存在离线的安全位置。这个短语是恢复你资金的唯一方式。
4. 也可以选择备份到 Google Drive，以方便使用。

### 或连接你已有的钱包

SUBFROST 可连接主流的 Bitcoin 钱包，包括 **OKX、Unisat 和 Xverse**。打开 **Connect Wallet**，选择你的提供商，并批准连接。

:::caution[烧毁风险：请为 Ordinals、Runes 和 BRC-20 使用单独的钱包]
SUBFROST 目前不索引 `ord`。在使用我们的应用之前，你必须将 Ordinals、Runes 和 BRC-20 资产转移到另一个钱包。这些资产存在于 SUBFROST 无法识别的特定一枚币（UTXO）上，如果它在日常操作中被花费，上面的资产就会丢失。见[安全须知](../using-subfrost/safety)。
:::

## 第 3 步：存入 Bitcoin

你不需要手动包装（wrap）你的 BTC。当你从 BTC 开始兑换时，应用会在一个原子步骤中将你的 Bitcoin 包装为 frBTC 并完成兑换。包装过程完全在后台完成。

如果你只是想直接获得 frBTC，包装是 1:1 转换。

## 第 4 步：完成你的第一笔兑换

1. **选择代币。** 选择你要**发送**的代币（You Send）和想要**接收**的代币（You Receive）。
2. **输入数量。** 直接输入，或使用快捷按钮：你余额的 25%、50%、75% 或 Max。
3. **查看详情。** 确认前你会看到汇率、兑换路径、你将收到的最低数量、截止时间（以区块数计）、你的滑点容差，以及矿工费率。
4. **确认并签名。** 点击 Swap，然后用你连接的钱包批准交易。

:::tip[从小额开始]
如果你刚接触本平台，建议先做一笔小额兑换，熟悉整个流程后再操作更大金额。
:::

:::info[兑换回 BTC 需要等待几个区块]
当你兑换为原生 BTC 时，协议会在发送前等待**3 到 7 个区块确认**。这个等待是为了保护 Bitcoin 储备免受链重组的影响。原因详见[包装与解包 BTC](../using-subfrost/wrap-unwrap-frbtc)。
:::

## 接下来去哪里

- **[关键概念](./key-concepts)：** 了解 frBTC、DIESEL、FIRE 及其他内容。
- 在 **[使用 SUBFROST](../using-subfrost/wallets)** 指南中探索资金池、FIRE vault 及更多内容。
