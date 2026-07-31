---
title: 包装与解包 BTC
sidebar_label: 包装与解包 BTC
sidebar_position: 2
description: 将你的 Bitcoin 转换为 frBTC 并按 1:1 换回，全程无需离开 Bitcoin。
---

# 包装与解包 BTC

**frBTC** 是可编程化的 Bitcoin：一种由真实 BTC 按 1:1 支撑、可与链上应用交互并原生结算于 Bitcoin 的代币。包装（Wrapping）是获得 frBTC 的方式；解包（Unwrapping）则会将其转换回原生 BTC。

## 铸造 frBTC（将 BTC 包装为 frBTC）

铸造 frBTC 会锁定你的 BTC，并在同一步骤中铸造等量的 frBTC。这是一个 **1:1 转换**：1 个 BTC 立即为你铸造 1 个 frBTC。

在实际使用中，你很少需要手动包装。当你从 BTC 开始进行[交换](./swap)时，应用会在一笔原子交易中完成包装为 frBTC 并执行交换的全部过程。包装过程在幕后自动完成。

## 赎回 BTC（将 frBTC 解包为 BTC）

解包会销毁你的 frBTC，并将对应的原生 BTC 释放归还给你。与包装不同，解包需要经过托管该 Bitcoin 的分布式签名者群体授权（没有任何单一方能够单独控制）。这种托管方式的具体原理，参见 [What is SUBFROST（什么是 SUBFROST）](../start-here/what-is-subfrost)。

### 为什么需要等待

你的 BTC 会在 **3 到 7 个区块确认**后到账。具体数字会随手续费率的波动而变化，因此请把它理解为一个区间，而不是一个固定的数字。

这个等待是为了保护储备免受 **Bitcoin 重组（reorg）**的影响，背后的原因值得理解，因为它听起来像是出于谨慎，实际上是纯粹的算术问题：

假设没有这个等待，你的 frBTC 在解包的瞬间就变成了 BTC。此时 Bitcoin 发生重组，撤销了最后一个区块。签名者已经同意了这笔解包并完成了付款，但你 frBTC 的销毁却被这次重组撤销了。结果你会**同时**持有 frBTC 和 BTC，而储备则会出现缺口。

等待几个区块就能堵上这个窗口期。一次深到足以突破 3 到 7 个区块的重组，代价高到不值得去做，所以这个深度已经足够。

## 手续费

铸造和赎回各收取 **0.1%** 的手续费，两个方向的费率相同。包装 1 个 BTC，你将获得 0.999 个 frBTC；解包 1 个 frBTC，你将获得 0.999 个 BTC。

该手续费并非固定写死在合约代码中，而是一个协议可以更改的链上参数，因此请将 0.1% 视为当前生效的费率，而非永久保证。应用会在你确认之前始终报价你将收到的确切数额。

## 下一步

- [Swap（交换）](./swap)：将 frBTC 交换为其他 Bitcoin 资产。
- [Pools & Liquidity（资金池与流动性）](./pools-liquidity)：让你的 frBTC 发挥作用。
- [Tokens & Economics（代币与经济模型）](../start-here/key-concepts)：了解 frBTC、DIESEL 和 FIRE 是如何协同运作的。
