---
title: 安全须知
sidebar_label: 安全须知
sidebar_position: 6
description: 使用 SUBFROST 时，保护好你的 Ordinals、Runes 和 BRC-20 资产。
---

# 安全须知

SUBFROST 处理的是 Bitcoin 上的 Alkanes 代币。如果你还持有 **Ordinals、Runes 或 BRC-20 资产**，有一项预防措施你必须采取，这并非可选项。

## 把你的非 Alkanes 资产转移到另一个钱包

> **销毁风险。** SUBFROST 目前不索引 `ord`。在使用我们的应用之前，你必须将 Ordinals、Runes 和 BRC-20 资产转移到另一个钱包。

原因如下。在 Bitcoin 上，这些资产依附于一个特定的 coin（即一个 UTXO）之上。SUBFROST 看不到它们，因此也无法避开它们：如果这些 coin 中的某一个在正常操作过程中被花费，**它上面承载的资产就没了**。没有恢复的可能，也无法撤销。

因此请保留两个钱包：

- 一个**专用钱包**用于 SUBFROST：包装、交换、质押。
- 一个**单独的钱包**用于存放你的 Ordinals、Runes 和 BRC-20 资产。

将两者分开后，你在 SUBFROST 上所做的任何操作都无法触及承载这些资产的 coin。

## 保护好你的助记词

你的 12 词助记词是恢复自托管钱包的唯一方式。请将它写下来，妥善保存在离线的地方。切勿分享它，也不要在钱包自身的恢复页面以外的任何网站上输入它。

## 从小额开始

如果你刚接触这个平台，建议先进行一笔小额交易，熟悉整个流程后再操作更大的金额。

## 下一步

- [Wallets（钱包）](./wallets)：设置你的 SUBFROST 钱包。
